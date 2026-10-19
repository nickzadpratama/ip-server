const { comparePassword, hashPassword } = require("../helpers/bcrypt");
const { signToken, verifyToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const crypto = require("crypto");
const { User } = require("../models");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

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

  static async googleLogin(req, res, next) {
    try {
      const token = req.headers.token;

      if (!GOOGLE_CLIENT_ID) {
        throw {
          name: "ServiceUnavailable",
          message:
            "Google Sign In not configured. Please set GOOGLE_CLIENT_ID in environment variables.",
        };
      }

      if (!token) throw { name: "LoginError" };

      const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });

      const gpayload = ticket.getPayload();
      const [user] = await User.findOrCreate({
        where: { email: gpayload.email },
        defaults: {
          username: gpayload.name || gpayload.email.split("@")[0],
          email: gpayload.email,
          password: hashPassword("login_with_google"),
        },
      });

      const payload = {
        id: user.id,
        email: user.email,
      };

      const access_token = signToken(payload);
      console.log(access_token);

      res.status(200).json({
        access_token,
      });
    } catch (error) {
      console.log(error);
      if (error.name === "ServiceUnavailable") {
        return next(error);
      }

      next({ name: "LoginError" });
    }
  }

  static async facebookLogin(req, res, next) {
    try {
      const token = req.headers.token;

      if (!token) throw { name: "LoginError" };

      const params = {
        fields: "id,name,email",
        access_token: token,
      };

      if (process.env.FACEBOOK_APP_SECRET) {
        params.appsecret_proof = crypto
          .createHmac("sha256", process.env.FACEBOOK_APP_SECRET)
          .update(token)
          .digest("hex");
      }

      const { data: profile } = await axios.get(
        "https://graph.facebook.com/me",
        { params },
      );

      if (!profile.email) throw { name: "FacebookEmailRequired" };

      const [user] = await User.findOrCreate({
        where: { email: profile.email },
        defaults: {
          username: profile.name || profile.email.split("@")[0],
          email: profile.email,
          password: hashPassword(crypto.randomBytes(32).toString("hex")),
        },
      });

      const payload = {
        id: user.id,
        email: user.email,
      };

      const access_token = signToken(payload);

      res.status(200).json({
        access_token,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        next({ name: "FacebookLoginError" });
      } else {
        next(error);
      }
    }
  }
}

module.exports = AuthController;
