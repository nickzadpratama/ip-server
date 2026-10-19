"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FanClub extends Model {
    static associate(models) {
      FanClub.hasMany(models.FanClubMembership, { foreignKey: "FanClubId" });
      FanClub.belongsToMany(models.User, {
        through: models.FanClubMembership,
        foreignKey: "FanClubId",
        otherKey: "UserId",
      });
    }
  }
  FanClub.init({
    provider: { type: DataTypes.STRING, allowNull: false, defaultValue: "api-sports" },
    externalTeamId: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    name: { type: DataTypes.STRING, allowNull: false },
    code: DataTypes.STRING,
    logo: DataTypes.STRING,
    founded: DataTypes.INTEGER,
    national: DataTypes.BOOLEAN,
    stadium: DataTypes.STRING,
    city: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    image: DataTypes.STRING,
  }, {
    sequelize,
    modelName: "FanClub",
    indexes: [{ unique: true, fields: ["provider", "externalTeamId"] }],
  });
  return FanClub;
};
