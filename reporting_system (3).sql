-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 08, 2025 at 12:21 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `reporting_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `accomplish-report`
--

CREATE TABLE `accomplish-report` (
  `id` int(11) NOT NULL,
  `report_id` int(11) DEFAULT NULL,
  `departure_time` varchar(10) DEFAULT NULL,
  `arrival_time` varchar(10) DEFAULT NULL,
  `accomplish_date` date DEFAULT NULL,
  `accomplish_proof` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approved_reports`
--

CREATE TABLE `approved_reports` (
  `id` int(11) NOT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `service_description` text DEFAULT NULL,
  `nature_of_service` varchar(255) DEFAULT NULL,
  `location` text DEFAULT NULL,
  `proof` longtext DEFAULT NULL,
  `proof_type` varchar(50) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `departure_time` time DEFAULT NULL,
  `arrival_time` time DEFAULT NULL,
  `accomplish_date` date DEFAULT NULL,
  `accomplish_proof` longtext DEFAULT NULL,
  `plumber_username` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coordinates`
--

CREATE TABLE `coordinates` (
  `node_id` varchar(50) NOT NULL,
  `latitude` decimal(10,6) NOT NULL,
  `longitude` decimal(10,6) NOT NULL,
  `type` varchar(50) DEFAULT 'node'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coordinates`
--

INSERT INTO `coordinates` (`node_id`, `latitude`, `longitude`, `type`) VALUES
('101', 13.696876, 123.490323, 'node'),
('7/11', 13.698281, 123.489455, 'node'),
('A1', 13.699208, 123.488681, 'node'),
('A10', 13.697858, 123.489030, 'node'),
('A2', 13.699149, 123.488221, 'node'),
('A3', 13.699368, 123.489980, 'node'),
('A4', 13.698364, 123.488196, 'node'),
('A5', 13.698301, 123.489024, 'node'),
('A6', 13.698728, 123.489034, 'node'),
('A7', 13.698762, 123.490014, 'node'),
('A8', 13.698245, 123.490011, 'node'),
('A9', 13.697875, 123.490022, 'node'),
('B1', 13.699606, 123.488171, 'node'),
('B10', 13.699646, 123.491924, 'node'),
('B2', 13.700247, 123.489926, 'node'),
('B3', 13.699146, 123.486900, 'node'),
('B4', 13.697783, 123.486905, 'node'),
('B5', 13.698998, 123.486036, 'node'),
('B6', 13.697838, 123.488179, 'node'),
('B7', 13.696867, 123.486868, 'node'),
('B8', 13.696861, 123.488140, 'node'),
('B9', 13.696837, 123.486491, 'node'),
('C1', 13.700565, 123.491895, 'node'),
('C10', 13.696925, 123.492063, 'node'),
('C2', 13.700402, 123.490970, 'node'),
('C3', 13.700838, 123.492998, 'node'),
('C4', 13.698776, 123.491974, 'node'),
('C5', 13.698165, 123.492020, 'node'),
('C6', 13.698856, 123.494610, 'node'),
('C7', 13.698109, 123.494595, 'node'),
('C8', 13.697762, 123.495973, 'node'),
('C9', 13.697909, 123.492027, 'node'),
('Central', 13.696862, 123.487733, 'node'),
('D1', 13.696867, 123.490069, 'node'),
('D10', 13.694148, 123.483893, 'node'),
('D2', 13.696142, 123.490097, 'node'),
('D3', 13.696348, 123.492127, 'node'),
('D4', 13.696903, 123.489051, 'node'),
('D5', 13.696022, 123.489160, 'node'),
('D6', 13.695563, 123.489277, 'node'),
('D7', 13.695309, 123.488162, 'node'),
('D8', 13.695217, 123.487718, 'node'),
('D9', 13.694362, 123.484679, 'node'),
('Doña', 13.698180, 123.491665, 'node'),
('E1', 13.696391, 123.483597, 'node'),
('E10', 13.696611, 123.480873, 'node'),
('E2', 13.697178, 123.483450, 'node'),
('E3', 13.698649, 123.483274, 'node'),
('E4', 13.699137, 123.481457, 'node'),
('E5', 13.699375, 123.480658, 'node'),
('E6', 13.698253, 123.480420, 'node'),
('E7', 13.698149, 123.481462, 'node'),
('E8', 13.697806, 123.480417, 'node'),
('E9', 13.697720, 123.481495, 'node'),
('F1', 13.697021, 123.481569, 'node'),
('F10', 13.698885, 123.485161, 'node'),
('F2', 13.695979, 123.481021, 'node'),
('F3', 13.696077, 123.481812, 'node'),
('F4', 13.698843, 123.482426, 'node'),
('F5', 13.699074, 123.481638, 'node'),
('F6', 13.698610, 123.481601, 'node'),
('F7', 13.698465, 123.482325, 'node'),
('F8', 13.697695, 123.481662, 'node'),
('F9', 13.697941, 123.483354, 'node'),
('G1', 13.696866, 123.486877, 'node'),
('G10', 13.693009, 123.489996, 'node'),
('G2', 13.695886, 123.485995, 'node'),
('G3', 13.693068, 123.485034, 'node'),
('G4', 13.694358, 123.487732, 'node'),
('G5', 13.694223, 123.487709, 'node'),
('G6', 13.693819, 123.487637, 'node'),
('G7', 13.692837, 123.487414, 'node'),
('G8', 13.693722, 123.489786, 'node'),
('G9', 13.693317, 123.489903, 'node'),
('GCC', 13.699213, 123.488727, 'node'),
('Grace', 13.698203, 123.490855, 'node'),
('H1', 13.697165, 123.495206, 'node'),
('Isang Cusina', 13.699867, 123.488133, 'node'),
('jolibee', 13.698269, 123.489735, 'node'),
('LCC', 13.698151, 123.489022, 'node'),
('Motortrade', 13.696394, 123.489108, 'node'),
('p1', 13.696360, 123.483386, 'node'),
('Paborito', 13.699819, 123.489951, 'node'),
('Prime 1', 13.697871, 123.489630, 'node'),
('PSU', 13.696320, 123.483138, 'node'),
('Solid Metal', 13.697788, 123.490026, 'node'),
('St Paul', 13.698118, 123.486913, 'node');

-- --------------------------------------------------------

--
-- Table structure for table `list_report`
--

CREATE TABLE `list_report` (
  `id` int(11) NOT NULL,
  `client_name` varchar(100) NOT NULL,
  `address` varchar(100) NOT NULL,
  `contact no.` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `service_description` varchar(100) NOT NULL,
  `proof` longtext DEFAULT NULL,
  `nature of service` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `proof_type` varchar(50) DEFAULT NULL,
  `plumber_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `list_report`
--

INSERT INTO `list_report` (`id`, `client_name`, `address`, `contact no.`, `date`, `service_description`, `proof`, `nature of service`, `location`, `proof_type`, `plumber_id`, `status`, `completed_at`) VALUES

CREATE TABLE `location` (
  `id` int(11) NOT NULL,
  `location_name` varchar(255) NOT NULL,
  `location` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `location`
--

INSERT INTO `location` (`id`, `location_name`, `location`, `type`) VALUES
(1, 'LCC', '13.698166988058981, 123.48894461989403', 'shop'),
(2, 'St. Paul', '13.698632143984891, 123.4876558184624', 'school'),
(3, 'Isang Cusina', '13.699810013697503, 123.48805144429208', 'food'),
(4, 'Paborito', '13.699845193343716, 123.49003091454507', 'food'),
(5, 'GCC', '13.699069936956674, 123.4888091683388', 'school'),
(6, 'Jollibee', '13.698303798720987, 123.48987400531769', 'food'),
(7, 'Prime 1', '13.69813701999859, 123.48979085683824', 'market'),
(8, 'Solid Metal', '13.697746131904301, 123.4901234507561', 'shop'),
(9, '7 Eleven', '13.698163079181755, 123.48940730094911', 'shop'),
(10, 'RCF Gas', '13.697240582338434, 123.4892249107361', 'gas'),
(11, 'Mcdo', '13.696745455421187, 123.48647430539134', 'food'),
(13, '7/11', '13.696044458160321, 123.48221361637117', 'shop'),
(14, 'Doña Linda', '13.698249074465739, 123.49164694547655', 'market'),
(15, 'Graceland', '13.698090113461586, 123.4908637404442', 'food'),
(16, '101', '13.69677542365899, 123.49042654037477', 'shop'),
(20, 'Partido State University', '13.696594311207116, 123.48268256271922', 'school');

-- --------------------------------------------------------

--
-- Table structure for table `pda`
--

CREATE TABLE `pda` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pda`
--

INSERT INTO `pda` (`id`, `username`, `password`, `role`) VALUES
(1, 'admin', 'admin', 'admin'),
(2, 'choy', 'choyy', 'plumber'),
(3, 'jepoy', 'jepoy123', 'plumber'),
(4, 'mark', 'mark123', 'plumber'),
(5, 'john', 'john123', 'plumber'),
(6, 'james', 'james123', 'plumber');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accomplish-report`
--
ALTER TABLE `accomplish-report`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_report` (`report_id`);

--
-- Indexes for table `approved_reports`
--
ALTER TABLE `approved_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coordinates`
--
ALTER TABLE `coordinates`
  ADD PRIMARY KEY (`node_id`);

--
-- Indexes for table `list_report`
--
ALTER TABLE `list_report`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plumber_id` (`plumber_id`);

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pda`
--
ALTER TABLE `pda`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accomplish-report`
--
ALTER TABLE `accomplish-report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approved_reports`
--
ALTER TABLE `approved_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `list_report`
--
ALTER TABLE `list_report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `location`
--
ALTER TABLE `location`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `pda`
--
ALTER TABLE `pda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accomplish-report`
--
ALTER TABLE `accomplish-report`
  ADD CONSTRAINT `fk_report` FOREIGN KEY (`report_id`) REFERENCES `list_report` (`id`);

--
-- Constraints for table `list_report`
--
ALTER TABLE `list_report`
  ADD CONSTRAINT `fk_plumber` FOREIGN KEY (`plumber_id`) REFERENCES `pda` (`id`);
COMMIT;
