
-- USER REPORT

-- Total registered customers
SELECT COUNT(*) AS Total_Registered_Customers
FROM Customer;

-- Total support tickets per customer
SELECT User_ID AS Customer_ID, COUNT(*) AS Total_Tickets
FROM Support_Ticket
GROUP BY User_ID;

-- Customers who never opened a support ticket
SELECT c.Customer_ID
FROM Customer c
LEFT JOIN Support_Ticket s
ON c.Customer_ID = s.User_ID
WHERE s.Ticket_ID IS NULL;

-- PACKAGE REPORT

-- Total number of packages
SELECT COUNT(*) AS Total_Packages
FROM Package;

-- Packages per zone
SELECT Zone, COUNT(*) AS Packages_Per_Zone
FROM Package
GROUP BY Zone;

-- Packages by type
SELECT Package_Type_Code, COUNT(*) AS Packages_By_Type
FROM Package
GROUP BY Package_Type_Code;

-- Average package weight
SELECT AVG(Weight) AS Average_Package_Weight
FROM Package;

-- Packages requiring signature
SELECT Requires_Signature, COUNT(*) AS Signature_Required
FROM Package
GROUP BY Requires_Signature;

-- EMPLOYEE & SUPPORT REPORT


-- Deliveries completed by each employee
SELECT Delivered_By AS Employee_ID, COUNT(*) AS Deliveries_Completed
FROM Delivery
GROUP BY Delivered_By;

-- Support tickets assigned per employee
SELECT Assigned_Employee_ID, COUNT(*) AS Tickets_Assigned
FROM Support_Ticket
GROUP BY Assigned_Employee_ID;

-- Unresolved support tickets
SELECT COUNT(*) AS Unresolved_Tickets
FROM Support_Ticket
WHERE Ticket_Status_Code = 0;
