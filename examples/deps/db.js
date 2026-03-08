import Chance from 'chance';
import emoji from 'node-emoji';

const chance = new Chance();

export default () => ({
  animals: Array.from({ length: 100 }, (_, idx) => {
    const animal = chance.animal({ type: 'pet' }).replace(/s$/, '').split(' ').pop().toLowerCase();

    return {
      id: idx + 1,
      animal,
      emoji: emoji.find(animal)?.emoji || '🦄',
      name: chance.name({ middle: true }),
    };
  }),
});
