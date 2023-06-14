export = (req, res, next) => {
  res.set('X-Middleware-A', 'is applied!');

  next();
};
