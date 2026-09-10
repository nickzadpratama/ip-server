const { Op } = require("sequelize");
const { Team, User } = require("../models");

class TeamController {
  static async read(req, res, next) {
    try {
      const { search } = req.query;

      const option = {
        include: {
          model: User,
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      };

      if (search) {
        option.where = {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        };
      }

      const teams = await Team.findAll({ option });
      res.status(200).json({
        message: "Succeed read data team",
        data: teams,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { userId } = req.loginInfo;
      const { name, code, founded, stadium, city, capacity } = req.body;

      const team = await Team.create({
        name,
        code,
        founded,
        stadium,
        city,
        capacity,
        UserId: userId,
      });

      delete team.dataValues.createdAt;
      delete team.dataValues.updatedAt;
      res.status(201).json({
        message: "Succeed create data team",
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  static async teamById(req, res, next) {
    try {
      const { id } = req.params;
      const team = await Team.findByPk(id, {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      if (!team) {
        throw { name: "NotFound" };
      }

      res.status(200).json({
        message: "Succeed read detail team",
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { userId } = req.loginInfo;
      const { id } = req.params;
      const team = await Team.findByPk(id, {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      if (!team) {
        throw { name: "NotFound" };
      }

      const { name, code, founded, stadium, city, capacity } = req.body;

      await team.update({
        name,
        code,
        founded,
        stadium,
        city,
        capacity,
      });

      res.status(200).json({
        message: "Succeed update data team",
        data: team,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const team = await Team.findByPk(id, {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      if (!team) {
        throw { name: "NotFound" };
      }

      await team.destroy();

      res.status(200).json({
        message: `${team.name} succeed to delete`,
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TeamController;
