const { comparePassword, hashPassword } = require("../helpers/bcrypt");
const { signToken, verifyToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const crypto = require("crypto");
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

  static async googleLogin(req, res, next) {
    try {
      const client = new OAuth2Client();
      const token = req.headers.token;

      if (!token) throw { name: "LoginError" };

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience:
          process.env.GOOGLE_CLIENT_ID ||
          "778334040842-f1npb34334aearksr30upc1prhv6scbd.apps.googleusercontent.com",
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
      // Token Google invalid/kedaluwarsa gagal verifikasi → 401 (bukan
      // 500), mengikuti konvensi googleLogin di folder example.
      next({ name: "LoginError" });
    }
  }

  static async facebookLogin(req, res, next) {
    try {
      const token = req.headers.token;

      if (!token) throw { name: "LoginError" };

      // appsecret_proof: HMAC-SHA256 dari access token memakai App Secret —
      // wajib bila app Facebook mengaktifkan "Require App Secret".
      const appSecret =
        process.env.FACEBOOK_APP_SECRET ||
        "3c15ea1fb56da1aaf2b5edd047dbf190";
      const appSecretProof = crypto
        .createHmac("sha256", appSecret)
        .update(token)
        .digest("hex");

      // Verifikasi access token & ambil profil pemiliknya via Graph API.
      const { data: profile } = await axios.get(
        "https://graph.facebook.com/me",
        {
          params: {
            fields: "id,name,email",
            access_token: token,
            appsecret_proof: appSecretProof,
          },
        },
      );

      if (!profile.email) throw { name: "LoginError" };

      const [user] = await User.findOrCreate({
        where: { email: profile.email },
        defaults: {
          username: profile.name || profile.email.split("@")[0],
          email: profile.email,
          password: hashPassword("login_with_facebook"),
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
      if (axios.isAxiosError(error)) {
        // Token invalid/kedaluwarsa ditolak Graph API → 401, bukan 500.
        next({ name: "LoginError" });
      } else {
        next(error);
      }
    }
  }
}

module.exports = AuthController;
