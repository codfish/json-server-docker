import Chance from 'chance';
import times from 'lodash/times';
import emoji from 'node-emoji';

const chance = new Chance();

export default () => ({
  animals: times(100, idx => {
    const animal = chance.animal({ type: 'pet' }).replace(/s$/, '').split(' ').pop().toLowerCase();

    return {
      id: idx + 1,
      animal,
      emoji: emoji.find(animal)?.emoji || '🦄',
      name: chance.name({ middle: true }),
    };
  }),
});
