// 图片上传：从相册选图（原图不压缩）上传到仓库指定图片目录
// 支持：选图预览、目标目录选择/自定义、文件名指定、上传后复制网站相对链接
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { putFile } from '../src/lib/github-client';
import { SPACING, useTheme, type Palette } from '../src/theme';

/** 预设上传目录（白名单，避免写入仓库任意位置） */
const TARGET_DIRS = [
  { label: 'image/poster/ 海报', value: 'image/poster/' },
  { label: 'image/ 根目录', value: 'image/' },
  { label: 'docs/paper-figures/ 论文配图', value: 'docs/paper-figures/' },
];

/** 文件名非法字符（仓库路径安全） */
const INVALID_PATH_CHARS = /[\\/\u0000-\u001f<>:"|?*]|\.\./;

export default function ImageUploadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [uri, setUri] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [pickedName, setPickedName] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [targetDir, setTargetDir] = useState(TARGET_DIRS[0].value);
  const [uploading, setUploading] = useState(false);
  const [lastPath, setLastPath] = useState<string | null>(null);

  // 选图时自动带出文件名，用户可修改
  useEffect(() => {
    if (pickedName && !fileName) {
      // 去掉路径只留文件名
      const n = pickedName.split('/').pop() || '';
      setFileName(n);
    }
  }, [pickedName, fileName]);

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        base64: true,
      });
      if (res.canceled || !res.assets?.length) return;
      const asset = res.assets[0];
      if (!asset.base64) {
        Alert.alert('选图失败', '未能读取所选图片的数据，请换一张图片重试。');
        return;
      }
      setUri(asset.uri);
      setBase64(asset.base64);
      setPickedName(asset.fileName ?? '');
      setFileName(asset.fileName ?? '');
      setLastPath(null);
    } catch (err) {
      Alert.alert('选图失败', `无法读取所选图片，请重试。\n\n${(err as Error).message}`);
    }
  };

  const handleUpload = async () => {
    if (!base64) {
      Alert.alert('请先选择图片');
      return;
    }
    const fn = fileName.trim();
    if (!fn) {
      Alert.alert('文件名不能为空');
      return;
    }
    if (INVALID_PATH_CHARS.test(fn)) {
      Alert.alert('文件名不合法', '文件名不能包含 / \\ : * ? " < > | 等字符或 ..');
      return;
    }
    const fullPath = targetDir + fn;
    setUploading(true);
    try {
      await putFile(fullPath, base64, {
        message: `上传图片：${fullPath}（移动端 App）`,
        contentIsBase64: true,
      });
      setUploading(false);
      setLastPath(fullPath);
      Alert.alert(
        '上传成功',
        `图片已上传：${fullPath}\n\n网站相对路径：./${fullPath}\n约 1-2 分钟后可访问。`,
        [{ text: '完成' }],
      );
    } catch (err) {
      setUploading(false);
      Alert.alert('上传失败', (err as Error).message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* 选图 */}
        <Text style={s.label}>选择图片</Text>
        {uri ? (
          <Image source={{ uri }} style={s.preview} resizeMode="contain" />
        ) : (
          <Pressable style={s.pickArea} onPress={pickImage}>
            <Text style={s.pickAreaText}>点击选择相册图片</Text>
          </Pressable>
        )}
        <Pressable style={s.pickBtn} onPress={pickImage}>
          <Text style={s.pickBtnText}>{uri ? '重新选择' : '从相册选择'}</Text>
        </Pressable>
        <Text style={s.hint}>原图上传，不压缩；建议使用宽 800px 以上的图片</Text>

        {/* 上传目录 */}
        <Text style={s.label}>上传目录</Text>
        <View style={s.chipRow}>
          {TARGET_DIRS.map((d) => (
            <Pressable
              key={d.value}
              style={[s.chip, targetDir === d.value && s.chipActive]}
              onPress={() => setTargetDir(d.value)}
            >
              <Text style={[s.chipText, targetDir === d.value && s.chipTextActive]}>{d.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.hint}>图片将上传到仓库 {targetDir} 目录</Text>

        {/* 文件名 */}
        <Text style={s.label}>文件名</Text>
        <TextInput
          style={s.input}
          value={fileName}
          onChangeText={setFileName}
          placeholder="如 my-image.png"
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={s.hint}>保留扩展名（.png / .jpg / .webp 等），将直接用作仓库文件名</Text>
      </ScrollView>

      {/* 上传结果提示 */}
      {lastPath && (
        <View style={s.resultBox}>
          <Text style={s.resultText}>已上传：{lastPath}</Text>
          <Text style={s.resultText}>网站引用：./{lastPath}</Text>
        </View>
      )}

      {/* 底部操作 */}
      <View style={s.footer}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>返回</Text>
        </Pressable>
        <Pressable
          style={[s.uploadBtn, (uploading || !base64) && s.btnDisabled]}
          onPress={handleUpload}
          disabled={uploading || !base64}
        >
          <Text style={s.uploadBtnText}>{uploading ? '上传中…' : '上传图片'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { flex: 1 },
    content: { padding: SPACING.md, paddingBottom: SPACING.xl },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },
    hint: { fontSize: 12, color: COLORS.textLight, marginTop: 4, lineHeight: 17 },
    pickArea: {
      height: 160,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: COLORS.borderDark,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.bgSubtle,
    },
    pickAreaText: { fontSize: 14, color: COLORS.textLight },
    preview: {
      width: '100%',
      height: 200,
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.bgSubtle,
    },
    pickBtn: {
      borderWidth: 1,
      borderColor: COLORS.accent,
      padding: SPACING.sm + 2,
      alignItems: 'center',
      marginTop: SPACING.xs,
      backgroundColor: COLORS.bgSubtle,
    },
    pickBtnText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
    chip: {
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: COLORS.bg,
    },
    chipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
    chipText: { fontSize: 12, color: COLORS.textSecondary },
    chipTextActive: { color: '#fff', fontWeight: '600' },
    input: {
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.sm + 2,
      fontSize: 15,
      color: COLORS.text,
      backgroundColor: COLORS.bg,
    },
    resultBox: {
      backgroundColor: COLORS.successBg,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.success,
      padding: SPACING.sm + 2,
    },
    resultText: { fontSize: 12, color: COLORS.success, lineHeight: 18 },
    footer: {
      flexDirection: 'row',
      gap: SPACING.sm,
      borderTopWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      backgroundColor: COLORS.bg,
    },
    backBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      alignItems: 'center',
    },
    backText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '500' },
    uploadBtn: {
      flex: 2,
      backgroundColor: COLORS.accent,
      padding: SPACING.md,
      alignItems: 'center',
    },
    uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    btnDisabled: { opacity: 0.5 },
  });
