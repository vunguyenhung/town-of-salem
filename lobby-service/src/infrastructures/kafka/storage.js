/* eslint-disable prefer-const */
const createStorage = () => {
  let producers = [];
  let consumers = [];
  return {
    producers,
    consumers,
  };
};

exports.storage = createStorage();
