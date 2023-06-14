import { faker } from '@faker-js/faker';

interface Database {
  posts: Array<{
    id: string;
    title: string;
    body: string;
  }>;
}

export = (): Database => ({
  posts: faker.helpers.multiple(
    () => ({
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      body: faker.lorem.paragraphs(3),
    }),
    { count: 10 },
  ),
});
