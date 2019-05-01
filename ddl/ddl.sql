-- MySQL dump 10.17  Distrib 10.3.14-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: automotive
-- ------------------------------------------------------
-- Server version	10.3.14-MariaDB

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
-- Current Database: `automotive`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `automotive` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `automotive`;

--
-- Table structure for table `colors`
--

DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `colors` (
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `model_colors`
--

DROP TABLE IF EXISTS `model_colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_colors` (
  `color` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` int(11) NOT NULL,
  PRIMARY KEY (`color`,`model`),
  KEY `model` (`model`),
  CONSTRAINT `model_colors_ibfk_1` FOREIGN KEY (`color`) REFERENCES `colors` (`name`),
  CONSTRAINT `model_colors_ibfk_2` FOREIGN KEY (`model`) REFERENCES `models` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `models`
--

DROP TABLE IF EXISTS `models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `models` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_trimline` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `base_trimline` (`base_trimline`),
  CONSTRAINT `models_ibfk_1` FOREIGN KEY (`base_trimline`) REFERENCES `trimline` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trimline` int(11) NOT NULL,
  `color` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `trimline` (`trimline`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`trimline`) REFERENCES `trimlines` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  PRIMARY KEY (`id`),
  KEY `associated_trimline` (`associated_trimline`),
  KEY `associated_model` (`associated_model`),
  KEY `associated_part` (`associated_part`),
  CONSTRAINT `part_requirements_ibfk_1` FOREIGN KEY (`associated_trimline`) REFERENCES `trimlines` (`id`),
  CONSTRAINT `part_requirements_ibfk_2` FOREIGN KEY (`associated_model`) REFERENCES `models` (`id`),
  CONSTRAINT `part_requirements_ibfk_3` FOREIGN KEY (`associated_part`) REFERENCES `parts` (`id`),
  CONSTRAINT `CONSTRAINT_1` CHECK (`associated_model` is not null or `associated_trimline` is not null)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trimlines`
--

DROP TABLE IF EXISTS `trimlines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trimlines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` int(11) DEFAULT NULL,
  `default_color` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `model` (`model`),
  KEY `default_color` (`default_color`),
  CONSTRAINT `trimlines_ibfk_1` FOREIGN KEY (`model`) REFERENCES `models` (`id`),
  CONSTRAINT `trimlines_ibfk_2` FOREIGN KEY (`default_color`) REFERENCES `colors` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-04-30 21:46:24
