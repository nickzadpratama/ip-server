const { User, Lodging, Type } = require("../models");

const authorization = async (req, res, next) => {
  try {
    const { userId, role } = req.loginInfo;

    if (role === "staff") {
      if (req.originalUrl === "/add-user") throw { name: "Forbidden" };

      const { id } = req.params;
      const lodging = await Lodging.findByPk(id);

      if (!lodging) throw { name: "NotFound" };

      const user = await User.findByPk(userId);

      if (!user) throw { name: "Forbidden" };

      if (user.id !== lodging.authorId) throw { name: "Forbidden" };
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authorization;
