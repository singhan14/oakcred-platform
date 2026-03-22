/**
 * Firm data isolation middleware.
 * Automatically injects firmId filter into req so controllers
 * always scope queries to the authenticated user's firm.
 */
const firmIsolation = (req, res, next) => {
  if (req.user && req.user.firmId) {
    req.firmId = req.user.firmId;
  }
  next();
};

module.exports = firmIsolation;
