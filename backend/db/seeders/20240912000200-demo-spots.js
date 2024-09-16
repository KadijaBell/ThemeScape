'use strict';
const { Op } = require('sequelize');
const { Spot, User } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const spotSeed = [
      {

        ownerId: 1,
        address: "123 Disney Lane",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 37.7645358,
        lng: -122.4730327,
        name: "App Academy",
        description: "Place where web developers are created",
        price: 123,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 2,
        address: "129 Disney Lane",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 43.7645358,
        lng: -132.4730327,
        name: "App Academy admission office",
        description: "Place where web developers are accepted",
        price: 129,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 3,
        address: "135 Disney Lane",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 50.7645358,
        lng: -145.4730327,
        name: "App Academy",
        description: "help office",
        price: 145,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 3,
        address: "485 Development Way",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 37.7645358,
        lng: -122.4730327,
        name: "Shutter Island",
        description: "Nice comfy cot",
        price: 123,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 1,
        address: "9245 Main Street N",
        city: "Paris",
        state: "Texas",
        country: "United States of America",
        lat: 48.1234576,
        lng: -129.4793338,
        name: "Residence Inn",
        description:
          "Three bedroom suite with kitchenette and kitchen with island",
        price: 285,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    try {
      await Spot.bulkCreate(spotSeed , { validate: true });
      //await queryInterface.bulkInsert('Spot', spotSeed, {validate : true});
    } catch (error) {
      console.error(error);
    }

  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Spots';
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['App Academy', 'App Academy admission office', 'Shutter Island', 'Residence Inn'] }
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
//     const spots = [
//       {
//         ownerId: 1,
//         address: "123 Wonderland St",
//         city: "Fantasy City",
//         state: "Dreamland",
//         country: "Imaginary",
//         lat: 35.1234,
//         lng: -120.2345,
//         name: "Alice's Wonderland",
//         description: "A magical place filled with wonders",
//         price: 150.0,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         ownerId: 2,
//         address: "456 Builder Ave",
//         city: "Construction Town",
//         state: "Hardwork",
//         country: "Reality",
//         lat: 42.4321,
//         lng: -73.5678,
//         name: "Bob's Builder Retreat",
//         description: "Where hard work meets relaxation",
//         price: 200.0,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         ownerId: 3,
//         address: "789 Chocolate Blvd",
//         city: "Sweet City",
//         state: "Candyland",
//         country: "Fantasy",
//         lat: 38.6789,
//         lng: -79.4321,
//         name: "Charlie’s Chocolate Factory",
//         description: "A paradise for chocolate lovers",
//         price: 175.0,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ];

//     try {
//       await queryInterface.bulkInsert('Spot', spots, {});
//       console.log('Spot seeded successfully');
//     } catch (error) {
//       console.error('Error seeding Spot:', error);
//     }
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.bulkDelete('Spot', null, {});
//   },
// };
