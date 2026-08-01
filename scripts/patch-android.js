/**
 * Postinstall patch: fix Expo SDK 52 Android build issues
 * 1. Remove expo-module-gradle-plugin reference from @expo/dom-webview
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

// 1. Fix @expo/dom-webview: remove expo-module-gradle-plugin
const domWebviewGradle = path.join(__dirname, '..', 'node_modules', '@expo', 'dom-webview', 'android', 'build.gradle');
patchFile(
  domWebviewGradle,
  `plugins {
  id 'com.android.library'
  id 'expo-module-gradle-plugin'
}`,
  `plugins {
  id 'com.android.library'
}`
);

// 2. Fix ExpoModulesCorePlugin: guard components.release
const expoPluginGradle = path.join(__dirname, '..', 'node_modules', 'expo-modules-core', 'android', 'ExpoModulesCorePlugin.gradle');
const pluginContent = fs.readFileSync(expoPluginGradle, 'utf8');
const releasePattern = 'release(MavenPublication) {\n          from components.release\n        }';
const releaseReplacement = "if (components.findByName('release') != null) {\n          release(MavenPublication) {\n            from components.release\n          }\n        }";
patchFile(expoPluginGradle, releasePattern, releaseReplacement);

console.log('[patch-android] Done.');