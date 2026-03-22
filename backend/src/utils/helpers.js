const crypto = require('crypto');

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function paginate(query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return { ...query, skip, take: limit };
}

function paginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}

module.exports = { generateToken, generateOTP, paginate, paginationMeta };
