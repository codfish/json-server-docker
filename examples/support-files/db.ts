import { faker } from '@faker-js/faker';

import generateDog from './fixtures/dogs.js';

export default () => ({
  dags: faker.helpers.multiple(generateDog, { count: 10 }),
});
