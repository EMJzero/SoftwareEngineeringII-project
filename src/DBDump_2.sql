CREATE DATABASE  IF NOT EXISTS `bank_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bank_db`;
-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: bank_db
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `cardNumber` char(16) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` char(4) NOT NULL,
  `cvv` char(3) NOT NULL,
  `totalBilled` double NOT NULL,
  PRIMARY KEY (`cardNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES ('4365875436666669','MARIO LUIGI','1122','123',0.13);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-04 10:48:16
CREATE DATABASE  IF NOT EXISTS `emsp_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `emsp_db`;
-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: emsp_db
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `availabilityautomanaged`
--

DROP TABLE IF EXISTS `availabilityautomanaged`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `availabilityautomanaged` (
  `cpms` int NOT NULL,
  `cs` int NOT NULL,
  `socket` int NOT NULL,
  `start` bigint NOT NULL,
  `end` bigint NOT NULL,
  PRIMARY KEY (`cpms`,`cs`,`socket`,`start`),
  CONSTRAINT `availabilityautomanaged_cpmses_null_fk` FOREIGN KEY (`cpms`) REFERENCES `cpmses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `availabilityautomanaged`
--

LOCK TABLES `availabilityautomanaged` WRITE;
/*!40000 ALTER TABLE `availabilityautomanaged` DISABLE KEYS */;
INSERT INTO `availabilityautomanaged` VALUES (1,1,1,0,1675414800000),(1,1,1,1675461600000,5026378548000);
/*!40000 ALTER TABLE `availabilityautomanaged` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `availabletimeslots`
--

DROP TABLE IF EXISTS `availabletimeslots`;
/*!50001 DROP VIEW IF EXISTS `availabletimeslots`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `availabletimeslots` AS SELECT 
 1 AS `start`,
 1 AS `end`,
 1 AS `cpmsId`,
 1 AS `csId`,
 1 AS `socketId`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `startDate` bigint DEFAULT NULL,
  `endDate` bigint DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `cpmsId` int DEFAULT NULL,
  `csId` int DEFAULT NULL,
  `socketId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId_idx` (`userId`),
  KEY `cpmsId_idx` (`cpmsId`),
  CONSTRAINT `cpmsId` FOREIGN KEY (`cpmsId`) REFERENCES `cpmses` (`id`),
  CONSTRAINT `userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (27,4,1675414800000,1675461600000,0,1,1,1);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `availabilityInsert` AFTER INSERT ON `bookings` FOR EACH ROW begin
    declare startTimestamp, endTimestamp bigint;
    select start into startTimestamp from availabilityautomanaged where cpms = new.cpmsId and cs = new.csId and socket = new.socketId and start <= new.startDate;
    select end into endTimestamp from availabilityautomanaged where cpms = new.cpmsId and cs = new.csId and socket = new.socketId and start = startTimestamp;

    if (startTimestamp is null) then
        -- Clean insert of 2 new availability slots (before and after) for that station and socket
        insert into availabilityautomanaged
            values (new.cpmsId, new.csId, new.socketId, 0, new.startDate);
        insert into availabilityautomanaged
            values (new.cpmsId, new.csId, new.socketId, new.endDate, UNIX_TIMESTAMP() * 3000);
    else
        -- Do we need to delete the availability slot we found?
        if (startTimestamp = new.startDate and endTimestamp = new.endDate) then
            delete from availabilityautomanaged
            where cpms = new.cpmsId and cs = new.csId and socket = new.socketId and start = startTimestamp;
        elseif (startTimestamp = new.startDate) then
            -- Shorten the slot from the start
            update availabilityautomanaged
            set start = new.endDate
            where cpms = new.cpmsId and cs = new.csId and socket = new.socketId and start = startTimestamp;
        elseif (endTimestamp = new.endDate) then
            -- Shorten the slot from the end
            update availabilityautomanaged
            set end = new.startDate
            where cpms = new.cpmsId and cs = new.csId and socket = new.socketId and start = startTimestamp;
        else
            -- The new slot is inside the availability slot. Update the existing slot to become the lower one, then create the upper slot
            update availabilityautomanaged
            set end = new.startDate
            where cpms = new.cpmsId and cs = new.csId and socket = new.socketId and start = startTimestamp;

            insert into availabilityautomanaged
            values (new.cpmsId, new.csId, new.socketId, new.endDate, UNIX_TIMESTAMP() * 3000);
        end if;
    end if;
end */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `blockbookingupdate` BEFORE UPDATE ON `bookings` FOR EACH ROW begin
    if (old.isActive = new.isActive) then
        signal sqlstate '45000' set message_text = 'Updates to the bookings table are forbidden';
    end if;
end */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `availabilityDelete` AFTER DELETE ON `bookings` FOR EACH ROW begin
    declare startTimestampLower, endTimestampLower, startTimestampUpper, endTimestampUpper bigint;
    select start, end into startTimestampLower, endTimestampLower from availabilityautomanaged where cpms = old.cpmsId and cs = old.csId and socket = old.socketId and end = old.startDate;
    select start, end into startTimestampUpper, endTimestampUpper from availabilityautomanaged where cpms = old.cpmsId and cs = old.csId and socket = old.socketId and start = old.endDate;

    if (startTimestampLower is not null and startTimestampUpper is not null) then
        -- The deleted slot was the last standing hole between the 2 slots - delete the slot and insert a bigger one
        delete from availabilityautomanaged
        where cpms = old.cpmsId and cs = old.csId and socket = old.socketId and start = startTimestampUpper;

        update availabilityautomanaged
        set end = endTimestampUpper
        where cpms = old.cpmsId and cs = old.csId and socket = old.socketId and start = startTimestampLower;
    elseif (startTimestampLower is not null) then
        -- The deleted slot increases the length of the lower availability slot
        update availabilityautomanaged
        set end = old.endDate
        where cpms = old.cpmsId and cs = old.csId and socket = old.socketId and start = startTimestampLower;
    elseif (startTimestampUpper is not null) then
        -- The deleted slot increases the length of the upper availability slot
        update availabilityautomanaged
        set start = old.startDate
        where cpms = old.cpmsId and cs = old.csId and socket = old.socketId and start = startTimestampUpper;
    else
        -- No adjacent slot found - insert the deleted booking slot into the availability list
        insert into availabilityautomanaged
        values (old.cpmsId, old.csId, old.socketId, old.startDate, old.endDate);
    end if;
end */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cpmses`
--

DROP TABLE IF EXISTS `cpmses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cpmses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `APIendpoint` varchar(511) NOT NULL,
  `APIkey` varchar(255) NOT NULL,
  `token` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpmses`
--

LOCK TABLES `cpmses` WRITE;
/*!40000 ALTER TABLE `cpmses` DISABLE KEYS */;
INSERT INTO `cpmses` VALUES (1,'CPMS1','http://127.0.0.1:8001/api','JinSakai',null);
/*!40000 ALTER TABLE `cpmses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `content` varchar(1025) NOT NULL,
  `generationDate` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_users_null_fk` (`userId`),
  CONSTRAINT `notifications_users_null_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (3,4,'Your recharge at \"Tokyo Tower Hub\" ended, and you\'ve been charged $0.14',1675458461000),(4,4,'Your recharge at \"Tokyo Tower Hub\" ended, and you\'ve been charged $1.12',1675459025000),(5,4,'Your recharge at \"Tokyo Tower Hub\" ended, and you\'ve been charged $0.31',1675459241000),(6,4,'Your recharge at \"Tokyo Tower Hub\" ended, and you\'ve been charged $0.28',1675459384000),(7,4,'Your recharge at \"Tokyo Tower Hub\" ended, and you\'ve been charged $0.13',1675459488000);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `paymentCardNumber` char(16) DEFAULT NULL,
  `paymentCardCvv` char(3) DEFAULT NULL,
  `paymentCardExpirationDate` char(4) DEFAULT NULL,
  `paymentCardOwnerName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userName_UNIQUE` (`userName`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Pippo','pippo.pluto@gmail.com','NotARealPassword','1231123112311231','123','0424','Pippo Pluto'),(2,'Paperino','paperino@pippomail.com','$2b$04$Nbvn9PGE7MBuKp09/AQpBuOJttDVjljRDsgE5k8tCN8Vs9k41ps6e','5846215678957720','789','0725','Paolino Paperino'),(3,'MarioLuigi2','mario.luigi3@mushroom.kingdom','$2b$04$WvBt3ONHmMJAze.8G126.epyxgDL4V3OVlQzqHgXqG0pkkJ3Zl2f.','4365875436666669','111','0223','MARIO LUIGI'),(4,'MarioLuigi','mario.luigi@mushroom.kingdom','$2b$04$u3hLguczAiaeVgyAQ6Hpp.Qr/.10SathCJn/SwG2GKWpdOeUZ9f.G','4365875436666669','123','1122','MARIO LUIGI');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `availabletimeslots`
--

/*!50001 DROP VIEW IF EXISTS `availabletimeslots`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `availabletimeslots` (`start`,`end`,`cpmsId`,`csId`,`socketId`) AS select `b1`.`endDate` AS `endDate`,`b2`.`startDate` AS `startDate`,`b1`.`cpmsId` AS `cpmsId`,`b1`.`csId` AS `csId`,`b1`.`socketId` AS `socketId` from (`bookings` `b1` join `bookings` `b2` on(((`b1`.`cpmsId` = `b2`.`cpmsId`) and (`b1`.`csId` = `b2`.`csId`) and (`b1`.`socketId` = `b2`.`socketId`)))) where ((`b1`.`endDate` < `b2`.`startDate`) and exists(select 1 from `bookings` `b3` where ((`b1`.`cpmsId` = `b3`.`cpmsId`) and (`b1`.`csId` = `b3`.`csId`) and (`b1`.`socketId` = `b3`.`socketId`) and ((`b3`.`startDate` between `b1`.`endDate` and `b2`.`startDate`) or (`b3`.`startDate` between `b1`.`endDate` and `b2`.`startDate`)))) is false) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-04 10:48:16
CREATE DATABASE  IF NOT EXISTS `cpms_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cpms_db`;
-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: cpms_db
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cs`
--

DROP TABLE IF EXISTS `cs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `locationLatitude` double NOT NULL,
  `locationLongitude` double NOT NULL,
  `nominalPrice` decimal(6,2) NOT NULL,
  `userPrice` decimal(6,2) NOT NULL,
  `offerExpirationDate` bigint DEFAULT NULL,
  `imageURL` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cs`
--

LOCK TABLES `cs` WRITE;
/*!40000 ALTER TABLE `cs` DISABLE KEYS */;
INSERT INTO `cs` VALUES (1,'Tokyo Tower Hub',35.702662,139.774413,12.00,8.00,1675429200000,'http://www.widest.com/wp-content/uploads/Tokyo-Tower-in-Tokyo-Japan.jpg'),(2,'Akiba Bolt',35.702662,139.776447,11.00,11.00,NULL,'https://www.japan-guide.com/g18/3003_01.jpg');
/*!40000 ALTER TABLE `cs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cssockets`
--

DROP TABLE IF EXISTS `cssockets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cssockets` (
  `id` int NOT NULL,
  `csId` int DEFAULT NULL,
  `typeId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `csId_idx` (`csId`),
  KEY `socketType_idx` (`typeId`),
  CONSTRAINT `csId` FOREIGN KEY (`csId`) REFERENCES `cs` (`id`),
  CONSTRAINT `socketType` FOREIGN KEY (`typeId`) REFERENCES `socketstype` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cssockets`
--

LOCK TABLES `cssockets` WRITE;
/*!40000 ALTER TABLE `cssockets` DISABLE KEYS */;
INSERT INTO `cssockets` VALUES (1,1,1),(2,1,1),(3,1,2),(4,1,2);
/*!40000 ALTER TABLE `cssockets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emsps`
--

DROP TABLE IF EXISTS `emsps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emsps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `APIKey` char(127) DEFAULT NULL,
  `NotificationEndpoint` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emsps`
--

LOCK TABLES `emsps` WRITE;
/*!40000 ALTER TABLE `emsps` DISABLE KEYS */;
INSERT INTO `emsps` VALUES (1,'JinSakai','http://127.0.0.1:8000/api/cs-notification');
/*!40000 ALTER TABLE `emsps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socketstype`
--

DROP TABLE IF EXISTS `socketstype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socketstype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `connector` varchar(45) NOT NULL,
  `maxPower` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socketstype`
--

LOCK TABLES `socketstype` WRITE;
/*!40000 ALTER TABLE `socketstype` DISABLE KEYS */;
INSERT INTO `socketstype` VALUES (1,'Type A',10),(2,'Type B',15);
/*!40000 ALTER TABLE `socketstype` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-04 10:48:17
