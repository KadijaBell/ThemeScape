PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE `SequelizeMeta` (`name` VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY);
INSERT INTO SequelizeMeta VALUES('20240904223350-create-users.js');
INSERT INTO SequelizeMeta VALUES('20240904223741-create-booking.js');
INSERT INTO SequelizeMeta VALUES('20240904224038-create-spots.js');
INSERT INTO SequelizeMeta VALUES('20240904224314-create-review-images.js');
INSERT INTO SequelizeMeta VALUES('20240904224627-create-reviews.js');
CREATE TABLE `SequelizeData` (`name` VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY);
INSERT INTO SequelizeData VALUES('20240910220255-demo-users.js');
INSERT INTO SequelizeData VALUES('20240910220307-demo-spots.js');
INSERT INTO SequelizeData VALUES('20240910220327-demo-reviews.js');
INSERT INTO SequelizeData VALUES('20240910220335-demo-bookings.js');
INSERT INTO SequelizeData VALUES('20240910220412-demo-review-images.js');
INSERT INTO SequelizeData VALUES('20240910220433-demo-spot-images.js');
CREATE TABLE `Users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `firstName` VARCHAR(255) NOT NULL, `lastName` VARCHAR(255) NOT NULL, `userName` VARCHAR(255) NOT NULL UNIQUE, `hashedPassword` VARCHAR(255) NOT NULL, `email` VARCHAR(255) NOT NULL UNIQUE, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
INSERT INTO Users VALUES(1,'Demo','lition','Demo-lition','$2a$10$nKNj.iTklarPF/w4quScxeBnhH/qHGFjy3xLyxAzfui8YmXn0AVZ.','demo@user.io','2024-09-11 01:05:34.802 +00:00','2024-09-11 01:05:34.802 +00:00');
INSERT INTO Users VALUES(2,'Fake','User','FakeUser1','$2a$10$t7uZ1r/bK89Yuz040ZeEbu6OoQmuQ21hzVAwaDYQ20vq9L4pHRBrW','user1@user.io','2024-09-11 01:05:34.802 +00:00','2024-09-11 01:05:34.802 +00:00');
INSERT INTO Users VALUES(3,'Faker','User','FakeUser2','$2a$10$f5LW.1ESxcyQXPKcvaPNaeDB.Uq.WB2OOShTbaLVwacYAVhq3xP/a','user2@user.io','2024-09-11 01:05:34.802 +00:00','2024-09-11 01:05:34.802 +00:00');
CREATE TABLE `Bookings` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `spotId` INTEGER NOT NULL REFERENCES `Spots` (`id`) ON DELETE CASCADE, `userId` INTEGER NOT NULL REFERENCES `Users` (`id`) ON DELETE CASCADE, `startDate` DATETIME NOT NULL, `endDate` DATETIME NOT NULL, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
INSERT INTO Bookings VALUES(1,1,1,'2024-09-15 00:00:00.000 +00:00','2024-09-16 00:00:00.000 +00:00','2024-09-11 01:05:34.827 +00:00','2024-09-11 01:05:34.827 +00:00');
INSERT INTO Bookings VALUES(2,2,1,'2024-09-24 00:00:00.000 +00:00','2024-09-25 00:00:00.000 +00:00','2024-09-11 01:05:34.827 +00:00','2024-09-11 01:05:34.827 +00:00');
INSERT INTO Bookings VALUES(3,5,3,'2024-10-31 00:00:00.000 +00:00','2024-11-01 00:00:00.000 +00:00','2024-09-11 01:05:34.827 +00:00','2024-09-11 01:05:34.827 +00:00');
CREATE TABLE `Spots` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `ownerId` INTEGER NOT NULL REFERENCES `Users` (`id`), `address` VARCHAR(255) NOT NULL, `city` VARCHAR(255) NOT NULL, `state` VARCHAR(255) NOT NULL, `country` VARCHAR(255) NOT NULL, `lat` FLOAT NOT NULL, `lng` FLOAT NOT NULL, `name` VARCHAR(255) NOT NULL, `description` VARCHAR(255), `price` FLOAT NOT NULL, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
INSERT INTO Spots VALUES(1,1,'123 Disney Lane','San Francisco','California','United States of America',37.76453579999999732,-122.4730327000000045,'App Academy','Place where web developers are created',123.0,'2024-09-11 01:05:34.818 +00:00','2024-09-11 01:05:34.818 +00:00');
INSERT INTO Spots VALUES(2,1,'129 Disney Lane','San Francisco','California','United States of America',43.76453579999999732,-132.4730327000000045,'App Academy admission office','Place where web developers are accepted',129.0,'2024-09-11 01:05:34.818 +00:00','2024-09-11 01:05:34.818 +00:00');
INSERT INTO Spots VALUES(3,1,'135 Disney Lane','San Francisco','California','United States of America',50.76453579999999733,-145.4730327000000045,'App Academy','help office',145.0,'2024-09-11 01:05:34.818 +00:00','2024-09-11 01:05:34.818 +00:00');
INSERT INTO Spots VALUES(4,3,'485 Development Way','San Francisco','California','United States of America',37.76453579999999732,-122.4730327000000045,'Shutter Island','Nice comfy cot',123.0,'2024-09-11 01:05:34.818 +00:00','2024-09-11 01:05:34.818 +00:00');
INSERT INTO Spots VALUES(5,3,'9245 Main Street N','Paris','Texas','United States of America',48.12345760000000183,-129.4793338000000062,'Residence Inn','Three bedroom suite with kitchenette and kitchen with island',285.0,'2024-09-11 01:05:34.818 +00:00','2024-09-11 01:05:34.818 +00:00');
CREATE TABLE `ReviewImages` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `reviewId` INTEGER REFERENCES `Reviews` (`id`), `url` VARCHAR(255) NOT NULL, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
INSERT INTO ReviewImages VALUES(1,1,'https://placehold.co/600x400/png','2024-09-11 01:05:34.830 +00:00','2024-09-11 01:05:34.830 +00:00');
INSERT INTO ReviewImages VALUES(2,2,'https://placehold.co/600x400/png','2024-09-11 01:05:34.830 +00:00','2024-09-11 01:05:34.830 +00:00');
INSERT INTO ReviewImages VALUES(3,3,'https://placehold.co/600x400/png','2024-09-11 01:05:34.830 +00:00','2024-09-11 01:05:34.830 +00:00');
CREATE TABLE `Reviews` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `spotId` INTEGER NOT NULL REFERENCES `Spots` (`id`), `userId` INTEGER NOT NULL REFERENCES `Users` (`id`), `review` VARCHAR(255) NOT NULL, `stars` INTEGER NOT NULL, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
INSERT INTO Reviews VALUES(1,4,2,'This place gives me the creeps!!',1.5,'2024-09-11 01:05:34.823 +00:00','2024-09-11 01:05:34.823 +00:00');
INSERT INTO Reviews VALUES(2,5,1,'I really like this place!',5,'2024-09-11 01:05:34.823 +00:00','2024-09-11 01:05:34.823 +00:00');
INSERT INTO Reviews VALUES(3,2,3,'Great place!',4.5,'2024-09-11 01:05:34.823 +00:00','2024-09-11 01:05:34.823 +00:00');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('Users',3);
INSERT INTO sqlite_sequence VALUES('Spots',5);
INSERT INTO sqlite_sequence VALUES('Reviews',3);
INSERT INTO sqlite_sequence VALUES('Bookings',3);
INSERT INTO sqlite_sequence VALUES('ReviewImages',3);
COMMIT;
