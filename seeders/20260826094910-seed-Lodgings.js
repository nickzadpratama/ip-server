"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const lodgings = require("../data/lodgings.json");
    lodgings.forEach((el) => {
      el.createdAt = el.updatedAt = new Date();
    });

    await queryInterface.bulkInsert("Lodgings", lodgings, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Lodgings", null, {
      restartIdentity: true,
    });
  },
};
