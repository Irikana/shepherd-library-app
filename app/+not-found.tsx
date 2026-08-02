import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SPACING, useTheme, type Palette } from '../src/theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const s = createStyles(colors);
  return (
    <>
      <Stack.Screen options={{ title: '页面不存在' }} />
      <View style={s.container}>
        <Text style={s.title}>404</Text>
        <Text style={s.desc}>该页面尚未开发或不存在</Text>
        <Link href="/" asChild>
          <Pressable style={s.btn}>
            <Text style={s.btnText}>返回首页</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg, padding: SPACING.lg },
    title: { fontSize: 48, fontWeight: '700', color: COLORS.accent },
    desc: { fontSize: 15, color: COLORS.textSecondary, marginTop: SPACING.sm },
    btn: { marginTop: SPACING.lg, borderWidth: 1, borderColor: COLORS.accent, padding: SPACING.sm + 2, paddingHorizontal: SPACING.lg },
    btnText: { color: COLORS.accent, fontWeight: '600' },
  });
