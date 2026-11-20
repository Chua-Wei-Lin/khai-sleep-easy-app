module.exports = ({ config }) => {
  const variant = process.env.APP_VARIANT || process.env.EXPO_PUBLIC_APP_VARIANT || "patient";
  const isDistributor = variant === "distributor";

  return {
    ...config,
    name: isDistributor ? "SleepEasy Distributor" : "SleepEasy Patient",
    slug: "sleep-easy-app",
    scheme: "sleep-easy-app",
    version: "1.3.4",
    orientation: "portrait",
    icon: "./assets/sleepeasylogo-android.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/sleepeasylogo-android.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: isDistributor
        ? "com.sleepeasy.app.distributor"
        : "com.sleepeasy.app.patient",
      infoPlist: {
        NSBluetoothAlwaysUsageDescription:
          "SleepEasy requires Bluetooth to connect to and sync data from your O2Ring device.",
        NSBluetoothPeripheralUsageDescription:
          "SleepEasy requires Bluetooth access to discover nearby O2Ring devices.",
        UIBackgroundModes: ["bluetooth-central"],
        UIApplicationSceneManifest: {
          UIApplicationSupportsMultipleScenes: false,
          UISceneConfigurations: {
            UIWindowSceneSessionRoleApplication: [
              {
                UISceneConfigurationName: "Default Configuration",
                UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
              },
            ],
          },
        },
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/sleepeasylogo-android.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: isDistributor
        ? "com.sleepeasy.app.distributor"
        : "com.sleepeasy.app.patient",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "./packages/viatom-o2ring/plugin",
      "./app.plugin.js",
      "expo-router",
      "expo-font",
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
            ndkVersion: "26.1.10909125",
            packagingOptions: {
              pickFirst: ["**/libreactnative.so", "**/libc++_shared.so"],
            },
            abiFilters: ["arm64-v8a", "x86_64"],
          },
        },
      ],
      [
        "expo-share-intent",
        {
          iosActivationRules: {
            NSExtensionActivationSupportsFileWithMaxCount: 1,
          },
          androidIntentFilters: ["*/*"],
        },
      ],
    ],
    extra: {
      appVariant: isDistributor ? "distributor" : "patient",
      eas: {
        projectId: "fb24647a-0e66-494f-b8a2-17e2efd6656e",
      },
    },
  };
};
