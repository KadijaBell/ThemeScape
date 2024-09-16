// 'use strict';

// const { Op } = require('sequelize');
// const { Bookings } = require('../models')

// let options = {};
// if (process.env.NODE_ENV === 'production') {
//   options.schema = process.env.SCHEMA;  // define your schema in options object
// }

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {

//     const bookingSeed = [
//       {
//         spotId: 21,
//         userId: 4,
//         startDate: new Date("2024-09-15"),
//         endDate: new Date("2024-09-16"),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         spotId: 22,
//         userId: 5,
//         startDate: new Date("2024-09-24"),
//         endDate: new Date("2024-09-25"),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         spotId: 25,
//         userId: 6,
//         startDate: new Date("2024-10-31"),
//         endDate: new Date("2024-11-01"),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ];
//     try {
//       await Bookings.bulkCreate( bookingSeed , {validate : true});
//     } catch (error) {
//       console.error(error);
//     }

//   },

//   async down(queryInterface, Sequelize) {
//     options.tableName = 'Bookings';
//     return queryInterface.bulkDelete(options, {
//       spotId: { [Op.in]: [1, 2, 5] }
//     }, {});
//   }


// };
// 'use strict';
// let options = {};
// if (process.env.NODE_ENV === "production") {
//   options.schema = process.env.SCHEMA; // define your schema in options object
// }

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     const bookings = [
//       {
//         userId: 1,
//         spotId: 1,
//         startDate: new Date("2024-12-01"),
//         endDate: new Date("2024-12-05"),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         userId: 2,
//         spotId: 2,
//         startDate: new Date("2024-11-15"),
//         endDate: new Date("2024-11-20"),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         userId: 3,
//         spotId: 3,
//         startDate: new Date("2024-10-10"),
//         endDate: new Date("2024-10-15"),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ];

//     try {
//       await queryInterface.bulkInsert('Bookings', bookings, {});
//       console.log('Bookings seeded successfully');
//     } catch (error) {
//       console.error('Error seeding Bookings:', error);
//     }
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkDelete('Bookings', null, {});
//   },
// };
