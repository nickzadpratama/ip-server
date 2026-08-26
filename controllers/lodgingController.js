const { Lodging } = require("../models");

class LodgingController {
  static async read(req, res) {
    try {
      const lodgings = await Lodging.findAll({
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });
      res.status(200).json({
        massage: "Succeed read data Lodging",
        data: lodgings,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async create(req, res) {
    try {
      const { id } = req.logInfo;

      const {
        name,
        description,
        totalPrize,
        eventPoster,
        eventDate,
        eventType,
        eventStatus,
        GameId,
      } = req.body;

      const event = await Event.create({
        name,
        description,
        totalPrize,
        eventPoster,
        eventDate,
        eventType,
        eventStatus,
        GameId,
        id,
      });

      delete event.dataValues.createdAt;
      delete event.dataValues.updatedAt;
      res.status(200).json({
        massage: "Succeed create data events",
        data: event,
      });
    } catch (error) {
      let status = 500;
      let message = "Internal server error";

      if (error.name === "SequelizeValidationError") {
        message = error.errors[0].message;
        status = 400;
      }

      if (
        error.name === "SequelizeDatabaseError" ||
        error.name === "SequelizeForeignKeyConstraintError"
      ) {
        status = 400;
        message = "Invalid input";
      }

      res.status(status).json({ message });
    }
  }

  //   static async readById(req, res) {
  //     try {
  //       const { id } = req.params;
  //       const event = await Event.findByPk(id, {
  //         attributes: {
  //           exclude: ["createdAt", "updatedAt"],
  //         },
  //       });

  //       if (!event) {
  //         throw { name: "NotFound" };
  //       }

  //       res.status(200).json({
  //         massage: "Succeed read detail event",
  //         data: event,
  //       });
  //     } catch (error) {
  //       let status = 500;
  //       let message = "Internal server error";

  //       if (error.name === "NotFound") {
  //         status = 404;
  //         message = "Data not found";
  //       }

  //       res.status(status).json({ message });
  //     }
  //   }

  //   static async delete(req, res) {
  //     try {
  //       console.log("a");
  //       const { id } = req.params;
  //       const event = await Event.findByPk(id, {
  //         attributes: {
  //           exclude: ["createdAt", "updatedAt"],
  //         },
  //       });

  //       if (!event) {
  //         throw { name: "NotFound" };
  //       }

  //       await event.destroy();

  //       res.status(200).json({
  //         massage: "Succeed delete data event",
  //         data: event,
  //       });
  //     } catch (error) {
  //       let status = 500;
  //       let message = "Internal server error";

  //       if (error.name === "NotFound") {
  //         status = 404;
  //         message = "Data not found";
  //       }

  //       res.status(status).json({ message });
  //     }
  //   }

  //   static async update(req, res) {
  //     try {
  //       const { id } = req.params;
  //       const event = await Event.findByPk(id, {
  //         attributes: {
  //           exclude: ["createdAt", "updatedAt"],
  //         },
  //       });

  //       if (!event) {
  //         throw { name: "NotFound" };
  //       }

  //       const {
  //         name,
  //         description,
  //         totalPrize,
  //         eventPoster,
  //         eventDate,
  //         eventType,
  //         GameId,
  //       } = req.body;

  //       await event.update({
  //         name,
  //         description,
  //         totalPrize,
  //         eventPoster,
  //         eventDate,
  //         eventType,
  //         GameId,
  //       });

  //       res.status(200).json({
  //         massage: "Succeed update data event",
  //         data: event,
  //       });
  //     } catch (error) {
  //       let status = 500;
  //       let message = "Internal server error";

  //       if (error.name === "NotFound") {
  //         status = 404;
  //         message = "Data not found";
  //       }

  //       if (error.name === "SequelizeValidationError") {
  //         message = error.errors[0].message;
  //         status = 400;
  //       }

  //       if (
  //         error.name === "SequelizeDatabaseError" ||
  //         error.name === "SequelizeForeignKeyConstraintError"
  //       ) {
  //         status = 400;
  //         message = "Invalid input";
  //       }

  //       res.status(status).json({ message });
  //     }
  //   }

  //   static async updateStatus(req, res) {
  //     try {
  //       const { id } = req.params;
  //       const event = await Event.findByPk(id, {
  //         attributes: {
  //           exclude: ["createdAt", "updatedAt"],
  //         },
  //       });

  //       if (!event) {
  //         throw { name: "NotFound" };
  //       }

  //       const { eventStatus } = req.body;

  //       await event.update({ eventStatus });

  //       res.status(200).json({
  //         massage: "Succeed update event status",
  //         data: event,
  //       });
  //     } catch (error) {
  //       let status = 500;
  //       let message = "Internal server error";

  //       if (error.name === "NotFound") {
  //         status = 404;
  //         message = "Data not found";
  //       }

  //       if (error.name === "SequelizeValidationError") {
  //         message = error.errors[0].message;
  //         status = 400;
  //       }

  //       if (
  //         error.name === "SequelizeDatabaseError" ||
  //         error.name === "SequelizeForeignKeyConstraintError"
  //       ) {
  //         status = 400;
  //         message = "Invalid input";
  //       }

  //       res.status(status).json({ message });
  //     }
  //   }
}

module.exports = LodgingController;
