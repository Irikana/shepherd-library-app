// 内容编辑入口：仓库文件树浏览（GitHub Contents API，逐层加载）
// 支持：展开/收起目录、打开文本文件进入编辑器、新建文本文件
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { listDir, getFile } from '../src/lib/github-client';
import { useEditorStore } from '../src/store/editor-store';
import type { RepoContentItem } from '../src/types';
import { SPACING, useTheme, type Palette } from '../src/theme';

/** 常见文本扩展名（其余按二进制处理，不提供在线编辑） */
const TEXT_EXTENSIONS = [
  'html', 'htm', 'css', 'js', 'mjs', 'cjs', 'json', 'md', 'txt', 'ts', 'tsx',
  'jsx', 'xml', 'svg', 'yml', 'yaml', 'toml', 'ini', 'cfg', 'csv', 'tsv',
  'conf', 'log', 'sh', 'bat', 'ps1', 'py', 'tex', 'env', 'gitignore',
];

function isTextFile(name: string): boolean {
  const idx = name.lastIndexOf('.');
  if (idx < 0) return false; // 无扩展名默认按二进制
  return TEXT_EXTENSIONS.includes(name.slice(idx + 1).toLowerCase());
}

/** 目录显示名（知识馆/主馆等中文展示，兼容 null 名） */
function displayName(name: string | null): string {
  return name || '(未命名)';
}

interface TreeNode {
  item: RepoContentItem;
  /** 已展开的目录缓存（key 为目录路径） */
  children?: RepoContentItem[];
  expanded: boolean;
  loading: boolean;
}

export default function FileBrowserScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [root, setRoot] = useState<RepoContentItem[] | null>(null);
  const [loadingRoot, setLoadingRoot] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, TreeNode>>({});
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  /** 加载根目录 */
  useEffect(() => {
    let mounted = true;
    setLoadingRoot(true);
    listDir('')
      .then((items) => {
        if (!mounted) return;
        setRoot(sortEntries(items));
        setLoadingRoot(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError((err as Error).message);
        setLoadingRoot(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  /** 目录项排序：目录在前，文件在后，均按名称排序 */
  function sortEntries(items: RepoContentItem[]): RepoContentItem[] {
    return [...items].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name, 'zh-Hans-CN');
    });
  }

  /** 展开/收起目录 */
  const toggleDir = useCallback(
    async (dir: RepoContentItem) => {
      const path = dir.path || dir.name;
      const node = expanded[path];
      if (node?.expanded) {
        // 收起
        setExpanded((prev) => ({ ...prev, [path]: { ...node, expanded: false } }));
        return;
      }
      if (node?.children) {
        // 已有缓存，直接展开
        setExpanded((prev) => ({ ...prev, [path]: { ...node, expanded: true } }));
        return;
      }
      // 首次展开：加载子目录
      setExpanded((prev) => ({ ...prev, [path]: { ...node, expanded: true, loading: true } }));
      try {
        const items = sortEntries(await listDir(path));
        setExpanded((prev) => ({
          ...prev,
          [path]: { ...(prev[path] || {}), item: dir, expanded: true, loading: false, children: items },
        }));
      } catch (err) {
        setExpanded((prev) => ({ ...prev, [path]: { ...(prev[path] || {}), item: dir, expanded: true, loading: false } }));
        Alert.alert('加载失败', (err as Error).message);
      }
    },
    [expanded],
  );

  /** 打开文件：文本文件进入编辑器，二进制文件提示不可编辑 */
  const openFile = useCallback(
    async (file: RepoContentItem) => {
      if (!isTextFile(file.name)) {
        Alert.alert('无法编辑', '该文件为二进制或非文本类型，暂不支持在线编辑。\n可尝试「图片上传」功能上传图片。');
        return;
      }
      try {
        const { content } = await getFile(file.path);
        // 先加载内容到 store，再跳转编辑器
        useEditorStore.getState().load(file.path, content, file.sha);
        router.push({
          pathname: '/editor',
          params: { path: file.path, name: file.name },
        });
      } catch (err) {
        Alert.alert('读取失败', (err as Error).message);
      }
    },
    [router],
  );

  /** 过滤显示（按名称/路径模糊匹配） */
  const filterVisible = (items: RepoContentItem[]): RepoContentItem[] => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.path.toLowerCase().includes(q));
  };

  const renderItem = (item: RepoContentItem, depth: number) => {
    const isDir = item.type === 'dir';
    const path = item.path || item.name;
    const node = expanded[path];
    const isOpen = !!node?.expanded;

    return (
      <View key={item.path || item.name}>
        <Pressable
          style={[s.row, { paddingLeft: SPACING.sm + depth * 16 }]}
          onPress={() => (isDir ? toggleDir(item) : openFile(item))}
        >
          <Text style={[s.rowIcon, isDir ? s.rowIconDir : s.rowIconFile]}>
            {isDir ? (isOpen ? '▾' : '▸') : '·'}
          </Text>
          <Text style={[s.rowName, isDir && s.rowNameDir]} numberOfLines={1}>
            {displayName(item.name)}
          </Text>
          {isDir && node?.loading && <ActivityIndicator size="small" color={colors.accent} />}
          {!isDir && <Text style={s.rowSize}>{formatSize(item.size)}</Text>}
        </Pressable>
        {isDir && isOpen && (
          <View>
            {node?.loading && (
              <Text style={[s.loadingText, { paddingLeft: SPACING.sm + (depth + 1) * 16 }]}>加载中…</Text>
            )}
            {node?.children &&
              filterVisible(node.children).map((child) => renderItem(child, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  /** 新建文本文件：跳转到编辑器（空内容 + 新建模式） */
  const createFile = () => {
    useEditorStore.getState().loadNew();
    router.push({ pathname: '/editor', params: { path: '', name: '' } });
  };

  const visibleRoot = root ? filterVisible(root) : [];

  return (
    <View style={s.container}>
      {/* 顶部工具条 */}
      <View style={s.toolbar}>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="搜索文件或目录…"
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={s.createBtn} onPress={createFile}>
          <Text style={s.createBtnText}>新建文件</Text>
        </Pressable>
      </View>

      {loadingRoot ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={s.hint}>正在加载仓库文件…</Text>
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={s.list} contentContainerStyle={s.listContent}>
          {visibleRoot.length === 0 && (
            <Text style={s.hint}>未找到匹配的文件或目录</Text>
          )}
          {visibleRoot.map((item) => renderItem(item, 0))}
        </ScrollView>
      )}
    </View>
  );
}

function formatSize(bytes: number): string {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const createStyles = (COLORS: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgSubtle },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      padding: SPACING.md,
      backgroundColor: COLORS.bg,
      borderBottomWidth: 1,
      borderColor: COLORS.border,
    },
    searchInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.sm,
      fontSize: 14,
      color: COLORS.text,
      backgroundColor: COLORS.bgSubtle,
    },
    createBtn: {
      borderWidth: 1,
      borderColor: COLORS.accent,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      backgroundColor: COLORS.bgSubtle,
    },
    createBtnText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
    hint: { fontSize: 13, color: COLORS.textLight, marginTop: SPACING.sm, textAlign: 'center' },
    errorText: { fontSize: 13, color: COLORS.danger, textAlign: 'center', lineHeight: 19 },
    list: { flex: 1 },
    listContent: { paddingVertical: SPACING.xs },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingRight: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      backgroundColor: COLORS.bg,
    },
    rowIcon: { width: 18, fontSize: 13, marginRight: SPACING.xs },
    rowIconDir: { color: COLORS.accent },
    rowIconFile: { color: COLORS.textLight },
    rowName: { flex: 1, fontSize: 14, color: COLORS.text },
    rowNameDir: { fontWeight: '600', color: COLORS.accent },
    rowSize: { fontSize: 11, color: COLORS.textLight },
    loadingText: { fontSize: 12, color: COLORS.textLight, paddingVertical: 6 },
  });
