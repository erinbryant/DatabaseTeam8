-- Package pickup records (package held at a post office for recipient).
-- mysql -u root -p your_database < backend/db/migrations/005_create_package_pickup.sql

-- Tracking_Number length must match package.Tracking_Number (use VARCHAR(10) if your Package uses 10).
CREATE TABLE package_pickup (
  Tracking_Number VARCHAR(20) NOT NULL PRIMARY KEY,
  Recipient_ID INT NOT NULL,
  Post_Office_ID INT NOT NULL,
  Arrival_Time DATETIME NULL,
  Pickup_Time DATETIME NULL,
  Is_picked_Up ENUM('1','0') NOT NULL DEFAULT '0',
  CONSTRAINT fk_package_pickup_package
    FOREIGN KEY (Tracking_Number) REFERENCES package(Tracking_Number),
  CONSTRAINT fk_package_pickup_recipient
    FOREIGN KEY (Recipient_ID) REFERENCES customer(Customer_ID),
  CONSTRAINT fk_package_pickup_post_office
    FOREIGN KEY (Post_Office_ID) REFERENCES post_office(Post_Office_ID)
);


-- Package pickup: late fees ($10 after 10 days, +$10 after 20 days) and disposal after 30 days
-- for packages whose shipment status is "At Office". Uses Package_Pickup.Arrival_Time as the clock.
--

-- Tables: Status_Code, Shipment, Shipment_Package, Package_Pickup (see schema.sql).

USE post_office_8;

-- ── 1. Column to hold accumulated late fee (original Package.Price stays unchanged) ──
ALTER TABLE Package_Pickup
  ADD COLUMN Late_Fee_Amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- ── 2. Status codes (adjust Status_Code values if they collide with your data) ───────
INSERT INTO Status_Code (Status_Code, Status_Name, Is_Final_Status)
SELECT 8, 'At Office', 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM Status_Code WHERE Status_Name = 'At Office');

INSERT INTO Status_Code (Status_Code, Status_Name, Is_Final_Status)
SELECT 9, 'Disposed', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM Status_Code WHERE Status_Name = 'Disposed');

-- ── 3. Helper: calendar days since office arrival (DATE-only; same as DATEDIFF rules) ─
--    Fee tier 1:  DATEDIFF > 10  → $10
--    Fee tier 2:  DATEDIFF > 20  → $20 total
--    Disposal:    DATEDIFF >= 30 → status Disposed (still not picked up)


DELIMITER $$

DROP TRIGGER IF EXISTS trg_shipment_au_sync_pickup_arrival $$
CREATE TRIGGER trg_shipment_au_sync_pickup_arrival
AFTER UPDATE ON shipment
FOR EACH ROW
BEGIN
  DECLARE v_at_office INT;

  SELECT status_code INTO v_at_office
  FROM status_code
  WHERE Status_Name = 'At Office'
  LIMIT 1;

  IF NOT (NEW.Status_Code <=> OLD.Status_Code) THEN
    IF v_at_office IS NOT NULL AND NEW.Status_Code = v_at_office THEN
      UPDATE package_pickup pp
      INNER JOIN shipment_package sp ON sp.Tracking_Number = pp.Tracking_Number
      SET pp.Arrival_Time = COALESCE(NEW.Arrival_Time_Stamp, pp.Arrival_Time, NOW())
      WHERE sp.Shipment_ID = NEW.Shipment_ID;
    END IF;
  END IF;

  IF v_at_office IS NOT NULL AND NEW.Status_Code = v_at_office THEN
    UPDATE package_pickup pp
    INNER JOIN shipment_package sp ON sp.Tracking_Number = pp.Tracking_Number
    SET pp.Late_Fee_Amount = CASE
      WHEN pp.Is_picked_Up <> '0' THEN pp.Late_Fee_Amount
      WHEN pp.Arrival_Time IS NULL THEN pp.Late_Fee_Amount
      WHEN DATEDIFF(CURDATE(), DATE(pp.Arrival_Time)) > 20 THEN 20.00
      WHEN DATEDIFF(CURDATE(), DATE(pp.Arrival_Time)) > 10 THEN 10.00
      ELSE 0.00
    END
    WHERE sp.Shipment_ID = NEW.Shipment_ID
      AND pp.Is_picked_Up = '0'
      AND pp.Arrival_Time IS NOT NULL;
  END IF;
END $$

DELIMITER ;



-- Turn on MySQL Event Scheduler so evt_daily_package_pickup_storage runs.
-- Requires a user with SYSTEM_VARIABLES_ADMIN (MySQL 8+) or SUPER (older).
-- Create the event/procedure: run 006 (and 007), then 010 so the event calls sp_daily_package_pickup_storage.
-- mysql -u root -p your_database < backend/db/migrations/008_enable_event_scheduler.sql

SET GLOBAL event_scheduler = ON;




-- Nightly procedure + event: late fees + 30-day disposal (delivery + shipment).
-- Apply to the DB your app uses, e.g.:
-- (No USE line — the database is the one you pass on the mysql command line.)

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_daily_package_pickup_storage $$
CREATE PROCEDURE sp_daily_package_pickup_storage()
BEGIN
  DECLARE v_disposed INT;

  SELECT Status_Code INTO v_disposed
  FROM status_code
  WHERE LOWER(TRIM(Status_Name)) = 'disposed'
     OR REPLACE(LOWER(TRIM(Status_Name)), ' ', '') LIKE '%disposed%'
  LIMIT 1;

  UPDATE package_pickup pp
  INNER JOIN delivery d ON d.Tracking_Number = pp.Tracking_Number
  LEFT JOIN status_code scd ON scd.Status_Code = d.Delivery_Status_Code
  LEFT JOIN shipment_package sp ON sp.Tracking_Number = pp.Tracking_Number
  LEFT JOIN shipment sh ON sh.Shipment_ID = sp.Shipment_ID
  LEFT JOIN status_code scs ON scs.Status_Code = sh.Status_Code
  SET pp.Late_Fee_Amount = CASE
    WHEN pp.Is_picked_Up <> '0' THEN pp.Late_Fee_Amount
    WHEN pp.Arrival_Time IS NULL THEN pp.Late_Fee_Amount
    WHEN DATEDIFF(CURDATE(), DATE(pp.Arrival_Time)) > 20 THEN 20.00
    WHEN DATEDIFF(CURDATE(), DATE(pp.Arrival_Time)) > 10 THEN 10.00
    ELSE 0.00
  END
  WHERE (TRIM(IFNULL(pp.Is_picked_Up, '')) = '0' OR pp.Is_picked_Up IS NULL)
    AND pp.Arrival_Time IS NOT NULL
    AND (
      LOWER(TRIM(REPLACE(REPLACE(REPLACE(IFNULL(scd.Status_Name, ''), '-', ' '), '_', ' '), '  ', ' '))) = 'at office'
      OR REPLACE(LOWER(TRIM(IFNULL(scd.Status_Name, ''))), ' ', '') LIKE '%atoffice%'
      OR (
        sh.Shipment_ID IS NOT NULL
        AND (
          LOWER(TRIM(REPLACE(REPLACE(REPLACE(IFNULL(scs.Status_Name, ''), '-', ' '), '_', ' '), '  ', ' '))) = 'at office'
          OR REPLACE(LOWER(TRIM(IFNULL(scs.Status_Name, ''))), ' ', '') LIKE '%atoffice%'
        )
      )
    );

  IF v_disposed IS NOT NULL THEN
    DROP TEMPORARY TABLE IF EXISTS _pkg_dispose_today;
    CREATE TEMPORARY TABLE _pkg_dispose_today (Tracking_Number VARCHAR(64) PRIMARY KEY);

    INSERT IGNORE INTO _pkg_dispose_today (Tracking_Number)
    SELECT pp.Tracking_Number
    FROM package_pickup pp
    INNER JOIN delivery d ON d.Tracking_Number = pp.Tracking_Number
    INNER JOIN status_code scd ON scd.Status_Code = d.Delivery_Status_Code
    WHERE (TRIM(IFNULL(pp.Is_picked_Up, '')) = '0' OR pp.Is_picked_Up IS NULL)
      AND pp.Arrival_Time IS NOT NULL
      AND DATEDIFF(CURDATE(), DATE(pp.Arrival_Time)) >= 30
      AND (
        LOWER(TRIM(REPLACE(REPLACE(REPLACE(IFNULL(scd.Status_Name, ''), '-', ' '), '_', ' '), '  ', ' '))) = 'at office'
        OR REPLACE(LOWER(TRIM(IFNULL(scd.Status_Name, ''))), ' ', '') LIKE '%atoffice%'
      );

    INSERT IGNORE INTO _pkg_dispose_today (Tracking_Number)
    SELECT pp.Tracking_Number
    FROM package_pickup pp
    INNER JOIN shipment_package sp ON sp.Tracking_Number = pp.Tracking_Number
    INNER JOIN shipment sh ON sh.Shipment_ID = sp.Shipment_ID
    INNER JOIN status_code scs ON scs.Status_Code = sh.Status_Code
    WHERE (TRIM(IFNULL(pp.Is_picked_Up, '')) = '0' OR pp.Is_picked_Up IS NULL)
      AND pp.Arrival_Time IS NOT NULL
      AND DATEDIFF(CURDATE(), DATE(pp.Arrival_Time)) >= 30
      AND (
        LOWER(TRIM(REPLACE(REPLACE(REPLACE(IFNULL(scs.Status_Name, ''), '-', ' '), '_', ' '), '  ', ' '))) = 'at office'
        OR REPLACE(LOWER(TRIM(IFNULL(scs.Status_Name, ''))), ' ', '') LIKE '%atoffice%'
      );

    UPDATE delivery d
    INNER JOIN _pkg_dispose_today t ON t.Tracking_Number = d.Tracking_Number
    SET d.Delivery_Status_Code = v_disposed;

    UPDATE shipment sh
    INNER JOIN shipment_package sp ON sp.Shipment_ID = sh.Shipment_ID
    INNER JOIN _pkg_dispose_today t ON t.Tracking_Number = sp.Tracking_Number
    SET sh.Status_Code = v_disposed;

    DROP TEMPORARY TABLE IF EXISTS _pkg_dispose_today;
  END IF;
END $$

DROP EVENT IF EXISTS evt_daily_package_pickup_storage $$
CREATE EVENT evt_daily_package_pickup_storage
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY)
ON COMPLETION PRESERVE
ENABLE
DO CALL sp_daily_package_pickup_storage() $$

DELIMITER ;

-- erin- moved from before delimiter for easier copy and pasting
-- Ensure the pickup event is active (skip if you have not run 006 yet).
ALTER EVENT evt_daily_package_pickup_storage ENABLE;
