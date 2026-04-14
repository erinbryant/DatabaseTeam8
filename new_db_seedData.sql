-- ============================================================
-- ADDRESS
-- ============================================================
INSERT INTO Address (Apt_Number, House_Number, Street, City, State, Zip_First3, Zip_Last2, Zip_Plus4)
VALUES
(NULL, '123', 'Main St', 'Houston', 'TX', '770', '02', '1234'),
('Apt 4B', '456', 'Oak Ave', 'Dallas', 'TX', '752', '01', NULL),
(NULL, '789', 'Pine Rd', 'Austin', 'TX', '733', '01', '5678'),
(NULL, '321', 'Maple Dr', 'San Antonio', 'TX', '782', '05', NULL),
('Suite 200', '654', 'Elm St', 'Fort Worth', 'TX', '761', '02', '4321'),
(NULL, '888', 'Cedar Ln', 'Houston', 'TX', '770', '03', NULL),
(NULL, '999', 'Birch Blvd', 'Dallas', 'TX', '752', '02', NULL);

-- ============================================================
-- POST OFFICE
-- ============================================================
INSERT INTO Post_Office (Address_ID, Phone_Number,
Mon_Start_Time, Mon_Finish_Time,
Tue_Start_Time, Tue_Finish_Time,
Wed_Start_Time, Wed_Finish_Time,
Thu_Start_Time, Thu_Finish_Time,
Fri_Start_Time, Fri_Finish_Time)
VALUES
(1, '281-555-1000','08:00:00','17:00:00','08:00:00','17:00:00','08:00:00','17:00:00','08:00:00','17:00:00','08:00:00','17:00:00'),
(2, '972-555-2000','09:00:00','18:00:00','09:00:00','18:00:00','09:00:00','18:00:00','09:00:00','18:00:00','09:00:00','18:00:00');

-- ============================================================
-- STORE
-- ============================================================
INSERT INTO Store (Post_Office_ID)
VALUES (1),(2);

-- ============================================================
-- PRODUCT
-- ============================================================
INSERT INTO Product (Universal_Product_Code, Store_ID, Product_Name, Price, Quantity)
VALUES
('UPC001', 1, 'Shipping Box Small', 2.99, 100),
('UPC002', 1, 'Shipping Box Large', 5.99, 50),
('UPC003', 2, 'Packing Tape', 3.49, 200);

-- ============================================================
-- ROLE
-- ============================================================
INSERT INTO Role (Role_Name, Role_Description, Access_Level)
VALUES
('Clerk', 'Handles customer service', 1),
('Supervisor', 'Oversees employees', 3),
('Manager', 'Manages operations', 4),
('Admin', 'Full system access', 5);

-- ============================================================
-- DEPARTMENT
-- ============================================================
INSERT INTO Department (Department_Name)
VALUES
('Customer Service'),
('Logistics'),
('Management');

-- ============================================================
-- CUSTOMER
-- ============================================================
INSERT INTO Customer
(First_Name, Middle_Name, Last_Name, Address_ID, Password_Hash, Email_Address, Phone_Number, Birth_Day, Birth_Month, Birth_Year, Sex)
VALUES
('John', NULL, 'Doe', 1, 'hash1', 'john.doe@email.com', '281-555-1111', 15, 6, 1995, 'M'),
('Jane', 'A', 'Smith', 2, 'hash2', 'jane.smith@email.com', '972-555-2222', 22, 9, 1998, 'F'),
('Carlos', NULL, 'Lopez', 3, 'hash3', 'carlos.lopez@email.com', '512-555-3333', 10, 12, 1992, 'M');

-- ============================================================
-- EMPLOYEE
-- ============================================================
INSERT INTO Employee
(Post_Office_ID, Supervisor_ID, Role_ID, Department_ID,
 First_Name, Middle_Name, Last_Name,
 Birth_Day, Birth_Month, Birth_Year,
 Password_Hash, Email_Address, Phone_Number,
 Sex, Salary, Hours_Worked)
VALUES
(1, NULL, 3, 3, 'Alice', 'M', 'Johnson', 5, 4, 1985, 'hash_emp1', 'alice@post.com', '281-555-4444', 'F', 60000, 40),
(1, 1, 1, 1, 'Bob', 'K', 'Williams', 12, 8, 1990, 'hash_emp2', 'bob@post.com', '281-555-5555', 'M', 35000, 38),
(2, NULL, 2, 2, 'Eve', 'L', 'Davis', 20, 3, 1988, 'hash_emp3', 'eve@post.com', '972-555-6666', 'F', 50000, 40);

-- ============================================================
-- PACKAGE TYPE
-- ============================================================
INSERT INTO Package_Type (Package_Type_Code, Description, Type_Name)
VALUES
('GEN', 'Standard shipping', 'general shipping'),
('EXP', 'Fast delivery', 'express'),
('OVR', 'Oversized package', 'oversize');

-- ============================================================
-- EXCESS FEE
-- ============================================================
INSERT INTO Excess_Fee (Fee_Type_Code, Description, Type_Name, Additional_Price)
VALUES
('F1', 'Overweight fee', 'Weight', 10.00),
('F2', 'Fragile item', 'Handling', 5.00);

-- ============================================================
-- PACKAGE
-- ============================================================
INSERT INTO Package
(Tracking_Number, Sender_ID, Recipient_ID,
 Dim_X, Dim_Y, Dim_Z,
 Package_Type_Code, Weight, Zone,
 Oversize, Requires_Signature, Price)
VALUES
('PKG0000001', 1, 2, 10, 5, 4, 'GEN', 12.5, 3, 0, 1, 15.99),
('PKG0000002', 2, 3, 20, 10, 8, 'EXP', 25.0, 5, 0, 1, 29.99),
('PKG0000003', 3, 1, 40, 20, 15, 'OVR', 60.0, 7, 1, 0, 49.99);

-- ============================================================
-- STATUS CODE
-- ============================================================
INSERT INTO Status_Code (Status_Name, Is_Final_Status)
VALUES
('Created', 0),
('In Transit', 0),
('Delivered', 1),
('Delayed', 0);

-- ============================================================
-- SHIPMENT
-- ============================================================
INSERT INTO Shipment
(Status_Code, Employee_ID, From_Address_ID, To_Address_ID, Departure_Time_Stamp)
VALUES
(1, 2, 1, 2, NOW()),
(2, 3, 2, 3, NOW());

-- ============================================================
-- SHIPMENT_PACKAGE
-- ============================================================
INSERT INTO Shipment_Package (Shipment_ID, Tracking_Number)
VALUES
(1, 'PKG0000001'),
(2, 'PKG0000002');

-- ============================================================
-- SUPPORT TICKET
-- ============================================================
INSERT INTO Support_Ticket
(User_ID, Package_ID, Assigned_Employee_ID, Issue_Type, Description, Ticket_Status_Code)
VALUES
(1, 'PKG0000001', 2, 1, 'Package delayed', 0),
(2, 'PKG0000002', 3, 2, 'Damaged item', 1);

-- ============================================================
-- PAYMENT
-- ============================================================
INSERT INTO Payment
(Customer_ID, Store_ID, Items, Payment_Type, Payment_Amount, Payment_Status)
VALUES
(1, 1, 2, 1, 25.00, 'completed'),
(2, 2, 1, 2, 15.00, 'pending');

-- ============================================================
-- DELIVERY
-- ============================================================
INSERT INTO Delivery
(Tracking_Number, Delivered_Date, Signature_Required, Signature_Received, Delivery_Status_Code, Delivered_By)
VALUES
('PKG0000001', NOW(), 1, 'J.Doe', 3, 2);

-- ============================================================
-- PACKAGE_EXCESS_FEE
-- ============================================================
INSERT INTO Package_Excess_Fee (Tracking_Number, Fee_Type_Code)
VALUES
('PKG0000003', 'F1');

-- ============================================================
-- PACKAGE_PRICING
-- ============================================================
INSERT INTO Package_Pricing
(Package_Type_Code, Min_Weight, Max_Weight, Zone, Price)
VALUES
('GEN', 0, 20, 3, 15.99),
('EXP', 0, 30, 5, 29.99),
('OVR', 30, 70, 7, 49.99);


-- After this you must run these or it might just resolve itself idk :()
DROP TABLE Package_Excess_Fee;

CREATE TABLE Package_Excess_Fee (
    Tracking_Number VARCHAR(10) NOT NULL,
    Fee_Type_Code   VARCHAR(50) NOT NULL,
    PRIMARY KEY (Tracking_Number, Fee_Type_Code),
    FOREIGN KEY (Tracking_Number) REFERENCES Package(Tracking_Number),
    FOREIGN KEY (Fee_Type_Code) REFERENCES Excess_Fee(Fee_Type_Code)
);

INSERT INTO Package_Excess_Fee (Tracking_Number, Fee_Type_Code)
VALUES ('PKG0000003', 'F1');