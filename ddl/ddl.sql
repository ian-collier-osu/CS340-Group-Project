-- MySQL dump 10.17  Distrib 10.3.15-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: auto2
-- ------------------------------------------------------
-- Server version	10.3.15-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `colors`
--

DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `colors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colors`
--

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
INSERT INTO `colors` VALUES (8,'Blue'),(9,'Burnt Umber'),(10,'Green'),(11,'Ineffable Chartreuse'),(12,'Infrared'),(13,'Red'),(14,'Taupe');
/*!40000 ALTER TABLE `colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `models`
--

DROP TABLE IF EXISTS `models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `models` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_trimline` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `base_trimline` (`base_trimline`),
  CONSTRAINT `models_ibfk_1` FOREIGN KEY (`base_trimline`) REFERENCES `trimlines` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `models`
--

LOCK TABLES `models` WRITE;
/*!40000 ALTER TABLE `models` DISABLE KEYS */;
INSERT INTO `models` VALUES (1,'Outdoorsy Metaphor',1),(2,'Foo Bar',3);
/*!40000 ALTER TABLE `models` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trimline` int(11) NOT NULL,
  `color` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `trimline` (`trimline`),
  KEY `orders_ibfk_2` (`color`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`trimline`) REFERENCES `trimlines` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`color`) REFERENCES `colors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'Normal Human',1,11);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `part_requirements`
--

DROP TABLE IF EXISTS `part_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `part_requirements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `associated_model` int(11) DEFAULT NULL,
  `associated_trimline` int(11) DEFAULT NULL,
  `associated_part` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `associated_trimline` (`associated_trimline`),
  KEY `associated_model` (`associated_model`),
  KEY `associated_part` (`associated_part`),
  CONSTRAINT `part_requirements_ibfk_1` FOREIGN KEY (`associated_trimline`) REFERENCES `trimlines` (`id`),
  CONSTRAINT `part_requirements_ibfk_2` FOREIGN KEY (`associated_model`) REFERENCES `models` (`id`),
  CONSTRAINT `part_requirements_ibfk_3` FOREIGN KEY (`associated_part`) REFERENCES `parts` (`id`),
  CONSTRAINT `CONSTRAINT_1` CHECK (`associated_model` is not null or `associated_trimline` is not null)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `part_requirements`
--

LOCK TABLES `part_requirements` WRITE;
/*!40000 ALTER TABLE `part_requirements` DISABLE KEYS */;
INSERT INTO `part_requirements` VALUES (1,1,NULL,2,4),(2,1,NULL,1,1),(6,NULL,3,5,1),(7,NULL,3,6,1),(8,NULL,1,4,4);
/*!40000 ALTER TABLE `part_requirements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parts`
--

DROP TABLE IF EXISTS `parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity_on_hand` int(11) NOT NULL,
  `cost` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parts`
--

LOCK TABLES `parts` WRITE;
/*!40000 ALTER TABLE `parts` DISABLE KEYS */;
INSERT INTO `parts` VALUES (1,'Roland LAPC-I',0,100),(2,'Pimaster 9000 Wheel',2,300),(4,'\'Ben-Hur (R) Wheel Spikes\'',10,40),(5,'Anti-Theft Detonator',0,400),(6,'Shark Repellent Coating',40,370);
/*!40000 ALTER TABLE `parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trimline_colors`
--

DROP TABLE IF EXISTS `trimline_colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trimline_colors` (
  `color` int(11) NOT NULL,
  `trimline` int(11) NOT NULL,
  PRIMARY KEY (`color`,`trimline`),
  KEY `trimline_colors_ibfk_2` (`trimline`),
  CONSTRAINT `trimline_colors_ibfk_1` FOREIGN KEY (`color`) REFERENCES `colors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trimline_colors_ibfk_2` FOREIGN KEY (`trimline`) REFERENCES `trimlines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trimline_colors`
--

LOCK TABLES `trimline_colors` WRITE;
/*!40000 ALTER TABLE `trimline_colors` DISABLE KEYS */;
INSERT INTO `trimline_colors` VALUES (8,1),(9,1),(9,3),(10,3),(11,1),(12,3);
/*!40000 ALTER TABLE `trimline_colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trimlines`
--

DROP TABLE IF EXISTS `trimlines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trimlines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` int(11) DEFAULT NULL,
  `default_color` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `model` (`model`),
  KEY `default_color` (`default_color`),
  CONSTRAINT `trimlines_ibfk_3` FOREIGN KEY (`model`) REFERENCES `models` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trimlines_ibfk_4` FOREIGN KEY (`default_color`) REFERENCES `colors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trimlines`
--

LOCK TABLES `trimlines` WRITE;
/*!40000 ALTER TABLE `trimlines` DISABLE KEYS */;
INSERT INTO `trimlines` VALUES (1,'Weekdayer',1,8),(3,'Ultra Luxe',2,10);
/*!40000 ALTER TABLE `trimlines` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-05-28  1:33:27
