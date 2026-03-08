import { faker } from '@faker-js/faker';

export default () => ({
  users: faker.helpers.multiple(
    idx => ({
      id: idx,
      name: faker.person.fullName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      website: faker.internet.url(),
    }),
    { count: 10 },
  ),
});
