/**
 * Postinstall patch: fix Expo SDK 52 Android build issues
 * 
 * Patches:
 * 1. @expo/dom-webview/android/build.gradle:
 *    - Add kotlin-android plugin (DomWebViewModule is Kotlin, needs Kotlin compiler)
 *    - Add expo-modules-core dependency
 *    - Add explicit SDK version config
 *    Strategy: overwrite entire file with known-good content (most robust)
 * 
 * 2. expo-modules-core/android/ExpoModulesCorePlugin.gradle:
 *    - Guard components.release with findByName check
 *    Strategy: regex-based replacement (handles whitespace variations)
 */
const fs = require('fs');
const path = require('path');

function log(msg) {
  console.log('[patch-android] ' + msg);
}

// --- Patch 1: @expo/dom-webview/android/build.gradle ---
// Strategy: overwrite entire file with known-good content including Kotlin plugin
function patchDomWebview() {
  const filePath = path.join(__dirname, '..', 'node_modules', '@expo', 'dom-webview', 'android', 'build.gradle');
  
  if (!fs.existsSync(filePath)) {
    log('SKIP: @expo/dom-webview/android/build.gradle not found (package may not be installed)');
    return;
  }

  const original = fs.readFileSync(filePath, 'utf8');
  log('Original @expo/dom-webview/android/build.gradle:');
  original.split('\n').forEach((line, i) => {
    console.log('  ' + (i + 1) + ': ' + line);
  });

  // Extract version and group from original file if possible
  let version = '57.0.1';
  let groupName = 'expo.modules.webview';
  let namespace = 'expo.modules.webview';
  
  const versionMatch = original.match(/version\s*=\s*['"]([^'"]+)['"]/);
  if (versionMatch) version = versionMatch[1];
  
  const groupMatch = original.match(/group\s*=\s*['"]([^'"]+)['"]/);
  if (groupMatch) groupName = groupMatch[1];
  
  const namespaceMatch = original.match(/namespace\s+["']([^"']+)["']/);
  if (namespaceMatch) namespace = namespaceMatch[1];

  // Check if kotlin-android is already in the plugins block
  if (original.includes('kotlin-android')) {
    log('SKIP: kotlin-android already present in dom-webview build.gradle');
    // Still check if dependencies are present
    if (original.includes('expo-modules-core')) {
      log('SKIP: expo-modules-core dependency already present');
      return;
    }
  }

  // Write the fixed content with Kotlin plugin and Expo dependencies
  var fixedContent = "plugins {\n" +
    "  id 'com.android.library'\n" +
    "  id 'kotlin-android'\n" +
    "}\n\n" +
    "group = '" + groupName + "'\n" +
    "version = '" + version + "'\n\n" +
    "android {\n" +
    '  namespace "' + namespace + '"\n\n' +
    "  // SDK versions\n" +
    "  compileSdkVersion rootProject.ext.compileSdkVersion\n" +
    "  buildToolsVersion rootProject.ext.buildToolsVersion\n\n" +
    "  defaultConfig {\n" +
    "    minSdkVersion rootProject.ext.minSdkVersion\n" +
    "    targetSdkVersion rootProject.ext.targetSdkVersion\n" +
    "    versionCode 1\n" +
    '    versionName "' + version + '"\n' +
    "  }\n" +
    "}\n\n" +
    "// Dependencies for Expo module compilation (no apply from: to avoid path issues)\n" +
    "dependencies {\n" +
    "  implementation project(':expo-modules-core')\n" +
    "  implementation 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.9.24'\n" +
    "}\n";

  fs.writeFileSync(filePath, fixedContent, 'utf8');
  log('PATCHED: @expo/dom-webview/android/build.gradle (added kotlin-android + direct dependencies)');
}

// --- Patch 2: expo-modules-core/android/ExpoModulesCorePlugin.gradle ---
// Strategy: regex-based replacement for robustness
function patchExpoModulesCore() {
  const filePath = path.join(__dirname, '..', 'node_modules', 'expo-modules-core', 'android', 'ExpoModulesCorePlugin.gradle');
  
  if (!fs.existsSync(filePath)) {
    log('SKIP: expo-modules-core/android/ExpoModulesCorePlugin.gradle not found');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if already patched
  if (content.includes("findByName('release')") || content.includes('findByName("release")')) {
    log('SKIP: ExpoModulesCorePlugin.gradle already patched (findByName found)');
    return;
  }

  // Strategy: find release(MavenPublication) { ... from components.release ... } and wrap it
  var releaseRegex = /(\s*)release\s*\(\s*MavenPublication\s*\)\s*\{([\s\S]*?)from\s+components\.release([\s\S]*?)\}/;
  
  if (releaseRegex.test(content)) {
    content = content.replace(releaseRegex, function(match, indent1, inner1, inner2) {
      return indent1 + "if (components.findByName('release') != null) {" +
        indent1 + "  release(MavenPublication) {" +
        inner1 + "  from components.release" +
        inner2 + "  }" +
        indent1 + "}";
    });
    fs.writeFileSync(filePath, content, 'utf8');
    log('PATCHED: ExpoModulesCorePlugin.gradle (regex-based)');
  } else {
    // Fallback: line-by-line approach
    var lines = content.split('\n');
    var modified = false;
    
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].includes('from components.release')) {
        var releaseStart = -1;
        for (var j = i - 1; j >= 0; j--) {
          if (lines[j].includes('release(') && lines[j].includes('MavenPublication')) {
            releaseStart = j;
            break;
          }
        }
        
        if (releaseStart >= 0) {
          var braceCount = 0;
          var releaseEnd = -1;
          for (var j = releaseStart; j < lines.length; j++) {
            for (var k = 0; k < lines[j].length; k++) {
              if (lines[j][k] === '{') braceCount++;
              if (lines[j][k] === '}') braceCount--;
              if (braceCount === 0 && j > releaseStart) {
                releaseEnd = j;
                break;
              }
            }
            if (releaseEnd >= 0) break;
          }
          
          if (releaseEnd >= 0) {
            var indent = lines[releaseStart].match(/^\s*/)[0];
            var blockLines = lines.slice(releaseStart, releaseEnd + 1);
            var wrappedLines = [
              indent + "if (components.findByName('release') != null) {",
            ];
            for (var b = 0; b < blockLines.length; b++) {
              wrappedLines.push(blockLines[b].replace(/^(\s*)/, indent + '  $1'));
            }
            wrappedLines.push(indent + "}");
            
            lines.splice(releaseStart, blockLines.length, ...wrappedLines);
            modified = true;
            break;
          }
        }
      }
    }
    
    if (modified) {
      content = lines.join('\n');
      fs.writeFileSync(filePath, content, 'utf8');
      log('PATCHED: ExpoModulesCorePlugin.gradle (line-by-line fallback)');
    } else {
      log('WARNING: Could not find release(MavenPublication) block in ExpoModulesCorePlugin.gradle');
    }
  }
}

// --- Scan for other modules using expo-module-gradle-plugin ---
function scanForGradlePlugin(dir) {
  if (!fs.existsSync(dir)) return;
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanForGradlePlugin(fullPath);
    } else if (entry.name.endsWith('.gradle')) {
      var content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('expo-module-gradle-plugin')) {
        var relPath = path.relative(path.join(__dirname, '..', 'node_modules'), fullPath);
        log('WARNING: ' + relPath + ' references expo-module-gradle-plugin');
        var fixed = content.replace(/id\s+'expo-module-gradle-plugin'\n?/, '');
        if (!fixed.includes('compileSdkVersion') && fixed.includes('android {')) {
          fixed = fixed.replace(
            /(android\s*\{)/,
            '$1\n  compileSdkVersion rootProject.ext.compileSdkVersion\n  buildToolsVersion rootProject.ext.buildToolsVersion'
          );
        }
        if (!fixed.includes('minSdkVersion') && fixed.includes('defaultConfig {')) {
          fixed = fixed.replace(
            /(defaultConfig\s*\{)/,
            '$1\n    minSdkVersion rootProject.ext.minSdkVersion\n    targetSdkVersion rootProject.ext.targetSdkVersion'
          );
        }
        fs.writeFileSync(fullPath, fixed, 'utf8');
        log('  PATCHED: ' + relPath);
      }
    }
  }
}

// --- Main ---
log('Applying Android build fixes...');
patchDomWebview();
patchExpoModulesCore();

log('Scanning for other modules using expo-module-gradle-plugin...');
var nodeModulesDir = path.join(__dirname, '..', 'node_modules');

var expoPackagesDir = path.join(nodeModulesDir, '@expo');
if (fs.existsSync(expoPackagesDir)) {
  var packages = fs.readdirSync(expoPackagesDir);
  for (var i = 0; i < packages.length; i++) {
    var gradlePath = path.join(expoPackagesDir, packages[i], 'android', 'build.gradle');
    if (fs.existsSync(gradlePath)) {
      var content = fs.readFileSync(gradlePath, 'utf8');
      if (content.includes('expo-module-gradle-plugin') && !content.includes('findByName')) {
        log('WARNING: @expo/' + packages[i] + '/android/build.gradle still references expo-module-gradle-plugin');
        var fixed = content.replace(/id\s+'expo-module-gradle-plugin'\n?/, '');
        if (!fixed.includes('compileSdkVersion')) {
          fixed = fixed.replace(
            /(android\s*\{)/,
            '$1\n  compileSdkVersion rootProject.ext.compileSdkVersion\n  buildToolsVersion rootProject.ext.buildToolsVersion'
          );
        }
        fs.writeFileSync(gradlePath, fixed, 'utf8');
        log('  PATCHED: @expo/' + packages[i] + '/android/build.gradle');
      }
    }
  }
}

scanForGradlePlugin(path.join(nodeModulesDir, 'expo-modules-core', 'android'));

log('Done.');
