

INSERT INTO `categories` VALUES 
('uKmwctxAcAbRby8O', 'Chairs', '891d021aa00ac630'),
('1Zx6DYqPodqATCyF', 'Tables', '68c2964483c5dd89'),
('YduZmJFmovN99StC', 'Center Pieces', 'c7c0ba8f75526b63'),
('4cAZzlORUK/x9pff', 'Candy Carts', 'e45fb3f53ec72314'),
('l9MaaH3gDylnsN73', 'Decor', '4dcd9a8e107efb15'),
('aMgUNqzSrYQnbkYN', 'Draping', 'cdd430c68b12f394'),
('98xC4R9kw+qXxlp/', 'Drinkware', '3633cb86cb3aeda3'),
('10G1coNRVArXAXyK', 'Flatware', '9c19108cc70d42dc'),
('ISQdbBvXb6SGHFh0', 'Flower, Plants &amp; Trees', 'd42d4a8dc51fccc5'),
('hlliNpVwEmCLI0cp', 'Lighting', 'dc32f42895f52767'),
('NOdc2PSP2bz6BR0Q', 'Linen', '89583b90176011c4'),
('JGnG0WO5wyeNGxc5', 'Marquee & LED Signs', '46073ffedd2c6888'),
('CzcfVrglF1cORrS/', 'Pedestal & Plinths', 'c3b1dc73ad3e8a83'),
('4FbNYK2SlX97+tbX', 'Serverware', '174bdb74a17a2c61'),
('6e0ebqYdZ1226Ts3', 'Silverware', '2ac244c6cac19c17'),
('mEfkVpMmFSgyuWEd', 'Teaware / Coffeeware', '9fec515ceeb00b9d'),
('w7nKt148IWrnVr6Q', 'Children Party Rentals', 'ec0fa50fad58f55e'),
('EH/hrvVp5Oc3uIrt', 'Candles', 'a8c867c0f708a7c8') ;



/* The below mysql code inserts a new user into the database 
    the structure of the users table is as follows:
        
    CREATE TABLE IF NOT EXISTS `users` (
        user_id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        login_attempts INT DEFAULT 0,
        user_type ENUM('standard_admin', 'master_admin', 'customer') DEFAULT 'standard_admin',
        account_status ENUM('active', 'locked') DEFAULT 'active'
    );
*/

 insert into users values 
 ( 'q6qSVIlN84+2621uokE1', 'ntuifranklin', 
 'ntuifranklin2005@gmail.com', PASSWORD('password'), 
 created_at, last_modified, current_timestamp(), 0, 
 user_type, account_status);

insert into users values 
 ( 'uMWMmhFMA1nmvZIpsXiOfjL4YQ8=', 'franklin', 
 'franklin@bashballoonsrentals.com', PASSWORD('<<>>**1aBB'), 
 created_at, last_modified, current_timestamp(), 0, 
 standard_admin, active);
 
insert into users values 
 ( 'ba719890e6e762564eef1a', 'franklin', 
 'franklin.nkokam.ngongang@gmail.com', PASSWORD('<<>>**1aBB'), 
 created_at, last_modified, current_timestamp(), 0, 
 'standard_admin', 'active');
 
insert into users values 
 ( '90ad544413be0ba8ee6c6cae', 'franklin', 
 'franklin@email.bashballoonsrentals.com', PASSWORD('<<>>**1aBB'), 
 created_at, last_modified, current_timestamp(), 0, 
 'master_admin', 'active'); 
 
insert into users values 
 ( 'fe76c21a8aaaa283', 'Asong Nic', 
 'asong_nic@email.bashballoonsrentals.com', PASSWORD('asong_nic123'), 
 created_at, last_modified, current_timestamp(), 0, 
 'standard_admin', 'active'); 

/*
-- Generate OTP for a user
*/
INSERT INTO otp (user_id, otp_code, expiration_time)
VALUES (1, '123456', NOW() + INTERVAL 5 MINUTE);


update categories set category_name = 'Pedestal and Plinths' where category_id = 'CzcfVrglF1cORrS/';
update categories set category_name = 'Flowers, Plants and Trees' where category_id = 'ISQdbBvXb6SGHFh0';
update categories set category_name = 'Teaware or Coffeeware' where category_id = 'mEfkVpMmFSgyuWEd';
update categories set category_name = 'Marquee and LED Signs' where category_id = 'JGnG0WO5wyeNGxc5';