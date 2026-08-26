"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Lodging extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Lodging.belongsTo(models.User, { foreignKey: "authorId" });
      Lodging.belongsTo(models.Type, { foreignKey: "authorId" });
    }
  }
  Lodging.init(
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
      facility: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Facility required",
          },
          notEmpty: {
            msg: "Facility required",
          },
        },
      },
      roomCapacity: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Room capacity required",
          },
          notEmpty: {
            msg: "Room capacity required",
          },
        },
      },
      imgUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Facility required",
          },
          notEmpty: {
            msg: "Facility required",
          },
          isUrl: {
            msg: "Must in URL link",
          },
        },
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Location required",
          },
          notEmpty: {
            msg: "Location required",
          },
        },
      },
      price: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Price required",
          },
          notEmpty: {
            msg: "Price required",
          },
        },
      },
      typeId: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Type required",
          },
          notEmpty: {
            msg: "Type required",
          },
        },
      },
      authorId: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Author required",
          },
          notEmpty: {
            msg: "Author required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Lodging",
    },
  );
  return Lodging;
};
