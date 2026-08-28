const { Type } = require("../models");

class TypeController {
  static async read(req, res, next) {
    try {
      const types = await Type.findAll({
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });
      res.status(200).json({
        massage: "Succeed read data type",
        data: types,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { name } = req.body;

      const type = await Type.create({
        name,
      });

      delete type.dataValues.createdAt;
      delete type.dataValues.updatedAt;
      res.status(201).json({
        massage: "Succeed create data type",
        data: type,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const type = await Type.findByPk(id, {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      if (!type) {
        throw { name: "NotFound" };
      }

      const { name } = req.body;

      await type.update({
        name,
      });

      res.status(200).json({
        massage: "Succeed update data type",
        data: type,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TypeController;
