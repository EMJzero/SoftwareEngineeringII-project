CREATE TABLE Users (
    userName varchar(255) primary key,
    email varchar(255) unique,
    password varchar(255),
    paymentCardNumber char(16),
    paymentCardCvv char(3),
    paymentCardExpirationDate char(4),
    paymentCardOwnerName varchar(255)
);

CREATE TABLE Bookings (
    userName varchar(255),
    bookingID int,
    startDate datetime,
    endDate datetime,
    isActive boolean,
    cpmsID int,
    csID int, --EXTERNAL
    socketID int, --EXTERNAL
    primary key (userName, bookingID), --TO REMOVE IN FAVOR OF SINGLE KEY AND UNIQUE ID 
    foreign key (userName) references Users(userName),
    foreign key (cpmsID) references CPMSes(cpmsID)
);

CREATE TABLE CPMSes (
    cpmsID int,
    cpmsName varchar(255),
    APIEndpoint varchar(511),
);