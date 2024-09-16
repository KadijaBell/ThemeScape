// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class ReviewImages extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       ReviewImages.belongsTo(models.Reviews, { foreignKey: "reviewId" });
//     }
//   }
//   ReviewImages.init({
//     reviewId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "Reviews",
//         key: "id"
//       },
//       onDelete: 'CASCADE'
//     },
//     url: {
//       type: DataTypes.STRING,
//       allowNull: false
//     }
//   }, {
//     sequelize,
//     modelName: 'ReviewImages',
//   });
//   return ReviewImages;
// };

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
    static associate(models) {
      // ReviewImage belongs to a review
      ReviewImage.belongsTo(models.Review, { foreignKey: 'reviewId', onDelete: 'CASCADE' });
    }
  }

  ReviewImage.init({
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: "Reviews",
        key: "id"
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
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
    modelName: 'ReviewImage'
  });

  return ReviewImage;
};
