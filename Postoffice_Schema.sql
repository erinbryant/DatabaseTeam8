CREATE DATABASE postoffice_db;
USE postoffice_db;
















-- Create the Product table
CREATE TABLE Product (
    Universal_Product_Code VARCHAR(50) PRIMARY KEY,
    Product_name VARCHAR(255) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Quantity INT NOT NULL DEFAULT 0
);

-- Create the Package_Type lookup table
CREATE TABLE Package_Type (
    Package_Type_Code VARCHAR(50) PRIMARY KEY,
    Description VARCHAR(255),
    Type_Name ENUM('oversize', 'express', 'general shipping') NOT NULL
);

-- Create the Excess_Fee lookup table
CREATE TABLE Excess_Fee (
    Fee_Type_Code VARCHAR(50) PRIMARY KEY,
    Description VARCHAR(255),
    Type_Name VARCHAR(100) NOT NULL,
    Additional_Price DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- Create the Payment table
CREATE TABLE Payment (
    Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Customer_ID INT NOT NULL,
    Items INT NOT NULL,
    Payment_Type SMALLINT NOT NULL,
    Credit_Debit_Information JSON,
    Payment_Amount DECIMAL(10, 2) NOT NULL,
    Payment_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Payment_Status VARCHAR(50) NOT NULL DEFAULT 'pending',
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID)
);





















