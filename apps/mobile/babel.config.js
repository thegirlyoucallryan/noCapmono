module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    "plugins": [
      ["module:react-native-dotenv", {
        moduleName: '@env',
        path: '.env',
        blocklist: null,
      
        safe: false,
        systemvars: false,
        allowUndefined: true,
        verbose: false,
      }],
      'react-native-reanimated/plugin'
    ]
  };
};
