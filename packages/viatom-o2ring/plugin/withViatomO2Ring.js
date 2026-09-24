const { withProjectBuildGradle } = require('@expo/config-plugins');

const withViatomO2Ring = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const flatDirConfig = `
allprojects {
    repositories {
        flatDir {
            dirs "$rootDir/../packages/viatom-o2ring/android/libs"
        }
    }
}`;
      if (!config.modResults.contents.includes('packages/viatom-o2ring/android/libs')) {
        config.modResults.contents += flatDirConfig;
      }
    }
    return config;
  });
};

module.exports = withViatomO2Ring;