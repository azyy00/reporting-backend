-- Create PDA table first (since it's referenced by list_report)
CREATE TABLE IF NOT EXISTS `pda` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create list_report table second (since it's referenced by accomplish-report)
CREATE TABLE IF NOT EXISTS `list_report` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_name` varchar(100) NOT NULL,
  `address` varchar(100) NOT NULL,
  `contact no.` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `service_description` varchar(100) NOT NULL,
  `proof` longtext DEFAULT NULL,
  `nature of service` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `proof_type` varchar(50) DEFAULT NULL,
  `plumber_id` int DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plumber_id` (`plumber_id`),
  CONSTRAINT `fk_plumber` FOREIGN KEY (`plumber_id`) REFERENCES `pda` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create accomplish-report table
CREATE TABLE IF NOT EXISTS `accomplish-report` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_id` int DEFAULT NULL,
  `departure_time` varchar(10) DEFAULT NULL,
  `arrival_time` varchar(10) DEFAULT NULL,
  `accomplish_date` date DEFAULT NULL,
  `accomplish_proof` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_report` (`report_id`),
  CONSTRAINT `fk_report` FOREIGN KEY (`report_id`) REFERENCES `list_report` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create approved_reports table
CREATE TABLE IF NOT EXISTS `approved_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_name` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `service_description` text DEFAULT NULL,
  `nature_of_service` varchar(255) DEFAULT NULL,
  `location` text DEFAULT NULL,
  `proof` longtext DEFAULT NULL,
  `proof_type` varchar(50) DEFAULT NULL,
  `approved_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `departure_time` time DEFAULT NULL,
  `arrival_time` time DEFAULT NULL,
  `accomplish_date` date DEFAULT NULL,
  `accomplish_proof` longtext DEFAULT NULL,
  `plumber_username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create coordinates table
CREATE TABLE IF NOT EXISTS `coordinates` (
  `node_id` varchar(50) NOT NULL,
  `latitude` decimal(10,6) NOT NULL,
  `longitude` decimal(10,6) NOT NULL,
  `type` varchar(50) DEFAULT 'node',
  PRIMARY KEY (`node_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert initial coordinates data
-- Replace existing coordinates with new ones
INSERT INTO coordinates (node_id, latitude, longitude, type) VALUES
('A1', 13.699208, 123.488681, 'node'),
('A2', 13.699149, 123.488221, 'node'),
('A3', 13.699368, 123.489980, 'node'),
('A4', 13.698364, 123.488196, 'node'),
('A5', 13.698301, 123.489024, 'node'),
('A6', 13.698728, 123.489034, 'node'),
('A7', 13.698762, 123.490014, 'node'),
('A8', 13.698245, 123.490011, 'node'),
('A9', 13.697875, 123.490022, 'node'),
('A10', 13.697858, 123.489030, 'node'),
('B1', 13.699606, 123.488171, 'node'),
('B2', 13.700247, 123.489926, 'node'),
('B3', 13.699146, 123.486900, 'node'),
('B4', 13.697783, 123.486905, 'node'),
('B5', 13.698998, 123.486036, 'node'),
('B6', 13.697838, 123.488179, 'node'),
('B7', 13.696867, 123.486868, 'node'),
('B8', 13.696861, 123.488140, 'node'),
('B9', 13.696837, 123.486491, 'node'),
('B10', 13.699646, 123.491924, 'node'),
('C1', 13.700565, 123.491895, 'node'),
('C2', 13.700402, 123.490970, 'node'),
('C3', 13.700838, 123.492998, 'node'),
('C4', 13.698776, 123.491974, 'node'),
('C5', 13.698165, 123.492020, 'node'),
('C6', 13.698856, 123.494610, 'node'),
('C7', 13.698109, 123.494595, 'node'),
('C8', 13.697762, 123.495973, 'node'),
('C9', 13.697909, 123.492027, 'node'),
('C10', 13.696925, 123.492063, 'node'),
('D1', 13.696867, 123.490069, 'node'),
('D2', 13.696142, 123.490097, 'node'),
('D3', 13.696348, 123.492127, 'node'),
('D4', 13.696903, 123.489051, 'node'),
('D5', 13.696022, 123.489160, 'node'),
('D6', 13.695563, 123.489277, 'node'),
('D7', 13.695309, 123.488162, 'node'),
('D8', 13.695217, 123.487718, 'node'),
('D9', 13.694362, 123.484679, 'node'),
('D10', 13.694148, 123.483893, 'node'),
('E1', 13.696391, 123.483597, 'node'),
('E2', 13.697178, 123.483450, 'node'),
('E3', 13.698649, 123.483274, 'node'),
('E4', 13.699137, 123.481457, 'node'),
('E5', 13.699375, 123.480658, 'node'),
('E6', 13.698253, 123.480420, 'node'),
('E7', 13.698149, 123.481462, 'node'),
('E8', 13.697806, 123.480417, 'node'),
('E9', 13.697720, 123.481495, 'node'),
('E10', 13.696611, 123.480873, 'node'),
('F1', 13.697021, 123.481569, 'node'),
('F2', 13.695979, 123.481021, 'node'),
('F3', 13.696077, 123.481812, 'node'),
('F4', 13.698843, 123.482426, 'node'),
('F5', 13.699074, 123.481638, 'node'),
('F6', 13.698610, 123.481601, 'node'),
('F7', 13.698465, 123.482325, 'node'),
('F8', 13.697695, 123.481662, 'node'),
('F9', 13.697941, 123.483354, 'node'),
('F10', 13.698885, 123.485161, 'node'),
('G1', 13.696866, 123.486877, 'node'),
('G2', 13.695886, 123.485995, 'node'),
('G3', 13.693068, 123.485034, 'node'),
('G4', 13.694358, 123.487732, 'node'),
('G5', 13.694223, 123.487709, 'node'),
('G6', 13.693819, 123.487637, 'node'),
('G7', 13.692837, 123.487414, 'node'),
('G8', 13.693722, 123.489786, 'node'),
('G9', 13.693317, 123.489903, 'node'),
('G10', 13.693009, 123.489996, 'node'),
('H1', 13.697165, 123.495206, 'node');
-- ... existing code ...
('GCC', 13.699312, 123.488910, 'landmark'),
('LCC', 13.698512, 123.488910, 'landmark'),
('Paborito', 13.699212, 123.488510, 'landmark'),
('Grace', 13.698112, 123.488910, 'landmark'),
('Doña', 13.698212, 123.489110, 'landmark'),
('Prime 1', 13.697712, 123.489010, 'landmark'),
('Isang Cusina', 13.699412, 123.488010, 'landmark'),
('jolibee', 13.698112, 123.488510, 'landmark'),
('7/11', 13.698512, 123.488310, 'landmark'),
('St Paul', 13.699612, 123.488510, 'landmark'),
('Central', 13.699912, 123.489410, 'landmark'),
('Solid Metal', 13.697712, 123.489210, 'landmark'),
('101', 13.697612, 123.489310, 'landmark'),
('Motortrade', 13.701712, 123.492710, 'landmark'),
('PSU', 13.702312, 123.494310, 'landmark'),
('7-Eleven', 13.703512, 123.496310, 'landmark');



-- First, create the PDA table if it doesn't exist
CREATE TABLE IF NOT EXISTS PDA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Insert admin user
INSERT INTO PDA (username, password, role) VALUES 
('admin', 'admin', 'admin');

-- Insert plumbers
INSERT INTO PDA (username, password, role) VALUES 
('choy', 'choyy', 'plumber'),
('jepoy', 'jepoy123', 'plumber'),
('mark', 'mark123', 'plumber'),
('john', 'john123', 'plumber'),
('james', 'james123', 'plumber');

-- You can verify the insertions with:
SELECT * FROM PDA;


CREATE TABLE location (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    location VARCHAR(100) NOT NULL,  -- Stored as "latitude, longitude"
    type VARCHAR(50) NOT NULL        -- 'food', 'market', 'school', 'shop', 'gas'
);