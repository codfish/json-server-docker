export = (req, res, next) => {
  res.set('X-Middleware-B', 'is applied!');

  next();
};
