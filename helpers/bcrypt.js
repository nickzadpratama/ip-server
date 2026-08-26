const bcrypt = require("bcryptjs");

const hashPassword = (payload) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(payload, salt);

  return hash;
};

module.exports = { hashPassword };
