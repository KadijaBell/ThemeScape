'use strict';

const { Op } = require('sequelize');
const { Reviews } = require('../models');



let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  const reviewSeed = [
    {

      spotId: 4,
      userId: 2,
      review: "This place gives me the creeps!!",
      stars: 1.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {

      spotId: 5,
      userId: 1,
      review: "I really like this place!",
      stars: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {

      spotId: 2,
      userId: 3,
      review: "Great place!",
      stars: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
try {
  await Reviews.bulkCreate(reviewSeed, {validate : true});

} catch (error) {
 console.error(error);
}

  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    return queryInterface.bulkDelete(options, {
      review: { [Op.in]: ['This place gives me the creeps!!', 'I really like this place!', 'Great place!'] }
    }, {})
  }
};


// 'use strict';
// let options = {};
// if (process.env.NODE_ENV === "production") {
//   options.schema = process.env.SCHEMA; // define your schema in options object
// }

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     const reviews = [
//       {
//         spotId: 1,
//         userId: 2,
//         review: "A magical place! Highly recommend.",
//         stars: 5.0,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         spotId: 2,
//         userId: 3,
//         review: "Great stay! Very relaxing.",
//         stars: 4.5,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         spotId: 3,
//         userId: 1,
//         review: "Sweetest vacation ever!",
//         stars: 4.8,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ];

//     try {
//       await queryInterface.bulkInsert('Reviews', reviews, {});
//       console.log('Reviews seeded successfully');
//     } catch (error) {
//       console.error('Error seeding Reviews:', error);
//     }
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkDelete('Reviews', null, {});
//   },
// };
