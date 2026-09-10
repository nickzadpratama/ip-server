const { comparePassword, hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const user = await User.create({
        username,
        email,
        password: hashPassword(password),
      });

      delete user.dataValues.password;
      res.status(200).json({
        message: "Create new User",
        data: user,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) throw { name: "InvalidLogin" };

      const user = await User.findOne({
        where: {
          email,
        },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      if (!user) throw { name: "LoginError" };

      if (!comparePassword(password, user.password))
        throw { name: "LoginError" };

      const payload = {
        id: user.id,
        email: user.email,
      };

      const access_token = signToken(payload);

      res.status(200).json({
        access_token,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = AuthController;
