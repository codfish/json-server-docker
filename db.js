const { faker } = require('@faker-js/faker');

/**
 * This is a the main database file. It's meant to be mounted over.
 */
module.exports = () => ({
  posts: faker.helpers.multiple(
    () => ({
      id: faker.datatype.uuid(),
      title: faker.lorem.words(3),
      body: faker.lorem.paragraphs(3),
    }),
    { count: 100 },
  ),
  comments: [{ id: 1, body: 'some comment', postId: 1 }],
  profile: { name: 'typicode' },
});
