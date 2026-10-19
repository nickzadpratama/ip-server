"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FanClubMembership extends Model {
    static associate(models) {
      FanClubMembership.belongsTo(models.User, { foreignKey: "UserId", onDelete: "CASCADE" });
      FanClubMembership.belongsTo(models.FanClub, { foreignKey: "FanClubId", onDelete: "CASCADE" });
    }
  }
  FanClubMembership.init({
    UserId: { type: DataTypes.INTEGER, allowNull: false },
    FanClubId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
    modelName: "FanClubMembership",
    indexes: [{ unique: true, fields: ["UserId", "FanClubId"] }],
  });
  return FanClubMembership;
};