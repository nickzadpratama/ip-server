const errorHandler = (err, req, res, next) => {
  let status = 500;
  let message = "Internal server error";

  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    status = 400;
    message = err.errors[0].message;
  }

  if (
    err.name === "SequelizeDatabaseError" ||
    err.name === "SequelizeForeignKeyConstraintError"
  ) {
    status = 400;
    message = "Invalid input";
  }

  if (err.name === "InvalidLogin") {
    status = 401;
    message = "Please input email or password";
  }

  if (err.name === "LoginError") {
    status = 401;
    message = "Invalid email or password";
  }

  if (err.name === "FacebookLoginError") {
    status = 401;
    message = "Facebook login failed. Check the Facebook app configuration and try again.";
  }

  if (err.name === "FacebookEmailRequired") {
    status = 400;
    message = "Facebook did not provide an email address. Grant the email permission and try again.";
  }

  if (err.name === "InvalidInput") {
    status = 400;
    message = "Input is required";
  }

  if (err.name === "ChatInputTooLong") {
    status = 400;
    message = "Message must be 500 characters or fewer";
  }

  if (err.name === "Unauthorized" || err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Please login first";
  }

  if (err.name === "Forbidden") {
    status = 403;
    message = "You don't have any access";
  }

  if (err.name === "NotFound") {
    status = 404;
    message = "Data not found";
  }

  if (err.name === "ServiceUnavailable") {
    status = 503;
    message = err.message || "Service temporarily unavailable";
  }

  if (err.name === "InvalidMembershipInput") {
    status = 400;
    message = err.message;
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;
