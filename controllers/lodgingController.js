const { Op } = require("sequelize");
const { Lodging, User } = require("../models");
const ImageKit = require("@imagekit/nodejs");
const upload = require("../utils/multer");

class LodgingController {
  static async read(req, res, next) {
    try {
      const { filter, sort } = req.query;
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

      if (filter) {
        option.where = {
          name: {
            [Op.iLike]: `%${filter}%`,
          },
        };
      }

      if (sort) {
        const ordering = sort[0] === "-" ? "DESC" : "ASC";
        const colomnName = ordering === "DESC" ? sort.slice(1) : sort;

        option.order = [[colomnName, ordering]];
      }

      const lodgings = await Lodging.findAll(option);
      res.status(200).json({
        massage: "Succeed read data Lodging",
        data: lodgings,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { id } = req.logInfo;

      const { name, facility, roomCapacity, imgUrl, location, price, typeId } =
        req.body;

      const lodging = await Lodging.create({
        name,
        facility,
        roomCapacity,
        imgUrl,
        location,
        price,
        typeId,
        authorId: id,
      });

      delete lodging.dataValues.createdAt;
      delete lodging.dataValues.updatedAt;
      res.status(201).json({
        massage: "Succeed create data lodging",
        lodging: lodging,
      });
    } catch (error) {
      next(error);
    }
  }

  static async lodgingById(req, res, next) {
    try {
      const { id } = req.params;
      const lodging = await Lodging.findByPk(id, {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      if (!lodging) {
        throw { name: "NotFound" };
      }

      res.status(200).json({
        massage: "Succeed read detail lodging",
        data: lodging,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const lodging = await Lodging.findByPk(id, {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      if (!lodging) {
        throw { name: "NotFound" };
      }

      const {
        name,
        facility,
        roomCapacity,
        imgUrl,
        location,
        price,
        typeId,
        authorId,
      } = req.body;

      await lodging.update({
        name,
        facility,
        roomCapacity,
        imgUrl,
        location,
        price,
        typeId,
        authorId,
      });

      res.status(200).json({
        massage: "Succeed update data lodging",
        data: lodging,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const lodging = await Lodging.findByPk(id, {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      if (!lodging) {
        throw { name: "NotFound" };
      }

      await lodging.destroy();

      res.status(200).json({
        massage: `${lodging.name} succeed to delete`,
        data: lodging,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateImage(req, res, next) {
    try {
      const { id } = req.params;

      const lodging = await Lodging.findByPk(id);

      const client = new ImageKit({
        privateKey: "private_gCazD3zMSodFQ0BXpcaAgKJ06/4=",
      });

      const result = await client.files.upload({
        file: await ImageKit.toFile(Buffer.from(req.file.buffer), "file"),
        fileName: req.file.originalname,
      });

      lodging.update({
        imgUrl: result.url,
      });

      res.status(200).json({
        massage: `Image ${lodging.name} success to update`,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LodgingController;
