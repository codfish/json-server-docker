import { faker } from '@faker-js/faker';

export default () => ({
  users: faker.helpers.multiple(
    () => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      website: faker.internet.url(),
    }),
    { count: 10 },
  ),
});
