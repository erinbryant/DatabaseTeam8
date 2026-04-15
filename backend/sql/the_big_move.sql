
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

-- Add Status_Code FK to Package
ALTER TABLE Package
    ADD COLUMN Status_Code INT NOT NULL DEFAULT 1,
    ADD FOREIGN KEY (Status_Code) REFERENCES status_code(Status_Code);

-- Drop Status_Code FK from Delivery (replace constraint name with actual from SHOW CREATE TABLE)
ALTER TABLE Delivery
    DROP FOREIGN KEY delivery_ibfk_2,
    DROP COLUMN Delivery_Status_Code;

UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000001';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000002';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000003';
UPDATE Package SET Status_Code = 3 WHERE Tracking_Number = 'TRK0000004';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000005';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000006';
UPDATE Package SET Status_Code = 3 WHERE Tracking_Number = 'TRK0000007';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000008';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000009';
UPDATE Package SET Status_Code = 1 WHERE Tracking_Number = 'TRK0000010';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000011';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000012';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000016';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000017';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000018';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000019';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000020';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000021';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000022';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000023';
UPDATE Package SET Status_Code = 3 WHERE Tracking_Number = 'TRK0000024';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000025';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000026';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000027';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000028';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000029';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000030';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000031';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000032';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000033';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000034';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000035';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000036';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000037';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000038';
UPDATE Package SET Status_Code = 5 WHERE Tracking_Number = 'TRK0000039';
UPDATE Package SET Status_Code = 5 WHERE Tracking_Number = 'TRK0000040';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000041';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000042';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000043';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000044';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000045';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000046';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000047';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000048';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000049';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000050';
UPDATE Package SET Status_Code = 3 WHERE Tracking_Number = 'TRK0000051';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000052';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000053';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000054';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000055';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000056';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000057';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000058';
UPDATE Package SET Status_Code = 5 WHERE Tracking_Number = 'TRK0000059';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000060';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000061';
UPDATE Package SET Status_Code = 3 WHERE Tracking_Number = 'TRK0000062';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000063';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000064';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000065';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000066';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000067';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000068';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000069';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000070';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000071';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000072';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000073';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000074';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000075';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000076';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000077';
UPDATE Package SET Status_Code = 4 WHERE Tracking_Number = 'TRK0000078';
UPDATE Package SET Status_Code = 2 WHERE Tracking_Number = 'TRK0000079';
UPDATE Package SET Status_Code = 7 WHERE Tracking_Number = 'TRK0000080';
UPDATE Package SET Status_Code = 7 WHERE Tracking_Number = 'TRK0000081';
UPDATE Package SET Status_Code = 7 WHERE Tracking_Number = 'TRK0000082';
UPDATE Package SET Status_Code = 6 WHERE Tracking_Number = 'TRK0000083';
UPDATE Package SET Status_Code = 6 WHERE Tracking_Number = 'TRK0000084';
UPDATE Package SET Status_Code = 6 WHERE Tracking_Number = 'TRK0000085';
UPDATE Package SET Status_Code = 1 WHERE Tracking_Number = 'TRK0000086';
UPDATE Package SET Status_Code = 1 WHERE Tracking_Number = 'TRK0000087';
UPDATE Package SET Status_Code = 1 WHERE Tracking_Number = 'TRK0000088';
UPDATE Package SET Status_Code = 1 WHERE Tracking_Number = 'TRK0000089';

ALTER TABLE Payment
DROP COLUMN Payment_Type,
DROP COLUMN Payment_Status,
DROP COLUMN Items,
CHANGE date_created Date_Created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE Package
ADD COLUMN To_Address_ID INT NOT NULL,
ADD COLUMN Recipient_Name VARCHAR(100) NOT NULL;

ALTER TABLE customer
ADD COLUMN is_Active TINYINT(1) NOT NULL DEFAULT 0
CHECK (is_Active IN (0, 1));

UPDATE customer
SET is_Active = 0
WHERE customer_id > 0;

ALTER TABLE Package
MODIFY To_Address_ID INT NULL;

UPDATE Package
SET To_Address_ID = NULL
WHERE To_Address_ID = 0;

UPDATE Package p
JOIN Customer c 
    ON p.Recipient_ID = c.Customer_ID
SET p.To_Address_ID = c.Address_ID
WHERE p.To_Address_ID IS NULL;

TRUNCATE TABLE Payment;

DELETE FROM Payment;

ALTER TABLE Payment AUTO_INCREMENT = 1;

INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (3, 8.50, 'TRK0000001');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (4, 22.00, 'TRK0000002');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (5, 14.25, 'TRK0000003');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (6, 65.00, 'TRK0000004');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (7, 18.75, 'TRK0000005');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (8, 11.00, 'TRK0000006');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (9, 7.50, 'TRK0000007');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (10, 31.50, 'TRK0000008');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (1, 48.00, 'TRK0000009');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (2, 5.25, 'TRK0000010');

INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (5, 13.00, 'TRK0000011');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (7, 20.00, 'TRK0000012');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (8, 82.00, 'TRK0000013');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (10, 6.75, 'TRK0000014');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (1, 27.00, 'TRK0000015');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (11, 10.00, 'TRK0000016');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (2, 13.00, 'TRK0000017');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (12, 16.00, 'TRK0000018');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (3, 9.00, 'TRK0000019');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (13, 52.00, 'TRK0000020');

INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (4, 5.25, 'TRK0000021');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (14, 24.00, 'TRK0000022');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (5, 80.00, 'TRK0000023');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (15, 11.00, 'TRK0000024');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (6, 26.00, 'TRK0000025');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (16, 4.50, 'TRK0000026');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (7, 42.00, 'TRK0000027');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (17, 16.00, 'TRK0000028');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (8, 11.00, 'TRK0000029');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (18, 61.00, 'TRK0000030');

INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (9, 10.00, 'TRK0000031');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (19, 22.00, 'TRK0000032');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (10, 19.00, 'TRK0000033');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (20, 15.00, 'TRK0000034');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (1, 88.00, 'TRK0000035');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (2, 9.00, 'TRK0000036');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (3, 28.00, 'TRK0000037');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (4, 14.00, 'TRK0000038');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (5, 11.00, 'TRK0000039');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (6, 46.00, 'TRK0000040');

INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (7, 13.00, 'TRK0000041');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (8, 30.00, 'TRK0000042');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (9, 74.00, 'TRK0000043');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (10, 13.00, 'TRK0000044');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (11, 22.00, 'TRK0000045');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (12, 4.50, 'TRK0000046');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (13, 52.00, 'TRK0000047');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (14, 12.00, 'TRK0000048');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (15, 28.00, 'TRK0000049');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (16, 25.00, 'TRK0000050');

INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (17, 20.00, 'TRK0000051');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (18, 66.00, 'TRK0000052');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (19, 19.00, 'TRK0000053');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (11, 24.00, 'TRK0000054');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (12, 68.00, 'TRK0000055');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (13, 10.00, 'TRK0000056');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (14, 34.00, 'TRK0000057');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (15, 56.00, 'TRK0000058');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (16, 9.00, 'TRK0000059');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (17, 22.00, 'TRK0000060');

INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (18, 25.00, 'TRK0000061');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (19, 16.50, 'TRK0000062');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (20, 70.00, 'TRK0000063');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (1, 10.00, 'TRK0000064');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (2, 18.00, 'TRK0000065');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (3, 11.00, 'TRK0000066');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (4, 24.00, 'TRK0000067');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (5, 19.00, 'TRK0000068');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (6, 56.00, 'TRK0000069');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (7, 20.00, 'TRK0000070');

INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (8, 14.00, 'TRK0000071');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (9, 33.00, 'TRK0000072');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (10, 10.00, 'TRK0000073');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (11, 30.00, 'TRK0000074');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (12, 22.00, 'TRK0000075');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (13, 85.00, 'TRK0000076');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (14, 22.00, 'TRK0000077');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (15, 16.00, 'TRK0000078');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (16, 33.00, 'TRK0000079');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (17, 12.00, 'TRK0000080');

INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (18, 28.00, 'TRK0000081');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (19, 68.00, 'TRK0000082');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (20, 11.00, 'TRK0000083');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (21, 26.00, 'TRK0000084');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (22, 25.00, 'TRK0000085');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (21, 40.75, 'TRK0000086');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (22, 50.25, 'TRK0000087');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (23, 37.50, 'TRK0000088');
INSERT INTO Payment (Customer_ID, Payment_Amount, Tracking_Number) VALUES (23, 28.50, 'TRK0000089');


