"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const types = require("../data/types.json");
    types.forEach((el) => {
      el.createdAt = el.updatedAt = new Date();
    });

    await queryInterface.bulkInsert("Types", types, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Types", null, { restartIdentity: true });
  },
};
