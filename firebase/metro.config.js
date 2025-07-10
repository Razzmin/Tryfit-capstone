const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.extraNodeModules = {
    'firebase/auth': require.resolve('firebase/auth/react-native'),
  };
  return config;
})();
