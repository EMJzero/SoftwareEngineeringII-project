CREATE DATABASE  IF NOT EXISTS `emsp_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `emsp_db`;
-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: localhost    Database: emsp_db
-- ------------------------------------------------------
-- Server version	8.0.28

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
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `cpmsId` int DEFAULT NULL,
  `csId` int DEFAULT NULL,
  `socketId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId_idx` (`userId`),
  KEY `cpmsId_idx` (`cpmsId`),
  CONSTRAINT `cpmsId` FOREIGN KEY (`cpmsId`) REFERENCES `cpmses` (`id`),
  CONSTRAINT `userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,'2023-02-18 10:00:00','2023-02-18 11:00:00',0,1,1,2);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpmses`
--

LOCK TABLES `cpmses` WRITE;
/*!40000 ALTER TABLE `cpmses` DISABLE KEYS */;
INSERT INTO `cpmses` VALUES (1,'CPMS1','http://127.0.0.1:8001/api','JinSakai');
/*!40000 ALTER TABLE `cpmses` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Pippo','pippo.pluto@gmail.com','NotARealPassword','1231123112311231','123','0424','Pippo Pluto'),(2,'Paperino','paperino@pippomail.com','$2b$04$Nbvn9PGE7MBuKp09/AQpBuOJttDVjljRDsgE5k8tCN8Vs9k41ps6e','5846215678957720','789','0725','Paolino Paperino');
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
/*!50001 VIEW `availabletimeslots` (`start`,`end`,`cpmsId`,`csId`,`socketId`) AS select `b1`.`endDate` AS `endDate`,`b2`.`startDate` AS `startDate`,`b1`.`cpmsId` AS `cpmsId`,`b1`.`csId` AS `csId`,`b1`.`socketId` AS `socketId` from (`bookings` `b1` join `bookings` `b2` on(((`b1`.`cpmsId` = `b2`.`cpmsId`) and (`b1`.`csId` = `b2`.`csId`) and (`b1`.`socketId` = `b2`.`socketId`)))) where ((`b1`.`endDate` < `b2`.`startDate`) and exists(select 1 from `bookings` `b3` where ((`b1`.`cpmsId` = `b3`.`cpmsId`) and (`b1`.`csId` = `b3`.`csId`) and (`b1`.`socketId` = `b3`.`socketId`) and ((`b3`.`startDate` between `b1`.`endDate` and `b2`.`startDate`) or (`b3`.`startDate` between `b1`.`endDate` and `b2`.`startDate`)))) is false) union select max(`bookings`.`endDate`) AS `max(endDate)`,'9999-12-31 23:59:59' AS `9999-12-31 23:59:59`,`bookings`.`cpmsId` AS `cpmsId`,`bookings`.`csId` AS `csId`,`bookings`.`socketId` AS `socketId` from `bookings` union select curdate() AS `curdate()`,min(`bookings`.`startDate`) AS `min(startDate)`,`bookings`.`cpmsId` AS `cpmsId`,`bookings`.`csId` AS `csId`,`bookings`.`socketId` AS `socketId` from `bookings` */;
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

-- Dump completed on 2023-01-28 22:08:36
CREATE DATABASE  IF NOT EXISTS `cpms_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cpms_db`;
-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: localhost    Database: cpms_db
-- ------------------------------------------------------
-- Server version	8.0.28

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
  `offerExpirationDate` datetime DEFAULT NULL,
  `imageURL` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cs`
--

LOCK TABLES `cs` WRITE;
/*!40000 ALTER TABLE `cs` DISABLE KEYS */;
INSERT INTO `cs` VALUES (1,'Tokyo Tower Hub',35.702662,139.774413,12.00,12.00,NULL,'http://www.widest.com/wp-content/uploads/Tokyo-Tower-in-Tokyo-Japan.jpg'),(2,'Akiba Bolt',35.702662,139.776447,11.00,11.00,NULL,'https://www.japan-guide.com/g18/3003_01.jpg');
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
INSERT INTO `emsps` VALUES (1,'CavallettaQuantica','http://www.eMall.com/notificationsEndpoint');
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
INSERT INTO `socketstype` VALUES (1,'type1',10),(2,'type2',15);
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

-- Dump completed on 2023-01-28 22:08:36
