module.exports = {
  '*.{json,md}': ['prettier --write', 'git add'],
  '*.js': ['eslint --fix', 'git add'],
};
