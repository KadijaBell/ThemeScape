// 'use strict';

// const { Users } = require('../models');
// const bcrypt = require('bcryptjs');
// const { Op } = require('sequelize');

// let options = {};
// if (process.env.NODE_ENV === 'production') {
//   options.schema = process.env.SCHEMA;  // define your schema in options object
// }

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//    const userSeed = [
//      {
//        firstName: "Demo",
//        lastName: "lition",
//        email: "demo@user.io",
//        username: "Demo-lition",
//        hashedPassword: bcrypt.hashSync("password"),
//      },
//      {
//        firstName: "Fake",
//        lastName: "Users",
//        email: "user1@user.io",
//        username: "FakeUser1",
//        hashedPassword: bcrypt.hashSync("password2"),
//      },
//      {
//       firstName: "Faker",
//       lastName: "User",
//       email: "user2@user.io",
//       username: "FakeUser2",
//       hashedPassword: bcrypt.hashSync("password3"),
//      },
//    ];
//    try {
//     await queryInterface.bulkInsert('Users', userSeed, {});
//     console.log('Users seeded successfully');
//   } catch (error) {
//     console.error('Error seeding Users:', error);
//   }
// },

// down: async (queryInterface, Sequelize) => {
//   await queryInterface.bulkDelete('Users', null, {});
// },
// };
// 'use strict';
// const bcrypt = require('bcryptjs');
// let options = {};
// if (process.env.NODE_ENV === "production") {
//   options.schema = process.env.SCHEMA; // define your schema in options object
// }
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     const users = [
//       {
//         firstName: 'Alice',
//         lastName: 'Wonderland',
//         email: 'alice@wonder.io',
//         username: 'Alice-W',
//         hashedPassword: bcrypt.hashSync('password'),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         firstName: 'Bob',
//         lastName: 'Builder',
//         email: 'bob@builder.io',
//         username: 'Bob-B',
//         hashedPassword: bcrypt.hashSync('password123'),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         firstName: 'Charlie',
//         lastName: 'Chocolate',
//         email: 'charlie@choco.io',
//         username: 'Charlie-C',
//         hashedPassword: bcrypt.hashSync('choco123'),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ];

//     try {
//       await queryInterface.bulkInsert('Users', users, {});
//       console.log('Users seeded successfully');
//     } catch (error) {
//       console.error('Error seeding Users:', error);
//     }
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkDelete('Users', null, {});
//   },
// };
