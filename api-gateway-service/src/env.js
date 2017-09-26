const DEFAULT_ENV = {
  APP_PORT: '3000',
  NODE_ENV: 'local',
};

function improveEnv(env) {
  return { ...DEFAULT_ENV, ...env };
}

exports.imroveEnv = improveEnv;
