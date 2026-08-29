const { Op } = require("sequelize");
const { Lodging, User } = require("../models");
const ImageKit = require("@imagekit/nodejs");
const upload = require("../utils/multer");

class LodgingController {
  static async read(req, res, next) {
    try {
      const lodgings = await Lodging.findAll({
        include: {
          model: User,
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },})
      res.status(200).json({
        message: "Succeed read data Lodging",
        data: lodgings
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async readPub(req, res, next) {
    try {
      const { search, sort, filter, page } = req.query;

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

      let type_id;
      if (filter) {
        if (filter === "Campur") {
          type_id = 1;
        } else if (filter === "Putri") {
          type_id = 2
        } else if (filter === "Putra") {
          type_id = 3
        }
        option.where = {typeId: type_id}
      }

      if (sort) {
        const ordering = sort[0] === "-" ? "DESC" : "ASC";
        const colomnName = ordering === "DESC" ? sort.slice(1) : sort;

        option.order = [[colomnName, ordering]];
      }

      let limit = 10;
      let pageNumber = 1;
      if (page) {
        if (page.size) {
          limit = page.size
          option.limit = limit
        }
        if (page.number) {
          pageNumber = page.number;
          option.offset = limit * (pageNumber - 1)
        }
      }

      const { count, rows } = await Lodging.findAndCountAll(option)
      res.status(200).json({
        page: pageNumber,
        data: rows,
        totalData: count,
        totalPage: Math.ceil(count / limit),
        dataPerPage: limit,
        message: "Succeed read data Lodgings",
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async create(req, res, next) {
    try {
      const { name, facility, roomCapacity, imgUrl, location, price, typeId, authorId } =
        req.body;

      const lodging = await Lodging.create({
        name,
        facility,
        roomCapacity,
        imgUrl,
        location,
        price,
        typeId,
        authorId
      });

      delete lodging.dataValues.createdAt;
      delete lodging.dataValues.updatedAt;
      res.status(201).json({
        message: "Succeed create data lodging",
        data: lodging,
      });
    } catch (error) {
      console.log(error);
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
        message: "Succeed read detail lodging",
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
        message: "Succeed update data lodging",
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
        message: `${lodging.name} succeed to delete`,
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
        message: `Image ${lodging.name} success to update`,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LodgingController;
