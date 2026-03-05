DELIMITER $$

CREATE TRIGGER package_must_have_tracking_event
AFTER INSERT ON Package
FOR EACH ROW
BEGIN
    DECLARE cnt INT;

    SELECT COUNT(*) INTO cnt
    FROM Tracking_Event
    WHERE tracking_number = NEW.tracking_number;

    IF cnt = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Package must have at least one Tracking_Event';
    END IF;
END$$

DELIMITER $$

CREATE TRIGGER check_payment_before_processing
BEFORE UPDATE ON Shipment
FOR EACH ROW
BEGIN
    IF NEW.status_code = (SELECT status_code FROM Status_Code WHERE status_name='Processing')
       AND (NEW.payment_id IS NULL) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot set Shipment to Processing: Payment missing';
    END IF;
END$$

DELIMITER $$

CREATE TRIGGER prevent_event_after_final
BEFORE INSERT ON Tracking_Event
FOR EACH ROW
BEGIN
    DECLARE last_final TINYINT;

    SELECT is_final_status INTO last_final
    FROM Tracking_Event te
    JOIN Status_Code sc ON te.status_code = sc.status_code
    WHERE te.tracking_number = NEW.tracking_number
    ORDER BY te.event_timestamp DESC
    LIMIT 1;

    IF last_final = 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot insert new Tracking_Event: previous event is final';
    END IF;
END$$

DELIMITER $$

CREATE TRIGGER prevent_negative_inventory
BEFORE UPDATE ON Product
FOR EACH ROW
BEGIN
    IF NEW.quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Inventory quantity cannot go below 0';
    END IF;
END$$

DELIMITER ;