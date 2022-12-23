CREATE TABLE CS (
    csID int,
    city varchar(63),
    locationLatitude float,
    locationLongitude float,
    nominalPrice decimal(8, 2),
    userPrice decimal(8, 2),
    offerExpirationDate datetime,
    chargingFromBatteries boolean,
    rechargingBatteries boolean,
    DSOID int references DSOes(DSOID),
    batteryPolicyID int references BatteryPolicy(policyID)
);

CREATE TABLE CSSockets (
    socketID int primary key,
    csID int references CS(csID),
    typeID int references SocketsType(typeID),
    currentPower float
)

CREATE TABLE SocketsType (
    typeID int,
    connector varchar(10),
    maxPower float
);

CREATE TABLE DSOes (
    DSOID int,
    DSOName varchar(255),
    DSOEndpoint varchar(511)
);

CREATE TABLE BatteryPolicy (
    policyID int,
    composite attribute: thresholds (1...n)
    composite attribute: weigths (1...n)
)