// TEMPORARY - fakes a logged-in buyer until real auth (Dev 1) is ready
module.exports = (req, res, next) => {
  req.user = { id: '000000000000000000000001' };
  next();
};