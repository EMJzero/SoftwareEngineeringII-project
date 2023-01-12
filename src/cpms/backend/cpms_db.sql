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
  `locationLatitude` double NOT NULL,
  `locationLongitude` double NOT NULL,
  `nominalPrice` decimal(6,2) NOT NULL,
  `userPrice` decimal(6,2) NOT NULL,
  `offerExpirationDate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cs`
--

LOCK TABLES `cs` WRITE;
/*!40000 ALTER TABLE `cs` DISABLE KEYS */;
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
/*!40000 ALTER TABLE `cssockets` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socketstype`
--

LOCK TABLES `socketstype` WRITE;
/*!40000 ALTER TABLE `socketstype` DISABLE KEYS */;
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

-- Dump completed on 2023-01-12 23:17:15
