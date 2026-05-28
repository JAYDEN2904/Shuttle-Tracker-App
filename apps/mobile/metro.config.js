const { getDefaultConfig } = require("expo/metro-config");
const { resolve: metroResolve } = require("metro-resolver");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(monorepoRoot, "node_modules"),
  path.resolve(projectRoot, "node_modules"),
];

function shouldUsePackageExports(moduleName) {
  return (
    moduleName === "@posthog/core" ||
    moduleName.startsWith("@posthog/core/") ||
    moduleName === "posthog-react-native" ||
    moduleName.startsWith("posthog-react-native/")
  );
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "nanoid/non-secure") {
    return {
      type: "sourceFile",
      filePath: path.resolve(projectRoot, "src/shims/nanoid-non-secure.js"),
    };
  }

  if (shouldUsePackageExports(moduleName)) {
    return metroResolve(
      {
        ...context,
        unstable_enablePackageExports: true,
        unstable_conditionNames: [
          "require",
          "react-native",
          "import",
          "default",
        ],
      },
      moduleName,
      platform
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
