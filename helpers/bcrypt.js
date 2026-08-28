const bcrypt = require("bcryptjs");

const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  return hash;
};

const comparePassword = (pass, hashedPass) => {
  return bcrypt.compareSync(pass, hashedPass);
};

module.exports = { hashPassword, comparePassword };
