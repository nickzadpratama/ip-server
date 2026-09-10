"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Team);
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Username Required",
          },
          notEmpty: {
            msg: "Username Required",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: {
          msg: "Email must be unique",
        },
        allowNull: false,
        validate: {
          notNull: {
            msg: "Email Required",
          },
          notEmpty: {
            msg: "Email Required",
          },
          isEmail: {
            msg: "Invalid email format",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Password Required",
          },
          notEmpty: {
            msg: "Password Required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
