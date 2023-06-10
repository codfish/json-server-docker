import { faker } from '@faker-js/faker';
import generateDog from './fixtures/dogs';

export = () => ({
  dags: faker.helpers.multiple(generateDog, { count: 10 }),
});
