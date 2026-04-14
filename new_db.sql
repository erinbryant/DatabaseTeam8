CREATE TABLE Address (
    Address_ID   INT AUTO_INCREMENT PRIMARY KEY,
    Apt_Number   VARCHAR(10)  NULL,
    House_Number VARCHAR(10)  NOT NULL,
    Street       VARCHAR(100) NOT NULL,
    City         VARCHAR(100) NOT NULL,
    State        VARCHAR(50)  NOT NULL,
    Zip_First3   CHAR(3)      NOT NULL,
    Zip_Last2    CHAR(2)      NOT NULL,
    Zip_Plus4    CHAR(4)      NULL,
    Country      VARCHAR(50)  NOT NULL DEFAULT 'USA'
);

CREATE TABLE Post_Office (
    Post_Office_ID INT AUTO_INCREMENT PRIMARY KEY,

    Address_ID     INT NOT NULL,
    Phone_Number   VARCHAR(20) NOT NULL,

    Sun_Start_Time  TIME NOT NULL DEFAULT '00:00:00',
    Sun_Finish_Time TIME NOT NULL DEFAULT '00:00:00',
    Mon_Start_Time  TIME NOT NULL DEFAULT '00:00:00',
    Mon_Finish_Time TIME NOT NULL DEFAULT '00:00:00',
    Tue_Start_Time  TIME NOT NULL DEFAULT '00:00:00',
    Tue_Finish_Time TIME NOT NULL DEFAULT '00:00:00',
    Wed_Start_Time  TIME NOT NULL DEFAULT '00:00:00',
    Wed_Finish_Time TIME NOT NULL DEFAULT '00:00:00',
    Thu_Start_Time  TIME NOT NULL DEFAULT '00:00:00',
    Thu_Finish_Time TIME NOT NULL DEFAULT '00:00:00',
    Fri_Start_Time  TIME NOT NULL DEFAULT '00:00:00',
    Fri_Finish_Time TIME NOT NULL DEFAULT '00:00:00',
    Sat_Start_Time  TIME NOT NULL DEFAULT '00:00:00',
    Sat_Finish_Time TIME NOT NULL DEFAULT '00:00:00',

    FOREIGN KEY (Address_ID) REFERENCES Address(Address_ID)
);

CREATE TABLE Store (
    Store_ID       INT AUTO_INCREMENT PRIMARY KEY,
    Post_Office_ID INT NOT NULL,
    FOREIGN KEY (Post_Office_ID) REFERENCES Post_Office(Post_Office_ID)
);

CREATE TABLE Product (
    Universal_Product_Code VARCHAR(50) PRIMARY KEY,
    Store_ID               INT         NOT NULL,
    Product_Name           VARCHAR(255) NOT NULL,
    Price                  DECIMAL(10, 2) NOT NULL,
    Quantity               INT          NOT NULL DEFAULT 0,
    FOREIGN KEY (Store_ID) REFERENCES Store(Store_ID)
);

CREATE TABLE Customer (
    Customer_ID  INT AUTO_INCREMENT PRIMARY KEY,

    First_Name   VARCHAR(30) NOT NULL,
    Middle_Name  VARCHAR(30) NULL,
    Last_Name    VARCHAR(30) NOT NULL,

    Address_ID   INT NOT NULL,

    Password_Hash  VARCHAR(255) NOT NULL,
    Email_Address  VARCHAR(255) NOT NULL UNIQUE,
    Phone_Number   VARCHAR(20)  NULL,

    Birth_Day    TINYINT NOT NULL CHECK (Birth_Day   BETWEEN 1 AND 31),
    Birth_Month  TINYINT NOT NULL CHECK (Birth_Month BETWEEN 1 AND 12),
    Birth_Year   YEAR    NOT NULL,
    Sex          CHAR(1) NOT NULL CHECK (Sex IN ('M','F','O','U')),

    FOREIGN KEY (Address_ID) REFERENCES Address(Address_ID)
);

CREATE TABLE Role (
    Role_ID          INT AUTO_INCREMENT PRIMARY KEY,
    Role_Name        VARCHAR(25)  NOT NULL UNIQUE,
    Role_Description VARCHAR(255),
    Access_Level     INT NOT NULL CHECK (Access_Level BETWEEN 1 AND 5)
);

CREATE TABLE Department (
    Department_ID   INT AUTO_INCREMENT PRIMARY KEY,
    Department_Name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE Employee (
    Employee_ID   INT AUTO_INCREMENT PRIMARY KEY,

    Post_Office_ID  INT NOT NULL,
    Supervisor_ID   INT NULL,
    Role_ID         INT NOT NULL,
    Department_ID   INT NOT NULL,

    First_Name   VARCHAR(30) NOT NULL,
    Middle_Name  VARCHAR(30) NOT NULL,
    Last_Name    VARCHAR(30) NOT NULL,

    Birth_Day    TINYINT NOT NULL CHECK (Birth_Day   BETWEEN 1 AND 31),
    Birth_Month  TINYINT NOT NULL CHECK (Birth_Month BETWEEN 1 AND 12),
    Birth_Year   YEAR    NOT NULL,

    Password_Hash VARCHAR(255) NOT NULL,
    Email_Address VARCHAR(255) NOT NULL UNIQUE,
    Phone_Number  VARCHAR(20)  NULL,

    Sex          CHAR(1)        NOT NULL,
    Salary       DECIMAL(10, 2) NOT NULL,
    Hours_Worked DECIMAL(6, 2)  NOT NULL DEFAULT 0.00,

    FOREIGN KEY (Post_Office_ID) REFERENCES Post_Office(Post_Office_ID),
    FOREIGN KEY (Supervisor_ID)  REFERENCES Employee(Employee_ID),
    FOREIGN KEY (Role_ID)        REFERENCES Role(Role_ID),
    FOREIGN KEY (Department_ID)  REFERENCES Department(Department_ID)
);

CREATE TABLE Package_Type (
    Package_Type_Code VARCHAR(50) PRIMARY KEY,
    Description       VARCHAR(255),
    Type_Name         ENUM('oversize', 'express', 'general shipping') NOT NULL
);

CREATE TABLE Excess_Fee (
    Fee_Type_Code    VARCHAR(50)    PRIMARY KEY,
    Description      VARCHAR(255),
    Type_Name        VARCHAR(100)   NOT NULL,
    Additional_Price DECIMAL(10, 2) NOT NULL DEFAULT 0
);

CREATE TABLE Package (
    Tracking_Number   VARCHAR(10) PRIMARY KEY,

    Sender_ID         INT NOT NULL,
    Recipient_ID      INT NULL,

    Dim_X DECIMAL(8, 2) NOT NULL CHECK (Dim_X > 0),
    Dim_Y DECIMAL(8, 2) NOT NULL CHECK (Dim_Y > 0),
    Dim_Z DECIMAL(8, 2) NOT NULL CHECK (Dim_Z > 0),

    Date_Created      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Date_Updated      DATETIME NULL,

    Package_Type_Code VARCHAR(30)    NOT NULL,
    Weight            DECIMAL(6, 2)  NOT NULL CHECK (Weight <= 70),
    Zone              TINYINT        NOT NULL CHECK (Zone BETWEEN 1 AND 9),
    Oversize          BOOLEAN        NOT NULL DEFAULT 0,
    Requires_Signature BOOLEAN       NOT NULL DEFAULT 0,
    Price             DECIMAL(8, 2)  NOT NULL DEFAULT 0.00,
    Created_At        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (Sender_ID)         REFERENCES Customer(Customer_ID),
    FOREIGN KEY (Recipient_ID)      REFERENCES Customer(Customer_ID),
    FOREIGN KEY (Package_Type_Code) REFERENCES Package_Type(Package_Type_Code),
    CONSTRAINT chk_package_sender_recipient_different CHECK (Sender_ID <> Recipient_ID)
);

CREATE TABLE Status_Code (
    Status_Code      INT AUTO_INCREMENT PRIMARY KEY,
    Status_Name      VARCHAR(25) NOT NULL UNIQUE,
    Is_Final_Status  BOOLEAN     NOT NULL
);

CREATE TABLE Shipment (
    Shipment_ID INT AUTO_INCREMENT PRIMARY KEY,

    Status_Code   INT NOT NULL,
    Employee_ID   INT NOT NULL,

    From_Address_ID INT NOT NULL,
    To_Address_ID   INT NOT NULL,

    Departure_Time_Stamp DATETIME NULL,
    Arrival_Time_Stamp   DATETIME NULL,

    FOREIGN KEY (Status_Code)     REFERENCES Status_Code(Status_Code),
    FOREIGN KEY (Employee_ID)     REFERENCES Employee(Employee_ID),
    FOREIGN KEY (From_Address_ID) REFERENCES Address(Address_ID),
    FOREIGN KEY (To_Address_ID)   REFERENCES Address(Address_ID)
);

CREATE TABLE Support_Ticket (
    Ticket_ID            INT AUTO_INCREMENT PRIMARY KEY,

    User_ID              INT          NOT NULL,
    Package_ID           VARCHAR(30)  NOT NULL,
    Assigned_Employee_ID INT          NOT NULL,

    Issue_Type           SMALLINT     NOT NULL,
    Description          VARCHAR(200) NULL,
    Resolution_Note      VARCHAR(200) NULL,
    Ticket_Status_Code   SMALLINT     NOT NULL DEFAULT 0,

    FOREIGN KEY (User_ID)              REFERENCES Customer(Customer_ID),
    FOREIGN KEY (Package_ID)           REFERENCES Package(Tracking_Number),
    FOREIGN KEY (Assigned_Employee_ID) REFERENCES Employee(Employee_ID)
);

CREATE TABLE Payment (
    Payment_ID      INT AUTO_INCREMENT PRIMARY KEY,
    Customer_ID     INT            NOT NULL,
    Store_ID        INT            NOT NULL,
    Items           INT            NOT NULL,
    Payment_Type    SMALLINT       NOT NULL,
    Credit_Debit_Information JSON,
    Payment_Amount  DECIMAL(10, 2) NOT NULL,
    Payment_Date    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Payment_Status  VARCHAR(50)    NOT NULL DEFAULT 'pending',
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID),
    FOREIGN KEY (Store_ID)    REFERENCES Store(Store_ID)
);

CREATE TABLE Delivery (
    Delivery_ID          INT AUTO_INCREMENT PRIMARY KEY,
    Tracking_Number      VARCHAR(30) NOT NULL,
    Delivered_Date       DATETIME,
    Signature_Required   BOOLEAN     NOT NULL,
    Signature_Received   VARCHAR(25),
    Delivery_Status_Code INT         NOT NULL,
    Delivered_By         INT,

    UNIQUE (Tracking_Number),

    FOREIGN KEY (Tracking_Number)      REFERENCES Package(Tracking_Number) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Delivery_Status_Code) REFERENCES Status_Code(Status_Code) ON UPDATE CASCADE,
    FOREIGN KEY (Delivered_By)         REFERENCES Employee(Employee_ID)    ON UPDATE CASCADE
);

CREATE TABLE Package_Excess_Fee (
    Tracking_Number VARCHAR(10) NOT NULL,
    Fee_Type_Code   TINYINT     NOT NULL,
    PRIMARY KEY (Tracking_Number, Fee_Type_Code),
    FOREIGN KEY (Tracking_Number) REFERENCES Package(Tracking_Number)
);

CREATE TABLE Shipment_Package (
    Shipment_ID     INT         NOT NULL,
    Tracking_Number VARCHAR(10) NOT NULL,
    PRIMARY KEY (Shipment_ID, Tracking_Number),
    FOREIGN KEY (Shipment_ID)     REFERENCES Shipment(Shipment_ID),
    FOREIGN KEY (Tracking_Number) REFERENCES Package(Tracking_Number)
);

CREATE TABLE Package_Pricing (
    Pricing_ID        INT AUTO_INCREMENT PRIMARY KEY,
    Package_Type_Code VARCHAR(50)    NOT NULL,
    Min_Weight        DECIMAL(10, 2) NOT NULL DEFAULT 0,
    Max_Weight        DECIMAL(10, 2) NOT NULL DEFAULT 0,
    Max_Length        DECIMAL(10, 2) DEFAULT NULL,
    Max_Width         DECIMAL(10, 2) DEFAULT NULL,
    Max_Height        DECIMAL(10, 2) DEFAULT NULL,
    Zone              TINYINT        NOT NULL CHECK (Zone BETWEEN 1 AND 9),
    Price             DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (Package_Type_Code) REFERENCES Package_Type(Package_Type_Code) ON DELETE CASCADE
);