"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(models) {
      Team.belongsTo(models.User);
    }
  }
  Team.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Name Team Required",
          },
          notEmpty: {
            msg: "Name Team Required",
          },
        },
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Code Required",
          },
          notEmpty: {
            msg: "Code Required",
          },
        },
      },
      logo: DataTypes.STRING,
      founded: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Founded Required",
          },
          notEmpty: {
            msg: "Founded Required",
          },
        },
      },
      stadium: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Stadium Required",
          },
          notEmpty: {
            msg: "Stadium Required",
          },
        },
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "City Required",
          },
          notEmpty: {
            msg: "City Required",
          },
        },
      },
      capacity: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Capacity Required",
          },
          notEmpty: {
            msg: "Capacity Required",
          },
        },
      },
      image: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Team",
    },
  );
  return Team;
};
