const mongoose = require("mongoose");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const parsePagination = (query, defaults = { page: 1, limit: 10, maxLimit: 100 }) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || defaults.page);
  const limit = Math.min(defaults.maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaults.limit));
  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const normalizeString = (value, max = 5000) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
};

const requireFields = (obj, fields) => {
  const missing = fields.filter((k) => obj[k] === undefined || obj[k] === null || String(obj[k]).trim() === "");
  return { ok: missing.length === 0, missing };
};

const monthKey = (d = new Date()) => {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

module.exports = {
  isValidObjectId,
  parsePagination,
  normalizeString,
  requireFields,
  monthKey
};
