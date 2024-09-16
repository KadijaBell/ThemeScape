// 'use strict';
// const { Model } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class SpotImages extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       SpotImages.belongsTo(models.Spots, { foreignKey: "spotId" });
//     }
//   }
//   SpotImages.init({
//     spotId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "Spots",
//         key: "id"
//       },
//       onDelete: 'CASCADE'
//     },
//     url: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     preview: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false,
//     }
//   }, {
//     sequelize,
//     modelName: 'SpotImages',
//   });
//   return SpotImages;
// };
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {
    static associate(models) {
      // SpotImage belongs to a spot
      SpotImage.belongsTo(models.Spot, { foreignKey: 'spotId', onDelete: 'CASCADE' });
    }
  }

  SpotImage.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: "Spots",
        key: "id"
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    modelName: 'SpotImage'
  });

  return SpotImage;
};
