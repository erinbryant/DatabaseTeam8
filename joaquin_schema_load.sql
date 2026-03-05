CREATE TABLE Department (
	Department_ID INT AUTO_INCREMENT PRIMARY KEY,
    Department_Name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE Role (
	Role_ID INT AUTO_INCREMENT PRIMARY KEY,
    Role_Name VARCHAR(25) NOT NULL UNIQUE,
    Role_Description VARCHAR(255),
    Access_Level INT NOT NULL CHECK (Access_Level BETWEEN 1 AND 5)
);

CREATE TABLE Status_Code (
	Status_Code INT AUTO_INCREMENT PRIMARY KEY,
    Status_Name VARCHAR(25) NOT NULL UNIQUE,
    Is_Final_Status BOOLEAN NOT NULL
);

CREATE TABLE Delivery (
	Delivery_ID INT PRIMARY KEY AUTO_INCREMENT,
    -- Change TrackingNumber to VARCHAR if including letters
	TrackingNumber INT NOT NULL,
    Delivered_Date DATETIME,
    Signature_Required BOOLEAN NOT NULL,
    Signature_Received VARCHAR(25),
    Delivery_Status_Code INT NOT NULL,
    Delivered_By INT,
    
    UNIQUE (TrackingNumber),
    
    FOREIGN KEY (TrackingNumber)
		REFERENCES Package(TrackingNumber)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
	FOREIGN KEY (Delivery_Status_Code)
		REFERENCES Status_Code(Status_Code)
        ON UPDATE CASCADE,
        
	FOREIGN KEY (Delivered_By)
		REFERENCES Employee(Employee_ID)
        ON UPDATE CASCADE
);