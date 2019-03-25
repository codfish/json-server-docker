/**
 * This is a the main database file. It's meant to be mounted over.
 */
module.exports = () => ({
  posts: [{ id: 1, title: 'json-server', author: 'typicode' }],
  comments: [{ id: 1, body: 'some comment', postId: 1 }],
  profile: { name: 'typicode' },
});
