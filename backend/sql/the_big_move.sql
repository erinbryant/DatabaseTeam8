
CREATE TABLE Address (
    Address_ID     INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Apt_Number     VARCHAR(10),
    House_Number   VARCHAR(10)   NOT NULL,
    Street         VARCHAR(100)  NOT NULL,
    City           VARCHAR(100)  NOT NULL,
    State          VARCHAR(50)   NOT NULL,
    Zip_Code       CHAR(5)       NOT NULL,
    Country        VARCHAR(50)   NOT NULL DEFAULT 'USA'
);

INSERT INTO Address (Apt_Number, House_Number, Street, City, State, Zip_Code, Country)
VALUES (NULL, '742', 'Evergreen Terrace', 'Springfield', 'IL', '62701', 'USA');
-- Add as nullable first
ALTER TABLE Customer
    ADD COLUMN Address_ID INT;

-- Populate existing rows with a valid Address_ID here
UPDATE Customer SET Address_ID = 1 WHERE Address_ID IS NULL;

-- Then enforce NOT NULL and add FK
ALTER TABLE Customer
    MODIFY COLUMN Address_ID INT NOT NULL,
    ADD FOREIGN KEY (Address_ID) REFERENCES Address(Address_ID);

-- Insert unique addresses
INSERT INTO Address (House_Number, Street, City, State, Zip_Code, Country) VALUES
('112', 'Oak St',         'Houston',     'TX', '77002', 'USA'),  -- ID 2: James Wilson
('234', 'Elm Ave',        'Houston',     'TX', '77003', 'USA'),  -- ID 3: Maria Garcia
('567', 'Pine Rd',        'Dallas',      'TX', '75204', 'USA'),  -- ID 4: Robert Smith
('890', 'Maple Dr',       'Dallas',      'TX', '75205', 'USA'),  -- ID 5: Linda Johnson
('321', 'Cedar Blvd',     'Austin',      'TX', '73306', 'USA'),  -- ID 6: Carlos Martinez
('654', 'Birch Ln',       'Austin',      'TX', '73307', 'USA'),  -- ID 7: Susan Brown
('777', 'Walnut St',      'San Antonio', 'TX', '78208', 'USA'),  -- ID 8: David Lee
('888', 'Spruce Ave',     'San Antonio', 'TX', '78209', 'USA'),  -- ID 9: Patricia Taylor
('999', 'Willow Way',     'Lubbock',     'TX', '79410', 'USA'),  -- ID 10: Michael Anderson
('101', 'Aspen Ct',       'Lubbock',     'TX', '79411', 'USA'),  -- ID 11: Barbara Thomas
('220', 'Pecan St',       'Houston',     'TX', '77012', 'USA'),  -- ID 12: Anthony Rivera
('445', 'Magnolia Ave',   'Dallas',      'TX', '75206', 'USA'),  -- ID 13: Kimberly Carter
('678', 'Cypress Rd',     'Austin',      'TX', '73308', 'USA'),  -- ID 14: Daniel Mitchell
('891', 'Lavender Ln',    'San Antonio', 'TX', '78210', 'USA'),  -- ID 15: Jessica Perez
('102', 'Sycamore Blvd',  'Lubbock',     'TX', '79412', 'USA'),  -- ID 16: Matthew Roberts
('334', 'Rosewood Dr',    'Houston',     'TX', '77014', 'USA'),  -- ID 17: Amanda Sanders
('556', 'Bluebonnet Way', 'Dallas',      'TX', '75208', 'USA'),  -- ID 18: Kevin Price
('789', 'Juniper St',     'Austin',      'TX', '73310', 'USA'),  -- ID 19: Sarah Hughes
('901', 'Mesquite Rd',    'San Antonio', 'TX', '78211', 'USA'),  -- ID 20: Brian Foster
('123', 'Cottonwood Ct',  'Lubbock',     'TX', '79413', 'USA'),  -- ID 21: Nicole Butler
('hk',  'hkj',           'hjk',         'hkj','12345', 'USA'),  -- ID 22: hkj (test)
('jlk', 'jkl',           'jkl',         'jkl','78978', 'USA'),  -- ID 23: jkl (test)
('123', 'mainst',         'hu',          'tx', '00000', 'USA');  -- ID 24: Test3

UPDATE Customer SET Address_ID = 2  WHERE Customer_ID = 1;
UPDATE Customer SET Address_ID = 3  WHERE Customer_ID = 2;
UPDATE Customer SET Address_ID = 4  WHERE Customer_ID = 3;
UPDATE Customer SET Address_ID = 5  WHERE Customer_ID = 4;
UPDATE Customer SET Address_ID = 6  WHERE Customer_ID = 5;
UPDATE Customer SET Address_ID = 7  WHERE Customer_ID = 6;
UPDATE Customer SET Address_ID = 8  WHERE Customer_ID = 7;
UPDATE Customer SET Address_ID = 9  WHERE Customer_ID = 8;
UPDATE Customer SET Address_ID = 10 WHERE Customer_ID = 9;
UPDATE Customer SET Address_ID = 11 WHERE Customer_ID = 10;
UPDATE Customer SET Address_ID = 12 WHERE Customer_ID = 11;
UPDATE Customer SET Address_ID = 13 WHERE Customer_ID = 12;
UPDATE Customer SET Address_ID = 14 WHERE Customer_ID = 13;
UPDATE Customer SET Address_ID = 15 WHERE Customer_ID = 14;
UPDATE Customer SET Address_ID = 16 WHERE Customer_ID = 15;
UPDATE Customer SET Address_ID = 17 WHERE Customer_ID = 16;
UPDATE Customer SET Address_ID = 18 WHERE Customer_ID = 17;
UPDATE Customer SET Address_ID = 19 WHERE Customer_ID = 18;
UPDATE Customer SET Address_ID = 20 WHERE Customer_ID = 19;
UPDATE Customer SET Address_ID = 21 WHERE Customer_ID = 20;
UPDATE Customer SET Address_ID = 22 WHERE Customer_ID = 21;
UPDATE Customer SET Address_ID = 23 WHERE Customer_ID = 22;
UPDATE Customer SET Address_ID = 24 WHERE Customer_ID = 23;

ALTER TABLE Customer
    DROP COLUMN Apt_Number,
    DROP COLUMN House_Number,
    DROP COLUMN Street,
    DROP COLUMN City,
    DROP COLUMN State,
    DROP COLUMN Zip_First3,
    DROP COLUMN Zip_Last2,
    DROP COLUMN Zip_Plus4,
    DROP COLUMN Country;

-- Step 1: Add as nullable first
ALTER TABLE post_office
    ADD COLUMN Address_ID INT;

-- Step 2: Insert an address for the post office, then update it
INSERT INTO Address (House_Number, Street, City, State, Zip_Code, Country)
VALUES ('1', 'Post Office St', 'Houston', 'TX', '77001', 'USA');

-- Step 3: Update all existing rows (adjust the Address_ID value if needed)
UPDATE post_office SET Address_ID = (SELECT MAX(Address_ID) FROM Address);

-- Step 4: Now enforce NOT NULL and add the FK
ALTER TABLE post_office
    MODIFY COLUMN Address_ID INT NOT NULL,
    ADD FOREIGN KEY (Address_ID) REFERENCES Address(Address_ID);

INSERT INTO Address (House_Number, Street, City, State, Zip_Code, Country) VALUES
('100', 'Main St',      'Houston',     'TX', '77001', 'USA'),  -- ID 26: Post Office 1
('200', 'Commerce St',  'Dallas',      'TX', '75201', 'USA'),  -- ID 27: Post Office 2
('300', 'Congress Ave', 'Austin',      'TX', '73301', 'USA'),  -- ID 28: Post Office 3
('400', 'Broadway St',  'San Antonio', 'TX', '78201', 'USA'),  -- ID 29: Post Office 4
('500', 'Lubbock Ave',  'Lubbock',     'TX', '79401', 'USA');  -- ID 30: Post Office 5

UPDATE post_office SET Address_ID = 26 WHERE Post_Office_ID = 1;
UPDATE post_office SET Address_ID = 27 WHERE Post_Office_ID = 2;
UPDATE post_office SET Address_ID = 28 WHERE Post_Office_ID = 3;
UPDATE post_office SET Address_ID = 29 WHERE Post_Office_ID = 4;
UPDATE post_office SET Address_ID = 30 WHERE Post_Office_ID = 5;

ALTER TABLE post_office
    DROP COLUMN Apt_Number,
    DROP COLUMN House_Number,
    DROP COLUMN Street,
    DROP COLUMN City,
    DROP COLUMN State,
    DROP COLUMN Zip_First3,
    DROP COLUMN Zip_Last2,
    DROP COLUMN Zip_Plus4,
    DROP COLUMN Country;


-- Step 1: Add both as nullable first
ALTER TABLE Shipment
    ADD COLUMN From_Address_ID INT,
    ADD COLUMN To_Address_ID INT;

-- Step 2: Enforce NOT NULL and add both FKs
ALTER TABLE Shipment
    MODIFY COLUMN From_Address_ID INT NOT NULL,
    MODIFY COLUMN To_Address_ID INT NOT NULL,
    ADD FOREIGN KEY (From_Address_ID) REFERENCES Address(Address_ID),
    ADD FOREIGN KEY (To_Address_ID) REFERENCES Address(Address_ID);

-- Step 3: Drop old address columns
ALTER TABLE Shipment
    DROP COLUMN From_Apt_Number,
    DROP COLUMN From_House_Number,
    DROP COLUMN From_Street,
    DROP COLUMN From_City,
    DROP COLUMN From_State,
    DROP COLUMN From_Zip_First3,
    DROP COLUMN From_Zip_Last2,
    DROP COLUMN From_Zip_Plus4,
    DROP COLUMN From_Country,
    DROP COLUMN To_Apt_Number,
    DROP COLUMN To_House_Number,
    DROP COLUMN To_Street,
    DROP COLUMN To_City,
    DROP COLUMN To_State,
    DROP COLUMN To_Zip_First3,
    DROP COLUMN To_Zip_Last2,
    DROP COLUMN To_Zip_Plus4,
    DROP COLUMN To_Country;

ALTER TABLE Shipment
    MODIFY COLUMN From_Address_ID INT NOT NULL,
    MODIFY COLUMN To_Address_ID INT NOT NULL,
    ADD FOREIGN KEY (From_Address_ID) REFERENCES Address(Address_ID),
    ADD FOREIGN KEY (To_Address_ID) REFERENCES Address(Address_ID);


-- Shipment 1: From 112 Oak St (2), To 567 Pine Rd (4)
UPDATE Shipment SET From_Address_ID = 2,  To_Address_ID = 4  WHERE Shipment_ID = 1;
-- Shipment 2: From 234 Elm Ave (3), To 890 Maple Dr (5)
UPDATE Shipment SET From_Address_ID = 3,  To_Address_ID = 5  WHERE Shipment_ID = 2;
-- Shipment 3: From 321 Cedar Blvd (6), To 777 Walnut St (8)
UPDATE Shipment SET From_Address_ID = 6,  To_Address_ID = 8  WHERE Shipment_ID = 3;
-- Shipment 4: From 654 Birch Ln (7), To 888 Spruce Ave (9)
UPDATE Shipment SET From_Address_ID = 7,  To_Address_ID = 9  WHERE Shipment_ID = 4;
-- Shipment 5: From 999 Willow Way (10), To 101 Aspen Ct (11)
UPDATE Shipment SET From_Address_ID = 10, To_Address_ID = 11 WHERE Shipment_ID = 5;
-- Shipment 6: From 567 Pine Rd (4), To 112 Oak St (2)
UPDATE Shipment SET From_Address_ID = 4,  To_Address_ID = 2  WHERE Shipment_ID = 6;
-- Shipment 7: From 777 Walnut St (8), To 234 Elm Ave (3)
UPDATE Shipment SET From_Address_ID = 8,  To_Address_ID = 3  WHERE Shipment_ID = 7;
-- Shipment 8: From 100 Main St (26), To 300 Congress Ave (28)
UPDATE Shipment SET From_Address_ID = 26, To_Address_ID = 28 WHERE Shipment_ID = 8;
-- Shipment 9: From 112 Oak St (2), To 220 Pecan St (12)
UPDATE Shipment SET From_Address_ID = 2,  To_Address_ID = 12 WHERE Shipment_ID = 9;
-- Shipment 10: From 234 Elm Ave (3), To 445 Magnolia Ave (13)
UPDATE Shipment SET From_Address_ID = 3,  To_Address_ID = 13 WHERE Shipment_ID = 10;
-- Shipment 11: From 321 Cedar Blvd (6), To 678 Cypress Rd (14)
UPDATE Shipment SET From_Address_ID = 6,  To_Address_ID = 14 WHERE Shipment_ID = 11;
-- Shipment 12: From 567 Pine Rd (4), To 891 Lavender Ln (15)
UPDATE Shipment SET From_Address_ID = 4,  To_Address_ID = 15 WHERE Shipment_ID = 12;
-- Shipment 13: From 777 Walnut St (8), To 102 Sycamore Blvd (16)
UPDATE Shipment SET From_Address_ID = 8,  To_Address_ID = 16 WHERE Shipment_ID = 13;
-- Shipment 14: From 890 Maple Dr (5), To 334 Rosewood Dr (17)
UPDATE Shipment SET From_Address_ID = 5,  To_Address_ID = 17 WHERE Shipment_ID = 14;
-- Shipment 15: From 654 Birch Ln (7), To 556 Bluebonnet Way (18)
UPDATE Shipment SET From_Address_ID = 7,  To_Address_ID = 18 WHERE Shipment_ID = 15;
-- Shipment 16: From 999 Willow Way (10), To 789 Juniper St (19)
UPDATE Shipment SET From_Address_ID = 10, To_Address_ID = 19 WHERE Shipment_ID = 16;
-- Shipment 17: From 101 Aspen Ct (11), To 901 Mesquite Rd (20)
UPDATE Shipment SET From_Address_ID = 11, To_Address_ID = 20 WHERE Shipment_ID = 17;
-- Shipment 18: From 220 Pecan St (12), To 123 Cottonwood Ct (21)
UPDATE Shipment SET From_Address_ID = 12, To_Address_ID = 21 WHERE Shipment_ID = 18;
-- Shipment 19: From 445 Magnolia Ave (13), To 112 Oak St (2)
UPDATE Shipment SET From_Address_ID = 13, To_Address_ID = 2  WHERE Shipment_ID = 19;
-- Shipment 20: From 678 Cypress Rd (14), To 234 Elm Ave (3)
UPDATE Shipment SET From_Address_ID = 14, To_Address_ID = 3  WHERE Shipment_ID = 20;
-- Shipment 21: From 891 Lavender Ln (15), To 567 Pine Rd (4)
UPDATE Shipment SET From_Address_ID = 15, To_Address_ID = 4  WHERE Shipment_ID = 21;
-- Shipment 22: From 102 Sycamore Blvd (16), To 890 Maple Dr (5)
UPDATE Shipment SET From_Address_ID = 16, To_Address_ID = 5  WHERE Shipment_ID = 22;
-- Shipment 23: From 334 Rosewood Dr (17), To 654 Birch Ln (7)
UPDATE Shipment SET From_Address_ID = 17, To_Address_ID = 7  WHERE Shipment_ID = 23;
-- Shipment 24: From 556 Bluebonnet Way (18), To 999 Willow Way (10)
UPDATE Shipment SET From_Address_ID = 18, To_Address_ID = 10 WHERE Shipment_ID = 24;
-- Shipment 25: From 789 Juniper St (19), To 101 Aspen Ct (11)
UPDATE Shipment SET From_Address_ID = 19, To_Address_ID = 11 WHERE Shipment_ID = 25;
-- Shipment 26: From 901 Mesquite Rd (20), To 220 Pecan St (12)
UPDATE Shipment SET From_Address_ID = 20, To_Address_ID = 12 WHERE Shipment_ID = 26;
-- Shipment 27: From 123 Cottonwood Ct (21), To 445 Magnolia Ave (13)
UPDATE Shipment SET From_Address_ID = 21, To_Address_ID = 13 WHERE Shipment_ID = 27;
-- Shipment 28: From 112 Oak St (2), To 678 Cypress Rd (14)
UPDATE Shipment SET From_Address_ID = 2,  To_Address_ID = 14 WHERE Shipment_ID = 28;
-- Shipment 29: From 234 Elm Ave (3), To 891 Lavender Ln (15)
UPDATE Shipment SET From_Address_ID = 3,  To_Address_ID = 15 WHERE Shipment_ID = 29;
-- Shipment 30: From 567 Pine Rd (4), To 102 Sycamore Blvd (16)
UPDATE Shipment SET From_Address_ID = 4,  To_Address_ID = 16 WHERE Shipment_ID = 30;
-- Shipment 31: From 890 Maple Dr (5), To 334 Rosewood Dr (17)
UPDATE Shipment SET From_Address_ID = 5,  To_Address_ID = 17 WHERE Shipment_ID = 31;
-- Shipment 32: From 654 Birch Ln (7), To 556 Bluebonnet Way (18)
UPDATE Shipment SET From_Address_ID = 7,  To_Address_ID = 18 WHERE Shipment_ID = 32;
-- Shipment 33: From 777 Walnut St (8), To 789 Juniper St (19)
UPDATE Shipment SET From_Address_ID = 8,  To_Address_ID = 19 WHERE Shipment_ID = 33;
-- Shipment 34: From 888 Spruce Ave (9), To 220 Pecan St (12)
UPDATE Shipment SET From_Address_ID = 9,  To_Address_ID = 12 WHERE Shipment_ID = 34;
-- Shipment 35: From 777 Walnut St (8), To 445 Magnolia Ave (13)
UPDATE Shipment SET From_Address_ID = 8,  To_Address_ID = 13 WHERE Shipment_ID = 35;
-- Shipment 36: From 891 Lavender Ln (15), To 678 Cypress Rd (14)
UPDATE Shipment SET From_Address_ID = 15, To_Address_ID = 14 WHERE Shipment_ID = 36;
-- Shipment 37: From 400 Broadway St (29), To 334 Rosewood Dr (17)
UPDATE Shipment SET From_Address_ID = 29, To_Address_ID = 17 WHERE Shipment_ID = 37;
-- Shipment 38: From 654 Birch Ln (7), To 891 Lavender Ln (15)
UPDATE Shipment SET From_Address_ID = 7,  To_Address_ID = 15 WHERE Shipment_ID = 38;
-- Shipment 39: From 556 Bluebonnet Way (18), To 777 Walnut St (8)
UPDATE Shipment SET From_Address_ID = 18, To_Address_ID = 8  WHERE Shipment_ID = 39;
-- Shipment 40: From 112 Oak St (2), To 888 Spruce Ave (9)
UPDATE Shipment SET From_Address_ID = 2,  To_Address_ID = 9  WHERE Shipment_ID = 40;
-- Shipment 41: From 101 Aspen Ct (11), To 112 Oak St (2)
UPDATE Shipment SET From_Address_ID = 11, To_Address_ID = 2  WHERE Shipment_ID = 41;
-- Shipment 42: From 999 Willow Way (10), To 567 Pine Rd (4)
UPDATE Shipment SET From_Address_ID = 10, To_Address_ID = 4  WHERE Shipment_ID = 42;
-- Shipment 43: From 500 Lubbock Ave (30), To 890 Maple Dr (5)
UPDATE Shipment SET From_Address_ID = 30, To_Address_ID = 5  WHERE Shipment_ID = 43;
-- Shipment 44: From 123 Cottonwood Ct (21), To 654 Birch Ln (7)
UPDATE Shipment SET From_Address_ID = 21, To_Address_ID = 7  WHERE Shipment_ID = 44;
-- Shipment 45: From 789 Juniper St (19), To 101 Aspen Ct (11)
UPDATE Shipment SET From_Address_ID = 19, To_Address_ID = 11 WHERE Shipment_ID = 45;
-- Shipment 46: From 901 Mesquite Rd (20), To 999 Willow Way (10)
UPDATE Shipment SET From_Address_ID = 20, To_Address_ID = 10 WHERE Shipment_ID = 46;
-- Shipment 47: From 234 Elm Ave (3), To 500 Lubbock Ave (30)
UPDATE Shipment SET From_Address_ID = 3,  To_Address_ID = 30 WHERE Shipment_ID = 47;
-- Shipment 48: From 321 Cedar Blvd (6), To 777 Walnut St (8)
UPDATE Shipment SET From_Address_ID = 6,  To_Address_ID = 8  WHERE Shipment_ID = 48;
-- Shipment 49: From 654 Birch Ln (7), To 999 Willow Way (10)
UPDATE Shipment SET From_Address_ID = 7,  To_Address_ID = 10 WHERE Shipment_ID = 49;
-- Shipment 50: From 112 Oak St (2), To 890 Maple Dr (5)
UPDATE Shipment SET From_Address_ID = 2,  To_Address_ID = 5  WHERE Shipment_ID = 50;
-- Shipment 51: From 567 Pine Rd (4), To 234 Elm Ave (3)
UPDATE Shipment SET From_Address_ID = 4,  To_Address_ID = 3  WHERE Shipment_ID = 51;
-- Shipment 52: From 890 Maple Dr (5), To 321 Cedar Blvd (6)
UPDATE Shipment SET From_Address_ID = 5,  To_Address_ID = 6  WHERE Shipment_ID = 52;
-- Shipment 53: From 777 Walnut St (8), To 101 Aspen Ct (11)
UPDATE Shipment SET From_Address_ID = 8,  To_Address_ID = 11 WHERE Shipment_ID = 53;
-- Shipment 54: From 101 Aspen Ct (11), To hk/hkj (22)
UPDATE Shipment SET From_Address_ID = 11, To_Address_ID = 22 WHERE Shipment_ID = 54;
-- Shipment 55: From 101 Aspen Ct (11), To jlk/jkl (23)
UPDATE Shipment SET From_Address_ID = 11, To_Address_ID = 23 WHERE Shipment_ID = 55;
-- Shipment 56: From 101 Aspen Ct (11), To jlk/jkl (23)
UPDATE Shipment SET From_Address_ID = 11, To_Address_ID = 23 WHERE Shipment_ID = 56;
-- Shipment 57: From 101 Aspen Ct (11), To 123 mainst (24)
UPDATE Shipment SET From_Address_ID = 11, To_Address_ID = 24 WHERE Shipment_ID = 57;



-- +++++++++Deleting inventory++++++++++++=====
-- Step 1: Drop the FK constraint
ALTER TABLE Payment
    DROP FOREIGN KEY payment_ibfk_2;

-- Step 2: Now drop the column
ALTER TABLE Payment
    DROP COLUMN Store_ID;

Drop product;
drop store;

-- +++++++++++++roldeid cahgne+++++++++++++===
-- Step 1: Update all references to Supervisor (3) and Manager (4) to Admin (5)
UPDATE Employee SET Role_ID = 5 WHERE Role_ID = 3 OR Role_ID = 4;

-- Step 2: Delete Supervisor and Manager roles
DELETE FROM Role WHERE Role_ID IN (3, 4);

Delete from department where Department_ID =3;
Delete from department where Department_ID =5;

-- query clean up
-- Step 1: Drop the FK constraint first
ALTER TABLE Package
    DROP FOREIGN KEY fk_package_payment;

-- Step 2: Now drop the column
ALTER TABLE Package
    DROP COLUMN Payment_ID;

-- Step 1: Add Package Tracking_Number to Payment
ALTER TABLE Payment
    ADD COLUMN Tracking_Number VARCHAR(10),
    ADD FOREIGN KEY (Tracking_Number) REFERENCES Package(Tracking_Number);

-- Step 2: Migrate existing links from Package.Payment_ID -> Payment.Tracking_Number
UPDATE Payment p
JOIN Package pkg ON pkg.Payment_ID = p.Payment_ID
SET p.Tracking_Number = pkg.Tracking_Number;

-- Step 3: Drop FK constraint on Package.Payment_ID (replace name with actual from SHOW CREATE TABLE)
ALTER TABLE Package
    DROP FOREIGN KEY package_ibfk_x;

-- Step 4: Drop Payment_ID from Package
ALTER TABLE Package
    DROP COLUMN Payment_ID;
 alter table package drop column Created_At;
 alter table package drop column price;






