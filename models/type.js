"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Type.hasMany(models.Lodging, { foreignKey: "typeId" });
    }
  }
  Type.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Name required",
          },
          notEmpty: {
            msg: "Name required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Type",
    },
  );
  return Type;
};
