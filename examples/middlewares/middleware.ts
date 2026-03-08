export default (req, res, next) => {
  res.set('X-Middleware-A', 'is applied!');
  res.set('X-Middleware-B', 'is applied!');

  next();
};
