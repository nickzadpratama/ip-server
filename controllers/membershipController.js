const axios = require("axios");
const { FanClub, FanClubMembership, sequelize } = require("../models");

function externalId(raw) {
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) > 2147483647) {
    throw { name: "InvalidMembershipInput", message: "Team ID must be a positive integer" };
  }
  return Number(raw);
}

async function lookupClub(id) {
  if (!process.env.API_SPORTS_KEY) {
    throw { name: "ServiceUnavailable", message: "Fan club lookup is not configured" };
  }
  let data;
  try {
    ({ data } = await axios.get("https://v3.football.api-sports.io/teams", {
      params: { id }, headers: { "x-apisports-key": process.env.API_SPORTS_KEY }, timeout: 10000,
    }));
  } catch {
    throw { name: "ServiceUnavailable", message: "Unable to verify this club. Please try again." };
  }
  if (!Array.isArray(data?.response) || Object.keys(data?.errors ?? {}).length) {
    throw { name: "ServiceUnavailable", message: "Unable to verify this club. Please try again." };
  }
  const entry = data.response.find((item) => item.team?.id === id);
  if (!entry) throw { name: "NotFound" };
  if (!entry.team.name) throw { name: "ServiceUnavailable", message: "Club details are unavailable" };
  const { team, venue = {} } = entry;
  return {
    name: team.name, code: team.code ?? null, logo: team.logo ?? null,
    founded: team.founded ?? null, national: team.national ?? false,
    stadium: venue.name ?? null, city: venue.city ?? null,
    capacity: venue.capacity ?? null, image: venue.image ?? null,
  };
}

class MembershipController {
  static async detail(req, res, next) {
    try {
      const id = externalId(req.params.externalTeamId);
      const membership = await FanClubMembership.findOne({
        where: { UserId: req.loginInfo.userId },
        include: [{ model: FanClub, where: { provider: "api-sports", externalTeamId: id } }],
      });
      if (!membership) throw { name: "NotFound" };
      res.json({ message: "Your team details", data: membership });
    } catch (error) { next(error); }
  }

  static async update(req, res, next) {
    try {
      const id = externalId(req.params.externalTeamId);
      const membership = await FanClubMembership.findOne({
        where: { UserId: req.loginInfo.userId },
        include: [{ model: FanClub, where: { provider: "api-sports", externalTeamId: id } }],
      });
      if (!membership) throw { name: "NotFound" };
      const details = {};
      const invalid = (message) => { throw { name: "InvalidMembershipInput", message }; };
      for (const key of ["name", "code", "stadium", "city"]) {
        const value = req.body[key];
        if (typeof value !== "string" || value.trim().length > 255) invalid(`${key} must be text up to 255 characters`);
        details[key] = key === "code" ? value.trim().toUpperCase() : value.trim();
      }
      if (details.name.length < 2) invalid("Team name must be at least 2 characters");
      for (const key of ["founded", "capacity"]) {
        const raw = req.body[key];
        if (raw === "" || raw === null) { details[key] = null; continue; }
        if ((typeof raw !== "string" && typeof raw !== "number") || String(raw).trim() === "") invalid(`${key} must be an integer`);
        const value = Number(raw);
        if (!Number.isInteger(value) || value < 0 || value > 2147483647) invalid(`${key} must be a non-negative integer`);
        if (key === "founded" && (value < 1800 || value > 2100)) invalid("Founded must be between 1800 and 2100");
        details[key] = value;
      }
      await membership.update({ details });
      res.json({ message: "Your team updated successfully", data: membership });
    } catch (error) { next(error); }
  }

  static async list(req, res, next) {
    try {
      const memberships = await FanClubMembership.findAll({
        where: { UserId: req.loginInfo.userId },
        include: [{ model: FanClub }], order: [["createdAt", "DESC"], ["id", "DESC"]],
      });
      res.json({ message: "Your fan clubs", data: memberships });
    } catch (error) { next(error); }
  }

  static async join(req, res, next) {
    try {
      const id = externalId(req.params.externalTeamId);
      const where = { provider: "api-sports", externalTeamId: id };
      const existing = await FanClub.findOne({ where });
      const details = existing ? null : await lookupClub(id);
      const result = await sequelize.transaction(async (transaction) => {
        const club = existing ?? (await FanClub.findOrCreate({
          where, defaults: details, transaction,
        }))[0];
        const [membership, created] = await FanClubMembership.findOrCreate({
          where: { UserId: req.loginInfo.userId, FanClubId: club.id }, transaction,
        });
        return { created, data: { ...membership.toJSON(), FanClub: club.toJSON() } };
      });
      res.status(result.created ? 201 : 200).json({
        message: result.created ? "Joined fan club" : "Already a member", data: result.data,
      });
    } catch (error) { next(error); }
  }

  static async leave(req, res, next) {
    try {
      const id = externalId(req.params.externalTeamId);
      const club = await FanClub.findOne({ where: { provider: "api-sports", externalTeamId: id } });
      if (club) await FanClubMembership.destroy({
        where: { UserId: req.loginInfo.userId, FanClubId: club.id },
      });
      res.status(204).end();
    } catch (error) { next(error); }
  }
}

module.exports = MembershipController;
