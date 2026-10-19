"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const options = { transaction };
      await queryInterface.createTable("FanClubs", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        provider: { type: Sequelize.STRING, allowNull: false, defaultValue: "api-sports" },
        externalTeamId: { type: Sequelize.INTEGER, allowNull: false },
        name: { type: Sequelize.STRING, allowNull: false },
        code: Sequelize.STRING,
        logo: Sequelize.STRING,
        founded: Sequelize.INTEGER,
        national: Sequelize.BOOLEAN,
        stadium: Sequelize.STRING,
        city: Sequelize.STRING,
        capacity: Sequelize.INTEGER,
        image: Sequelize.STRING,
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      }, options);
      await queryInterface.addIndex("FanClubs", ["provider", "externalTeamId"], {
        ...options, unique: true, name: "fanclubs_provider_external_team_unique",
      });
      await queryInterface.createTable("FanClubMemberships", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        UserId: {
          type: Sequelize.INTEGER, allowNull: false,
          references: { model: "Users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE",
        },
        FanClubId: {
          type: Sequelize.INTEGER, allowNull: false,
          references: { model: "FanClubs", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE",
        },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      }, options);
      await queryInterface.addIndex("FanClubMemberships", ["UserId", "FanClubId"], {
        ...options, unique: true, name: "fanclub_membership_user_club_unique",
      });
    });
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("FanClubMemberships", { transaction });
      await queryInterface.dropTable("FanClubs", { transaction });
    });
  },
};
