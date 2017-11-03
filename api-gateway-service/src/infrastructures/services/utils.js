// TODO: remove this
const R = require('ramda');

const trace = (something) => {
  console.log(something);
  return something;
};

// flattenObj :: Any -> String
const flattenObj = (obj) => {
  const go = obj_ => R.chain(([k, v]) => {
    if (typeof v === 'object') {
      return R.map(([k_, v_]) => [`${k}-${k_}`, v_], go(v));
    }
    return [[k, v]];
  }, R.toPairs(obj_));

  return R.pipe(
    go,
    R.flatten,
    R.join('-'),
  )(obj);
};

module.exports = {
  trace,
  flattenObj,
};
