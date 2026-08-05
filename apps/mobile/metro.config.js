// Learn more https://docs.expo.io/guides/customizing-metro
// SDK 54+ configures monorepo watchFolders automatically — don't override them.
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(projectRoot);

// Monorepo has React 18 (web) + React 19 (mobile). Also polluted by ~/node_modules.
// Force every react* import to the mobile app's single copy.
const reactSingletons = new Set([
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react/compiler-runtime",
  "react-native",
]);

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    reactSingletons.has(moduleName) ||
    moduleName.startsWith("react-native/")
  ) {
    return {
      type: "sourceFile",
      filePath: require.resolve(moduleName, { paths: [projectRoot] }),
    };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
