create table Support_Ticket(

-- pk
Ticket_ID int auto_increment primary key,
-- fk
User_ID int not null,
Package_ID int not null,
Assigned_Employee_ID int not null,

Issue_Type smallint not null,
Description varchar(200) null,
Resolution_Note varchar(200) null,
-- 0 is unresolved 1 is resolved
Ticket_Status_Code smallint(1) not null default 0,

foreign key (User_ID) references Customer(Customer_ID),
foreign key (Package_ID) references Package(Tracking_Number),
foreign key (Role_ID) references Role(Role_ID),
foreign key (Assigned_Employee_ID ) references Employee(Employee_ID)
);

create table Post_Office(
--pk
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

Phone_Number int not null check(Phone_Number <= 999999999),

Sun_Start_Time time not null,
Sun_Finish_Time time not null,
Mon_Start_Time time not null,
Mon_Finish_Time time not null,
Tues_Start_Time time not null,
Tue_Finish_Time time not null,
Wed_Start_Time time not null,
Wed_Finish_Time time not null,
Thu_Start_Time time not null,
Thu_Finish_Time time not null,
Fri_Start_Time time not null,
Fri_Finish_Time time not null,
Sat_Start_Time time not null,
Sat_Finish_Time time not null
);

create table Store(
Store_ID int auto_increment primary key,
Post_Office_ID int not null,
foreign key (Post_Office_ID) references Post_Office(Post_Office_ID)
);
