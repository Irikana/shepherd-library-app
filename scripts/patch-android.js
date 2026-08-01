/**
 * Postinstall patch: fix Expo SDK 52 Android build issues
 * 1. Replace @expo/dom-webview build.gradle: remove expo-module-gradle-plugin
 *    and add explicit SDK version config (plugin provided these via useDefaultAndroidSdkVersions)
 * 2. Guard components.release in ExpoModulesCorePlugin.gradle
 */
const fs = require('fs');
const path = require('path');

function patchFile(filePath, search, replace) {
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP (not found): ${path.basename(filePath)}`);
    return false;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(search)) {
    console.log(`  SKIP (already patched or pattern not found): ${path.basename(filePath)}`);
    return false;
  }
  const updated = content.replace(search, replace);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log(`  PATCHED: ${path.basename(filePath)}`);
  return true;
}

console.log('[patch-android] Applying Android build fixes...');

// 1. Fix @expo/dom-webview: replace entire plugins+android block
const domWebviewGradle = path.join(__dirname, '..', 'node_modules', '@expo', 'dom-webview', 'android', 'build.gradle');
patchFile(
  domWebviewGradle,
  `plugins {
  id 'com.android.library'
  id 'expo-module-gradle-plugin'
}

group = 'expo.modules.webview'
version = '57.0.1'

android {
  namespace "expo.modules.webview"
  defaultConfig {
    versionCode 1
    versionName "57.0.1"
  }
}`,
  `plugins {
  id 'com.android.library'
}

group = 'expo.modules.webview'
version = '57.0.1'

android {
  namespace "expo.modules.webview"

  // SDK versions (normally provided by expo-module-gradle-plugin via useDefaultAndroidSdkVersions)
  compileSdkVersion rootProject.ext.compileSdkVersion
  buildToolsVersion rootProject.ext.buildToolsVersion

  defaultConfig {
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 1
    versionName "57.0.1"
  }
}`
);

// 2. Fix ExpoModulesCorePlugin: guard components.release
const expoPluginGradle = path.join(__dirname, '..', 'node_modules', 'expo-modules-core', 'android', 'ExpoModulesCorePlugin.gradle');
const releasePattern = 'release(MavenPublication) {\n          from components.release\n        }';
const releaseReplacement = "if (components.findByName('release') != null) {\n          release(MavenPublication) {\n            from components.release\n          }\n        }";
patchFile(expoPluginGradle, releasePattern, releaseReplacement);

console.log('[patch-android] Done.');