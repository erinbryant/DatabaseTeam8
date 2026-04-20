CREATE DATABASE  IF NOT EXISTS `post_office_8` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `post_office_8`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Database: post_office_8
-- ------------------------------------------------------
-- Server version	8.0.44-azure

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
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `Address_ID` int NOT NULL AUTO_INCREMENT,
  `Apt_Number` varchar(10) DEFAULT NULL,
  `House_Number` varchar(10) NOT NULL,
  `Street` varchar(100) NOT NULL,
  `City` varchar(100) NOT NULL,
  `State` varchar(50) NOT NULL,
  `Zip_Code` char(5) NOT NULL,
  `Country` varchar(50) NOT NULL DEFAULT 'USA',
  `Apt_Key` varchar(10) GENERATED ALWAYS AS (coalesce(`Apt_Number`,_utf8mb4'')) STORED,
  PRIMARY KEY (`Address_ID`),
  UNIQUE KEY `unique_full_address` (`House_Number`,`Street`,`City`,`State`,`Zip_Code`,`Country`,`Apt_Key`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
INSERT INTO `address` (`Address_ID`, `Apt_Number`, `House_Number`, `Street`, `City`, `State`, `Zip_Code`, `Country`) VALUES (1,NULL,'742','Evergreen Terrace','Springfield','IL','62701','USA'),(2,NULL,'112','Oak St','Houston','TX','77002','USA'),(3,NULL,'234','Elm Ave','Houston','TX','77003','USA'),(4,NULL,'567','Pine Rd','Dallas','TX','75204','USA'),(5,NULL,'890','Maple Dr','Dallas','TX','75205','USA'),(6,NULL,'321','Cedar Blvd','Austin','TX','73306','USA'),(7,NULL,'654','Birch Ln','Austin','TX','73307','USA'),(8,NULL,'777','Walnut St','San Antonio','TX','78208','USA'),(9,NULL,'888','Spruce Ave','San Antonio','TX','78209','USA'),(10,NULL,'999','Willow Way','Lubbock','TX','79410','USA'),(11,NULL,'103','Aspen Ct','Lubbock','TX','79412','USA'),(12,NULL,'220','Pecan St','Houston','TX','77012','USA'),(13,NULL,'445','Magnolia Ave','Dallas','TX','75206','USA'),(14,NULL,'678','Cypress Rd','Austin','TX','73308','USA'),(15,NULL,'891','Lavender Ln','San Antonio','TX','78210','USA'),(16,NULL,'102','Sycamore Blvd','Lubbock','TX','79412','USA'),(17,NULL,'334','Rosewood Dr','Houston','TX','77014','USA'),(18,NULL,'556','Bluebonnet Way','Dallas','TX','75208','USA'),(19,NULL,'789','Juniper St','Austin','TX','73310','USA'),(20,NULL,'901','Mesquite Rd','San Antonio','TX','78211','USA'),(21,NULL,'123','Cottonwood Ct','Lubbock','TX','79413','USA'),(22,NULL,'hk','hkj','hjk','hkj','12345','USA'),(23,NULL,'jlk','jkl','jkl','jkl','78978','USA'),(24,NULL,'123','mainst','hu','tx','00000','USA'),(25,NULL,'1','Post Office St','Houston','TX','77001','USA'),(26,NULL,'100','Main St','Houston','TX','77001','USA'),(27,NULL,'200','Commerce St','Dallas','TX','75201','USA'),(28,NULL,'300','Congress Ave','Austin','TX','73301','USA'),(29,NULL,'400','Broadway St','San Antonio','TX','78201','USA'),(30,NULL,'500','Lubbock Ave','Lubbock','TX','79401','USA'),(64,NULL,'house','street','city','tx','11111','USA'),(65,'xgvhsg','123','main','ht','tx','77701','USA'),(66,'lh','742','Evergreen Terrace','Springfeild','IL','62701','USA'),(67,NULL,'iop','iop','io','iop','00000','USA'),(69,NULL,'123','main','ht','tx','77701','USA'),(70,NULL,'890','mn','houst','tx','00000','USA'),(71,NULL,'undefined','undefined','undefined','undefined','','USA'),(73,NULL,'123','Main St','Houston','TX','77070','USA'),(74,NULL,'123','Test St','Houston','TX','77070','USA'),(75,NULL,'123','Main St','Houston','TX','77493','USA'),(76,NULL,'143','Maint st','Houston','TX','77974','USA'),(77,NULL,'987','main st','Houston','Tx','77045','USA'),(78,NULL,'123','not main st','houston','tx','77493','USA'),(79,NULL,'103','Aspen','Lubbo','TX','79412','USA'),(80,NULL,'101','Maple St','Houston','Texas','77001','USA'),(81,NULL,'202','Oak Ave','Dallas','Texas','75201','USA'),(82,NULL,'303','Pine Rd','Austin','Texas','73301','USA'),(83,NULL,'404','Elm Blvd','San Antonio','Texas','78201','USA'),(84,NULL,'123 ','Maibnt ','Houstobn','TX','88737','USA'),(85,NULL,'123 ','Maint','houston','TX','77493','USA');
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `Customer_ID` int NOT NULL AUTO_INCREMENT,
  `First_Name` varchar(30) NOT NULL,
  `Middle_Name` varchar(30) DEFAULT NULL,
  `Last_Name` varchar(30) NOT NULL,
  `Password_Hash` varchar(255) NOT NULL,
  `Email_Address` varchar(255) NOT NULL,
  `Phone_Number` varchar(20) DEFAULT NULL,
  `Sex` char(1) NOT NULL DEFAULT 'U',
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `Address_ID` int NOT NULL,
  `is_Active` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Customer_ID`),
  UNIQUE KEY `Email_Address` (`Email_Address`),
  KEY `Address_ID` (`Address_ID`),
  CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`Address_ID`) REFERENCES `address` (`Address_ID`),
  CONSTRAINT `customer_chk_1` CHECK ((`is_Active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'James','A','Wilson','$2b$10$eImiTXuWVxfM37uY4JANjQ==','james.wilson@email.com','713-555-1001','U','2026-04-08 11:57:23','2026-04-16 00:27:09',2,0),(2,'Maria',NULL,'Garcia','$2b$10$eImiTXuWVxfM37uY4JANjQ==','maria.garcia@email.com','713-555-1002','U','2026-04-08 11:57:23','2026-04-16 00:27:09',3,0),(3,'Robert','J','Smith','$2b$10$eImiTXuWVxfM37uY4JANjQ==','robert.smith@email.com','214-555-1003','U','2026-04-08 11:57:23','2026-04-16 00:27:09',4,0),(4,'Linda',NULL,'Johnson','$2b$10$eImiTXuWVxfM37uY4JANjQ==','linda.johnson@email.com','214-555-1004','U','2026-04-08 11:57:23','2026-04-16 00:27:09',5,0),(5,'Carlos','M','Martinez','$2b$10$eImiTXuWVxfM37uY4JANjQ==','carlos.martinez@email.com','512-555-1005','U','2026-04-08 11:57:23','2026-04-16 00:27:09',6,0),(6,'Susan','L','Brown','$2b$10$eImiTXuWVxfM37uY4JANjQ==','susan.brown@email.com','512-555-1006','U','2026-04-08 11:57:23','2026-04-16 20:13:04',7,1),(7,'David',NULL,'Lee','$2b$10$eImiTXuWVxfM37uY4JANjQ==','david.lee@email.com','210-555-1007','U','2026-04-08 11:57:23','2026-04-16 00:27:09',8,0),(8,'Patricia','R','Taylor','$2b$10$eImiTXuWVxfM37uY4JANjQ==','patricia.taylor@email.com','210-555-1008','U','2026-04-08 11:57:23','2026-04-16 00:27:09',9,0),(9,'Michael',NULL,'Anderson','$2b$10$eImiTXuWVxfM37uY4JANjQ==','michael.anderson@email.com','806-555-1009','U','2026-04-08 11:57:23','2026-04-16 13:56:37',10,1),(10,'Barbara','E','Thomas','$2a$10$A2IrNr7Z4l3SoPcyzXlUG.Bmi.WhWw7gXL3E6ivDtRuEwi0tktT3C','customer@email.com','806-555-1010','U','2026-04-08 11:57:23','2026-04-16 21:55:13',11,0),(11,'Anthony','B','Rivera','$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy','anthony.rivera@email.com','713-555-2001','M','2026-04-11 12:40:00','2026-04-16 00:27:09',12,0),(12,'Kimberly',NULL,'Carter','$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy','kimberly.carter@email.com','214-555-2002','F','2026-04-11 12:40:00','2026-04-16 00:27:09',13,0),(13,'Daniel','R','Mitchell','$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy','daniel.mitchell@email.com','512-555-2003','M','2026-04-11 12:40:00','2026-04-16 00:27:09',14,0),(14,'Jessica','L','Perez','$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy','jessica.perez@email.com','210-555-2004','F','2026-04-11 12:40:00','2026-04-16 00:27:09',15,0),(15,'Matthew','K','Roberts','$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy','matthew.roberts@email.com','806-555-2005','M','2026-04-11 12:40:00','2026-04-16 00:27:09',16,0),(16,'Amanda',NULL,'Sanders','$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy','amanda.sanders@email.com','713-555-2006','F','2026-04-11 12:40:00','2026-04-16 00:27:09',17,0),(17,'Kevin','J','Price','$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy','kevin.price@email.com','214-555-2007','M','2026-04-11 12:40:00','2026-04-16 00:27:09',18,0),(18,'Sarah','M','Hughes','$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy','sarah.hughes@email.com','512-555-2008','F','2026-04-11 12:40:00','2026-04-16 00:27:09',19,0),(19,'Brian','T','Foster','$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy','brian.foster@email.com','210-555-2009','M','2026-04-11 12:40:00','2026-04-16 00:27:09',20,0),(20,'Nicole','A','Butler','$2a$10$YMEEetp9.9d4dZcqfaTzeuhVO.v/KeHPKhBtswEYLI2F8dsd2EoTy','nicole.butler@email.com','806-555-2010','F','2026-04-11 12:40:00','2026-04-16 00:27:09',21,0),(21,'hkj',NULL,'hk','$2a$10$dmz8PSdYosxIG0l7zbygnOlxtSaYDUAKvdm/5Rp6oRF1Y/bbeglhy','hkj','hjk','U','2026-04-13 17:21:45','2026-04-16 00:27:09',22,0),(22,'jkl',NULL,'kl','$2a$10$0Qd25mP3jLKvMrsPIvQfn.QbajDBEUtGTiXDDU7.ygL06o3LKgn/q','email@emaul.com','jkl','U','2026-04-13 17:27:43','2026-04-16 00:27:09',23,0),(23,'Test3',NULL,'test','$2a$10$UVbnCLAVM96ebPYjopxtSe1oz1LNluVMvoJF5vRmpVRwFo8yj5nky','test3@email.com','222-333-4445','U','2026-04-14 11:02:19','2026-04-16 00:27:09',24,0),(24,'dfg','sdg','xcv','$2a$10$Ev2v3/UZG2TC270qRlr.1u4y1V6m/1PpluJuGJa/Y3gA2vdVZFJ3O','e@e.com','111-111-1111','F','2026-04-16 04:52:30',NULL,65,0),(25,'Jon',NULL,'Doe','$2a$10$Ugt5r2XL.1rFMWp4QEk0V.wTj41FZlOdF45R4vWFPPYJkh6VWVVBm','e@email.com','111-111-1111','F','2026-04-16 05:18:43',NULL,66,0),(26,'kby',NULL,'opj','$2a$10$GONM0EWI/sY7gKOZ9YNTyO4J78eJ9hWTp2wHkvJOfZWzECG1Qgm4C','b@e.com','222-222-2222','F','2026-04-16 05:20:57',NULL,1,0),(27,'lk',NULL,'klj','$2a$10$n6EkOP6CFKus68E.odbfy..wU2xaGkLMvhGW5NR1MjJms8HRC9ALG','j@e.com','444-444-4444','U','2026-04-16 09:20:49',NULL,67,0),(28,'jd',NULL,'ij','$2a$10$ahJbYISCCSiThgcQ8oslWelQeaNJcpuREjBo.1QjQmwD0aCmxpViu','b@b.com','222-333-4445','U','2026-04-16 16:34:42',NULL,70,0),(29,'dfg',NULL,'xyz','$2a$10$lfdN95eyKF1HDj2r9mUSU.pz3Ri.E63Q8L79YwMiwKDE.At/bAUZe','','111-111-1111','U','2026-04-16 17:11:14',NULL,71,0),(33,'dfg',NULL,'xcv','$2a$10$dYi0qVsmGgDa8JMZRdnfWOs6osIJijv9IlOzmMsHTWlAZFhbf9xoW','noemail_1776360676500_l9byokuswf@placeholder.invalid','111-111-1111','U','2026-04-16 17:31:16',NULL,65,0),(34,'Jon',NULL,'Doe','$2a$10$c7QboRtuukyShdqDtDN.Ou/Pm6gJoX1sBMS.Cb.LG9EYiIl2riIp6','noemail_1776360769660_3mh2cpm3mx7@placeholder.invalid','111-111-1111','U','2026-04-16 17:32:49',NULL,66,0),(35,'test',NULL,'test','$2a$10$WSDIDHiFoCYOJHVtTPf3pOefTqL3SR1q1bYyYBpECmuZLJKe8GVS6','test11@email.com','111-111-1111','U','2026-04-16 18:10:21',NULL,73,0),(36,'tt',NULL,'tt','$2a$10$pc.jpxZ/BLia7AFFbx2YtORuYT5Z5IaxXEUu793mPqWytrIgu1cn.','test12@email.com','000-000-0000','U','2026-04-16 18:37:42','2026-04-16 21:36:50',74,0),(37,'Test',NULL,'Customer','$2a$10$kXqB0HaQI2u5Ewcibn2bd.VrZH0UWve.4vaK3DaNZ3sbFzOd.VEKG','testcustomer@gmail.com','1234567890','U','2026-04-16 18:39:56',NULL,75,0),(38,'Sam',NULL,'Testrecipient','$2a$10$xDQLInF1QlesxAo79Oy1y.namU5xq7YNdj8s29iga.YRvz0t3iDNG','noemail_1776364960878_jzxs1uym7v@placeholder.invalid',NULL,'U','2026-04-16 18:42:40',NULL,76,0),(39,'hy',NULL,'jou','$2a$10$X/T/3JewcHpm8K5G3GFmOuv5rPQT7OGHsFsnDo81awZA4/9m1oPwu','class@email.com','111-111-1111','U','2026-04-16 19:50:17',NULL,77,0),(40,'Barbara',NULL,'Thomas','$2a$10$vaktiWzJ8sHsaq5gQWbS0.Wx/sN8Zog94CT8Bq4pUTkjjjvjs.fiG','noemail_1776370623977_sk942xurh8@placeholder.invalid','806-555-1012','U','2026-04-16 20:17:03',NULL,11,0),(41,'testtest',NULL,'testtest','$2a$10$J34HX325EAx.zFizhewwP.A/o//cZ2mApjg4DEcLlK9CwfUYQwo4a','noemail_1776371416037_7dm5dbn248b@placeholder.invalid',NULL,'U','2026-04-16 20:30:16',NULL,78,0),(42,'Barbar',NULL,'Thom','$2a$10$ntCJXVfbhQY6jCLOZowHiOSyyLf0sg0/LnCZsQx0km9G3NLzlk1he','noemail_1776372967345_mp6oy55m1uk@placeholder.invalid','806-555-1012','U','2026-04-16 20:56:06',NULL,79,0),(43,'Sam',NULL,'test','$2a$10$kMM/UBP6UO5AnTRrlfCq7eIdZS8MVVV3MxQpNgSZIqgDy9f4YtR9y','samtest@gmail.com','8830098393','U','2026-04-16 21:53:40','2026-04-16 21:57:25',84,1),(44,'Sam',NULL,'testest','$2a$10$r3VRxgiCQZ1lUQZxXoa.auvdt0sx0AnQ6aa2v/TuEERfWieotNXdq','samtestcustomer@gmail.com','1122387442','U','2026-04-16 22:32:01',NULL,85,0);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery`
--

DROP TABLE IF EXISTS `delivery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery` (
  `Delivery_ID` int NOT NULL AUTO_INCREMENT,
  `Tracking_Number` varchar(30) NOT NULL,
  `Delivered_Date` datetime DEFAULT NULL,
  `Signature_Required` tinyint(1) NOT NULL,
  `Signature_Received` varchar(25) DEFAULT NULL,
  `Delivered_By` int DEFAULT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `Delivery_Status_Code` int DEFAULT NULL,
  PRIMARY KEY (`Delivery_ID`),
  UNIQUE KEY `Tracking_Number` (`Tracking_Number`),
  KEY `Delivered_By` (`Delivered_By`),
  KEY `fk_delivery_status` (`Delivery_Status_Code`),
  CONSTRAINT `delivery_ibfk_1` FOREIGN KEY (`Tracking_Number`) REFERENCES `package` (`Tracking_Number`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `delivery_ibfk_3` FOREIGN KEY (`Delivered_By`) REFERENCES `employee` (`Employee_ID`) ON UPDATE CASCADE,
  CONSTRAINT `fk_delivery_status` FOREIGN KEY (`Delivery_Status_Code`) REFERENCES `status_code` (`Status_Code`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery`
--

LOCK TABLES `delivery` WRITE;
/*!40000 ALTER TABLE `delivery` DISABLE KEYS */;
INSERT INTO `delivery` VALUES (1,'TRK0000001','2024-03-19 14:30:00',0,NULL,9,'2026-04-08 11:57:23','2026-04-16 13:41:20',4),(2,'TRK0000002','2024-03-18 16:00:00',0,NULL,11,'2026-04-08 11:57:23','2026-04-16 13:41:20',4),(3,'TRK0000003',NULL,0,NULL,9,'2026-04-08 11:57:23','2026-04-16 13:41:20',4),(4,'TRK0000004',NULL,1,NULL,11,'2026-04-08 11:57:23','2026-04-16 13:41:20',7),(5,'TRK0000005',NULL,1,NULL,9,'2026-04-08 11:57:23','2026-04-16 13:41:20',7),(6,'TRK0000006','2024-03-17 11:30:00',0,NULL,12,'2026-04-08 11:57:23','2026-04-16 13:41:20',4),(7,'TRK0000007',NULL,0,NULL,9,'2026-04-08 11:57:23','2026-04-16 13:41:20',7),(8,'TRK0000008',NULL,1,NULL,11,'2026-04-08 11:57:23','2026-04-16 13:41:20',7),(9,'TRK0000009','2024-03-17 11:00:00',0,NULL,9,'2026-04-08 11:57:23','2026-04-16 13:41:20',4),(10,'TRK0000010',NULL,0,NULL,8,'2026-04-08 11:57:23','2026-04-16 13:41:20',7),(11,'TRK0000011',NULL,0,NULL,9,'2026-04-08 11:57:23','2026-04-16 13:41:20',7),(12,'TRK0000012',NULL,1,NULL,12,'2026-04-08 11:57:23','2026-04-16 13:41:20',7),(16,'TRK0000016','2024-05-11 14:00:00',0,NULL,8,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(17,'TRK0000017','2024-05-11 15:00:00',0,NULL,8,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(18,'TRK0000018','2024-06-17 11:00:00',0,NULL,8,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(19,'TRK0000019','2024-06-17 12:00:00',0,NULL,8,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(20,'TRK0000020',NULL,0,NULL,8,'2026-04-11 12:59:50','2026-04-16 13:41:20',2),(21,'TRK0000021',NULL,0,NULL,8,'2026-04-11 12:59:50','2026-04-16 13:41:20',2),(22,'TRK0000022','2024-08-07 15:00:00',1,'J.Rivera',8,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(23,'TRK0000023','2024-08-07 16:00:00',0,NULL,8,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(24,'TRK0000024',NULL,0,NULL,8,'2026-04-11 12:59:50','2026-04-16 15:28:04',4),(25,'TRK0000025','2024-05-20 13:00:00',0,NULL,9,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(26,'TRK0000026','2024-05-20 14:00:00',0,NULL,9,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(27,'TRK0000027','2024-06-24 16:00:00',0,NULL,9,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(28,'TRK0000028','2024-06-24 17:00:00',0,NULL,9,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(29,'TRK0000029',NULL,0,NULL,9,'2026-04-11 12:59:50','2026-04-16 13:41:20',2),(30,'TRK0000030',NULL,1,NULL,9,'2026-04-11 12:59:50','2026-04-16 13:41:20',2),(31,'TRK0000031','2024-08-16 12:00:00',0,NULL,9,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(32,'TRK0000032','2024-08-16 13:00:00',0,NULL,9,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(33,'TRK0000033','2024-09-28 14:00:00',0,NULL,9,'2026-04-11 12:59:50','2026-04-20 02:00:41',7),(34,'TRK0000034','2024-09-28 15:00:00',0,NULL,9,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(35,'TRK0000035','2024-05-07 11:00:00',0,NULL,10,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(36,'TRK0000036','2024-05-07 12:00:00',0,NULL,10,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(37,'TRK0000037','2024-06-12 15:00:00',0,NULL,10,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(38,'TRK0000038','2024-06-12 16:00:00',0,NULL,10,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(39,'TRK0000039',NULL,0,NULL,10,'2026-04-11 12:59:50','2026-04-16 13:41:20',5),(40,'TRK0000040',NULL,0,NULL,10,'2026-04-11 12:59:50','2026-04-16 13:41:20',5),(41,'TRK0000041','2024-08-22 13:00:00',0,NULL,10,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(42,'TRK0000042','2024-08-22 14:00:00',1,'S.Hughes',10,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(43,'TRK0000043',NULL,0,NULL,10,'2026-04-11 12:59:50','2026-04-16 22:19:48',4),(44,'TRK0000044','2024-05-25 14:00:00',0,NULL,11,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(45,'TRK0000045','2024-05-25 15:00:00',0,NULL,11,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(46,'TRK0000046','2024-06-30 16:00:00',0,NULL,11,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(47,'TRK0000047','2024-06-30 17:00:00',1,'D.Mitchell',11,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(48,'TRK0000048','2024-07-17 12:00:00',0,NULL,11,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(49,'TRK0000049','2024-07-17 13:00:00',0,NULL,11,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(50,'TRK0000050',NULL,0,NULL,11,'2026-04-11 12:59:50','2026-04-16 13:41:20',2),(51,'TRK0000051',NULL,0,NULL,11,'2026-04-11 12:59:50','2026-04-16 13:41:20',3),(52,'TRK0000052',NULL,0,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',2),(53,'TRK0000053','2024-06-01 15:00:00',1,'B.Foster',12,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(54,'TRK0000054','2024-06-01 16:00:00',0,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(55,'TRK0000055','2024-07-07 11:00:00',0,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(56,'TRK0000056','2024-07-07 12:00:00',0,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(57,'TRK0000057','2024-08-30 14:00:00',1,'N.Butler',12,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(58,'TRK0000058','2024-08-30 15:00:00',0,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',4),(59,'TRK0000059',NULL,0,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',5),(60,'TRK0000060',NULL,0,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',2),(61,'TRK0000061',NULL,0,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',2),(62,'TRK0000062',NULL,0,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',3),(63,'TRK0000063',NULL,1,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',2),(64,'TRK0000064',NULL,0,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',2),(65,'TRK0000065',NULL,0,NULL,12,'2026-04-11 12:59:50','2026-04-16 13:41:20',2),(66,'TRK0000066','2024-06-07 14:00:00',0,NULL,15,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(67,'TRK0000067','2024-06-07 15:00:00',0,NULL,15,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(68,'TRK0000068','2024-07-14 15:00:00',0,NULL,15,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(69,'TRK0000069','2024-08-19 12:00:00',1,'J.Perez',15,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(70,'TRK0000070',NULL,0,NULL,16,'2026-04-11 13:45:32','2026-04-16 13:41:20',2),(71,'TRK0000071','2024-06-22 16:00:00',0,NULL,16,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(72,'TRK0000072','2024-07-30 13:00:00',0,NULL,16,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(73,'TRK0000073','2024-05-18 11:00:00',0,NULL,17,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(74,'TRK0000074','2024-05-18 12:00:00',1,'M.Roberts',17,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(75,'TRK0000075','2024-07-04 14:00:00',0,NULL,17,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(76,'TRK0000076','2024-08-13 15:00:00',0,NULL,18,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(77,'TRK0000077','2024-06-11 12:00:00',0,NULL,18,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(78,'TRK0000078','2024-07-25 16:00:00',0,NULL,18,'2026-04-11 13:45:32','2026-04-16 13:41:20',4),(79,'TRK0000079',NULL,0,NULL,18,'2026-04-11 13:45:32','2026-04-16 13:41:20',2),(80,'TRK0000080',NULL,0,NULL,9,'2026-04-11 13:45:32','2026-04-16 13:41:20',7),(81,'TRK0000081',NULL,0,NULL,11,'2026-04-11 13:45:32','2026-04-16 13:41:20',7),(82,'TRK0000082',NULL,0,NULL,10,'2026-04-11 13:45:32','2026-04-16 13:41:20',7),(83,'TRK0000083',NULL,0,NULL,8,'2026-04-11 13:45:32','2026-04-16 13:41:20',6),(84,'TRK0000084',NULL,1,NULL,12,'2026-04-11 13:45:32','2026-04-16 13:41:20',6),(85,'TRK0000085',NULL,0,NULL,15,'2026-04-11 13:45:32','2026-04-16 13:41:20',6),(86,'TRK0000086',NULL,0,NULL,NULL,'2026-03-29 19:35:50','2026-04-16 13:41:20',1),(87,'TRK0000087',NULL,0,NULL,NULL,'2026-04-13 17:27:43','2026-04-16 13:41:20',8),(88,'TRK0000088',NULL,0,NULL,NULL,'2026-04-13 17:39:19','2026-04-16 13:41:20',1),(89,'TRK0000089',NULL,0,NULL,NULL,'2026-04-14 11:34:17','2026-04-16 13:41:20',1),(92,'TRK0000090',NULL,0,NULL,NULL,'2026-04-16 03:38:42','2026-04-16 13:41:20',1),(99,'TRK0000091',NULL,0,NULL,NULL,'2026-04-16 08:57:35','2026-04-16 13:41:20',1),(100,'TRK0000092',NULL,0,NULL,NULL,'2026-04-16 08:58:26','2026-04-16 20:38:41',4),(101,'TRK0000093',NULL,0,NULL,NULL,'2026-04-16 13:59:32','2026-04-16 14:31:07',4),(102,'TRK0000013',NULL,1,NULL,NULL,'2026-04-16 14:33:22','2026-04-16 22:01:42',8),(103,'TRK0000014',NULL,0,NULL,NULL,'2026-04-16 14:33:22','2026-04-16 22:38:18',7),(104,'TRK0000015',NULL,0,NULL,NULL,'2026-04-16 14:33:22',NULL,1),(106,'TRK0000094',NULL,0,NULL,NULL,'2026-04-16 16:59:35',NULL,NULL),(107,'TRK0000095',NULL,0,NULL,NULL,'2026-04-16 17:11:14',NULL,NULL),(109,'TRK0000096',NULL,0,NULL,NULL,'2026-04-16 17:20:25',NULL,NULL),(110,'TRK0000097',NULL,0,NULL,NULL,'2026-04-16 17:20:41',NULL,NULL),(111,'TRK0000098',NULL,0,NULL,NULL,'2026-04-16 17:31:16',NULL,NULL),(112,'TRK0000099',NULL,0,NULL,NULL,'2026-04-16 17:31:30',NULL,NULL),(113,'TRK0000100',NULL,0,NULL,NULL,'2026-04-16 17:32:42',NULL,NULL),(114,'TRK0000101',NULL,0,NULL,NULL,'2026-04-16 17:32:49',NULL,NULL),(115,'TRK0000102',NULL,0,NULL,NULL,'2026-04-16 17:32:58',NULL,NULL),(116,'TRK0000103',NULL,0,NULL,NULL,'2026-04-16 18:42:40','2026-04-16 22:38:39',7),(117,'TRK0000104',NULL,0,NULL,NULL,'2026-04-16 18:49:16','2026-04-16 20:36:52',2),(118,'TRK0000105',NULL,0,NULL,NULL,'2026-04-16 20:17:04','2026-04-16 20:35:20',3),(119,'TRK0000106',NULL,0,NULL,NULL,'2026-04-16 20:27:22','2026-04-16 20:35:15',3),(120,'TRK0000107',NULL,0,NULL,NULL,'2026-04-16 20:30:16','2026-04-16 21:04:56',7),(121,'TRK0000108',NULL,0,NULL,NULL,'2026-04-16 20:56:07','2026-04-16 21:22:44',8),(122,'TRK0000200',NULL,0,NULL,1,'2026-04-16 21:38:58',NULL,1),(123,'TRK0000201',NULL,0,NULL,NULL,'2026-04-16 21:59:31','2026-04-16 22:07:36',8),(124,'TRK0000202',NULL,0,NULL,NULL,'2026-04-16 22:37:47','2026-04-16 22:38:48',8);
/*!40000 ALTER TABLE `delivery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `Department_ID` int NOT NULL AUTO_INCREMENT,
  `Department_Name` varchar(30) NOT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Department_ID`),
  UNIQUE KEY `Department_Name` (`Department_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'Customer Service','2026-04-08 11:57:23',NULL),(2,'Delivery','2026-04-08 11:57:23',NULL),(4,'Management','2026-04-08 11:57:23',NULL);
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `Employee_ID` int NOT NULL AUTO_INCREMENT,
  `Post_Office_ID` int NOT NULL,
  `Supervisor_ID` int DEFAULT NULL,
  `Role_ID` int NOT NULL,
  `Department_ID` int NOT NULL,
  `First_Name` varchar(30) NOT NULL,
  `Middle_Name` varchar(30) NOT NULL,
  `Last_Name` varchar(30) NOT NULL,
  `Password_Hash` varchar(255) NOT NULL,
  `Email_Address` varchar(255) NOT NULL,
  `Phone_Number` varchar(20) DEFAULT NULL,
  `Sex` char(1) NOT NULL,
  `Salary` decimal(10,2) NOT NULL,
  `Hours_Worked` decimal(6,2) NOT NULL DEFAULT '0.00',
  `Birthday` date DEFAULT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `is_active` enum('1','0') NOT NULL DEFAULT '1',
  PRIMARY KEY (`Employee_ID`),
  UNIQUE KEY `Email_Address` (`Email_Address`),
  KEY `Post_Office_ID` (`Post_Office_ID`),
  KEY `Supervisor_ID` (`Supervisor_ID`),
  KEY `role_ID` (`Role_ID`),
  KEY `Department_ID` (`Department_ID`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`Post_Office_ID`) REFERENCES `post_office` (`Post_Office_ID`),
  CONSTRAINT `employee_ibfk_2` FOREIGN KEY (`Supervisor_ID`) REFERENCES `employee` (`Employee_ID`),
  CONSTRAINT `employee_ibfk_3` FOREIGN KEY (`Role_ID`) REFERENCES `role` (`Role_ID`),
  CONSTRAINT `employee_ibfk_4` FOREIGN KEY (`Department_ID`) REFERENCES `department` (`Department_ID`),
  CONSTRAINT `ch_date_after` CHECK ((`Birthday` >= _utf8mb4'1900-01-01'))
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,1,NULL,5,4,'Richard','A','Moore','$2a$10$EJZhbmWFuPFOg8ZR73VG9eSEbQLGztIJG8uoge6atW1b2b7S3FpLS','richard.moore@postoffice8.com','713-500-2003','M',72000.00,0.00,NULL,'2026-04-08 11:57:23','2026-04-16 16:24:08','1'),(2,2,NULL,5,4,'Nancy','B','White','$2b$10$abc123hashed','nancy.white@postoffice8.com','214-500-2002','F',70000.00,0.00,NULL,'2026-04-08 11:57:23','2026-04-14 21:50:09','1'),(3,3,NULL,5,4,'Thomas','C','Harris','$2b$10$abc123hashed','thomas.harris@postoffice8.com','512-500-2003','M',71000.00,0.00,NULL,'2026-04-08 11:57:23','2026-04-14 21:50:09','1'),(4,1,1,5,1,'Jessica','D','Clark','$2b$10$abc123hashed','jessica.clark@postoffice8.com','713-500-2004','F',52000.00,0.00,NULL,'2026-04-08 11:57:23','2026-04-14 21:50:09','1'),(5,1,1,5,2,'Kevin','E','Lewis','$2b$10$abc123hashed','kevin.lewis@postoffice8.com','713-500-2005','M',51000.00,0.00,NULL,'2026-04-08 11:57:23','2026-04-14 21:50:09','1'),(6,2,2,5,1,'Amanda','F','Robinson','$2b$10$abc123hashed','amanda.robinson@postoffice8.com','214-500-2006','F',50000.00,0.00,NULL,'2026-04-08 11:57:23','2026-04-14 21:50:09','1'),(7,3,3,5,2,'Brian','G','Walker','$2b$10$abc123hashed','brian.walker@postoffice8.com','512-500-2007','M',51500.00,0.00,NULL,'2026-04-08 11:57:23','2026-04-14 21:50:09','1'),(8,1,4,1,1,'Ashley','H','Hall','$2a$10$sIfLILiK0ojJDwD5c7/JTelMjlSY0veA4c7UHC8TP4hoOae4a0ndG','ashley.hall@postoffice8.com','713-500-2001','F',38000.00,0.00,NULL,'2026-04-08 11:57:23','2026-04-16 20:13:26','1'),(9,1,5,2,2,'Joshua','I','Young','$2b$10$abc123hashed','joshua.young@postoffice8.com','713-500-2009','M',40000.00,0.00,NULL,'2026-04-08 11:57:23',NULL,'1'),(10,2,6,1,1,'Megan','J','Allen','$2b$10$abc123hashed','megan.allen@postoffice8.com','214-500-2010','F',37500.00,0.00,NULL,'2026-04-08 11:57:23',NULL,'1'),(11,2,6,2,2,'Tyler','K','Scott','$2b$10$abc123hashed','tyler.scott@postoffice8.com','214-500-2011','M',41000.00,0.00,NULL,'2026-04-08 11:57:23',NULL,'1'),(12,3,7,1,1,'Lauren','L','Adams','$2b$10$abc123hashed','lauren.adams@postoffice8.com','512-500-2012','F',38500.00,0.00,NULL,'2026-04-08 11:57:23',NULL,'1'),(13,4,NULL,5,4,'Steven','M','Baker','$2b$10$abc123hashed','steven.baker@postoffice8.com','210-500-2013','M',70500.00,0.00,NULL,'2026-04-08 11:57:23','2026-04-14 21:50:09','1'),(14,5,NULL,5,4,'Rachel','N','Gonzalez','$2b$10$abc123hashed','rachel.gonzalez@postoffice8.com','806-500-2014','F',69000.00,0.00,NULL,'2026-04-08 11:57:23','2026-04-14 21:50:09','1'),(15,4,13,1,1,'Marcus','D','Bell','$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q','marcus.bell@postoffice8.com','210-500-3001','M',37000.00,0.00,'1994-04-16','2026-04-11 13:19:06',NULL,'1'),(16,4,13,2,2,'Diana','K','Cruz','$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q','diana.cruz@postoffice8.com','210-500-3002','F',39500.00,0.00,'1991-07-09','2026-04-11 13:19:06',NULL,'1'),(17,5,14,1,1,'Ethan','R','Coleman','$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q','ethan.coleman@postoffice8.com','806-500-3003','M',37500.00,0.00,'1989-11-23','2026-04-11 13:19:06',NULL,'1'),(18,5,14,2,2,'Brittany','S','Simmons','$2a$10$kdMky0yh3FVqVBzXATNM/uYAd6L9WtXKnSrrV66P1ucpb/zyDvM0q','brittany.simmons@postoffice8.com','806-500-3004','F',40000.00,0.00,'1996-03-02','2026-04-11 13:19:06',NULL,'1'),(19,1,NULL,5,4,'Admin','A','User','$2b$10$dZqvPmx6ex1aURXjSj3AvOH6JxqPRsW5n61eDAwuUA5LYz.Ac9zaK','new.admin@postoffice8.com','945-856-7434','U',0.00,0.00,NULL,'2026-04-11 14:05:52','2026-04-16 09:34:47','1'),(22,1,NULL,1,2,'John','','doe','$2a$10$we4Uxh/mqkBBqeeHtg1H8usY8mL6CkVrL6/UYRLYqz2hc4K9ThmwG','jon@email.com','111-222-4444','U',0.00,0.00,'2000-02-03','2026-04-13 17:17:52','2026-04-13 20:32:35','0'),(23,1,NULL,1,1,'jd','','Employee','$2a$10$nTXUdnXc7mTrMp.vKelIp.uxWUiA1Z6IgMSUrsX/FS/bU4y3HfDh2','jd@e.com','444-444-4444','U',0.00,0.00,'1999-03-08','2026-04-14 11:37:09','2026-04-14 11:37:45','0'),(24,1,NULL,5,1,'Joyh','','Employee','$2a$10$fXzUadOYEhoJPhRQutwFI.wKm6HkGZDorkQ8Z9T8I/yD7v/u6mWCe','d@email.com','111-222-3333','U',0.00,0.00,'2026-04-15','2026-04-14 15:27:45','2026-04-14 21:50:09','0'),(25,1,NULL,1,4,'test','','Employee','$2a$10$xYBtys/0J3IrqvUVFbyOSe0naH66OUiHU/oGonRoG6j9XxCJrb4Iu','test12@gmail.com','1239938483','U',0.00,0.00,'2006-07-15','2026-04-16 00:12:34','2026-04-16 00:13:25','0'),(26,1,NULL,2,2,'John','','D','$2a$10$JwZxhICSiGVhOUWiuKu.SelrzoibOFhvs9bY7U58qsWeiw5eUe7YC','j@email.com','111-222-3333','U',0.00,0.00,'1988-04-04','2026-04-16 14:43:13',NULL,'1'),(27,1,NULL,1,1,'Test','','Employee','$2a$10$96.Xdn0nNuTYFK3VWonG7u6JUA8.POQVEaBR6tpupR/BcB4JB0P3m','test@gmail.com','1234567890','U',0.00,0.00,'2003-10-09','2026-04-16 18:29:52','2026-04-16 18:30:46','0'),(28,1,NULL,1,2,'j','','Employee','$2a$10$Hmmbn4OOIliFaj8v2hp9XurTJyUKCl.oc4MVLiSWnrH2ir0ksMA.i','d@e.com','111-222-3333','U',0.00,0.00,'2001-01-01','2026-04-16 18:36:58',NULL,'1'),(29,1,NULL,1,2,'To','','Be Deleted','$2a$10$Q2Bj1ijP60dM1Rdw2aaVmuuJYCQtEYVAdgoEgVpIdn2IWTrIayG.2','randomemployee@gmail.com','8387720909','U',0.00,0.00,'2015-07-24','2026-04-16 21:37:23','2026-04-16 21:37:34','0'),(30,1,NULL,1,1,'b','','Employee','$2a$10$Mx7PXWNPFYVtrkykbwlJUOGLbDtFhRoCIYteC3ek28O5CjzvRhyzC','e@a.com','111-222-3333','U',0.00,0.00,'2001-01-01','2026-04-16 22:03:34','2026-04-16 22:03:54','0'),(31,1,NULL,1,1,'employ','','Employee','$2a$10$1/gBN3HxLAkc4GQL7O0hm.5PRUG/IXvNVebQ0/YyfRl8y2/k3oQUu','empoy@email.com','111-222-3333','U',0.00,0.00,'2004-10-12','2026-04-16 22:40:54','2026-04-16 22:41:09','0');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `excess_fee`
--

DROP TABLE IF EXISTS `excess_fee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `excess_fee` (
  `Fee_Type_Code` varchar(50) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `Type_Name` varchar(100) NOT NULL,
  `Additional_Price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Fee_Type_Code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `excess_fee`
--

LOCK TABLES `excess_fee` WRITE;
/*!40000 ALTER TABLE `excess_fee` DISABLE KEYS */;
INSERT INTO `excess_fee` VALUES ('FRAG','Fragile item special handling','Fragile Handling',5.00,'2026-04-08 11:57:23',NULL),('FUEL','Fuel surcharge','Fuel Surcharge',2.25,'2026-04-08 11:57:23',NULL),('HAZ','Hazardous materials handling fee','Hazardous Material',15.00,'2026-04-08 11:57:23',NULL),('SIG','Signature confirmation required','Signature Required',3.50,'2026-04-08 11:57:23',NULL);
/*!40000 ALTER TABLE `excess_fee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package`
--

DROP TABLE IF EXISTS `package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package` (
  `Tracking_Number` varchar(10) NOT NULL,
  `Sender_ID` int NOT NULL,
  `Recipient_ID` int DEFAULT NULL,
  `Dim_X` decimal(8,2) NOT NULL,
  `Dim_Y` decimal(8,2) NOT NULL,
  `Dim_Z` decimal(8,2) NOT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL,
  `Package_Type_Code` varchar(30) NOT NULL,
  `Weight` decimal(6,2) NOT NULL,
  `Zone` tinyint NOT NULL,
  `Oversize` tinyint(1) NOT NULL DEFAULT '0',
  `Requires_Signature` tinyint(1) NOT NULL DEFAULT '0',
  `Status_Code` int NOT NULL DEFAULT '1',
  `Lost_Status` enum('active','lost','notified') DEFAULT 'active',
  PRIMARY KEY (`Tracking_Number`),
  KEY `Sender_ID` (`Sender_ID`),
  KEY `Recipient_ID` (`Recipient_ID`),
  KEY `Package_Type_Code` (`Package_Type_Code`),
  KEY `Status_Code` (`Status_Code`),
  KEY `idx_lost_status` (`Lost_Status`,`Recipient_ID`),
  KEY `idx_status_recipient` (`Recipient_ID`,`Status_Code`),
  CONSTRAINT `package_ibfk_1` FOREIGN KEY (`Sender_ID`) REFERENCES `customer` (`Customer_ID`),
  CONSTRAINT `package_ibfk_2` FOREIGN KEY (`Recipient_ID`) REFERENCES `customer` (`Customer_ID`),
  CONSTRAINT `package_ibfk_3` FOREIGN KEY (`Package_Type_Code`) REFERENCES `package_type` (`Package_Type_Code`),
  CONSTRAINT `package_ibfk_4` FOREIGN KEY (`Status_Code`) REFERENCES `status_code` (`Status_Code`),
  CONSTRAINT `chk_package_dimensions_positive` CHECK (((`Dim_X` > 0) and (`Dim_Y` > 0) and (`Dim_Z` > 0))),
  CONSTRAINT `chk_package_sender_recipient_different` CHECK ((`Sender_ID` <> `Recipient_ID`)),
  CONSTRAINT `package_chk_1` CHECK ((`Weight` <= 70)),
  CONSTRAINT `package_chk_2` CHECK ((`Zone` between 1 and 9))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package`
--

LOCK TABLES `package` WRITE;
/*!40000 ALTER TABLE `package` DISABLE KEYS */;
INSERT INTO `package` VALUES ('TRK0000001',1,3,12.00,8.00,6.00,'2026-03-26 13:30:08',NULL,'GEN',4.20,4,0,0,4,'active'),('TRK0000002',2,4,24.00,18.00,12.00,'2026-03-26 13:30:08',NULL,'GEN',12.70,7,1,0,4,'active'),('TRK0000003',3,5,6.00,4.00,2.00,'2026-03-26 13:30:08',NULL,'EXP',0.80,2,0,0,4,'active'),('TRK0000004',4,6,36.00,24.00,24.00,'2026-03-26 13:30:08','2026-04-16 10:04:53','OVR',48.00,5,1,1,7,'active'),('TRK0000005',5,7,10.00,7.00,5.00,'2026-03-26 13:30:08','2026-04-16 10:04:53','EXP',2.10,3,0,1,7,'active'),('TRK0000006',6,8,15.00,12.00,8.00,'2026-03-26 13:30:08',NULL,'GEN',6.50,6,0,0,4,'active'),('TRK0000007',7,9,8.00,8.00,8.00,'2026-03-26 13:30:08','2026-04-16 10:04:53','GEN',3.30,2,0,0,7,'active'),('TRK0000008',8,10,20.00,16.00,10.00,'2026-03-26 13:30:08',NULL,'EXP',9.80,8,0,1,7,'active'),('TRK0000009',9,1,30.00,20.00,15.00,'2026-03-26 13:30:08',NULL,'OVR',35.00,4,1,0,4,'active'),('TRK0000010',10,2,5.00,5.00,5.00,'2026-04-01 10:03:52','2026-04-16 10:04:53','GEN',1.20,1,0,0,7,'active'),('TRK0000011',1,5,18.00,14.00,9.00,'2026-03-26 13:30:08','2026-04-16 10:04:53','GEN',7.60,5,0,0,7,'active'),('TRK0000012',3,7,12.00,10.00,6.00,'2026-03-26 13:30:08','2026-04-16 10:04:53','EXP',3.40,3,0,1,7,'active'),('TRK0000013',2,8,40.00,30.00,20.00,'2026-03-26 13:30:08',NULL,'OVR',55.00,9,1,1,8,'active'),('TRK0000014',5,10,7.00,5.00,4.00,'2026-03-26 13:30:08',NULL,'GEN',2.00,2,0,0,7,'lost'),('TRK0000015',6,1,22.00,18.00,12.00,'2026-03-26 13:30:08',NULL,'EXP',11.50,6,0,0,1,'active'),('TRK0000016',1,11,10.00,8.00,6.00,'2026-04-11 12:44:54',NULL,'GEN',2.50,2,0,0,4,'active'),('TRK0000017',11,2,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'EXP',0.75,3,0,0,4,'active'),('TRK0000018',2,12,18.00,14.00,10.00,'2026-04-11 12:44:54',NULL,'GEN',8.00,4,0,0,4,'active'),('TRK0000019',12,3,6.00,4.00,3.00,'2026-04-11 12:44:54',NULL,'EXP',0.50,1,0,0,4,'active'),('TRK0000020',3,13,24.00,18.00,12.00,'2026-04-11 12:44:54',NULL,'OVR',20.00,5,1,0,2,'active'),('TRK0000021',13,4,8.00,6.00,4.00,'2026-04-11 12:44:54',NULL,'GEN',1.80,2,0,0,2,'active'),('TRK0000022',4,14,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'EXP',3.20,4,0,1,4,'active'),('TRK0000023',14,5,30.00,24.00,18.00,'2026-04-11 12:44:54',NULL,'OVR',38.00,6,1,0,4,'active'),('TRK0000024',5,15,10.00,8.00,6.00,'2026-04-11 12:44:54',NULL,'GEN',4.50,3,0,0,4,'active'),('TRK0000025',15,6,14.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'EXP',2.80,5,0,0,4,'active'),('TRK0000026',6,16,8.00,6.00,4.00,'2026-04-11 12:44:54',NULL,'GEN',0.90,1,0,0,4,'active'),('TRK0000027',16,7,18.00,14.00,10.00,'2026-04-11 12:44:54',NULL,'OVR',18.00,3,1,0,4,'active'),('TRK0000028',7,17,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'GEN',6.20,4,0,0,4,'active'),('TRK0000029',17,8,6.00,4.00,3.00,'2026-04-11 12:44:54',NULL,'EXP',0.60,2,0,0,2,'active'),('TRK0000030',8,18,24.00,18.00,12.00,'2026-04-11 12:44:54',NULL,'OVR',28.00,7,1,1,2,'active'),('TRK0000031',18,9,10.00,8.00,6.00,'2026-04-11 12:44:54',NULL,'GEN',3.10,2,0,0,4,'active'),('TRK0000032',9,19,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'EXP',1.40,3,0,0,4,'active'),('TRK0000033',19,10,18.00,14.00,10.00,'2026-04-11 12:44:54',NULL,'GEN',9.50,5,0,0,7,'lost'),('TRK0000034',10,20,8.00,6.00,4.00,'2026-04-11 12:44:54',NULL,'EXP',0.80,4,0,0,4,'active'),('TRK0000035',20,1,30.00,24.00,18.00,'2026-04-11 12:44:54',NULL,'OVR',42.00,8,1,1,4,'active'),('TRK0000036',11,3,10.00,8.00,6.00,'2026-04-11 12:44:54',NULL,'GEN',2.00,1,0,0,4,'active'),('TRK0000037',12,4,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'EXP',4.50,6,0,0,4,'active'),('TRK0000038',13,5,18.00,14.00,10.00,'2026-04-11 12:44:54',NULL,'GEN',7.80,3,0,0,4,'active'),('TRK0000039',14,6,6.00,4.00,3.00,'2026-04-11 12:44:54',NULL,'EXP',0.40,2,0,0,5,'active'),('TRK0000040',15,7,24.00,18.00,12.00,'2026-04-11 12:44:54',NULL,'OVR',25.00,4,1,0,5,'active'),('TRK0000041',16,8,10.00,8.00,6.00,'2026-04-11 12:44:54',NULL,'GEN',3.80,5,0,0,4,'active'),('TRK0000042',17,9,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'EXP',2.10,7,0,1,4,'active'),('TRK0000043',18,10,18.00,14.00,10.00,'2026-04-11 12:44:54',NULL,'OVR',32.00,9,1,0,4,'active'),('TRK0000044',19,11,10.00,8.00,6.00,'2026-04-11 12:44:54',NULL,'GEN',5.50,2,0,0,4,'active'),('TRK0000045',20,12,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'EXP',1.90,3,0,0,4,'active'),('TRK0000046',1,13,8.00,6.00,4.00,'2026-04-11 12:44:54',NULL,'GEN',0.70,1,0,0,4,'active'),('TRK0000047',2,14,24.00,18.00,12.00,'2026-04-11 12:44:54',NULL,'OVR',22.00,5,1,1,4,'active'),('TRK0000048',3,15,10.00,8.00,6.00,'2026-04-11 12:44:54',NULL,'GEN',4.20,4,0,0,4,'active'),('TRK0000049',4,16,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'EXP',3.60,6,0,0,4,'active'),('TRK0000050',5,17,18.00,14.00,10.00,'2026-04-11 12:44:54',NULL,'GEN',11.00,7,0,0,2,'active'),('TRK0000051',6,18,10.00,8.00,6.00,'2026-04-11 12:44:54',NULL,'EXP',0.90,2,0,0,3,'active'),('TRK0000052',7,19,30.00,24.00,18.00,'2026-04-11 12:44:54',NULL,'OVR',55.00,3,1,0,2,'active'),('TRK0000053',8,20,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'GEN',6.80,5,0,1,4,'active'),('TRK0000054',9,11,6.00,4.00,3.00,'2026-04-11 12:44:54',NULL,'EXP',1.20,4,0,0,4,'active'),('TRK0000055',10,12,18.00,14.00,10.00,'2026-04-11 12:44:54',NULL,'OVR',17.00,8,1,0,4,'active'),('TRK0000056',11,13,10.00,8.00,6.00,'2026-04-11 12:44:54',NULL,'GEN',2.90,2,0,0,4,'active'),('TRK0000057',12,14,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'EXP',4.80,9,0,1,4,'active'),('TRK0000058',13,15,24.00,18.00,12.00,'2026-04-11 12:44:54',NULL,'OVR',30.00,6,1,0,4,'active'),('TRK0000059',14,16,10.00,8.00,6.00,'2026-04-11 12:44:54',NULL,'GEN',1.50,1,0,0,5,'active'),('TRK0000060',15,17,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'EXP',2.40,3,0,0,2,'active'),('TRK0000061',16,18,18.00,14.00,10.00,'2026-04-11 12:44:54',NULL,'GEN',13.00,7,0,0,2,'active'),('TRK0000062',17,19,8.00,6.00,4.00,'2026-04-11 12:44:54',NULL,'EXP',0.70,5,0,0,3,'active'),('TRK0000063',18,20,30.00,24.00,18.00,'2026-04-11 12:44:54',NULL,'OVR',48.00,4,1,1,2,'active'),('TRK0000064',19,1,10.00,8.00,6.00,'2026-04-11 12:44:54',NULL,'GEN',3.40,2,0,0,2,'active'),('TRK0000065',20,2,12.00,10.00,8.00,'2026-04-11 12:44:54',NULL,'EXP',1.10,6,0,0,2,'active'),('TRK0000066',7,11,10.00,8.00,6.00,'2026-04-11 13:24:45',NULL,'GEN',3.20,3,0,0,4,'active'),('TRK0000067',8,12,12.00,10.00,8.00,'2026-04-11 13:24:45',NULL,'EXP',1.50,4,0,0,4,'active'),('TRK0000068',14,1,18.00,14.00,10.00,'2026-04-11 13:24:45',NULL,'GEN',8.50,5,0,0,4,'active'),('TRK0000069',3,14,24.00,18.00,12.00,'2026-04-11 13:24:45',NULL,'OVR',22.00,6,1,1,4,'active'),('TRK0000070',11,8,10.00,8.00,6.00,'2026-04-11 13:24:45',NULL,'EXP',0.80,2,0,0,2,'active'),('TRK0000071',7,15,12.00,10.00,8.00,'2026-04-11 13:24:45',NULL,'GEN',5.00,3,0,0,4,'active'),('TRK0000072',14,20,18.00,14.00,10.00,'2026-04-11 13:24:45',NULL,'EXP',3.80,5,0,0,4,'active'),('TRK0000073',9,13,10.00,8.00,6.00,'2026-04-11 13:24:45',NULL,'GEN',2.10,2,0,0,4,'active'),('TRK0000074',10,14,12.00,10.00,8.00,'2026-04-11 13:24:45',NULL,'EXP',4.20,4,0,1,4,'active'),('TRK0000075',15,2,18.00,14.00,10.00,'2026-04-11 13:24:45',NULL,'GEN',9.00,6,0,0,4,'active'),('TRK0000076',5,15,24.00,18.00,12.00,'2026-04-11 13:24:45',NULL,'OVR',28.00,7,1,0,4,'active'),('TRK0000077',20,9,10.00,8.00,6.00,'2026-04-11 13:24:45',NULL,'EXP',1.20,3,0,0,4,'active'),('TRK0000078',10,16,12.00,10.00,8.00,'2026-04-11 13:24:45',NULL,'GEN',6.50,4,0,0,4,'active'),('TRK0000079',15,3,18.00,14.00,10.00,'2026-04-11 13:24:45',NULL,'EXP',2.90,5,0,0,2,'active'),('TRK0000080',1,6,10.00,8.00,6.00,'2026-04-11 13:24:45',NULL,'GEN',3.50,4,0,0,7,'active'),('TRK0000081',3,8,12.00,10.00,8.00,'2026-04-11 13:24:45',NULL,'EXP',1.80,6,0,0,7,'active'),('TRK0000082',12,5,18.00,14.00,10.00,'2026-04-11 13:24:45',NULL,'OVR',20.00,8,1,0,7,'active'),('TRK0000083',2,7,10.00,8.00,6.00,'2026-04-11 13:24:45',NULL,'GEN',2.20,3,0,0,6,'active'),('TRK0000084',4,9,12.00,10.00,8.00,'2026-04-11 13:24:45',NULL,'EXP',3.10,5,0,1,6,'active'),('TRK0000085',16,4,18.00,14.00,10.00,'2026-04-11 13:24:45',NULL,'GEN',7.80,7,0,0,6,'active'),('TRK0000086',10,21,19.00,8.00,7.60,'2026-04-13 17:21:45',NULL,'OVR',30.00,7,1,0,1,'active'),('TRK0000087',10,22,8.00,9.00,8.00,'2026-04-13 17:27:43',NULL,'OVR',19.96,6,1,0,8,'active'),('TRK0000088',10,22,9.00,8.00,8.00,'2026-04-13 17:39:19',NULL,'OVR',20.00,6,1,0,1,'active'),('TRK0000089',10,23,9.00,9.00,8.00,'2026-04-14 11:34:17',NULL,'OVR',20.00,3,1,0,1,'active'),('TRK0000090',10,NULL,8.00,8.00,8.00,'2026-04-16 03:38:42',NULL,'GEN',15.00,3,0,0,1,'active'),('TRK0000091',10,24,8.00,8.00,8.00,'2026-04-16 08:57:35',NULL,'GEN',3.00,3,0,0,1,'active'),('TRK0000092',24,10,8.00,8.00,8.00,'2026-04-16 08:58:26',NULL,'GEN',3.00,3,0,0,1,'active'),('TRK0000093',10,24,12.00,10.00,1.00,'2026-04-16 13:59:31',NULL,'EXP',14.99,3,0,0,1,'active'),('TRK0000094',10,24,8.00,8.00,8.00,'2026-04-16 16:59:35',NULL,'OVR',17.00,6,1,0,1,'active'),('TRK0000095',10,29,8.00,8.00,8.00,'2026-04-16 17:11:14',NULL,'OVR',17.00,6,1,0,1,'active'),('TRK0000096',10,25,9.00,8.00,9.00,'2026-04-16 17:20:25',NULL,'GEN',10.00,4,0,0,1,'active'),('TRK0000097',10,25,9.00,8.00,9.00,'2026-04-16 17:20:41',NULL,'GEN',10.00,4,0,0,1,'active'),('TRK0000098',10,33,8.00,8.00,8.00,'2026-04-16 17:31:16',NULL,'OVR',17.00,6,1,0,1,'active'),('TRK0000099',10,24,8.00,8.00,8.00,'2026-04-16 17:31:30',NULL,'OVR',17.00,6,1,0,1,'active'),('TRK0000100',24,25,9.00,9.00,9.00,'2026-04-16 17:32:42',NULL,'OVR',23.00,5,1,0,1,'active'),('TRK0000101',24,34,9.00,9.00,9.00,'2026-04-16 17:32:49',NULL,'OVR',23.00,5,1,0,1,'active'),('TRK0000102',24,34,9.00,9.00,9.00,'2026-04-16 17:32:58',NULL,'OVR',23.00,5,1,0,1,'active'),('TRK0000103',37,38,2.00,3.00,4.00,'2026-04-16 18:42:40',NULL,'GEN',15.00,1,0,0,7,'lost'),('TRK0000104',10,24,9.00,8.00,9.00,'2026-04-16 18:49:15',NULL,'GEN',10.00,4,0,0,1,'active'),('TRK0000105',24,40,5.00,5.00,5.00,'2026-04-16 20:17:03',NULL,'GEN',10.00,3,0,0,1,'active'),('TRK0000106',24,10,0.10,7.00,8.00,'2026-04-16 20:27:21',NULL,'GEN',10.00,5,0,0,1,'active'),('TRK0000107',37,41,0.50,0.60,0.70,'2026-04-16 20:30:16',NULL,'GEN',1.99,1,0,0,7,'lost'),('TRK0000108',24,42,7.00,7.00,7.00,'2026-04-16 20:56:07',NULL,'GEN',10.00,4,0,0,8,'active'),('TRK0000200',10,24,10.00,10.00,10.00,'2026-04-16 21:37:45',NULL,'GEN',5.00,2,0,0,1,'active'),('TRK0000201',10,24,4.00,2.00,2.00,'2026-04-16 21:59:31',NULL,'EXP',4.00,6,0,0,8,'active'),('TRK0000202',10,24,3.00,5.00,6.00,'2026-04-16 22:37:47',NULL,'EXP',4.99,4,0,0,8,'active');
/*!40000 ALTER TABLE `package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_excess_fee`
--

DROP TABLE IF EXISTS `package_excess_fee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_excess_fee` (
  `Tracking_Number` varchar(10) NOT NULL,
  `Fee_Type_Code` varchar(50) NOT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Tracking_Number`,`Fee_Type_Code`),
  KEY `Fee_Type_Code` (`Fee_Type_Code`),
  CONSTRAINT `package_excess_fee_ibfk_1` FOREIGN KEY (`Tracking_Number`) REFERENCES `package` (`Tracking_Number`),
  CONSTRAINT `package_excess_fee_ibfk_2` FOREIGN KEY (`Fee_Type_Code`) REFERENCES `excess_fee` (`Fee_Type_Code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_excess_fee`
--

LOCK TABLES `package_excess_fee` WRITE;
/*!40000 ALTER TABLE `package_excess_fee` DISABLE KEYS */;
INSERT INTO `package_excess_fee` VALUES ('TRK0000001','FRAG','2026-04-11 23:32:27',NULL),('TRK0000001','FUEL','2026-04-11 23:32:27',NULL),('TRK0000002','FUEL','2026-04-11 23:32:27',NULL),('TRK0000002','HAZ','2026-04-11 23:32:27',NULL),('TRK0000003','FRAG','2026-04-11 23:32:27',NULL),('TRK0000011','FUEL','2026-04-11 23:32:27',NULL),('TRK0000011','SIG','2026-04-11 23:32:27',NULL),('TRK0000013','HAZ','2026-04-11 23:32:27',NULL);
/*!40000 ALTER TABLE `package_excess_fee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_pickup`
--

DROP TABLE IF EXISTS `package_pickup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_pickup` (
  `Tracking_Number` varchar(20) NOT NULL,
  `Post_Office_ID` int NOT NULL,
  `Arrival_Time` datetime DEFAULT NULL,
  `Pickup_Time` datetime DEFAULT NULL,
  `Is_picked_Up` enum('1','0') NOT NULL DEFAULT '0',
  `Late_Fee_Amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `Recipient_ID` int NOT NULL,
  PRIMARY KEY (`Tracking_Number`),
  KEY `fk_package_pickup_post_office` (`Post_Office_ID`),
  KEY `fk_package_pickup_recipient` (`Recipient_ID`),
  CONSTRAINT `fk_package_pickup_package` FOREIGN KEY (`Tracking_Number`) REFERENCES `package` (`Tracking_Number`),
  CONSTRAINT `fk_package_pickup_post_office` FOREIGN KEY (`Post_Office_ID`) REFERENCES `post_office` (`Post_Office_ID`),
  CONSTRAINT `fk_package_pickup_recipient` FOREIGN KEY (`Recipient_ID`) REFERENCES `customer` (`Customer_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_pickup`
--

LOCK TABLES `package_pickup` WRITE;
/*!40000 ALTER TABLE `package_pickup` DISABLE KEYS */;
INSERT INTO `package_pickup` VALUES ('TRK0000013',5,'2026-04-01 15:56:00','2026-04-16 17:02:00','1',75.00,8),('TRK0000014',1,'2026-04-16 10:14:00','2026-04-16 11:38:00','1',0.00,10),('TRK0000087',3,'2026-04-16 04:23:00','2026-04-17 12:37:00','1',5.00,22),('TRK0000092',1,'2026-04-16 12:37:00','2026-04-16 12:38:00','1',0.00,10),('TRK0000108',1,'2026-04-16 16:23:00','2026-04-16 16:23:00','1',0.00,42),('TRK0000202',1,'2026-04-14 17:39:00','2026-04-23 17:39:00','1',45.00,24);
/*!40000 ALTER TABLE `package_pickup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_pricing`
--

DROP TABLE IF EXISTS `package_pricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_pricing` (
  `Pricing_ID` int NOT NULL AUTO_INCREMENT,
  `Package_Type_Code` varchar(50) NOT NULL,
  `Min_Weight` decimal(10,2) NOT NULL DEFAULT '0.00',
  `Max_Weight` decimal(10,2) NOT NULL DEFAULT '0.00',
  `Zone` tinyint NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  `Max_Cubic_Inches` decimal(10,2) DEFAULT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Pricing_ID`),
  KEY `Package_Type_Code` (`Package_Type_Code`),
  CONSTRAINT `package_pricing_ibfk_1` FOREIGN KEY (`Package_Type_Code`) REFERENCES `package_type` (`Package_Type_Code`) ON DELETE CASCADE,
  CONSTRAINT `package_pricing_chk_1` CHECK ((`Zone` between 1 and 9))
) ENGINE=InnoDB AUTO_INCREMENT=270 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_pricing`
--

LOCK TABLES `package_pricing` WRITE;
/*!40000 ALTER TABLE `package_pricing` DISABLE KEYS */;
INSERT INTO `package_pricing` VALUES (27,'EXP',0.00,10.00,1,12.00,64.00,'2026-04-08 11:57:23',NULL),(28,'EXP',10.00,20.00,1,12.25,64.00,'2026-04-08 11:57:23',NULL),(29,'EXP',20.00,30.00,1,12.50,64.00,'2026-04-08 11:57:23',NULL),(30,'EXP',0.00,10.00,1,13.00,512.00,'2026-04-08 11:57:23',NULL),(31,'EXP',10.00,20.00,1,13.25,512.00,'2026-04-08 11:57:23',NULL),(32,'EXP',20.00,30.00,1,13.50,512.00,'2026-04-08 11:57:23',NULL),(33,'EXP',0.00,10.00,1,14.00,1728.00,'2026-04-08 11:57:23',NULL),(34,'EXP',10.00,20.00,1,14.25,1728.00,'2026-04-08 11:57:23',NULL),(35,'EXP',20.00,30.00,1,14.50,1728.00,'2026-04-08 11:57:23',NULL),(36,'EXP',0.00,10.00,2,15.00,64.00,'2026-04-08 11:57:23',NULL),(37,'EXP',10.00,20.00,2,15.25,64.00,'2026-04-08 11:57:23',NULL),(38,'EXP',20.00,30.00,2,15.50,64.00,'2026-04-08 11:57:23',NULL),(39,'EXP',0.00,10.00,2,16.00,512.00,'2026-04-08 11:57:23',NULL),(40,'EXP',10.00,20.00,2,16.25,512.00,'2026-04-08 11:57:23',NULL),(41,'EXP',20.00,30.00,2,16.50,512.00,'2026-04-08 11:57:23',NULL),(42,'EXP',0.00,10.00,2,17.00,1728.00,'2026-04-08 11:57:23',NULL),(43,'EXP',10.00,20.00,2,17.25,1728.00,'2026-04-08 11:57:23',NULL),(44,'EXP',20.00,30.00,2,17.50,1728.00,'2026-04-08 11:57:23',NULL),(45,'EXP',0.00,10.00,3,18.00,64.00,'2026-04-08 11:57:23',NULL),(46,'EXP',10.00,20.00,3,18.25,64.00,'2026-04-08 11:57:23',NULL),(47,'EXP',20.00,30.00,3,18.50,64.00,'2026-04-08 11:57:23',NULL),(48,'EXP',0.00,10.00,3,19.00,512.00,'2026-04-08 11:57:23',NULL),(49,'EXP',10.00,20.00,3,19.25,512.00,'2026-04-08 11:57:23',NULL),(50,'EXP',20.00,30.00,3,19.50,512.00,'2026-04-08 11:57:23',NULL),(51,'EXP',0.00,10.00,3,20.00,1728.00,'2026-04-08 11:57:23',NULL),(52,'EXP',10.00,20.00,3,20.25,1728.00,'2026-04-08 11:57:23',NULL),(53,'EXP',20.00,30.00,3,20.50,1728.00,'2026-04-08 11:57:23',NULL),(54,'EXP',0.00,10.00,4,21.00,64.00,'2026-04-08 11:57:23',NULL),(55,'EXP',10.00,20.00,4,21.25,64.00,'2026-04-08 11:57:23',NULL),(56,'EXP',20.00,30.00,4,21.50,64.00,'2026-04-08 11:57:23',NULL),(57,'EXP',0.00,10.00,4,22.00,512.00,'2026-04-08 11:57:23',NULL),(58,'EXP',10.00,20.00,4,22.25,512.00,'2026-04-08 11:57:23',NULL),(59,'EXP',20.00,30.00,4,22.50,512.00,'2026-04-08 11:57:23',NULL),(60,'EXP',0.00,10.00,4,23.00,1728.00,'2026-04-08 11:57:23',NULL),(61,'EXP',10.00,20.00,4,23.25,1728.00,'2026-04-08 11:57:23',NULL),(62,'EXP',20.00,30.00,4,23.50,1728.00,'2026-04-08 11:57:23',NULL),(63,'EXP',0.00,10.00,5,24.00,64.00,'2026-04-08 11:57:23',NULL),(64,'EXP',10.00,20.00,5,24.25,64.00,'2026-04-08 11:57:23',NULL),(65,'EXP',20.00,30.00,5,24.50,64.00,'2026-04-08 11:57:23',NULL),(66,'EXP',0.00,10.00,5,25.00,512.00,'2026-04-08 11:57:23',NULL),(67,'EXP',10.00,20.00,5,25.25,512.00,'2026-04-08 11:57:23',NULL),(68,'EXP',20.00,30.00,5,25.50,512.00,'2026-04-08 11:57:23',NULL),(69,'EXP',0.00,10.00,5,26.00,1728.00,'2026-04-08 11:57:23',NULL),(70,'EXP',10.00,20.00,5,26.25,1728.00,'2026-04-08 11:57:23',NULL),(71,'EXP',20.00,30.00,5,26.50,1728.00,'2026-04-08 11:57:23',NULL),(72,'EXP',0.00,10.00,6,27.00,64.00,'2026-04-08 11:57:23',NULL),(73,'EXP',10.00,20.00,6,27.25,64.00,'2026-04-08 11:57:23',NULL),(74,'EXP',20.00,30.00,6,27.50,64.00,'2026-04-08 11:57:23',NULL),(75,'EXP',0.00,10.00,6,28.00,512.00,'2026-04-08 11:57:23',NULL),(76,'EXP',10.00,20.00,6,28.25,512.00,'2026-04-08 11:57:23',NULL),(77,'EXP',20.00,30.00,6,28.50,512.00,'2026-04-08 11:57:23',NULL),(78,'EXP',0.00,10.00,6,29.00,1728.00,'2026-04-08 11:57:23',NULL),(79,'EXP',10.00,20.00,6,29.25,1728.00,'2026-04-08 11:57:23',NULL),(80,'EXP',20.00,30.00,6,29.50,1728.00,'2026-04-08 11:57:23',NULL),(81,'EXP',0.00,10.00,7,30.00,64.00,'2026-04-08 11:57:23',NULL),(82,'EXP',10.00,20.00,7,30.25,64.00,'2026-04-08 11:57:23',NULL),(83,'EXP',20.00,30.00,7,30.50,64.00,'2026-04-08 11:57:23',NULL),(84,'EXP',0.00,10.00,7,31.00,512.00,'2026-04-08 11:57:23',NULL),(85,'EXP',10.00,20.00,7,31.25,512.00,'2026-04-08 11:57:23',NULL),(86,'EXP',20.00,30.00,7,31.50,512.00,'2026-04-08 11:57:23',NULL),(87,'EXP',0.00,10.00,7,32.00,1728.00,'2026-04-08 11:57:23',NULL),(88,'EXP',10.00,20.00,7,32.25,1728.00,'2026-04-08 11:57:23',NULL),(89,'EXP',20.00,30.00,7,32.50,1728.00,'2026-04-08 11:57:23',NULL),(90,'EXP',0.00,10.00,8,33.00,64.00,'2026-04-08 11:57:23',NULL),(91,'EXP',10.00,20.00,8,33.25,64.00,'2026-04-08 11:57:23',NULL),(92,'EXP',20.00,30.00,8,33.50,64.00,'2026-04-08 11:57:23',NULL),(93,'EXP',0.00,10.00,8,34.00,512.00,'2026-04-08 11:57:23',NULL),(94,'EXP',10.00,20.00,8,34.25,512.00,'2026-04-08 11:57:23',NULL),(95,'EXP',20.00,30.00,8,34.50,512.00,'2026-04-08 11:57:23',NULL),(96,'EXP',0.00,10.00,8,35.00,1728.00,'2026-04-08 11:57:23',NULL),(97,'EXP',10.00,20.00,8,35.25,1728.00,'2026-04-08 11:57:23',NULL),(98,'EXP',20.00,30.00,8,35.50,1728.00,'2026-04-08 11:57:23',NULL),(99,'EXP',0.00,10.00,9,36.00,64.00,'2026-04-08 11:57:23',NULL),(100,'EXP',10.00,20.00,9,36.25,64.00,'2026-04-08 11:57:23',NULL),(101,'EXP',20.00,30.00,9,36.50,64.00,'2026-04-08 11:57:23',NULL),(102,'EXP',0.00,10.00,9,37.00,512.00,'2026-04-08 11:57:23',NULL),(103,'EXP',10.00,20.00,9,37.25,512.00,'2026-04-08 11:57:23',NULL),(104,'EXP',20.00,30.00,9,37.50,512.00,'2026-04-08 11:57:23',NULL),(105,'EXP',0.00,10.00,9,38.00,1728.00,'2026-04-08 11:57:23',NULL),(106,'EXP',10.00,20.00,9,38.25,1728.00,'2026-04-08 11:57:23',NULL),(107,'EXP',20.00,30.00,9,38.50,1728.00,'2026-04-08 11:57:23',NULL),(108,'GEN',0.00,10.00,1,6.00,64.00,'2026-04-08 11:57:23',NULL),(109,'GEN',10.00,20.00,1,6.25,64.00,'2026-04-08 11:57:23',NULL),(110,'GEN',20.00,30.00,1,6.50,64.00,'2026-04-08 11:57:23',NULL),(111,'GEN',0.00,10.00,1,7.00,512.00,'2026-04-08 11:57:23',NULL),(112,'GEN',10.00,20.00,1,7.25,512.00,'2026-04-08 11:57:23',NULL),(113,'GEN',20.00,30.00,1,7.50,512.00,'2026-04-08 11:57:23',NULL),(114,'GEN',0.00,10.00,1,8.00,1728.00,'2026-04-08 11:57:23',NULL),(115,'GEN',10.00,20.00,1,8.25,1728.00,'2026-04-08 11:57:23',NULL),(116,'GEN',20.00,30.00,1,8.50,1728.00,'2026-04-08 11:57:23',NULL),(117,'GEN',0.00,10.00,2,9.00,64.00,'2026-04-08 11:57:23',NULL),(118,'GEN',10.00,20.00,2,9.25,64.00,'2026-04-08 11:57:23',NULL),(119,'GEN',20.00,30.00,2,9.50,64.00,'2026-04-08 11:57:23',NULL),(120,'GEN',0.00,10.00,2,10.00,512.00,'2026-04-08 11:57:23',NULL),(121,'GEN',10.00,20.00,2,10.25,512.00,'2026-04-08 11:57:23',NULL),(122,'GEN',20.00,30.00,2,10.50,512.00,'2026-04-08 11:57:23',NULL),(123,'GEN',0.00,10.00,2,11.00,1728.00,'2026-04-08 11:57:23',NULL),(124,'GEN',10.00,20.00,2,11.25,1728.00,'2026-04-08 11:57:23',NULL),(125,'GEN',20.00,30.00,2,11.50,1728.00,'2026-04-08 11:57:23',NULL),(126,'GEN',0.00,10.00,3,12.00,64.00,'2026-04-08 11:57:23',NULL),(127,'GEN',10.00,20.00,3,12.25,64.00,'2026-04-08 11:57:23',NULL),(128,'GEN',20.00,30.00,3,12.50,64.00,'2026-04-08 11:57:23',NULL),(129,'GEN',0.00,10.00,3,13.00,512.00,'2026-04-08 11:57:23',NULL),(130,'GEN',10.00,20.00,3,13.25,512.00,'2026-04-08 11:57:23',NULL),(131,'GEN',20.00,30.00,3,13.50,512.00,'2026-04-08 11:57:23',NULL),(132,'GEN',0.00,10.00,3,14.00,1728.00,'2026-04-08 11:57:23',NULL),(133,'GEN',10.00,20.00,3,14.25,1728.00,'2026-04-08 11:57:23',NULL),(134,'GEN',20.00,30.00,3,14.50,1728.00,'2026-04-08 11:57:23',NULL),(135,'GEN',0.00,10.00,4,15.00,64.00,'2026-04-08 11:57:23',NULL),(136,'GEN',10.00,20.00,4,15.25,64.00,'2026-04-08 11:57:23',NULL),(137,'GEN',20.00,30.00,4,15.50,64.00,'2026-04-08 11:57:23',NULL),(138,'GEN',0.00,10.00,4,16.00,512.00,'2026-04-08 11:57:23',NULL),(139,'GEN',10.00,20.00,4,16.25,512.00,'2026-04-08 11:57:23',NULL),(140,'GEN',20.00,30.00,4,16.50,512.00,'2026-04-08 11:57:23',NULL),(141,'GEN',0.00,10.00,4,17.00,1728.00,'2026-04-08 11:57:23',NULL),(142,'GEN',10.00,20.00,4,17.25,1728.00,'2026-04-08 11:57:23',NULL),(143,'GEN',20.00,30.00,4,17.50,1728.00,'2026-04-08 11:57:23',NULL),(144,'GEN',0.00,10.00,5,18.00,64.00,'2026-04-08 11:57:23',NULL),(145,'GEN',10.00,20.00,5,18.25,64.00,'2026-04-08 11:57:23',NULL),(146,'GEN',20.00,30.00,5,18.50,64.00,'2026-04-08 11:57:23',NULL),(147,'GEN',0.00,10.00,5,19.00,512.00,'2026-04-08 11:57:23',NULL),(148,'GEN',10.00,20.00,5,19.25,512.00,'2026-04-08 11:57:23',NULL),(149,'GEN',20.00,30.00,5,19.50,512.00,'2026-04-08 11:57:23',NULL),(150,'GEN',0.00,10.00,5,20.00,1728.00,'2026-04-08 11:57:23',NULL),(151,'GEN',10.00,20.00,5,20.25,1728.00,'2026-04-08 11:57:23',NULL),(152,'GEN',20.00,30.00,5,20.50,1728.00,'2026-04-08 11:57:23',NULL),(153,'GEN',0.00,10.00,6,21.00,64.00,'2026-04-08 11:57:23',NULL),(154,'GEN',10.00,20.00,6,21.25,64.00,'2026-04-08 11:57:23',NULL),(155,'GEN',20.00,30.00,6,21.50,64.00,'2026-04-08 11:57:23',NULL),(156,'GEN',0.00,10.00,6,22.00,512.00,'2026-04-08 11:57:23',NULL),(157,'GEN',10.00,20.00,6,22.25,512.00,'2026-04-08 11:57:23',NULL),(158,'GEN',20.00,30.00,6,22.50,512.00,'2026-04-08 11:57:23',NULL),(159,'GEN',0.00,10.00,6,23.00,1728.00,'2026-04-08 11:57:23',NULL),(160,'GEN',10.00,20.00,6,23.25,1728.00,'2026-04-08 11:57:23',NULL),(161,'GEN',20.00,30.00,6,23.50,1728.00,'2026-04-08 11:57:23',NULL),(162,'GEN',0.00,10.00,7,24.00,64.00,'2026-04-08 11:57:23',NULL),(163,'GEN',10.00,20.00,7,24.25,64.00,'2026-04-08 11:57:23',NULL),(164,'GEN',20.00,30.00,7,24.50,64.00,'2026-04-08 11:57:23',NULL),(165,'GEN',0.00,10.00,7,25.00,512.00,'2026-04-08 11:57:23',NULL),(166,'GEN',10.00,20.00,7,25.25,512.00,'2026-04-08 11:57:23',NULL),(167,'GEN',20.00,30.00,7,25.50,512.00,'2026-04-08 11:57:23',NULL),(168,'GEN',0.00,10.00,7,26.00,1728.00,'2026-04-08 11:57:23',NULL),(169,'GEN',10.00,20.00,7,26.25,1728.00,'2026-04-08 11:57:23',NULL),(170,'GEN',20.00,30.00,7,26.50,1728.00,'2026-04-08 11:57:23',NULL),(171,'GEN',0.00,10.00,8,27.00,64.00,'2026-04-08 11:57:23',NULL),(172,'GEN',10.00,20.00,8,27.25,64.00,'2026-04-08 11:57:23',NULL),(173,'GEN',20.00,30.00,8,27.50,64.00,'2026-04-08 11:57:23',NULL),(174,'GEN',0.00,10.00,8,28.00,512.00,'2026-04-08 11:57:23',NULL),(175,'GEN',10.00,20.00,8,28.25,512.00,'2026-04-08 11:57:23',NULL),(176,'GEN',20.00,30.00,8,28.50,512.00,'2026-04-08 11:57:23',NULL),(177,'GEN',0.00,10.00,8,29.00,1728.00,'2026-04-08 11:57:23',NULL),(178,'GEN',10.00,20.00,8,29.25,1728.00,'2026-04-08 11:57:23',NULL),(179,'GEN',20.00,30.00,8,29.50,1728.00,'2026-04-08 11:57:23',NULL),(180,'GEN',0.00,10.00,9,30.00,64.00,'2026-04-08 11:57:23',NULL),(181,'GEN',10.00,20.00,9,30.25,64.00,'2026-04-08 11:57:23',NULL),(182,'GEN',20.00,30.00,9,30.50,64.00,'2026-04-08 11:57:23',NULL),(183,'GEN',0.00,10.00,9,31.00,512.00,'2026-04-08 11:57:23',NULL),(184,'GEN',10.00,20.00,9,31.25,512.00,'2026-04-08 11:57:23',NULL),(185,'GEN',20.00,30.00,9,31.50,512.00,'2026-04-08 11:57:23',NULL),(186,'GEN',0.00,10.00,9,32.00,1728.00,'2026-04-08 11:57:23',NULL),(187,'GEN',10.00,20.00,9,32.25,1728.00,'2026-04-08 11:57:23',NULL),(188,'GEN',20.00,30.00,9,32.50,1728.00,'2026-04-08 11:57:23',NULL),(189,'OVR',0.00,10.00,1,20.00,64.00,'2026-04-08 11:57:23',NULL),(190,'OVR',10.00,20.00,1,20.25,64.00,'2026-04-08 11:57:23',NULL),(191,'OVR',20.00,30.00,1,20.50,64.00,'2026-04-08 11:57:23',NULL),(192,'OVR',0.00,10.00,1,21.00,512.00,'2026-04-08 11:57:23',NULL),(193,'OVR',10.00,20.00,1,21.25,512.00,'2026-04-08 11:57:23',NULL),(194,'OVR',20.00,30.00,1,21.50,512.00,'2026-04-08 11:57:23',NULL),(195,'OVR',0.00,10.00,1,22.00,1728.00,'2026-04-08 11:57:23',NULL),(196,'OVR',10.00,20.00,1,22.25,1728.00,'2026-04-08 11:57:23',NULL),(197,'OVR',20.00,30.00,1,22.50,1728.00,'2026-04-08 11:57:23',NULL),(198,'OVR',0.00,10.00,2,23.00,64.00,'2026-04-08 11:57:23',NULL),(199,'OVR',10.00,20.00,2,23.25,64.00,'2026-04-08 11:57:23',NULL),(200,'OVR',20.00,30.00,2,23.50,64.00,'2026-04-08 11:57:23',NULL),(201,'OVR',0.00,10.00,2,24.00,512.00,'2026-04-08 11:57:23',NULL),(202,'OVR',10.00,20.00,2,24.25,512.00,'2026-04-08 11:57:23',NULL),(203,'OVR',20.00,30.00,2,24.50,512.00,'2026-04-08 11:57:23',NULL),(204,'OVR',0.00,10.00,2,25.00,1728.00,'2026-04-08 11:57:23',NULL),(205,'OVR',10.00,20.00,2,25.25,1728.00,'2026-04-08 11:57:23',NULL),(206,'OVR',20.00,30.00,2,25.50,1728.00,'2026-04-08 11:57:23',NULL),(207,'OVR',0.00,10.00,3,26.00,64.00,'2026-04-08 11:57:23',NULL),(208,'OVR',10.00,20.00,3,26.25,64.00,'2026-04-08 11:57:23',NULL),(209,'OVR',20.00,30.00,3,26.50,64.00,'2026-04-08 11:57:23',NULL),(210,'OVR',0.00,10.00,3,27.00,512.00,'2026-04-08 11:57:23',NULL),(211,'OVR',10.00,20.00,3,27.25,512.00,'2026-04-08 11:57:23',NULL),(212,'OVR',20.00,30.00,3,27.50,512.00,'2026-04-08 11:57:23',NULL),(213,'OVR',0.00,10.00,3,28.00,1728.00,'2026-04-08 11:57:23',NULL),(214,'OVR',10.00,20.00,3,28.25,1728.00,'2026-04-08 11:57:23',NULL),(215,'OVR',20.00,30.00,3,28.50,1728.00,'2026-04-08 11:57:23',NULL),(216,'OVR',0.00,10.00,4,29.00,64.00,'2026-04-08 11:57:23',NULL),(217,'OVR',10.00,20.00,4,29.25,64.00,'2026-04-08 11:57:23',NULL),(218,'OVR',20.00,30.00,4,29.50,64.00,'2026-04-08 11:57:23',NULL),(219,'OVR',0.00,10.00,4,30.00,512.00,'2026-04-08 11:57:23',NULL),(220,'OVR',10.00,20.00,4,30.25,512.00,'2026-04-08 11:57:23',NULL),(221,'OVR',20.00,30.00,4,30.50,512.00,'2026-04-08 11:57:23',NULL),(222,'OVR',0.00,10.00,4,31.00,1728.00,'2026-04-08 11:57:23',NULL),(223,'OVR',10.00,20.00,4,31.25,1728.00,'2026-04-08 11:57:23',NULL),(224,'OVR',20.00,30.00,4,31.50,1728.00,'2026-04-08 11:57:23',NULL),(225,'OVR',0.00,10.00,5,32.00,64.00,'2026-04-08 11:57:23',NULL),(226,'OVR',10.00,20.00,5,32.25,64.00,'2026-04-08 11:57:23',NULL),(227,'OVR',20.00,30.00,5,32.50,64.00,'2026-04-08 11:57:23',NULL),(228,'OVR',0.00,10.00,5,33.00,512.00,'2026-04-08 11:57:23',NULL),(229,'OVR',10.00,20.00,5,33.25,512.00,'2026-04-08 11:57:23',NULL),(230,'OVR',20.00,30.00,5,33.50,512.00,'2026-04-08 11:57:23',NULL),(231,'OVR',0.00,10.00,5,34.00,1728.00,'2026-04-08 11:57:23',NULL),(232,'OVR',10.00,20.00,5,34.25,1728.00,'2026-04-08 11:57:23',NULL),(233,'OVR',20.00,30.00,5,34.50,1728.00,'2026-04-08 11:57:23',NULL),(234,'OVR',0.00,10.00,6,35.00,64.00,'2026-04-08 11:57:23',NULL),(235,'OVR',10.00,20.00,6,35.25,64.00,'2026-04-08 11:57:23',NULL),(236,'OVR',20.00,30.00,6,35.50,64.00,'2026-04-08 11:57:23',NULL),(237,'OVR',0.00,10.00,6,36.00,512.00,'2026-04-08 11:57:23',NULL),(238,'OVR',10.00,20.00,6,36.25,512.00,'2026-04-08 11:57:23',NULL),(239,'OVR',20.00,30.00,6,36.50,512.00,'2026-04-08 11:57:23',NULL),(240,'OVR',0.00,10.00,6,37.00,1728.00,'2026-04-08 11:57:23',NULL),(241,'OVR',10.00,20.00,6,37.25,1728.00,'2026-04-08 11:57:23',NULL),(242,'OVR',20.00,30.00,6,37.50,1728.00,'2026-04-08 11:57:23',NULL),(243,'OVR',0.00,10.00,7,38.00,64.00,'2026-04-08 11:57:23',NULL),(244,'OVR',10.00,20.00,7,38.25,64.00,'2026-04-08 11:57:23',NULL),(245,'OVR',20.00,30.00,7,38.50,64.00,'2026-04-08 11:57:23',NULL),(246,'OVR',0.00,10.00,7,39.00,512.00,'2026-04-08 11:57:23',NULL),(247,'OVR',10.00,20.00,7,39.25,512.00,'2026-04-08 11:57:23',NULL),(248,'OVR',20.00,30.00,7,39.50,512.00,'2026-04-08 11:57:23',NULL),(249,'OVR',0.00,10.00,7,40.00,1728.00,'2026-04-08 11:57:23',NULL),(250,'OVR',10.00,20.00,7,40.25,1728.00,'2026-04-08 11:57:23',NULL),(251,'OVR',20.00,30.00,7,40.50,1728.00,'2026-04-08 11:57:23',NULL),(252,'OVR',0.00,10.00,8,41.00,64.00,'2026-04-08 11:57:23',NULL),(253,'OVR',10.00,20.00,8,41.25,64.00,'2026-04-08 11:57:23',NULL),(254,'OVR',20.00,30.00,8,41.50,64.00,'2026-04-08 11:57:23',NULL),(255,'OVR',0.00,10.00,8,42.00,512.00,'2026-04-08 11:57:23',NULL),(256,'OVR',10.00,20.00,8,42.25,512.00,'2026-04-08 11:57:23',NULL),(257,'OVR',20.00,30.00,8,42.50,512.00,'2026-04-08 11:57:23',NULL),(258,'OVR',0.00,10.00,8,43.00,1728.00,'2026-04-08 11:57:23',NULL),(259,'OVR',10.00,20.00,8,43.25,1728.00,'2026-04-08 11:57:23',NULL),(260,'OVR',20.00,30.00,8,43.50,1728.00,'2026-04-08 11:57:23',NULL),(261,'OVR',0.00,10.00,9,44.00,64.00,'2026-04-08 11:57:23',NULL),(262,'OVR',10.00,20.00,9,44.25,64.00,'2026-04-08 11:57:23',NULL),(263,'OVR',20.00,30.00,9,44.50,64.00,'2026-04-08 11:57:23',NULL),(264,'OVR',0.00,10.00,9,45.00,512.00,'2026-04-08 11:57:23',NULL),(265,'OVR',10.00,20.00,9,45.25,512.00,'2026-04-08 11:57:23',NULL),(266,'OVR',20.00,30.00,9,45.50,512.00,'2026-04-08 11:57:23',NULL),(267,'OVR',0.00,10.00,9,46.00,1728.00,'2026-04-08 11:57:23',NULL),(268,'OVR',10.00,20.00,9,46.25,1728.00,'2026-04-08 11:57:23',NULL),(269,'OVR',20.00,30.00,9,46.50,1728.00,'2026-04-08 11:57:23',NULL);
/*!40000 ALTER TABLE `package_pricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_type`
--

DROP TABLE IF EXISTS `package_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_type` (
  `Package_Type_Code` varchar(50) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `Type_Name` enum('oversize','express','general shipping') NOT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Package_Type_Code`),
  UNIQUE KEY `uq_package_type_code` (`Package_Type_Code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_type`
--

LOCK TABLES `package_type` WRITE;
/*!40000 ALTER TABLE `package_type` DISABLE KEYS */;
INSERT INTO `package_type` VALUES ('EXP','Expedited express delivery','express','2026-04-08 11:57:24',NULL),('GEN','Standard ground delivery','general shipping','2026-04-08 11:57:24',NULL),('OVR','Oversized items exceeding standard','oversize','2026-04-08 11:57:24',NULL);
/*!40000 ALTER TABLE `package_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `Payment_ID` int NOT NULL AUTO_INCREMENT,
  `Customer_ID` int NOT NULL,
  `Payment_Amount` decimal(10,2) NOT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Employee_ID` int DEFAULT NULL,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `Tracking_Number` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`Payment_ID`),
  KEY `Customer_ID` (`Customer_ID`),
  KEY `Employee_ID` (`Employee_ID`),
  KEY `Tracking_Number` (`Tracking_Number`),
  CONSTRAINT `Employee_ID` FOREIGN KEY (`Employee_ID`) REFERENCES `employee` (`Employee_ID`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`Customer_ID`) REFERENCES `customer` (`Customer_ID`),
  CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`Tracking_Number`) REFERENCES `package` (`Tracking_Number`)
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,3,8.50,'2026-04-14 23:17:37',22,'2026-04-16 04:05:06','TRK0000001'),(2,4,22.00,'2026-04-14 23:17:37',1,'2026-04-16 04:05:06','TRK0000002'),(3,5,14.25,'2026-04-14 23:17:37',6,'2026-04-16 04:05:06','TRK0000003'),(4,6,65.00,'2026-04-14 23:17:37',2,'2026-04-16 04:05:06','TRK0000004'),(5,7,18.75,'2026-04-14 23:17:37',3,'2026-04-16 04:05:06','TRK0000005'),(6,8,11.00,'2026-04-14 23:17:37',12,'2026-04-16 04:05:06','TRK0000006'),(7,9,7.50,'2026-04-14 23:17:37',12,'2026-04-16 04:05:06','TRK0000007'),(8,10,31.50,'2026-04-14 23:17:37',17,'2026-04-16 04:05:06','TRK0000008'),(9,1,48.00,'2026-04-14 23:17:37',15,'2026-04-16 04:05:06','TRK0000009'),(10,2,5.25,'2026-04-14 23:17:37',17,'2026-04-16 04:05:06','TRK0000010'),(11,5,13.00,'2026-04-14 23:17:37',14,'2026-04-16 04:05:06','TRK0000011'),(12,7,20.00,'2026-04-14 23:17:37',17,'2026-04-16 04:05:06','TRK0000012'),(13,8,82.00,'2026-04-14 23:17:37',25,'2026-04-16 04:05:06','TRK0000013'),(14,10,6.75,'2026-04-14 23:17:37',1,'2026-04-16 04:05:06','TRK0000014'),(15,1,27.00,'2026-04-14 23:17:37',7,'2026-04-16 04:05:06','TRK0000015'),(16,11,10.00,'2026-04-14 23:17:37',6,'2026-04-16 04:05:06','TRK0000016'),(17,2,13.00,'2026-04-14 23:17:37',13,'2026-04-16 04:05:06','TRK0000017'),(18,12,16.00,'2026-04-14 23:17:37',17,'2026-04-16 04:05:06','TRK0000018'),(19,3,9.00,'2026-04-14 23:17:37',14,'2026-04-16 04:05:06','TRK0000019'),(20,13,52.00,'2026-04-14 23:17:37',6,'2026-04-16 04:05:06','TRK0000020'),(21,4,5.25,'2026-04-14 23:17:37',24,'2026-04-16 04:05:06','TRK0000021'),(22,14,24.00,'2026-04-14 23:17:37',17,'2026-04-16 04:05:06','TRK0000022'),(23,5,80.00,'2026-04-14 23:17:38',8,'2026-04-16 04:05:06','TRK0000023'),(24,15,11.00,'2026-04-14 23:17:38',4,'2026-04-16 04:05:06','TRK0000024'),(25,6,26.00,'2026-04-14 23:17:38',13,'2026-04-16 04:05:06','TRK0000025'),(26,16,4.50,'2026-04-14 23:17:38',23,'2026-04-16 04:05:06','TRK0000026'),(27,7,42.00,'2026-04-14 23:17:38',15,'2026-04-16 04:05:06','TRK0000027'),(28,17,16.00,'2026-04-14 23:17:38',7,'2026-04-16 04:05:06','TRK0000028'),(29,8,11.00,'2026-04-14 23:17:38',4,'2026-04-16 04:05:06','TRK0000029'),(30,18,61.00,'2026-04-14 23:17:38',5,'2026-04-16 04:05:06','TRK0000030'),(31,9,10.00,'2026-04-14 23:17:38',4,'2026-04-16 04:05:06','TRK0000031'),(32,19,22.00,'2026-04-14 23:17:38',24,'2026-04-16 04:05:06','TRK0000032'),(33,10,19.00,'2026-04-14 23:17:38',8,'2026-04-16 04:05:06','TRK0000033'),(34,20,15.00,'2026-04-14 23:17:38',5,'2026-04-16 04:05:06','TRK0000034'),(35,1,88.00,'2026-04-14 23:17:38',8,'2026-04-16 04:05:06','TRK0000035'),(36,2,9.00,'2026-04-14 23:17:38',7,'2026-04-16 04:05:06','TRK0000036'),(37,3,28.00,'2026-04-14 23:17:38',6,'2026-04-16 04:05:06','TRK0000037'),(38,4,14.00,'2026-04-14 23:17:38',1,'2026-04-16 04:05:06','TRK0000038'),(39,5,11.00,'2026-04-14 23:17:38',14,'2026-04-16 04:05:06','TRK0000039'),(40,6,46.00,'2026-04-14 23:17:38',25,'2026-04-16 04:05:06','TRK0000040'),(41,7,13.00,'2026-04-14 23:17:38',23,'2026-04-16 04:05:06','TRK0000041'),(42,8,30.00,'2026-04-14 23:17:38',25,'2026-04-16 04:05:06','TRK0000042'),(43,9,74.00,'2026-04-14 23:17:38',8,'2026-04-16 04:05:06','TRK0000043'),(44,10,13.00,'2026-04-14 23:17:38',5,'2026-04-16 04:05:06','TRK0000044'),(45,11,22.00,'2026-04-14 23:17:38',15,'2026-04-16 04:05:06','TRK0000045'),(46,12,4.50,'2026-04-14 23:17:38',17,'2026-04-16 04:05:06','TRK0000046'),(47,13,52.00,'2026-04-14 23:17:38',19,'2026-04-16 04:05:06','TRK0000047'),(48,14,12.00,'2026-04-14 23:17:38',14,'2026-04-16 04:05:06','TRK0000048'),(49,15,28.00,'2026-04-14 23:17:38',12,'2026-04-16 04:05:06','TRK0000049'),(50,16,25.00,'2026-04-14 23:17:38',2,'2026-04-16 04:05:06','TRK0000050'),(51,17,20.00,'2026-04-14 23:17:38',1,'2026-04-16 04:05:06','TRK0000051'),(52,18,66.00,'2026-04-14 23:17:38',7,'2026-04-16 04:05:06','TRK0000052'),(53,19,19.00,'2026-04-14 23:17:38',2,'2026-04-16 04:05:06','TRK0000053'),(54,11,24.00,'2026-04-14 23:17:38',4,'2026-04-16 04:05:06','TRK0000054'),(55,12,68.00,'2026-04-14 23:17:38',19,'2026-04-16 04:05:06','TRK0000055'),(56,13,10.00,'2026-04-14 23:17:38',10,'2026-04-16 04:05:06','TRK0000056'),(57,14,34.00,'2026-04-14 23:17:38',2,'2026-04-16 04:05:06','TRK0000057'),(58,15,56.00,'2026-04-14 23:17:38',12,'2026-04-16 04:05:06','TRK0000058'),(59,16,9.00,'2026-04-14 23:17:38',8,'2026-04-16 04:05:06','TRK0000059'),(60,17,22.00,'2026-04-14 23:17:38',3,'2026-04-16 04:05:06','TRK0000060'),(61,18,25.00,'2026-04-14 23:17:38',13,'2026-04-16 04:05:06','TRK0000061'),(62,19,16.50,'2026-04-14 23:17:38',6,'2026-04-16 04:05:06','TRK0000062'),(63,20,70.00,'2026-04-14 23:17:38',10,'2026-04-16 04:05:06','TRK0000063'),(64,1,10.00,'2026-04-14 23:17:38',7,'2026-04-16 04:05:06','TRK0000064'),(65,2,18.00,'2026-04-14 23:17:38',5,'2026-04-16 04:05:06','TRK0000065'),(66,3,11.00,'2026-04-14 23:17:38',7,'2026-04-16 04:05:06','TRK0000066'),(67,4,24.00,'2026-04-14 23:17:38',10,'2026-04-16 04:05:06','TRK0000067'),(68,5,19.00,'2026-04-14 23:17:38',10,'2026-04-16 04:05:06','TRK0000068'),(69,6,56.00,'2026-04-14 23:17:38',23,'2026-04-16 04:05:06','TRK0000069'),(70,7,20.00,'2026-04-14 23:17:38',12,'2026-04-16 04:05:06','TRK0000070'),(71,8,14.00,'2026-04-14 23:17:38',3,'2026-04-16 04:05:06','TRK0000071'),(72,9,33.00,'2026-04-14 23:17:38',3,'2026-04-16 04:05:06','TRK0000072'),(73,10,10.00,'2026-04-14 23:17:38',3,'2026-04-16 04:05:06','TRK0000073'),(74,11,30.00,'2026-04-14 23:17:38',13,'2026-04-16 04:05:06','TRK0000074'),(75,12,22.00,'2026-04-14 23:17:38',4,'2026-04-16 04:05:06','TRK0000075'),(76,13,85.00,'2026-04-14 23:17:38',17,'2026-04-16 04:05:06','TRK0000076'),(77,14,22.00,'2026-04-14 23:17:38',5,'2026-04-16 04:05:06','TRK0000077'),(78,15,16.00,'2026-04-14 23:17:39',7,'2026-04-16 04:05:06','TRK0000078'),(79,16,33.00,'2026-04-14 23:17:39',10,'2026-04-16 04:05:06','TRK0000079'),(80,17,12.00,'2026-04-14 23:17:39',24,'2026-04-16 04:05:06','TRK0000080'),(81,18,28.00,'2026-04-14 23:17:39',4,'2026-04-16 04:05:06','TRK0000081'),(82,19,68.00,'2026-04-14 23:17:39',2,'2026-04-16 04:05:06','TRK0000082'),(83,20,11.00,'2026-04-14 23:17:39',24,'2026-04-16 04:05:06','TRK0000083'),(84,21,26.00,'2026-04-14 23:17:39',6,'2026-04-16 04:05:06','TRK0000084'),(85,22,25.00,'2026-04-14 23:17:39',24,'2026-04-16 04:05:06','TRK0000085'),(86,21,40.75,'2026-04-14 23:17:39',4,'2026-04-16 04:05:06','TRK0000086'),(87,22,50.25,'2026-04-14 23:17:39',24,'2026-04-16 04:05:06','TRK0000087'),(88,23,37.50,'2026-04-14 23:17:39',7,'2026-04-16 04:05:06','TRK0000088'),(89,23,28.50,'2026-04-14 23:17:40',24,'2026-04-16 04:05:06','TRK0000089'),(93,10,14.50,'2026-04-16 03:38:42',19,'2026-04-16 04:05:06','TRK0000090'),(100,10,14.25,'2026-04-16 08:57:35',19,NULL,'TRK0000091'),(101,24,14.25,'2026-04-16 08:58:26',19,NULL,'TRK0000092'),(102,10,23.25,'2026-04-16 13:59:31',1,NULL,'TRK0000093'),(111,10,37.50,'2026-04-16 16:59:35',1,NULL,'TRK0000094'),(112,10,37.50,'2026-04-16 16:59:35',1,NULL,'TRK0000094'),(113,10,37.50,'2026-04-16 17:11:14',1,NULL,'TRK0000095'),(115,10,17.25,'2026-04-16 17:20:25',1,NULL,'TRK0000096'),(116,10,17.25,'2026-04-16 17:20:41',1,NULL,'TRK0000097'),(117,10,37.50,'2026-04-16 17:31:16',1,NULL,'TRK0000098'),(118,10,37.50,'2026-04-16 17:31:30',1,NULL,'TRK0000099'),(119,24,34.75,'2026-04-16 17:32:42',1,NULL,'TRK0000100'),(120,24,34.75,'2026-04-16 17:32:49',1,NULL,'TRK0000101'),(121,24,34.75,'2026-04-16 17:32:58',1,NULL,'TRK0000102'),(122,37,8.50,'2026-04-16 18:42:40',1,NULL,'TRK0000103'),(123,10,17.25,'2026-04-16 18:49:16',1,NULL,'TRK0000104'),(124,24,12.00,'2026-04-16 20:17:03',8,NULL,'TRK0000105'),(125,24,20.25,'2026-04-16 20:27:21',1,NULL,'TRK0000106'),(126,37,6.00,'2026-04-16 20:30:16',1,NULL,'TRK0000107'),(127,24,17.25,'2026-04-16 20:56:07',1,NULL,'TRK0000108'),(128,10,32.00,'2026-04-16 21:59:31',8,NULL,'TRK0000201'),(129,10,26.00,'2026-04-16 22:37:47',1,NULL,'TRK0000202');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_office`
--

DROP TABLE IF EXISTS `post_office`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_office` (
  `Post_Office_ID` int NOT NULL AUTO_INCREMENT,
  `Phone_Number` varchar(20) NOT NULL,
  `Sun_Start_Time` time NOT NULL DEFAULT '00:00:00',
  `Sun_Finish_Time` time NOT NULL DEFAULT '00:00:00',
  `Mon_Start_Time` time NOT NULL DEFAULT '00:00:00',
  `Mon_Finish_Time` time NOT NULL DEFAULT '00:00:00',
  `Tue_Start_Time` time NOT NULL DEFAULT '00:00:00',
  `Tue_Finish_Time` time NOT NULL DEFAULT '00:00:00',
  `Wed_Start_Time` time NOT NULL DEFAULT '00:00:00',
  `Wed_Finish_Time` time NOT NULL DEFAULT '00:00:00',
  `Thu_Start_Time` time NOT NULL DEFAULT '00:00:00',
  `Thu_Finish_Time` time NOT NULL DEFAULT '00:00:00',
  `Fri_Start_Time` time NOT NULL DEFAULT '00:00:00',
  `Fri_Finish_Time` time NOT NULL DEFAULT '00:00:00',
  `Sat_Start_Time` time NOT NULL DEFAULT '00:00:00',
  `Sat_Finish_Time` time NOT NULL DEFAULT '00:00:00',
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `Address_ID` int NOT NULL,
  PRIMARY KEY (`Post_Office_ID`),
  KEY `Address_ID` (`Address_ID`),
  CONSTRAINT `post_office_ibfk_1` FOREIGN KEY (`Address_ID`) REFERENCES `address` (`Address_ID`),
  CONSTRAINT `post_office_chk_10` CHECK (((`Thu_Finish_Time` >= _utf8mb3'00:00:00') and (`Thu_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_11` CHECK (((`Fri_Start_Time` >= _utf8mb3'00:00:00') and (`Fri_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_12` CHECK (((`Fri_Finish_Time` >= _utf8mb3'00:00:00') and (`Fri_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_13` CHECK (((`Sat_Start_Time` >= _utf8mb3'00:00:00') and (`Sat_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_14` CHECK (((`Sat_Finish_Time` >= _utf8mb3'00:00:00') and (`Sat_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_15` CHECK (((`Sun_Start_Time` >= _utf8mb3'00:00:00') and (`Sun_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_16` CHECK (((`Sun_Finish_Time` >= _utf8mb3'00:00:00') and (`Sun_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_17` CHECK (((`Mon_Start_Time` >= _utf8mb3'00:00:00') and (`Mon_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_18` CHECK (((`Mon_Finish_Time` >= _utf8mb3'00:00:00') and (`Mon_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_19` CHECK (((`Tue_Start_Time` >= _utf8mb3'00:00:00') and (`Tue_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_2` CHECK (((`Sun_Finish_Time` >= _utf8mb3'00:00:00') and (`Sun_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_20` CHECK (((`Tue_Finish_Time` >= _utf8mb3'00:00:00') and (`Tue_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_21` CHECK (((`Wed_Start_Time` >= _utf8mb3'00:00:00') and (`Wed_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_22` CHECK (((`Wed_Finish_Time` >= _utf8mb3'00:00:00') and (`Wed_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_23` CHECK (((`Thu_Start_Time` >= _utf8mb3'00:00:00') and (`Thu_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_24` CHECK (((`Thu_Finish_Time` >= _utf8mb3'00:00:00') and (`Thu_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_25` CHECK (((`Fri_Start_Time` >= _utf8mb3'00:00:00') and (`Fri_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_26` CHECK (((`Fri_Finish_Time` >= _utf8mb3'00:00:00') and (`Fri_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_27` CHECK (((`Sat_Start_Time` >= _utf8mb3'00:00:00') and (`Sat_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_28` CHECK (((`Sat_Finish_Time` >= _utf8mb3'00:00:00') and (`Sat_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_3` CHECK (((`Mon_Start_Time` >= _utf8mb3'00:00:00') and (`Mon_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_4` CHECK (((`Mon_Finish_Time` >= _utf8mb3'00:00:00') and (`Mon_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_5` CHECK (((`Tue_Start_Time` >= _utf8mb3'00:00:00') and (`Tue_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_6` CHECK (((`Tue_Finish_Time` >= _utf8mb3'00:00:00') and (`Tue_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_7` CHECK (((`Wed_Start_Time` >= _utf8mb3'00:00:00') and (`Wed_Start_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_8` CHECK (((`Wed_Finish_Time` >= _utf8mb3'00:00:00') and (`Wed_Finish_Time` <= _utf8mb3'23:59:59'))),
  CONSTRAINT `post_office_chk_9` CHECK (((`Thu_Start_Time` >= _utf8mb3'00:00:00') and (`Thu_Start_Time` <= _utf8mb3'23:59:59')))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_office`
--

LOCK TABLES `post_office` WRITE;
/*!40000 ALTER TABLE `post_office` DISABLE KEYS */;
INSERT INTO `post_office` VALUES (1,'713-555-0101','00:00:00','00:00:00','08:00:00','18:00:00','08:00:00','18:00:00','08:00:00','18:00:00','08:00:00','18:00:00','08:00:00','18:00:00','09:00:00','14:00:00','2026-04-08 11:57:24','2026-04-14 21:28:46',26),(2,'214-555-0202','00:00:00','00:00:00','08:00:00','17:00:00','08:00:00','17:00:00','08:00:00','17:00:00','08:00:00','17:00:00','08:00:00','17:00:00','09:00:00','13:00:00','2026-04-08 11:57:24','2026-04-14 21:28:46',27),(3,'512-555-0303','00:00:00','00:00:00','09:00:00','17:00:00','09:00:00','17:00:00','09:00:00','17:00:00','09:00:00','17:00:00','09:00:00','17:00:00','10:00:00','14:00:00','2026-04-08 11:57:24','2026-04-14 21:28:46',28),(4,'210-555-0404','00:00:00','00:00:00','08:00:00','18:00:00','08:00:00','18:00:00','08:00:00','18:00:00','08:00:00','18:00:00','08:00:00','18:00:00','09:00:00','15:00:00','2026-04-08 11:57:24','2026-04-14 21:28:46',29),(5,'806-555-0505','00:00:00','00:00:00','08:00:00','17:00:00','08:00:00','17:00:00','08:00:00','17:00:00','08:00:00','17:00:00','08:00:00','17:00:00','00:00:00','00:00:00','2026-04-08 11:57:24','2026-04-14 21:28:47',30);
/*!40000 ALTER TABLE `post_office` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `Role_ID` int NOT NULL AUTO_INCREMENT,
  `Role_Name` varchar(25) NOT NULL,
  `Role_Description` varchar(255) DEFAULT NULL,
  `Access_Level` int NOT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Role_ID`),
  UNIQUE KEY `Role_Name` (`Role_Name`),
  CONSTRAINT `role_chk_1` CHECK ((`Access_Level` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'Clerk','Handles counter transactions and customer service',1,'2026-04-08 11:57:24',NULL),(2,'Driver','Delivers packages to recipients',1,'2026-04-08 11:57:24',NULL),(5,'Admin','Full system access',5,'2026-04-08 11:57:24',NULL);
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipment`
--

DROP TABLE IF EXISTS `shipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipment` (
  `Shipment_ID` int NOT NULL AUTO_INCREMENT,
  `Status_Code` int NOT NULL,
  `Employee_ID` int NOT NULL,
  `Departure_Time_Stamp` datetime DEFAULT NULL,
  `Arrival_Time_Stamp` datetime DEFAULT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `From_Address_ID` int NOT NULL,
  `To_Address_ID` int NOT NULL,
  PRIMARY KEY (`Shipment_ID`),
  KEY `Status_Code` (`Status_Code`),
  KEY `Employee_ID` (`Employee_ID`),
  KEY `From_Address_ID` (`From_Address_ID`),
  KEY `To_Address_ID` (`To_Address_ID`),
  CONSTRAINT `shipment_ibfk_1` FOREIGN KEY (`Status_Code`) REFERENCES `status_code` (`Status_Code`),
  CONSTRAINT `shipment_ibfk_2` FOREIGN KEY (`Employee_ID`) REFERENCES `employee` (`Employee_ID`),
  CONSTRAINT `shipment_ibfk_3` FOREIGN KEY (`From_Address_ID`) REFERENCES `address` (`Address_ID`),
  CONSTRAINT `shipment_ibfk_4` FOREIGN KEY (`To_Address_ID`) REFERENCES `address` (`Address_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment`
--

LOCK TABLES `shipment` WRITE;
/*!40000 ALTER TABLE `shipment` DISABLE KEYS */;
INSERT INTO `shipment` VALUES (1,4,9,'2024-03-18 08:00:00','2024-03-19 14:30:00','2026-04-08 11:57:24','2026-04-14 21:34:12',2,4),(2,4,11,'2024-03-17 09:00:00','2024-03-18 16:00:00','2026-04-08 11:57:24','2026-04-14 21:34:13',3,5),(3,4,9,'2024-03-20 07:30:00',NULL,'2026-04-08 11:57:24','2026-04-14 21:34:13',6,8),(4,3,11,'2024-03-19 10:00:00',NULL,'2026-04-08 11:57:24','2026-04-14 21:34:13',7,9),(5,1,8,NULL,NULL,'2026-04-08 11:57:24','2026-04-14 21:34:13',10,11),(6,3,12,'2024-03-21 06:00:00',NULL,'2026-04-08 11:57:24','2026-04-14 21:34:13',4,2),(7,4,9,'2024-03-15 08:00:00','2024-03-17 11:00:00','2026-04-08 11:57:24','2026-04-14 21:34:13',8,3),(8,2,11,'2024-03-21 09:00:00',NULL,'2026-04-08 11:57:24','2026-04-14 21:34:13',26,28),(9,4,8,'2024-05-10 08:00:00','2024-05-11 14:00:00','2026-04-11 12:57:48','2026-04-14 21:34:13',2,12),(10,4,8,'2024-06-15 09:00:00','2024-06-17 11:00:00','2026-04-11 12:57:48','2026-04-14 21:34:13',3,13),(11,2,8,'2024-07-20 08:30:00',NULL,'2026-04-11 12:57:48','2026-04-14 21:34:13',6,14),(12,4,8,'2024-08-05 07:00:00','2024-08-07 15:00:00','2026-04-11 12:57:48','2026-04-14 21:34:13',4,15),(13,4,8,'2024-09-12 08:00:00',NULL,'2026-04-11 12:57:48','2026-04-16 15:28:04',8,16),(14,4,9,'2024-05-18 06:30:00','2024-05-20 13:00:00','2026-04-11 12:57:48','2026-04-14 21:34:13',5,17),(15,4,9,'2024-06-22 08:00:00','2024-06-24 16:00:00','2026-04-11 12:57:48','2026-04-14 21:34:13',7,18),(16,2,9,'2024-07-30 09:00:00',NULL,'2026-04-11 12:57:48','2026-04-14 21:34:13',10,19),(17,4,9,'2024-08-14 07:30:00','2024-08-16 12:00:00','2026-04-11 12:57:48','2026-04-14 21:34:13',11,20),(18,7,9,'2024-09-25 08:00:00','2024-09-28 14:00:00','2026-04-11 12:57:48','2026-04-20 02:00:42',12,21),(19,4,10,'2024-05-05 08:00:00','2024-05-07 11:00:00','2026-04-11 12:57:48','2026-04-14 21:34:13',13,2),(20,4,10,'2024-06-10 09:30:00','2024-06-12 15:00:00','2026-04-11 12:57:48','2026-04-14 21:34:13',14,3),(21,5,10,'2024-07-08 08:00:00',NULL,'2026-04-11 12:57:48','2026-04-14 21:34:13',15,4),(22,4,10,'2024-08-20 07:00:00','2024-08-22 13:00:00','2026-04-11 12:57:48','2026-04-14 21:34:14',16,5),(23,4,10,'2024-10-01 09:00:00',NULL,'2026-04-11 12:57:48','2026-04-16 22:19:48',17,7),(24,4,11,'2024-05-22 08:00:00','2024-05-25 14:00:00','2026-04-11 12:57:48','2026-04-14 21:34:14',18,10),(25,4,11,'2024-06-28 09:00:00','2024-06-30 16:00:00','2026-04-11 12:57:48','2026-04-14 21:34:14',19,11),(26,4,11,'2024-07-15 08:30:00','2024-07-17 12:00:00','2026-04-11 12:57:48','2026-04-14 21:34:14',20,12),(27,2,11,'2024-09-05 07:00:00',NULL,'2026-04-11 12:57:48','2026-04-14 21:34:14',21,13),(28,3,11,'2024-10-15 08:00:00',NULL,'2026-04-11 12:57:48','2026-04-14 21:34:14',2,14),(29,4,12,'2024-05-30 08:00:00','2024-06-01 15:00:00','2026-04-11 12:57:48','2026-04-14 21:34:14',3,15),(30,4,12,'2024-07-04 09:00:00','2024-07-07 11:00:00','2026-04-11 12:57:48','2026-04-14 21:34:14',4,16),(31,4,12,'2024-08-28 08:00:00','2024-08-30 14:00:00','2026-04-11 12:57:48','2026-04-14 21:34:14',5,17),(32,5,12,'2024-09-18 07:30:00',NULL,'2026-04-11 12:57:48','2026-04-14 21:34:14',7,18),(33,2,12,'2024-10-22 09:00:00',NULL,'2026-04-11 12:57:48','2026-04-14 21:34:14',8,19),(34,4,15,'2024-06-05 08:00:00','2024-06-07 14:00:00','2026-04-11 13:34:43','2026-04-14 21:34:14',9,12),(35,4,15,'2024-07-12 09:00:00','2024-07-14 15:00:00','2026-04-11 13:34:43','2026-04-14 21:34:14',8,13),(36,4,15,'2024-08-18 08:00:00','2024-08-19 12:00:00','2026-04-11 13:34:43','2026-04-14 21:34:14',15,14),(37,2,15,'2024-09-22 07:30:00',NULL,'2026-04-11 13:34:43','2026-04-14 21:34:14',29,17),(38,4,16,'2024-06-20 08:00:00','2024-06-22 16:00:00','2026-04-11 13:34:43','2026-04-14 21:34:14',7,15),(39,4,16,'2024-07-28 09:00:00','2024-07-30 13:00:00','2026-04-11 13:34:43','2026-04-14 21:34:14',18,8),(40,2,16,'2024-10-05 08:00:00',NULL,'2026-04-11 13:34:43','2026-04-14 21:34:14',2,9),(41,4,17,'2024-05-15 07:00:00','2024-05-18 11:00:00','2026-04-11 13:34:43','2026-04-14 21:34:14',11,2),(42,4,17,'2024-07-01 08:00:00','2024-07-04 14:00:00','2026-04-11 13:34:43','2026-04-14 21:34:14',10,4),(43,4,17,'2024-08-10 09:00:00','2024-08-13 15:00:00','2026-04-11 13:34:43','2026-04-14 21:34:14',30,5),(44,2,17,'2024-10-12 08:00:00',NULL,'2026-04-11 13:34:43','2026-04-14 21:34:14',21,7),(45,4,18,'2024-06-08 08:00:00','2024-06-11 12:00:00','2026-04-11 13:34:43','2026-04-14 21:34:14',19,11),(46,4,18,'2024-07-22 09:00:00','2024-07-25 16:00:00','2026-04-11 13:34:43','2026-04-14 21:34:15',20,10),(47,2,18,'2024-09-30 08:00:00',NULL,'2026-04-11 13:34:43','2026-04-14 21:34:15',3,30),(48,7,9,'2024-04-10 08:00:00',NULL,'2026-04-11 13:34:43','2026-04-14 21:34:15',6,8),(49,7,11,'2024-05-02 09:00:00',NULL,'2026-04-11 13:34:43','2026-04-14 21:34:15',7,10),(50,7,10,'2024-06-14 08:00:00',NULL,'2026-04-11 13:34:43','2026-04-14 21:34:15',2,5),(51,6,8,'2024-04-20 08:00:00',NULL,'2026-04-11 13:34:43','2026-04-14 21:34:15',4,3),(52,6,12,'2024-07-08 09:00:00',NULL,'2026-04-11 13:34:43','2026-04-14 21:34:15',5,6),(53,6,15,'2024-08-25 08:00:00',NULL,'2026-04-11 13:34:43','2026-04-14 21:34:15',8,11),(54,1,19,NULL,NULL,'2026-04-13 17:21:45','2026-04-14 21:34:15',11,22),(55,1,19,NULL,NULL,'2026-04-13 17:27:43','2026-04-14 21:34:15',11,23),(56,1,19,NULL,NULL,'2026-04-13 17:39:19','2026-04-14 21:34:15',11,23),(57,1,1,NULL,NULL,'2026-04-14 11:34:17','2026-04-14 21:34:17',11,24),(58,1,1,NULL,NULL,'2026-04-16 03:38:42',NULL,1,64),(59,1,19,NULL,NULL,'2026-04-16 08:57:35',NULL,1,65),(60,4,19,NULL,NULL,'2026-04-16 08:58:26','2026-04-16 20:38:41',1,11),(61,1,1,NULL,NULL,'2026-04-16 13:59:32',NULL,11,69),(62,1,1,NULL,NULL,'2026-04-16 16:59:35',NULL,11,65),(63,1,1,NULL,NULL,'2026-04-16 17:11:14',NULL,11,65),(64,1,1,NULL,NULL,'2026-04-16 17:20:25',NULL,11,66),(65,1,1,NULL,NULL,'2026-04-16 17:20:41',NULL,11,66),(66,1,1,NULL,NULL,'2026-04-16 17:31:16',NULL,11,65),(67,1,1,NULL,NULL,'2026-04-16 17:31:31',NULL,11,65),(68,1,1,NULL,NULL,'2026-04-16 17:32:42',NULL,65,66),(69,1,1,NULL,NULL,'2026-04-16 17:32:49',NULL,65,66),(70,1,1,NULL,NULL,'2026-04-16 17:32:58',NULL,65,66),(71,7,1,NULL,NULL,'2026-04-16 18:42:40','2026-04-16 22:38:39',75,76),(72,2,1,NULL,NULL,'2026-04-16 18:49:16','2026-04-16 20:36:52',11,65),(73,3,8,NULL,NULL,'2026-04-16 20:17:04','2026-04-16 20:35:20',65,11),(74,3,1,NULL,NULL,'2026-04-16 20:27:22','2026-04-16 20:35:15',65,11),(75,7,1,NULL,NULL,'2026-04-16 20:30:16','2026-04-16 21:04:57',75,78),(76,8,1,NULL,NULL,'2026-04-16 20:56:07','2026-04-16 21:22:44',65,79),(77,4,1,NULL,NULL,'2026-04-16 21:37:45','2026-04-16 21:39:46',80,81),(78,4,1,NULL,NULL,'2026-04-16 21:37:45','2026-04-16 21:39:46',81,82),(79,4,1,NULL,NULL,'2026-04-16 21:37:45','2026-04-16 21:39:46',82,83),(80,8,8,NULL,NULL,'2026-04-16 21:59:31','2026-04-16 22:07:36',11,65),(81,8,1,NULL,NULL,'2026-04-16 22:37:47','2026-04-16 22:38:48',11,65);
/*!40000 ALTER TABLE `shipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipment_package`
--

DROP TABLE IF EXISTS `shipment_package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipment_package` (
  `Shipment_ID` int NOT NULL,
  `Tracking_Number` varchar(10) NOT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Shipment_ID`,`Tracking_Number`),
  KEY `Tracking_Number` (`Tracking_Number`),
  CONSTRAINT `shipment_package_ibfk_1` FOREIGN KEY (`Shipment_ID`) REFERENCES `shipment` (`Shipment_ID`),
  CONSTRAINT `shipment_package_ibfk_2` FOREIGN KEY (`Tracking_Number`) REFERENCES `package` (`Tracking_Number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment_package`
--

LOCK TABLES `shipment_package` WRITE;
/*!40000 ALTER TABLE `shipment_package` DISABLE KEYS */;
INSERT INTO `shipment_package` VALUES (1,'TRK0000001','2026-04-08 11:57:24'),(1,'TRK0000002','2026-04-08 11:57:24'),(2,'TRK0000006','2026-04-08 11:57:24'),(3,'TRK0000003','2026-04-08 11:57:24'),(3,'TRK0000005','2026-04-08 11:57:24'),(4,'TRK0000004','2026-04-08 11:57:24'),(5,'TRK0000010','2026-04-08 11:57:24'),(6,'TRK0000007','2026-04-08 11:57:24'),(6,'TRK0000008','2026-04-08 11:57:24'),(7,'TRK0000009','2026-04-08 11:57:24'),(8,'TRK0000011','2026-04-08 11:57:24'),(8,'TRK0000012','2026-04-08 11:57:24'),(9,'TRK0000016','2026-04-11 12:59:21'),(9,'TRK0000017','2026-04-11 12:59:21'),(10,'TRK0000018','2026-04-11 12:59:21'),(10,'TRK0000019','2026-04-11 12:59:21'),(11,'TRK0000020','2026-04-11 12:59:21'),(11,'TRK0000021','2026-04-11 12:59:21'),(12,'TRK0000022','2026-04-11 12:59:21'),(12,'TRK0000023','2026-04-11 12:59:21'),(13,'TRK0000024','2026-04-11 12:59:21'),(14,'TRK0000025','2026-04-11 12:59:21'),(14,'TRK0000026','2026-04-11 12:59:21'),(15,'TRK0000027','2026-04-11 12:59:21'),(15,'TRK0000028','2026-04-11 12:59:21'),(16,'TRK0000029','2026-04-11 12:59:21'),(16,'TRK0000030','2026-04-11 12:59:21'),(17,'TRK0000031','2026-04-11 12:59:21'),(17,'TRK0000032','2026-04-11 12:59:21'),(18,'TRK0000033','2026-04-11 12:59:21'),(18,'TRK0000034','2026-04-11 12:59:21'),(19,'TRK0000035','2026-04-11 12:59:21'),(19,'TRK0000036','2026-04-11 12:59:21'),(20,'TRK0000037','2026-04-11 12:59:21'),(20,'TRK0000038','2026-04-11 12:59:21'),(21,'TRK0000039','2026-04-11 12:59:21'),(21,'TRK0000040','2026-04-11 12:59:21'),(22,'TRK0000041','2026-04-11 12:59:21'),(22,'TRK0000042','2026-04-11 12:59:21'),(23,'TRK0000043','2026-04-11 12:59:21'),(24,'TRK0000044','2026-04-11 12:59:21'),(24,'TRK0000045','2026-04-11 12:59:21'),(25,'TRK0000046','2026-04-11 12:59:21'),(25,'TRK0000047','2026-04-11 12:59:21'),(26,'TRK0000048','2026-04-11 12:59:21'),(26,'TRK0000049','2026-04-11 12:59:21'),(27,'TRK0000050','2026-04-11 12:59:21'),(27,'TRK0000051','2026-04-11 12:59:21'),(28,'TRK0000052','2026-04-11 12:59:21'),(29,'TRK0000053','2026-04-11 12:59:21'),(29,'TRK0000054','2026-04-11 12:59:21'),(30,'TRK0000055','2026-04-11 12:59:21'),(30,'TRK0000056','2026-04-11 12:59:21'),(31,'TRK0000057','2026-04-11 12:59:21'),(31,'TRK0000058','2026-04-11 12:59:21'),(32,'TRK0000059','2026-04-11 12:59:21'),(32,'TRK0000060','2026-04-11 12:59:21'),(33,'TRK0000061','2026-04-11 12:59:21'),(33,'TRK0000062','2026-04-11 12:59:21'),(33,'TRK0000063','2026-04-11 12:59:21'),(33,'TRK0000064','2026-04-11 12:59:21'),(33,'TRK0000065','2026-04-11 12:59:21'),(34,'TRK0000066','2026-04-11 13:35:20'),(34,'TRK0000067','2026-04-11 13:35:20'),(35,'TRK0000068','2026-04-11 13:35:20'),(35,'TRK0000069','2026-04-11 13:35:20'),(36,'TRK0000070','2026-04-11 13:35:20'),(36,'TRK0000071','2026-04-11 13:35:20'),(37,'TRK0000072','2026-04-11 13:35:20'),(38,'TRK0000066','2026-04-11 13:35:20'),(39,'TRK0000067','2026-04-11 13:35:20'),(40,'TRK0000068','2026-04-11 13:35:20'),(41,'TRK0000073','2026-04-11 13:35:20'),(41,'TRK0000074','2026-04-11 13:35:20'),(42,'TRK0000075','2026-04-11 13:35:20'),(42,'TRK0000076','2026-04-11 13:35:20'),(43,'TRK0000077','2026-04-11 13:35:20'),(43,'TRK0000078','2026-04-11 13:35:20'),(44,'TRK0000079','2026-04-11 13:35:20'),(45,'TRK0000073','2026-04-11 13:35:20'),(46,'TRK0000074','2026-04-11 13:35:20'),(47,'TRK0000075','2026-04-11 13:35:20'),(48,'TRK0000080','2026-04-11 13:35:20'),(49,'TRK0000081','2026-04-11 13:35:20'),(50,'TRK0000082','2026-04-11 13:35:20'),(51,'TRK0000083','2026-04-11 13:35:20'),(52,'TRK0000084','2026-04-11 13:35:20'),(53,'TRK0000085','2026-04-11 13:35:20'),(54,'TRK0000086','2026-04-13 17:21:45'),(55,'TRK0000087','2026-04-13 17:27:43'),(56,'TRK0000088','2026-04-13 17:39:19'),(57,'TRK0000089','2026-04-14 11:34:17'),(58,'TRK0000090','2026-04-16 03:38:42'),(59,'TRK0000091','2026-04-16 08:57:35'),(60,'TRK0000092','2026-04-16 08:58:26'),(61,'TRK0000093','2026-04-16 13:59:32'),(62,'TRK0000094','2026-04-16 16:59:35'),(63,'TRK0000095','2026-04-16 17:11:14'),(64,'TRK0000096','2026-04-16 17:20:25'),(65,'TRK0000097','2026-04-16 17:20:41'),(66,'TRK0000098','2026-04-16 17:31:16'),(67,'TRK0000099','2026-04-16 17:31:31'),(68,'TRK0000100','2026-04-16 17:32:42'),(69,'TRK0000101','2026-04-16 17:32:49'),(70,'TRK0000102','2026-04-16 17:32:58'),(71,'TRK0000103','2026-04-16 18:42:40'),(72,'TRK0000104','2026-04-16 18:49:16'),(73,'TRK0000105','2026-04-16 20:17:04'),(74,'TRK0000106','2026-04-16 20:27:22'),(75,'TRK0000107','2026-04-16 20:30:16'),(76,'TRK0000108','2026-04-16 20:56:07'),(77,'TRK0000200','2026-04-16 21:37:46'),(78,'TRK0000200','2026-04-16 21:37:46'),(79,'TRK0000200','2026-04-16 21:37:46'),(80,'TRK0000201','2026-04-16 21:59:31'),(81,'TRK0000202','2026-04-16 22:37:47');
/*!40000 ALTER TABLE `shipment_package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status_code`
--

DROP TABLE IF EXISTS `status_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status_code` (
  `Status_Code` int NOT NULL AUTO_INCREMENT,
  `Status_Name` varchar(25) NOT NULL,
  `Is_Final_Status` tinyint(1) NOT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Status_Code`),
  UNIQUE KEY `Status_Name` (`Status_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status_code`
--

LOCK TABLES `status_code` WRITE;
/*!40000 ALTER TABLE `status_code` DISABLE KEYS */;
INSERT INTO `status_code` VALUES (1,'Pending',0,'2026-04-08 11:57:24',NULL),(2,'In Transit',0,'2026-04-08 11:57:24',NULL),(3,'Out for Delivery',0,'2026-04-08 11:57:24',NULL),(4,'Delivered',1,'2026-04-08 11:57:24',NULL),(5,'Delayed',0,'2026-04-08 11:57:24',NULL),(6,'Returned',1,'2026-04-08 11:57:24',NULL),(7,'Lost',1,'2026-04-08 11:57:24',NULL),(8,'At Office',0,'2026-04-11 11:36:36',NULL),(9,'Disposed',1,'2026-04-11 11:36:36',NULL);
/*!40000 ALTER TABLE `status_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_ticket`
--

DROP TABLE IF EXISTS `support_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_ticket` (
  `Ticket_ID` int NOT NULL AUTO_INCREMENT,
  `User_ID` int NOT NULL,
  `Package_ID` varchar(30) NOT NULL,
  `Assigned_Employee_ID` int DEFAULT NULL,
  `Issue_Type` int NOT NULL,
  `Description` varchar(200) DEFAULT NULL,
  `Resolution_Note` varchar(200) DEFAULT NULL,
  `Ticket_Status_Code` smallint NOT NULL DEFAULT '0',
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Ticket_ID`),
  KEY `User_ID` (`User_ID`),
  KEY `Package_ID` (`Package_ID`),
  KEY `Assigned_Employee_ID` (`Assigned_Employee_ID`),
  KEY `fk_issue_type` (`Issue_Type`),
  CONSTRAINT `fk_issue_type` FOREIGN KEY (`Issue_Type`) REFERENCES `ticket_issue_type` (`Type_ID`),
  CONSTRAINT `support_ticket_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `customer` (`Customer_ID`),
  CONSTRAINT `support_ticket_ibfk_2` FOREIGN KEY (`Package_ID`) REFERENCES `package` (`Tracking_Number`),
  CONSTRAINT `support_ticket_ibfk_3` FOREIGN KEY (`Assigned_Employee_ID`) REFERENCES `employee` (`Employee_ID`),
  CONSTRAINT `chk_ticket_status` CHECK ((`Ticket_Status_Code` in (0,1,2)))
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_ticket`
--

LOCK TABLES `support_ticket` WRITE;
/*!40000 ALTER TABLE `support_ticket` DISABLE KEYS */;
INSERT INTO `support_ticket` VALUES (1,1,'TRK0000004',4,1,'Package delayed, expected delivery was 3 days ago',NULL,0,'2026-04-08 11:57:24',NULL),(2,3,'TRK0000003',6,2,'Package shows in transit but no updates for 2 days',NULL,0,'2026-04-08 11:57:24',NULL),(3,5,'TRK0000005',4,1,'Need to change delivery address','',1,'2026-04-08 11:57:24','2026-04-08 15:21:40'),(4,2,'TRK0000001',4,3,'Item arrived damaged','Refund issued to customer',2,'2026-04-08 11:57:24','2026-04-08 15:21:27'),(5,7,'TRK0000009',7,2,'Tracking not updating','Carrier delay confirmed, resolved',2,'2026-04-08 11:57:24','2026-04-08 15:14:27'),(6,10,'TRK0000001',8,1,'Package not delivered on expected date.',NULL,0,'2026-03-18 08:30:00',NULL),(7,10,'TRK0000001',8,1,'Package not delivered on expected date.','resolution',2,'2026-03-18 08:30:00','2026-04-16 22:35:57'),(8,5,'TRK0000002',10,2,'Package arrived visibly damaged.',NULL,1,'2026-03-19 09:15:00','2026-03-21 10:00:00'),(9,7,'TRK0000004',4,4,'Tracking number not updating in system.',NULL,2,'2026-03-21 11:45:00','2026-03-23 09:00:00'),(10,1,'TRK0000007',7,3,'Package delivered to wrong address.',NULL,1,'2026-03-26 10:00:00','2026-03-28 13:00:00'),(11,4,'TRK0000008',1,4,'Unable to update delivery address online.',NULL,2,'2026-03-27 13:00:00','2026-03-29 15:45:00'),(12,2,'TRK0000009',2,1,'No delivery attempt made by courier.',NULL,2,'2026-03-28 14:30:00','2026-03-30 10:00:00'),(13,9,'TRK0000010',3,2,'Package shows delivered but not received.',NULL,2,'2026-03-29 15:00:00','2026-03-31 16:30:00'),(14,17,'TRK0000083',7,2,'test',NULL,0,'2026-04-11 19:18:29',NULL),(15,10,'TRK0000034',4,1,'Test3','',1,'2026-04-13 17:01:52','2026-04-16 23:15:19'),(16,10,'TRK0000087',4,1,'Test number 4','',1,'2026-04-14 11:14:47','2026-04-16 23:15:27'),(17,10,'TRK0000087',4,1,'test7',NULL,0,'2026-04-14 12:27:20','2026-04-16 23:15:31'),(18,10,'TRK0000086',4,2,'test8',NULL,0,'2026-04-14 12:31:26','2026-04-16 23:15:37'),(19,10,'TRK0000087',12,2,'test8','resolved',2,'2026-04-14 12:33:23','2026-04-14 13:39:55'),(20,10,'TRK0000087',15,2,'more than ten things.',NULL,0,'2026-04-16 04:40:48',NULL),(21,10,'TRK0000088',17,1,'test number something','work in progress',1,'2026-04-16 07:54:35','2026-04-16 09:35:32'),(22,10,'TRK0000086',22,2,'vercel test making sure things work',NULL,0,'2026-04-16 12:35:45',NULL),(23,10,'TRK0000074',23,2,'tester 123456.',NULL,0,'2026-04-16 13:55:13',NULL),(24,10,'TRK0000090',25,2,'abcdefghijk','',1,'2026-04-16 16:35:17','2026-04-16 18:37:13'),(25,37,'TRK0000103',27,4,'tracking not found','',2,'2026-04-16 18:49:56','2026-04-16 18:54:47'),(26,10,'TRK0000094',28,2,'payment did not go through',NULL,0,'2026-04-16 19:52:27',NULL),(27,10,'TRK0000095',5,4,'wheres my refund',NULL,0,'2026-04-16 19:53:52',NULL),(28,10,'TRK0000104',29,3,'late for delivery\n','resolved',2,'2026-04-16 21:55:43','2026-04-16 22:04:23'),(29,10,'TRK0000200',30,1,'test descrip',NULL,0,'2026-04-16 22:35:08',NULL);
/*!40000 ALTER TABLE `support_ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_issue_type`
--

DROP TABLE IF EXISTS `ticket_issue_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_issue_type` (
  `Type_ID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Date_Created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Date_Updated` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Type_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_issue_type`
--

LOCK TABLES `ticket_issue_type` WRITE;
/*!40000 ALTER TABLE `ticket_issue_type` DISABLE KEYS */;
INSERT INTO `ticket_issue_type` VALUES (1,'failed transaction','2026-04-08 11:57:26',NULL),(2,'payment issue','2026-04-08 11:57:26',NULL),(3,'delivery issue','2026-04-08 11:57:26',NULL),(4,'other','2026-04-08 11:57:26',NULL);
/*!40000 ALTER TABLE `ticket_issue_type` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-19 23:09:00
