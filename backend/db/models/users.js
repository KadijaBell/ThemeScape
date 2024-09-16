// 'use strict';
// const { Model, Validator } = require('sequelize');

// module.exports = (sequelize, DataTypes) => {
//   class Users extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       Users.hasMany(models.Spots, { foreignKey: "ownerId" , as: "Spots", onDelete: 'CASCADE' });
//       Users.hasMany(models.Bookings, { foreignKey: "userId" });
//       Users.hasMany(models.Reviews, { foreignKey: "userId" });

//     }
//   }
//   Users.init(
//     {
//       firstName: {
//         type: DataTypes.STRING(255) ,
//         allowNull: false,
//       },
//       lastName: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       email: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//         unique: true,
//         validate: {
//           len: [3, 256],
//           isEmail: true,
//         },
//       },
//       username: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//         unique: true,
//         validate: {
//           len: [4, 30],
//           isNotEmail(value) {
//             if (Validator.isEmail(value)) {
//               throw new Error('Cannot be an email.');
//             }
//           },
//         },
//       },
//       hashedPassword: {
//         type: DataTypes.STRING.BINARY,
//         allowNull: false,
//         validate: {
//           len: [60, 60],
//         },
//       },
//     },
//     {
//       sequelize,
//       modelName: 'Users',
//       defaultScope: {
//         attributes: {
//           exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt'],
//         },
//       },
//     }
//   );
//   return Users;
// };

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      // A user can have many spots, reviews, bookings
      Users.hasMany(models.Spots, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
      Users.hasMany(models.Reviews, { foreignKey: 'userId', onDelete: 'CASCADE' });
      Users.hasMany(models.Bookings, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }

  Users.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'First name is required' },
        notEmpty: { msg: 'First name cannot be empty' }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Last name is required' },
        notEmpty: { msg: 'Last name cannot be empty' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Email must be a valid email address' },
        notEmpty: { msg: 'Email cannot be empty' }
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Username cannot be empty' }
      }
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password cannot be empty' }
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Users',
    tableName: 'Users'
  });

  return Users;
};
