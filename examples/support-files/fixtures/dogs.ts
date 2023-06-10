import { faker } from '@faker-js/faker';

/**
 * Generates a fake dog..
 *
 * @param overrides - Optional override values.
 * @returns - Fake dog.
 */
export = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.firstName(),
  dob: faker.date.past({ years: 10 }).toISOString(),
  breed: faker.animal.dog(),
  ...overrides,
});
