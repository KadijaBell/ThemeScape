'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Users';
    await queryInterface.bulkInsert([
      {
        id:1,
        firstName: 'Demo',
        lastName: 'Lition',
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id:2,
        firstName: 'Fake',
        lastName: 'User',
        email: 'user1@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id:3,
        firstName: 'Fake',
        lastName: 'User',
        email: 'user2@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options,
      {
      username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] }
    },
    {});
  }
};


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
