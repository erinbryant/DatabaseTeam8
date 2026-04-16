-- ============================================================
--  POST OFFICE 8 — COMPLETE SEED DATA
--  Run this AFTER Schema_Combined.sql is loaded
--  Insert order matters due to foreign keys
-- ============================================================

-- ── 1. POST OFFICES ──────────────────────────────────────────────────────
INSERT INTO Post_Office (House_Number, Street, City, State, Zip_First3, Zip_Last2, Country, Phone_Number,
  Sun_Start_Time, Sun_Finish_Time,
  Mon_Start_Time, Mon_Finish_Time,
  Tue_Start_Time, Tue_Finish_Time,
  Wed_Start_Time, Wed_Finish_Time,
  Thu_Start_Time, Thu_Finish_Time,
  Fri_Start_Time, Fri_Finish_Time,
  Sat_Start_Time, Sat_Finish_Time
) VALUES
('100',  'Main St',       'Houston',     'TX', '770', '01', 'USA', '713-555-0101', '00:00:00','00:00:00', '08:00:00','18:00:00', '08:00:00','18:00:00', '08:00:00','18:00:00', '08:00:00','18:00:00', '08:00:00','18:00:00', '09:00:00','14:00:00'),
('200',  'Commerce St',   'Dallas',      'TX', '752', '01', 'USA', '214-555-0202', '00:00:00','00:00:00', '08:00:00','17:00:00', '08:00:00','17:00:00', '08:00:00','17:00:00', '08:00:00','17:00:00', '08:00:00','17:00:00', '09:00:00','13:00:00'),
('300',  'Congress Ave',  'Austin',      'TX', '733', '01', 'USA', '512-555-0303', '00:00:00','00:00:00', '09:00:00','17:00:00', '09:00:00','17:00:00', '09:00:00','17:00:00', '09:00:00','17:00:00', '09:00:00','17:00:00', '10:00:00','14:00:00'),
('400',  'Broadway St',   'San Antonio', 'TX', '782', '01', 'USA', '210-555-0404', '00:00:00','00:00:00', '08:00:00','18:00:00', '08:00:00','18:00:00', '08:00:00','18:00:00', '08:00:00','18:00:00', '08:00:00','18:00:00', '09:00:00','15:00:00'),
('500',  'Lubbock Ave',   'Lubbock',     'TX', '794', '01', 'USA', '806-555-0505', '00:00:00','00:00:00', '08:00:00','17:00:00', '08:00:00','17:00:00', '08:00:00','17:00:00', '08:00:00','17:00:00', '08:00:00','17:00:00', '00:00:00','00:00:00');

-- ── 2. STORES ────────────────────────────────────────────────────────────
INSERT INTO Store (Post_Office_ID) VALUES (1),(2),(3),(4),(5);

-- ── 3. PRODUCTS ──────────────────────────────────────────────────────────
INSERT INTO Product (Universal_Product_Code, Store_ID, Product_name, Price, Quantity) VALUES
('UPC-001', 1, 'Bubble Mailer (Small)',     0.45,  340),
('UPC-002', 1, 'Shipping Box (Medium)',     1.20,   12),
('UPC-003', 1, 'Packing Tape Roll',         3.99,   88),
('UPC-004', 1, 'Fragile Sticker Sheet',     0.99,    5),
('UPC-005', 2, 'Bubble Mailer (Large)',     0.85,  210),
('UPC-006', 2, 'Hazmat Label Pack',         5.50,    0),
('UPC-007', 2, 'Shipping Box (Large)',      2.10,   54),
('UPC-008', 3, 'Shipping Box (Small)',      0.80,    8),
('UPC-009', 3, 'Foam Padding Sheet',        2.75,  150),
('UPC-010', 3, 'Priority Mail Envelope',    0.00,  300),
('UPC-011', 4, 'Packing Peanuts (Bag)',     4.50,   42),
('UPC-012', 4, 'Stretch Wrap Roll',         6.99,   19),
('UPC-013', 5, 'Bubble Wrap (10ft)',        7.25,    3),
('UPC-014', 5, 'Rubber Bands (Pack)',       1.10,   95);

-- ── 4. CUSTOMERS ─────────────────────────────────────────────────────────
-- Password = 'password123'
INSERT INTO Customer (First_Name, Middle_Name, Last_Name, House_Number, Street, City, State, Zip_First3, Zip_Last2, Password_Hash, Email_Address, Phone_Number, Birth_Day, Birth_Month, Birth_Year, Sex) VALUES
('James',    'A', 'Wilson',    '112', 'Oak St',      'Houston',     'TX', '770', '02', '$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy', 'james.wilson@email.com',    '713-555-1001', 15, 3, 1985, 'M'),
('Maria',  NULL,  'Garcia',    '234', 'Elm Ave',     'Houston',     'TX', '770', '03', '$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy', 'maria.garcia@email.com',    '713-555-1002', 22, 7, 1990, 'F'),
('Robert',   'J', 'Smith',     '567', 'Pine Rd',     'Dallas',      'TX', '752', '04', '$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy', 'robert.smith@email.com',    '214-555-1003',  8, 11,1988, 'M'),
('Linda',  NULL,  'Johnson',   '890', 'Maple Dr',    'Dallas',      'TX', '752', '05', '$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy', 'linda.johnson@email.com',   '214-555-1004', 30, 1, 1992, 'F'),
('Carlos',   'M', 'Martinez',  '321', 'Cedar Blvd',  'Austin',      'TX', '733', '06', '$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy', 'carlos.martinez@email.com', '512-555-1005',  5, 6, 1987, 'M'),
('Susan',    'L', 'Brown',     '654', 'Birch Ln',    'Austin',      'TX', '733', '07', '$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy', 'susan.brown@email.com',     '512-555-1006', 18, 9, 1995, 'F'),
('David',  NULL,  'Lee',       '777', 'Walnut St',   'San Antonio', 'TX', '782', '08', '$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy', 'david.lee@email.com',       '210-555-1007', 12, 4, 1983, 'M'),
('Patricia', 'R', 'Taylor',    '888', 'Spruce Ave',  'San Antonio', 'TX', '782', '09', '$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy', 'patricia.taylor@email.com', '210-555-1008', 27, 12,1991, 'F'),
('Michael', NULL, 'Anderson',  '999', 'Willow Way',  'Lubbock',     'TX', '794', '10', '$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy', 'michael.anderson@email.com','806-555-1009',  3, 8, 1986, 'M'),
('Barbara',  'E', 'Thomas',    '101', 'Aspen Ct',    'Lubbock',     'TX', '794', '11', '$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy', 'barbara.thomas@email.com',  '806-555-1010', 14, 2, 1993, 'F');

-- ── 5. ROLES ─────────────────────────────────────────────────────────────
INSERT INTO Role (Role_Name, Role_Description, Access_Level) VALUES
('Clerk',      'Handles counter transactions and customer service',  1),
('Driver',     'Delivers packages to recipients',                    1),
('Supervisor', 'Oversees daily operations of a post office',         3),
('Manager',    'Manages a post office branch',                       4),
('Admin',      'Full system access',                                 5);

-- ── 6. DEPARTMENTS ───────────────────────────────────────────────────────
INSERT INTO Department (Department_Name) VALUES
('Customer Service'),
('Delivery'),
('Sorting'),
('Management'),
('IT');

-- ── 7. EMPLOYEES ─────────────────────────────────────────────────────────
-- Password = 'employee123'
INSERT INTO Employee (Post_Office_ID, Supervisor_ID, Role_ID, Department_ID, First_Name, Middle_Name, Last_Name, Birth_Day, Birth_Month, Birth_Year, Password_Hash, Email_Address, Phone_Number, Sex, Salary) VALUES
(1, 1, 1, 1, 'Richard', 'A', 'Moore',    15, 3,  1975, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'richard.moore@postoffice8.com',   '713-500-2001', 'M', 72000.00),
(2, NULL, 4, 4, 'Nancy',   'B', 'White',     8, 7,  1980, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'nancy.white@postoffice8.com',     '214-500-2002', 'F', 70000.00),
(3, NULL, 4, 4, 'Thomas',  'C', 'Harris',   22, 11, 1978, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'thomas.harris@postoffice8.com',   '512-500-2003', 'M', 71000.00),
(1, 1,    3, 1, 'Jessica', 'D', 'Clark',    30, 5,  1988, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'jessica.clark@postoffice8.com',   '713-500-2004', 'F', 52000.00),
(1, 1,    3, 2, 'Kevin',   'E', 'Lewis',    12, 9,  1985, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'kevin.lewis@postoffice8.com',     '713-500-2005', 'M', 51000.00),
(2, 2,    3, 1, 'Amanda',  'F', 'Robinson',  4, 2,  1990, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'amanda.robinson@postoffice8.com', '214-500-2006', 'F', 50000.00),
(3, 3,    3, 2, 'Brian',   'G', 'Walker',   19, 8,  1983, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'brian.walker@postoffice8.com',    '512-500-2007', 'M', 51500.00),
(1, 4,    1, 1, 'Ashley',  'H', 'Hall',      7, 1,  1995, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'ashley.hall@postoffice8.com',     '713-500-2008', 'F', 38000.00),
(1, 5,    2, 2, 'Joshua',  'I', 'Young',    25, 6,  1993, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'joshua.young@postoffice8.com',    '713-500-2009', 'M', 40000.00),
(2, 6,    1, 1, 'Megan',   'J', 'Allen',    14, 4,  1997, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'megan.allen@postoffice8.com',     '214-500-2010', 'F', 37500.00),
(2, 6,    2, 2, 'Tyler',   'K', 'Scott',     3, 10, 1991, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'tyler.scott@postoffice8.com',     '214-500-2011', 'M', 41000.00),
(3, 7,    1, 1, 'Lauren',  'L', 'Adams',    28, 12, 1996, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'lauren.adams@postoffice8.com',    '512-500-2012', 'F', 38500.00),
(4, NULL, 4, 4, 'Steven',  'M', 'Baker',    11, 3,  1977, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'steven.baker@postoffice8.com',    '210-500-2013', 'M', 70500.00),
(5, NULL, 4, 4, 'Rachel',  'N', 'Gonzalez',  6, 8,  1982, '$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q', 'rachel.gonzalez@postoffice8.com', '806-500-2014', 'F', 69000.00);

-- ── 8. PACKAGE TYPES ─────────────────────────────────────────────────────
INSERT INTO Package_Type (Package_Type_Code, Description, Type_Name) VALUES
('GEN', 'Standard ground delivery',           'general shipping'),
('EXP', 'Expedited express delivery',         'express'),
('OVR', 'Oversized items exceeding standard', 'oversize');

-- ── 9. EXCESS FEES ───────────────────────────────────────────────────────
INSERT INTO Excess_Fee (Fee_Type_Code, Description, Type_Name, Additional_Price) VALUES
('HAZ',  'Hazardous materials handling fee', 'Hazardous Material', 15.00),
('FRAG', 'Fragile item special handling',    'Fragile Handling',    5.00),
('SIG',  'Signature confirmation required',  'Signature Required',  3.50),
('FUEL', 'Fuel surcharge',                   'Fuel Surcharge',      2.25);

-- ── 10. PACKAGES ─────────────────────────────────────────────────────────
INSERT INTO Package (Tracking_Number, Sender_ID, Recipient_ID, Dim_X, Dim_Y, Dim_Z, Package_Type_Code, Weight, Zone, Oversize, Requires_Signature, Price) VALUES
('TRK0000001', 1,  3,  12.00,  8.00,  6.00, 'GEN',  4.20, 4, 0, 0,  8.50),
('TRK0000002', 2,  4,  24.00, 18.00, 12.00, 'GEN', 12.70, 7, 1, 0, 22.00),
('TRK0000003', 3,  5,   6.00,  4.00,  2.00, 'EXP',  0.80, 2, 0, 0, 14.25),
('TRK0000004', 4,  6,  36.00, 24.00, 24.00, 'OVR', 48.00, 5, 1, 1, 65.00),
('TRK0000005', 5,  7,  10.00,  7.00,  5.00, 'EXP',  2.10, 3, 0, 1, 18.75),
('TRK0000006', 6,  8,  15.00, 12.00,  8.00, 'GEN',  6.50, 6, 0, 0, 11.00),
('TRK0000007', 7,  9,   8.00,  8.00,  8.00, 'GEN',  3.30, 2, 0, 0,  7.50),
('TRK0000008', 8,  10, 20.00, 16.00, 10.00, 'EXP',  9.80, 8, 0, 1, 31.50),
('TRK0000009', 9,  1,  30.00, 20.00, 15.00, 'OVR', 35.00, 4, 1, 0, 48.00),
('TRK0000010', 10, 2,   5.00,  5.00,  5.00, 'GEN',  1.20, 1, 0, 0,  5.25),
('TRK0000011', 1,  5,  18.00, 14.00,  9.00, 'GEN',  7.60, 5, 0, 0, 13.00),
('TRK0000012', 3,  7,  12.00, 10.00,  6.00, 'EXP',  3.40, 3, 0, 1, 20.00),
('TRK0000013', 2,  8,  40.00, 30.00, 20.00, 'OVR', 55.00, 9, 1, 1, 82.00),
('TRK0000014', 5,  10,  7.00,  5.00,  4.00, 'GEN',  2.00, 2, 0, 0,  6.75),
('TRK0000015', 6,  1,  22.00, 18.00, 12.00, 'EXP', 11.50, 6, 0, 0, 27.00);

-- ── 11. STATUS CODES ─────────────────────────────────────────────────────
INSERT INTO Status_Code (Status_Name, Is_Final_Status) VALUES
('Pending',          0),
('In Transit',       0),
('Out for Delivery', 0),
('Delivered',        1),
('Delayed',          0),
('Returned',         1),
('Lost',             1);

-- ── 12. SHIPMENTS ────────────────────────────────────────────────────────
INSERT INTO Shipment (Status_Code, Employee_ID, From_House_Number, From_Street, From_City, From_State, From_Zip_First3, From_Zip_Last2, To_House_Number, To_Street, To_City, To_State, To_Zip_First3, To_Zip_Last2, Departure_Time_Stamp, Arrival_Time_Stamp) VALUES
(4,  9,  '112', 'Oak St',      'Houston',     'TX', '770', '02', '567', 'Pine Rd',      'Dallas',      'TX', '752', '04', '2024-03-18 08:00:00', '2024-03-19 14:30:00'),
(4,  11, '234', 'Elm Ave',     'Houston',     'TX', '770', '03', '890', 'Maple Dr',     'Dallas',      'TX', '752', '05', '2024-03-17 09:00:00', '2024-03-18 16:00:00'),
(2,  9,  '321', 'Cedar Blvd',  'Austin',      'TX', '733', '06', '777', 'Walnut St',    'San Antonio', 'TX', '782', '08', '2024-03-20 07:30:00', NULL),
(5,  11, '654', 'Birch Ln',    'Austin',      'TX', '733', '07', '888', 'Spruce Ave',   'San Antonio', 'TX', '782', '09', '2024-03-19 10:00:00', NULL),
(1,  8,  '999', 'Willow Way',  'Lubbock',     'TX', '794', '10', '101', 'Aspen Ct',     'Lubbock',     'TX', '794', '11', NULL,                  NULL),
(3,  12, '567', 'Pine Rd',     'Dallas',      'TX', '752', '04', '112', 'Oak St',       'Houston',     'TX', '770', '02', '2024-03-21 06:00:00', NULL),
(4,  9,  '777', 'Walnut St',   'San Antonio', 'TX', '782', '08', '234', 'Elm Ave',      'Houston',     'TX', '770', '03', '2024-03-15 08:00:00', '2024-03-17 11:00:00'),
(2,  11, '100', 'Main St',     'Houston',     'TX', '770', '01', '300', 'Congress Ave', 'Austin',      'TX', '733', '01', '2024-03-21 09:00:00', NULL);

-- ── 13. SHIPMENT_PACKAGE ─────────────────────────────────────────────────
INSERT INTO Shipment_Package (Shipment_ID, Tracking_Number) VALUES
(1, 'TRK0000001'),
(1, 'TRK0000002'),
(2, 'TRK0000006'),
(3, 'TRK0000003'),
(3, 'TRK0000005'),
(4, 'TRK0000004'),
(5, 'TRK0000010'),
(6, 'TRK0000007'),
(6, 'TRK0000008'),
(7, 'TRK0000009'),
(8, 'TRK0000011'),
(8, 'TRK0000012');

-- ── 14. DELIVERIES ───────────────────────────────────────────────────────
INSERT INTO Delivery (Tracking_Number, Delivered_Date, Signature_Required, Signature_Received, Delivery_Status_Code, Delivered_By) VALUES
('TRK0000001', '2024-03-19 14:30:00', 0, NULL, 4,  9),
('TRK0000002', '2024-03-18 16:00:00', 0, NULL, 4, 11),
('TRK0000003', NULL,                  0, NULL, 2,  9),
('TRK0000004', NULL,                  1, NULL, 5, 11),
('TRK0000005', NULL,                  1, NULL, 2,  9),
('TRK0000006', '2024-03-17 11:30:00', 0, NULL, 4, 12),
('TRK0000007', NULL,                  0, NULL, 3,  9),
('TRK0000008', NULL,                  1, NULL, 2, 11),
('TRK0000009', '2024-03-17 11:00:00', 0, NULL, 4,  9),
('TRK0000010', NULL,                  0, NULL, 1,  8),
('TRK0000011', NULL,                  0, NULL, 2,  9),
('TRK0000012', NULL,                  1, NULL, 2, 12),
('TRK0000013', NULL,                  1, NULL, 5, 11),
('TRK0000014', NULL,                  0, NULL, 1,  8),
('TRK0000015', NULL,                  0, NULL, 3,  9);

-- ── 15. SUPPORT TICKETS ──────────────────────────────────────────────────
INSERT INTO Support_Ticket (User_ID, Package_ID, Assigned_Employee_ID, Issue_Type, Description, Resolution_Note, Ticket_Status_Code) VALUES
(1, 'TRK0000004', 4, 1, 'Package delayed, expected delivery was 3 days ago',    NULL,                               0),
(3, 'TRK0000003', 6, 2, 'Package shows in transit but no updates for 2 days',   NULL,                               0),
(5, 'TRK0000005', 4, 1, 'Need to change delivery address',                      NULL,                               0),
(2, 'TRK0000001', 4, 3, 'Item arrived damaged',                                 'Refund issued to customer',        1),
(7, 'TRK0000009', 7, 2, 'Tracking not updating',                                'Carrier delay confirmed, resolved',1);

-- ── 16. PAYMENTS ─────────────────────────────────────────────────────────
INSERT INTO Payment (Customer_ID, Store_ID, Items, Payment_Type, Payment_Amount, Payment_Status, Employee_ID) VALUES
(1,  1, 2, 1, 12.50, 'completed', 1),
(2,  1, 1, 2,  8.25, 'completed', 1),
(3,  2, 3, 1, 22.75, 'completed', 2),
(4,  2, 1, 1,  5.50, 'completed', 2),
(5,  3, 4, 2, 31.00, 'completed', 3),
(6,  3, 2, 1, 14.50, 'completed', 3),
(7,  4, 1, 2,  6.99, 'completed', 4),
(8,  4, 3, 1, 18.00, 'completed', 4),
(9,  5, 2, 1, 15.25, 'completed', 5),
(10, 5, 1, 2,  7.25, 'completed', 5);

-- ── 17. PACKAGE PRICING (complete — all zones covered) ───────────────────
TRUNCATE TABLE package_pricing;

INSERT INTO package_pricing (Package_Type_Code, Min_Weight, Max_Weight, Zone, Price) VALUES
-- GEN 0-1 lb
('GEN',  0.00,  1.00, 1,  4.50),
('GEN',  0.00,  1.00, 2,  5.25),
('GEN',  0.00,  1.00, 3,  6.00),
('GEN',  0.00,  1.00, 4,  6.75),
('GEN',  0.00,  1.00, 5,  7.50),
('GEN',  0.00,  1.00, 6,  8.25),
('GEN',  0.00,  1.00, 7,  9.00),
('GEN',  0.00,  1.00, 8,  9.75),
('GEN',  0.00,  1.00, 9, 10.50),
-- GEN 1-5 lb
('GEN',  1.01,  5.00, 1,  9.00),
('GEN',  1.01,  5.00, 2, 10.00),
('GEN',  1.01,  5.00, 3, 11.00),
('GEN',  1.01,  5.00, 4, 12.00),
('GEN',  1.01,  5.00, 5, 13.00),
('GEN',  1.01,  5.00, 6, 14.25),
('GEN',  1.01,  5.00, 7, 15.50),
('GEN',  1.01,  5.00, 8, 16.75),
('GEN',  1.01,  5.00, 9, 18.00),
-- GEN 5-15 lb
('GEN',  5.01, 15.00, 1, 12.00),
('GEN',  5.01, 15.00, 2, 13.00),
('GEN',  5.01, 15.00, 3, 14.00),
('GEN',  5.01, 15.00, 4, 16.00),
('GEN',  5.01, 15.00, 5, 19.00),
('GEN',  5.01, 15.00, 6, 22.00),
('GEN',  5.01, 15.00, 7, 25.00),
('GEN',  5.01, 15.00, 8, 28.00),
('GEN',  5.01, 15.00, 9, 31.00),
-- EXP 0-1 lb
('EXP',  0.00,  1.00, 1,  9.00),
('EXP',  0.00,  1.00, 2, 11.00),
('EXP',  0.00,  1.00, 3, 13.00),
('EXP',  0.00,  1.00, 4, 15.00),
('EXP',  0.00,  1.00, 5, 16.50),
('EXP',  0.00,  1.00, 6, 18.00),
('EXP',  0.00,  1.00, 7, 19.50),
('EXP',  0.00,  1.00, 8, 21.00),
('EXP',  0.00,  1.00, 9, 22.50),
-- EXP 1-5 lb
('EXP',  1.01,  5.00, 1, 18.00),
('EXP',  1.01,  5.00, 2, 20.00),
('EXP',  1.01,  5.00, 3, 22.00),
('EXP',  1.01,  5.00, 4, 24.00),
('EXP',  1.01,  5.00, 5, 26.00),
('EXP',  1.01,  5.00, 6, 28.00),
('EXP',  1.01,  5.00, 7, 30.00),
('EXP',  1.01,  5.00, 8, 32.00),
('EXP',  1.01,  5.00, 9, 34.00),
-- EXP 5-15 lb
('EXP',  5.01, 15.00, 1, 24.00),
('EXP',  5.01, 15.00, 2, 26.00),
('EXP',  5.01, 15.00, 3, 28.00),
('EXP',  5.01, 15.00, 4, 30.00),
('EXP',  5.01, 15.00, 5, 33.00),
('EXP',  5.01, 15.00, 6, 36.00),
('EXP',  5.01, 15.00, 7, 38.00),
('EXP',  5.01, 15.00, 8, 40.00),
('EXP',  5.01, 15.00, 9, 42.00),
-- OVR 15-35 lb
('OVR', 15.01, 35.00, 1, 32.00),
('OVR', 15.01, 35.00, 2, 38.00),
('OVR', 15.01, 35.00, 3, 42.00),
('OVR', 15.01, 35.00, 4, 46.00),
('OVR', 15.01, 35.00, 5, 52.00),
('OVR', 15.01, 35.00, 6, 56.00),
('OVR', 15.01, 35.00, 7, 61.00),
('OVR', 15.01, 35.00, 8, 68.00),
('OVR', 15.01, 35.00, 9, 74.00),
-- OVR 35-70 lb
('OVR', 35.01, 70.00, 1, 58.00),
('OVR', 35.01, 70.00, 2, 62.00),
('OVR', 35.01, 70.00, 3, 66.00),
('OVR', 35.01, 70.00, 4, 70.00),
('OVR', 35.01, 70.00, 5, 75.00),
('OVR', 35.01, 70.00, 6, 80.00),
('OVR', 35.01, 70.00, 7, 85.00),
('OVR', 35.01, 70.00, 8, 88.00),
('OVR', 35.01, 70.00, 9, 92.00);