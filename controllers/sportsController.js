const axios = require("axios");

const API_SPORTS_URL = "https://v3.football.api-sports.io";
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const responseCache = new Map();
const pendingRequests = new Map();

function positiveInteger(value, name) {
  if (
    typeof value !== "string" ||
    !/^[1-9]\d*$/.test(value) ||
    !Number.isSafeInteger(Number(value))
  ) {
    throw {
      name: "InvalidSportsInput",
      message: `${name} must be a positive integer`,
    };
  }
  return Number(value);
}

function teamQuery(query) {
  if (query.id !== undefined) return { id: positiveInteger(query.id, "id") };
  if (
    typeof query.country !== "string" ||
    !query.country.trim() ||
    query.country.trim().length > 80
  ) {
    throw {
      name: "InvalidSportsInput",
      message: "country must be text up to 80 characters",
    };
  }
  return { country: query.country.trim() };
}

function providerError(errors) {
  const messages = Array.isArray(errors)
    ? errors
    : Object.values(errors ?? {}).flat();
  const message = messages.map(String).join(" ");
  return /rate.?limit|quota|request limit/i.test(message)
    ? "Football data provider rate limit reached. Please try again later."
    : "Football data service returned an invalid response";
}

async function getProviderData(path, params) {
  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) {
    throw {
      name: "ServiceUnavailable",
      message: "Football data service is not configured",
    };
  }

  const cacheKey = `${path}?${new URLSearchParams(
    Object.entries(params)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, String(value)]),
  )}`;
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  if (cached) responseCache.delete(cacheKey);
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

  const request = fetchProviderData(path, params, apiKey, cacheKey);
  pendingRequests.set(cacheKey, request);
  try {
    return await request;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

async function fetchProviderData(path, params, apiKey, cacheKey) {
  let response;
  try {
    response = await axios.get(`${API_SPORTS_URL}${path}`, {
      params,
      headers: { "x-apisports-key": apiKey },
      timeout: 10000,
    });
  } catch (error) {
    const status = error.response?.status;
    console.error("API-Sports request failed", {
      status: status ?? "unknown",
    });
    throw {
      name: "ServiceUnavailable",
      message:
        status === 429
          ? "Football data provider rate limit reached. Please try again later."
          : status === 401 || status === 403
            ? "Football data provider rejected its server API key."
            : "Football data service is temporarily unavailable",
    };
  }

  if (
    !Array.isArray(response.data?.response) ||
    (response.data.errors &&
      (Array.isArray(response.data.errors)
        ? response.data.errors.length > 0
        : Object.keys(response.data.errors).length > 0))
  ) {
    throw {
      name: "ServiceUnavailable",
      message: providerError(response.data?.errors),
    };
  }

  while (responseCache.size >= MAX_CACHE_ENTRIES) {
    responseCache.delete(responseCache.keys().next().value);
  }
  responseCache.set(cacheKey, {
    data: response.data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
  return response.data;
}

class SportsController {
  static async teams(req, res, next) {
    try {
      const params = teamQuery(req.query);
      res.json(await getProviderData("/teams", params));
    } catch (error) {
      next(error);
    }
  }

  static async squad(req, res, next) {
    try {
      const team = positiveInteger(req.query.team, "team");
      res.json(await getProviderData("/players/squads", { team }));
    } catch (error) {
      next(error);
    }
  }

  static async playerStatistics(req, res, next) {
    try {
      const id = positiveInteger(req.query.id, "id");
      const season = positiveInteger(req.query.season, "season");
      res.json(await getProviderData("/players", { id, season }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SportsController;
