const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Native development keeps the iOS styling workaround. Web preview uses
  // virtual modules to avoid unnecessary filesystem churn during bundling.
  forceWriteFileSystem: process.env.EXPO_WEB_PREVIEW !== "1",
});
