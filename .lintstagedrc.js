module.exports = {
  '*.{json}': ['prettier --write', 'git add'],
  '*.md': ['prettier --write', 'markdownlint', 'git add'],
  '*.js': ['eslint --fix', 'git add'],
};
