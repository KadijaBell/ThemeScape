'use strict';


const { ReviewImages } = require('../models');
const { Op } = require('sequelize');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const reviewImageSeed = [
      {
        reviewId: 1,
        url: "https://placehold.co/600x400/png",
      },
      {
        reviewId: 2,
        url: "https://placehold.co/600x400/png",
      },
      {

        reviewId: 3,
        url: "https://placehold.co/600x400/png",
      },
    ];
try {
  await ReviewImages.bulkCreate(reviewImageSeed, {validate : true});
} catch (error) {
  console.error(error)
}

  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: ['https://placehold.co/600x400/png'] }
    }, {});
  }

};
// 'use strict';
// let options = {};
// if (process.env.NODE_ENV === "production") {
//   options.schema = process.env.SCHEMA; // define your schema in options object
// }

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     const reviewImages = [
//       {
//         reviewId: 1,
//         url: "https://placehold.co/600x400/00ff00/png",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         reviewId: 2,
//         url: "https://placehold.co/600x400/ff0000/png",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         reviewId: 3,
//         url: "https://placehold.co/600x400/0000ff/png",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ];

//     try {
//       await queryInterface.bulkInsert('ReviewImages', reviewImages, {});
//       console.log('Review Images seeded successfully');
//     } catch (error) {
//       console.error('Error seeding Review Images:', error);
//     }
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkDelete('ReviewImages', null, {});
//   },
// };
