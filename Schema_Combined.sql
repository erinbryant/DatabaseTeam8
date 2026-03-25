
create table Post_Office(

Post_Office_ID int auto_increment primary key,

Apt_Number varchar(10) null,
House_Number varchar(10) not null,
Street varchar(100) not null,
City varchar(100) not null,
State varchar(50) not null,
Zip_First3 char(3) not null,
Zip_Last2 char(2) not null,
Zip_Plus4 char(4) null,
Country varchar (50) not null default 'USA',

Phone_Number varchar(20) not null,

Sun_Start_Time time not null default '00:00:00' check(Sun_Start_Time >= '00:00:00' and Sun_Start_Time <= '23:59:59'),
Sun_Finish_Time time not null default '00:00:00' check(Sun_Finish_Time >= '00:00:00' and Sun_Finish_Time <= '23:59:59'),
Mon_Start_Time time not null default '00:00:00' check(Mon_Start_Time >= '00:00:00' and Mon_Start_Time <= '23:59:59'),
Mon_Finish_Time time not null default '00:00:00' check(Mon_Finish_Time >= '00:00:00' and Mon_Finish_Time <= '23:59:59'),
Tue_Start_Time time not null default '00:00:00' check(Tue_Start_Time >= '00:00:00' and Tue_Start_Time <= '23:59:59'),
Tue_Finish_Time time not null default '00:00:00' check(Tue_Finish_Time >= '00:00:00' and Tue_Finish_Time <= '23:59:59'),
Wed_Start_Time time not null default '00:00:00' check(Wed_Start_Time >= '00:00:00' and Wed_Start_Time <= '23:59:59'),
Wed_Finish_Time time not null default '00:00:00' check(Wed_Finish_Time >= '00:00:00' and Wed_Finish_Time <= '23:59:59'),
Thu_Start_Time time not null default '00:00:00' check(Thu_Start_Time >= '00:00:00' and Thu_Start_Time <= '23:59:59'),
Thu_Finish_Time time not null default '00:00:00' check(Thu_Finish_Time >= '00:00:00' and Thu_Finish_Time <= '23:59:59'),
Fri_Start_Time time not null default '00:00:00' check(Fri_Start_Time >= '00:00:00' and Fri_Start_Time <= '23:59:59'),
Fri_Finish_Time time not null default '00:00:00' check(Fri_Finish_Time >= '00:00:00' and Fri_Finish_Time <= '23:59:59'),
Sat_Start_Time time not null default '00:00:00' check(Sat_Start_Time >= '00:00:00' and Sat_Start_Time <= '23:59:59'),
Sat_Finish_Time time not null default '00:00:00' check(Sat_Finish_Time >= '00:00:00' and Sat_Finish_Time <= '23:59:59'),
);

create table Store(
Store_ID int auto_increment primary key,
Post_Office_ID int not null,
foreign key (Post_Office_ID) references Post_Office(Post_Office_ID)
);

CREATE TABLE Product (
    Universal_Product_Code VARCHAR(50) PRIMARY KEY,
    Store_ID int NOT NULL,
    Product_name VARCHAR(255) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Quantity INT NOT NULL DEFAULT 0
    FOREIGN KEY(Store_ID) REFERENCES Store(Store_ID)
);


CREATE TABLE Customer(
Customer_ID int auto_increment primary key,

First_Name varchar(30) not null,
Middle_Name varchar(30) null,
Last_Name varchar(30) not null,

Apt_Number varchar(10) null,
House_Number varchar(10) not null,
Street varchar(100) not null,
City varchar(100) not null,
State varchar(50) not null,
Zip_First3 char(3) not null,
Zip_Last2 char(2) not null,
Zip_Plus4 char(4) null,
Country varchar (50) not null default 'USA',

Password_Hash varchar(255) not null,
Email_Address varchar(255) not null unique,
Phone_Number varchar(20) null
);

CREATE TABLE Role (
	Role_ID INT AUTO_INCREMENT PRIMARY KEY,
    Role_Name VARCHAR(25) NOT NULL UNIQUE,
    Role_Description VARCHAR(255),
    Access_Level INT NOT NULL CHECK (Access_Level BETWEEN 1 AND 5)
);

CREATE TABLE Department (
	Department_ID INT AUTO_INCREMENT PRIMARY KEY,
    Department_Name VARCHAR(30) NOT NULL UNIQUE
);


create table Employee(
Employee_ID int auto_increment primary key,

Post_Office_ID int not null,
Supervisor_ID int null,
role_ID int not null,
Department_ID int not null,

First_Name varchar(30) not null,
Middle_Name varchar(30) not null,
Last_Name varchar(30) not null,

Birth_Day tinyint not null check (Birth_Day between 1 and 31),
Birth_Month tinyint not null check (Birth_Month between 1 and 12),
Birth_Year year not null,

Password_Hash varchar(255) not null,
Email_Address varchar(255) not null unique,
Phone_Number varchar(20) null

Sex char(1) not null,
Salary decimal(10,2) not null,
Hours_Worked decimal(6,2) not null default 0.00,

foreign key (Post_Office_ID) references Post_Office(Post_Office_ID),
foreign key (Supervisor_ID) references Employee(Employee_ID),
foreign key (Role_ID) references Role(Role_ID),
foreign key (Department_ID) references Department(Department_ID)
);

CREATE TABLE Package_Type (
    Package_Type_Code VARCHAR(50) PRIMARY KEY,
    Description VARCHAR(255),
    Type_Name ENUM('oversize', 'express', 'general shipping') NOT NULL
);

CREATE TABLE Excess_Fee (
    Fee_Type_Code VARCHAR(50) PRIMARY KEY,
    Description VARCHAR(255),
    Type_Name VARCHAR(100) NOT NULL,
    Additional_Price DECIMAL(10, 2) NOT NULL DEFAULT 0
);


create table Package(

Tracking_Number varchar(10) primary key,

Sender_ID int not null,
Recipient_ID int null,

Dim_X decimal(8,2) not null,
Dim_Y decimal(8,2) not null,
Dim_Z decimal(8,2) not null,
Date_Created datetime not null default current_timestamp,
Date_Updated datetime null,

Package_Type_Code varchar(30) not null,
Weight decimal(6,2) not null check (Weight <= 70),
Zone tinyint not null check (Zone between 1 and 9),
Oversize boolean not null default 0,
Requires_Signature boolean not null default 0,
Price decimal(8,2) not null default 0.00,
Created_At datetime not null default current_timestamp,

foreign key (Sender_ID) references Customer(Customer_ID),
foreign key (Recipient_ID) references customer(Customer_ID),
foreign key (Package_Type_Code) references Package_Type(Package_Type_Code)
);

create table Shipment(
Shipment_ID int auto_increment primary key,

Status_Code int not null,
Employee_ID int not null,

From_Apt_Number varchar(10) null,
From_House_Number varchar(10) not null,
From_Street varchar(100) not null,
From_City varchar(100) not null,
From_State varchar(50) not null,
From_Zip_First3 char(3) not null,
From_Zip_Last2 char(2) not null,
From_Zip_Plus4 char(4) null,
From_Country varchar (50) not null default 'USA',

To_Apt_Number varchar(10) null,
To_House_Number varchar(10) not null,
To_Street varchar(100) not null,
To_City varchar(100) not null,
To_State varchar(50) not null,
To_Zip_First3 char(3) not null,
To_Zip_Last2 char(2) not null,
To_Zip_Plus4 char(4) null,
To_Country varchar (50) not null default 'USA',

Departure_Time_Stamp datetime null,
Arrival_Time_Stamp datetime null,


foreign key (Status_Code) references Status_Code(Status_Code),
foreign key (Employee_ID) references Employee(Employee_ID)
);


create table Support_Ticket(
Ticket_ID int auto_increment primary key,

User_ID int not null,
Package_ID varchar(30) not null,
Assigned_Employee_ID int not null,

Issue_Type smallint not null,
Description varchar(200) null,
Resolution_Note varchar(200) null,

Ticket_Status_Code smallint(1) not null default 0,

foreign key (User_ID) references Customer(Customer_ID),
foreign key (Package_ID) references Package(Tracking_Number),
foreign key (Assigned_Employee_ID ) references Employee(Employee_ID)
);


CREATE TABLE Payment (
    Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Customer_ID INT NOT NULL,
    Store_ID INT NOT NULL,
    Items INT NOT NULL,
    Payment_Type SMALLINT NOT NULL,
    Credit_Debit_Information JSON,
    Payment_Amount DECIMAL(10, 2) NOT NULL,
    Payment_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Payment_Status VARCHAR(50) NOT NULL DEFAULT 'pending',
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID),
    FOREIGN KEY(Store_ID) REFERENCES Store(Store_ID)
);


CREATE TABLE Status_Code (
	Status_Code INT AUTO_INCREMENT PRIMARY KEY,
    Status_Name VARCHAR(25) NOT NULL UNIQUE,
    Is_Final_Status BOOLEAN NOT NULL
);


CREATE TABLE Delivery (
	Delivery_ID INT PRIMARY KEY AUTO_INCREMENT,
   
	Tracking_Number varchar(30) NOT NULL,
    Delivered_Date DATETIME,
    Signature_Required BOOLEAN NOT NULL,
    Signature_Received VARCHAR(25),
    Delivery_Status_Code INT NOT NULL,
    Delivered_By INT,
    
    UNIQUE (Tracking_Number),
    
    FOREIGN KEY (Tracking_Number)
		REFERENCES Package(Tracking_Number)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
	FOREIGN KEY (Delivery_Status_Code)
		REFERENCES Status_Code(Status_Code)
        ON UPDATE CASCADE,
        
	FOREIGN KEY (Delivered_By)
		REFERENCES Employee(Employee_ID)
        ON UPDATE CASCADE
);


create table Package_Excess_Fee(
Tracking_Number varchar(10) not null,
Fee_Type_Code tinyint not null,

primary key(Tracking_Number, Fee_Type_Code),

foreign key (Tracking_Number) references Package(Tracking_Number)
);


create table Shipment_Package(

Shipment_ID int not null,
Tracking_Number varchar(10) not null,

Primary key (Shipment_ID, Tracking_Number),

foreign key (Shipment_ID) references Shipment(Shipment_ID),
foreign key (Tracking_Number) references Package(Tracking_Number)
);

create table package_pricing (
    Pricing_ID INT NOT NULL AUTO_INCREMENT,
    Package_Type_Code VARCHAR(50) NOT NULL,
    Min_Weight DECIMAL(10,2) NOT NULL DEFAULT 0,
    Max_Weight DECIMAL(10,2) NOT NULL DEFAULT 0,
    Max_Length DECIMAL(10,2) DEFAULT NULL,
    Max_Width DECIMAL(10,2) DEFAULT NULL,
    Max_Height DECIMAL(10,2) DEFAULT NULL,
    Zone tinyint not null check (Zone between 1 and 9),
    Price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (Pricing_ID),
    FOREIGN KEY (Package_Type_Code) REFERENCES package_type(Package_Type_Code)
        ON DELETE CASCADE
);

