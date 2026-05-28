module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
            "@/components": "./src/components",
            "@/hooks": "./src/hooks",
            "@/lib": "./src/lib",
            "@/store": "./src/store",
            "@/types": "./src/types",
            "@/utils": "./src/utils",
            "@/services": "./src/services",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
