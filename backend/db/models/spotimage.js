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
      },
      onDelete: "CASCADE",
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
  }, {
    sequelize,
    modelName: 'SpotImage'
  });

  return SpotImage;
};
