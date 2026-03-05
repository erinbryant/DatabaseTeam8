create table Tracking_Event(
    -- Uma recommended we change how we track our packages.
    -- This will create a "lookup table" in which we can query all
    -- events for a particular package.
    Tracking_Event_ID int auto_increment primary key,
    Tracking_Number varchar(20) not null,
    Status_code int not null,
    Post_Office_ID int,
    Employee_ID int,
    Event_Timestamp timestamp,
    Event_Notes varchar(255)

    constraint fk_tracking_package
        foreign key (Tracking_Number)
        references Package(Tracking_Number),

    constraint fk_tracking_status
        foreign key (Status_Code)
        references Status_Code(Status_Code),

    constraint fk_tracking_postoffice
        foreign key (Post_Office_ID)
        references Post_Office(Post_Office_ID),

    constraint fk_tracking_employee
        foreign key (Employee_ID)
        references Employee_ID
    -- Let me know yalls thoughts on this if we need to change anything
    -- Joaquin
);