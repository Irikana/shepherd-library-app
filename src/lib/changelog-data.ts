// 自动生成：node scripts/gen-changelog.js —— 请勿手改
// 静态内置的全部更新日志（与 changelog/CHANGELOG-*.md 同步），App 内离线展示。
export type ChangelogBlockKind = 'version' | 'section' | 'bullet';

export interface ChangelogBlock {
  kind: ChangelogBlockKind;
  text: string;
}

export interface ChangelogEntry {
  key: string;
  title: string;
  blocks: ChangelogBlock[];
}

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    "key": "0.0.2",
    "title": "0.0.2（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.2（2026-08）"
      },
      {
        "kind": "section",
        "text": "品牌与标识"
      },
      {
        "kind": "bullet",
        "text": "软件正式命名为 **SlyWrite**（Sly 取自 Shepherd's Library 的 S、L、Y，Write 为写作创作之意）"
      },
      {
        "kind": "bullet",
        "text": "登录页与首页展示软件 logo（透明底 PNG），首页右上角显示软件版本号"
      },
      {
        "kind": "section",
        "text": "撰写文章 · 元数据表单"
      },
      {
        "kind": "bullet",
        "text": "**创建日期**：新增月历选择器，点击「日历」弹出月历精确选日（支持年月切换、跨月选日）；新增「自定义」模式，可输入任意日期字符串，与原手动输入兼容"
      },
      {
        "kind": "bullet",
        "text": "**录音时长**：新增小时钟选择器，点击「小时钟」在表盘上拖动指针选择 时/分/秒（24 格小时盘 + 60 格分/秒盘），仍可直接手动输入"
      },
      {
        "kind": "bullet",
        "text": "**脚注**：新增脚注列表编辑（可添加/删除多条），与补充说明同属页脚元数据"
      },
      {
        "kind": "section",
        "text": "撰写文章 · 正文编辑器"
      },
      {
        "kind": "bullet",
        "text": "**脚注插入**：工具栏新增「脚注」按钮，自动编号插入 `[^n]` 上标引用；生成的文章中点击正文上标可跳转到页脚对应解释，页脚条目带 ↩ 返回链接；脚注渲染在文章页脚，与补充说明同级"
      },
      {
        "kind": "bullet",
        "text": "**插入区扩充**（对齐网站视觉组件标准）："
      },
      {
        "kind": "bullet",
        "text": "新增：灰引（`.quote-box-grey`）、红警（`.notice-box-red`）、Callout（图标提示框）"
      },
      {
        "kind": "bullet",
        "text": "新增 Markdown 元素：删除线、行内代码、代码块、引用块、无序/有序列表、分割线、图片、表格"
      },
      {
        "kind": "bullet",
        "text": "**数学公式**：新增行内公式（`$...$`）、独立公式（`$$...$$`）插入；新增「数学符号」面板，分组提供希腊字母、运算符、结构片段（分数/根号/上下标/向量等 LaTeX 模板）"
      },
      {
        "kind": "section",
        "text": "预览"
      },
      {
        "kind": "bullet",
        "text": "生成预览时从仓库读取网站 `css/style.css` 并内联到预览 HTML，预览真实渲染出图书馆的视觉组件与排版风格（不再是无样式的纯 Markdown）；注入 `<base>` 使正文相对路径图片在预览中可加载；样式读取失败时自动回退为无样式预览"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.2（app.json / package.json）"
      },
      {
        "kind": "bullet",
        "text": "APK 构建产物命名同步为 `shepherd-library-app-v0.0.2-release`"
      },
      {
        "kind": "bullet",
        "text": "新增本 changelog 目录，记录各版本净变更"
      }
    ]
  },
  {
    "key": "0.0.3",
    "title": "0.0.3（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.3（2026-08）"
      },
      {
        "kind": "section",
        "text": "撰写文章 · 标题"
      },
      {
        "kind": "bullet",
        "text": "**双标题**：标题区提供中文标题与英文标题两个输入框；中文标题用于页面显示，英文标题作为文件名（兼容性更好，符合网站「目录名和文件名一律使用英文」规范）；英文标题为空时阻止上传"
      },
      {
        "kind": "bullet",
        "text": "**上传文件名**：由中文标题改为英文标题（如 `library/paper/a-new-article.html`）"
      },
      {
        "kind": "section",
        "text": "撰写文章 · 元数据表单"
      },
      {
        "kind": "bullet",
        "text": "**文章性质新增「实验性文章」**：文章类型（性质）增加「实验性文章」选项，用于主要用于测试、可能可读性较低的文章；生成的文章页使用紫色徽标（`.article-type-badge.type-experimental`）"
      },
      {
        "kind": "bullet",
        "text": "**性质与分类措辞修正**：界面文案区分「文章性质」（录音/手写/信息/实验性，即创作方式）与「文章分类」（library/ 下目录：普通/作品/杂物/测试），不再混用「文章类型」"
      },
      {
        "kind": "bullet",
        "text": "**标签修复与扩充**："
      },
      {
        "kind": "bullet",
        "text": "新增「小说」标签"
      },
      {
        "kind": "bullet",
        "text": "「新闻」标签选中态新增专属半透明蓝色样式（此前与其他标签视觉不统一）"
      },
      {
        "kind": "bullet",
        "text": "**日历改造**：年份与月份可分别点击选中，选中后两侧轮播按钮（‹ ›）切换的是被选中的年份或月份"
      },
      {
        "kind": "bullet",
        "text": "**小时钟改轮播**：录音时长的表盘拖动改为三个可拖动的数字轮盘（时/分/秒），滚动自动吸附，点击数字可直接定位"
      },
      {
        "kind": "bullet",
        "text": "**界面去 emoji**：移除「日历」「小时钟」等按钮及界面中的 emoji 字符"
      },
      {
        "kind": "section",
        "text": "撰写文章 · 正文编辑器"
      },
      {
        "kind": "bullet",
        "text": "**输入法交互修复**：输入法打开时可直接点击工具栏插入组件（onPressIn 即时响应，不再需要先收起键盘）；插入后自动恢复光标位置"
      },
      {
        "kind": "section",
        "text": "上传与网站同步"
      },
      {
        "kind": "bullet",
        "text": "**文章分类上传**：预览/上传页新增文章分类选择（普通文章/作品文章/杂物文章/测试文章），按分类上传到 `library/paper`、`library/works`、`library/misc`、`library/misc/experimental` 对应目录；「实验性文章」性质默认推荐「测试文章」分类"
      },
      {
        "kind": "bullet",
        "text": "**library.html 自动同步**：文章上传后自动更新网站 `library/library.html`，将文章加入对应分类的文章列表（已存在则跳过，失败不阻塞上传）"
      },
      {
        "kind": "section",
        "text": "草稿与恢复"
      },
      {
        "kind": "bullet",
        "text": "**草稿自动保存**：撰写中的文章（含新闻）自动缓存到本机，防抖保存；退出软件重进后可在首页「草稿箱」查看并选择恢复继续编辑，也可删除；上传成功自动清除对应草稿"
      },
      {
        "kind": "section",
        "text": "设置"
      },
      {
        "kind": "bullet",
        "text": "**设置界面**：首页右上角新增齿轮图标入口（颜色与软件风格一致）"
      },
      {
        "kind": "bullet",
        "text": "**主题设置**：支持 浅色 / 深色 / 跟随系统 三种主题，选择持久化到本机"
      },
      {
        "kind": "bullet",
        "text": "**logo 黑白切换**：浅色主题下 logo 切换为黑色，深色主题下保持白色（`tintColor` 处理）"
      },
      {
        "kind": "section",
        "text": "新闻发布"
      },
      {
        "kind": "bullet",
        "text": "**新闻发布功能上线**：撰写新闻（标题/英文标题/发布日期/正文/可选海报），一键发布时自动完成："
      },
      {
        "kind": "bullet",
        "text": "上传文章到 `library/paper/{英文标题}.html`"
      },
      {
        "kind": "bullet",
        "text": "更新主页新闻区（`index.html`：文字新闻插入右侧列表 / 海报新闻替换左侧海报并降级旧海报）"
      },
      {
        "kind": "bullet",
        "text": "更新 `news.html` 列表项"
      },
      {
        "kind": "bullet",
        "text": "更新英文主页（`en/index.html`，英文标题卡片）"
      },
      {
        "kind": "bullet",
        "text": "同步 `library.html` 普通文章列表"
      },
      {
        "kind": "bullet",
        "text": "海报图片自动压缩至宽 800px 后上传到 `image/poster/`"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.3（app.json / package.json）"
      },
      {
        "kind": "bullet",
        "text": "APK 构建产物命名同步为 `shepherd-library-app-v0.0.3-release`"
      },
      {
        "kind": "bullet",
        "text": "新增依赖：`@react-native-async-storage/async-storage`（草稿持久化）、`expo-image-picker`、`expo-image-manipulator`（新闻海报）"
      }
    ]
  },
  {
    "key": "0.0.4",
    "title": "0.0.4（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.4（2026-08）"
      },
      {
        "kind": "section",
        "text": "上传与网站同步"
      },
      {
        "kind": "bullet",
        "text": "**英文版 library 同步**：文章上传与新闻发布现在同时同步 `en/library/library.html`（英文标题、英文分类锚点），此前仅同步中文版 library.html 与英文 news"
      },
      {
        "kind": "bullet",
        "text": "**站内搜索数据同步**：上传的文章/新闻自动写入网站 `js/library-dynamic.js` 的站内搜索数据（Search.data），从此 SlyWrite 上传的内容可通过网站右上角搜索（查找按钮）按标题或关键词找到"
      },
      {
        "kind": "bullet",
        "text": "**隐藏文章选项**：元数据表单新增「隐藏文章」开关；隐藏后不同步 library.html 与新闻区等公开列表（仍上传文章文件），但照常加入站内搜索数据——只能通过查找按钮找到"
      },
      {
        "kind": "bullet",
        "text": "**措辞同步**：文章页元数据 label 统一为「文章性质」"
      },
      {
        "kind": "section",
        "text": "新闻发布"
      },
      {
        "kind": "bullet",
        "text": "**完整元数据表单**：新闻发布页改为「元数据 / 正文」分段编辑，元数据复用完整表单——中文标题、英文标题、作者、创建日期、文章性质（录音/手写/信息/实验性）、标签、补充说明、脚注、MathJax 开关，另含新闻专属的「新闻形态」（文字/海报）与海报选择"
      },
      {
        "kind": "bullet",
        "text": "**海报选图修复与不压缩**："
      },
      {
        "kind": "bullet",
        "text": "修复选图失败：app.json 配置 expo-image-picker 插件（相册权限），改用系统图片选择器直接读取 base64"
      },
      {
        "kind": "bullet",
        "text": "取消图片压缩：海报原图上传（此前经 expo-image-manipulator 压缩至 800px），移除该依赖"
      },
      {
        "kind": "bullet",
        "text": "选图失败时提示具体错误信息"
      },
      {
        "kind": "section",
        "text": "界面修复"
      },
      {
        "kind": "bullet",
        "text": "**设置齿轮图标**：改用自绘齿轮 PNG 资源（accent 色、无依赖），修复字体图标不显示的问题"
      },
      {
        "kind": "bullet",
        "text": "**输入法插入交互改进**：工具栏恢复 onPress（不再用 onPressIn），配合 `keyboardShouldPersistTaps=\"handled\"`——键盘打开时点击一次即响应，且滑动工具栏不再误插入手指触碰到的组件"
      },
      {
        "kind": "section",
        "text": "软件图标"
      },
      {
        "kind": "bullet",
        "text": "**黑底 logo 作为软件图标**：`app.json` 的 `icon` / `android.icon` / `adaptiveIcon` 均使用黑底 logo（shephrdsLibraryWriteWithBackround.png），adaptiveIcon 背景黑色"
      },
      {
        "kind": "section",
        "text": "更新检查与发布"
      },
      {
        "kind": "bullet",
        "text": "**软件内获取更新**：新增「更新与版本」页（首页「日志/版本」入口）：显示当前版本与网站版本，检查 GitHub 最新 Release（版本号、发布时间、更新说明），有新版本时一键下载最新 APK（自动跳转到 `releases/latest/download/app-release.apk`）；可访问 SlyWrite 网站"
      },
      {
        "kind": "bullet",
        "text": "**自动发布 Release**：GitHub Actions 构建完成后自动创建 Release（tag 取 package.json 版本号，如 v0.0.4）并上传 APK，App 内与网站均通过 Release 下载"
      },
      {
        "kind": "bullet",
        "text": "**SlyWrite 网站**：图书馆网站新增 `slywrite/` 页面（介绍、功能、版本、APK 下载与相关链接），地址 https://irikana.github.io/slywrite/"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.4（app.json / package.json）"
      },
      {
        "kind": "bullet",
        "text": "APK 构建产物命名同步为 `shepherd-library-app-v0.0.4-release`"
      },
      {
        "kind": "bullet",
        "text": "移除依赖：`expo-image-manipulator`（海报不再压缩）"
      }
    ]
  },
  {
    "key": "0.0.5",
    "title": "0.0.5（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.5（2026-08）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**海报选图修复**：修复「ExponentImagePicker.launchImageLibraryAsync has been rejected / AppDirectories not found」——expo-image-picker 需要 `AppDirectoriesModuleInterface`，由 `expo-file-system` 提供，现安装 `expo-file-system@~18.0.12`；海报仍为原图上传（不压缩）"
      },
      {
        "kind": "bullet",
        "text": "**文章分类移入元数据表单**：分类选择（普通/作品/杂物/测试文章）从预览页移入元数据表单（性质之后），预览页仅显示所选分类提示，不再出现选择器"
      },
      {
        "kind": "bullet",
        "text": "**草稿数量即时显示**：应用启动时即加载草稿列表，首页「草稿箱」卡片无需进入页面即可看到篇数提醒"
      },
      {
        "kind": "section",
        "text": "新闻发布"
      },
      {
        "kind": "bullet",
        "text": "**新增正文预览**：新闻发布页底部新增「生成预览」按钮，与文章一致地以网站样式（内联 css/style.css）渲染正文预览，确认后再发布"
      },
      {
        "kind": "section",
        "text": "网站"
      },
      {
        "kind": "bullet",
        "text": "**站内搜索动态收录**：网站 `js/library-dynamic.js` 新增动态补充逻辑——自动列出仓库文章目录（library/paper、library/misc/experimental、en/library/paper），对静态搜索数据缺失的文章抓取 `<title>` 生成搜索条目；App 上传的新文章无需手动维护即可被站内搜索（查找按钮）找到"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.5（app.json / package.json）"
      },
      {
        "kind": "bullet",
        "text": "APK 构建产物命名同步为 `shepherd-library-app-v0.0.5-release`"
      },
      {
        "kind": "bullet",
        "text": "新增依赖：`expo-file-system`（提供 AppDirectories 接口，修复选图）"
      }
    ]
  },
  {
    "key": "0.0.6",
    "title": "0.0.6（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.6（2026-08）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**新闻草稿恢复跳转错误**：草稿箱恢复新闻草稿时会跳到普通「撰写文章」页；现草稿增加类型标记（kind），新闻草稿恢复到「新闻发布」页，普通文章草稿恢复到「撰写文章」页；旧草稿（无标记）按普通文章处理，兼容不丢失"
      },
      {
        "kind": "bullet",
        "text": "**标签页浏览进度丢失**：正文/元数据切换时页面重新挂载，滚动位置重置；现两个标签页保持挂载（display:none 切换），并记录/恢复各自的滚动位置，切换不再从头/从尾开始"
      },
      {
        "kind": "bullet",
        "text": "**顶部空白过大**：根布局 SafeAreaView 与 Stack header 双重适配导致首页「牧羊人图书馆管理」上方出现大段空白；移除根布局 SafeAreaView，由 header 统一处理状态栏，并让标题居中，顶部更紧凑"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**标签页锁定（防误触）**：撰写文章与新闻发布页的「元数据/正文」分段栏右侧新增「锁定」按钮，每个标签页可独立锁定；锁定后该页所有输入框/按钮/开关只读禁用，编辑元数据时放心查看正文、反之亦然，不会误删字符或弹出输入法"
      },
      {
        "kind": "bullet",
        "text": "**内容编辑（Phase 2 上线）**：首页「内容编辑」入口上线——仓库文件树逐层浏览（目录/文件、大小、搜索过滤），支持打开 HTML/CSS/JS/Markdown/JSON 等文本文件在线编辑并保存到仓库（带 sha 冲突保护），支持在 library/、knowledge-hall/、image/、根目录新建文本文件；二进制/图片文件提示不可编辑"
      },
      {
        "kind": "bullet",
        "text": "**图片上传（Phase 2 上线）**：首页「图片上传」入口上线——从相册选图（原图不压缩，base64 上传），可选目标目录（image/poster/、image/、docs/paper-figures/）或指定文件名，上传后提示网站相对引用路径"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.6（app.json / package.json）"
      },
      {
        "kind": "bullet",
        "text": "APK 构建产物命名同步为 `shepherd-library-app-v0.0.6-release`"
      },
      {
        "kind": "bullet",
        "text": "根目录文件列表接口修复：`listDir('')` 不再生成 `contents/` 尾部斜杠（避免 GitHub API 404）"
      }
    ]
  },
  {
    "key": "0.0.7",
    "title": "0.0.7（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.7（2026-08）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**更新检查失效**：检查更新依赖 GitHub 未认证 API（60 次/时，易触发 403），且 `/releases/latest` 的返回顺序可能被历史归档版本抢占；现改为「已登录时带 Token 请求 + 拉取 releases 列表按版本号取最大（过滤 draft）」，重新检查可正常发现新版本"
      },
      {
        "kind": "bullet",
        "text": "**深层目录文章 CSS/JS 失效**：文章模板相对路径写死为 `../../`，上传到 `library/misc/experimental/`（3 层目录）的文章样式、Logo、脚本全部 404；模板现按分类目录深度自动生成 `../` 前缀，并修复了站内已有的两篇实验性文章"
      },
      {
        "kind": "bullet",
        "text": "**内容编辑无法滚动**：编辑器 TextInput 嵌在 ScrollView 内，长文件滑动出现\"滑到底部\"反馈；现移除外层 ScrollView，TextInput `multiline` + `flex:1` 自行管理滚动（撰写正文编辑器同步修复）"
      },
      {
        "kind": "bullet",
        "text": "**小说标签颜色不对**：新增「小说」标签专属紫色配色（App 选中态 + 网站 `.article-tag.tag-novel` 样式）"
      },
      {
        "kind": "bullet",
        "text": "**数学练习后缀冗长**：library.html / en/library/library.html 中数学练习（一）条目删除「— 线性代数 · 多元微积分 · 微分方程 · 复变函数」后缀，仅保留标题"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**合并文章与新闻撰写**：删除独立「新闻发布」页，撰写文章页新增「在新闻板块展示」元数据开关——开启后自动添加「新闻」标签并固定发布到普通文章分类，可选文字/海报形态与海报图，发布时同步主页新闻区、news.html、英文主页；旧新闻草稿恢复时自动开启该选项"
      },
      {
        "kind": "bullet",
        "text": "**自定义分类/标签/上传目录**：设置页新增「站点配置」管理——可创建/删除自定义文章分类（自动写入仓库 slywrite-config.json 并同步 library.html 中英文分类章节）、自定义标签、自定义图片上传目录；配置存放于网站仓库根目录，App 与网站共享，永久生效"
      },
      {
        "kind": "bullet",
        "text": "**上传防重复锁**：文章上传/图片上传期间显示全屏遮罩并锁定返回键，全局 publishBusy 标记防止返回后重入重复提交；上传完成后展示分步结果日志"
      },
      {
        "kind": "bullet",
        "text": "**已有文章元数据编辑**：文件浏览器打开文章 HTML 时自动检测并提供「元数据 / 源码」双标签编辑——元数据标签页可表单化修改标题、作者、日期、文章性质、标签、录音时长、补充说明、脚注、MathJax 开关，保存时仅替换元数据区段、保留正文 HTML 不变"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.7（app.json / package.json）"
      },
      {
        "kind": "bullet",
        "text": "APK 构建产物命名同步为 `shepherd-library-app-v0.0.7-release`"
      },
      {
        "kind": "bullet",
        "text": "网站仓库新增 `slywrite-config.json`（站点自定义配置，初始为空）"
      }
    ]
  },
  {
    "key": "0.0.8",
    "title": "0.0.8（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.8（2026-08）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**内容编辑无法完整浏览代码**：源码编辑时部分长文件（HTML 等）无法滑动到屏幕范围之外，滑动出现\"滑到底部\"的反馈；现改为「外层 ScrollView 作为唯一滚动容器 + 内部输入框不限制高度、关闭自身滚动」，从机制上消除 Android 上输入框内部滚动与父级手势的冲突，所有长文件均可正常滑动浏览与编辑"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**正文编辑标签页**：编辑已有文章/新闻时，编辑器由「元数据 / 源码」双标签扩展为「元数据 / 正文 / 源码」三标签——「正文」标签页直接编辑文章正文区段（left-align 内部 HTML），不必面对整页的 head/脚本/导航等代码；配合已有的「元数据」表单（标题、作者、创建日期、文章性质、标签增删、录音时长、补充说明、脚注、MathJax 开关），编辑新闻与文章拥有了像撰写时一样完整的「元数据 + 正文」编辑窗口，保存时正文与元数据分别写回原文件、互不覆盖"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.8（app.json / package.json）"
      },
      {
        "kind": "bullet",
        "text": "APK 构建产物命名同步为 `shepherd-library-app-v0.0.8-release`"
      }
    ]
  },
  {
    "key": "0.0.9",
    "title": "0.0.9（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.9（2026-08）"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**内容编辑正文撰写化**：编辑已有文章/新闻时，「正文」标签页由 HTML 源码改为撰写式体验——自动把正文区段 HTML 还原为 Markdown，复用撰写页的 Markdown 编辑器（H2/H3/加粗/链接/图片/蓝框/灰引/红警/Callout/折叠块/脚注/数学公式等完整工具栏），保存时渲染回 HTML 写回原文件；视觉组件原样保留，元数据表单（标题/作者/日期/性质/标签增删等）与正文、源码三标签互不覆盖。还原失败时可退回「源码」标签页编辑"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**内容编辑始终只有源码（关键修复）**：文章识别条件 `html.includes('class=\"page-title-main\"')` 无法匹配实际的多 class 写法 `class=\"section-padding page-title-main\"`，导致所有文章（含新闻）都未被识别为文章，编辑器从不显示元数据表单。现改为 class token 匹配，仓库 51 个文章页均可识别；打开中文文章即可看到「元数据 / 正文 / 源码」三标签页，表单（标题/作者/日期/性质/标签增删等）与 Markdown 正文编辑正常工作"
      },
      {
        "kind": "bullet",
        "text": "**移除无意义的「网站版本（alpha）」**：更新与版本页、首页此前显示图书馆网站的 alpha 版本号（alpha-xxx，久未更新、含义不明、与 App 更新无关）；现已从界面彻底移除，更新页只显示 App 自身版本与 App 仓库 Release，并移除首页「刷新版本号」按钮及登录时的网站版本号拉取请求"
      },
      {
        "kind": "bullet",
        "text": "**更新页版本混淆**：更新与版本页「最新版本」明确标注为 App 自身版本（读取 App 仓库 GitHub Releases 按版本号取最大），下载按钮始终显示（不限于有新版本时），检查失败提供重试"
      },
      {
        "kind": "bullet",
        "text": "**登录页 SlyWrite 少一个 e**：登录页与首页品牌标题加 `numberOfLines` + `adjustsFontSizeToFit`，防止部分设备字体渲染时最后一个字符（e）被裁切，浅色/深色模式均完整显示"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "**SlyWrite 官网独立成站**：官网从图书馆项目 `Irikana.github.io/slywrite/` 迁移至 App 项目 `site/` 目录，由 GitHub Actions 发布到 gh-pages 分支，新地址 `https://irikana.github.io/shepherd-library-app/`；旧地址自动重定向。网站「当前版本」不再硬编码，改为读取 App 仓库 GitHub Releases 动态显示；网站样式/logo 已随站自包含（不再依赖图书馆站点资源）"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.9（app.json / package.json）"
      },
      {
        "kind": "bullet",
        "text": "APK 构建产物命名同步为 `shepherd-library-app-v0.0.9-release`"
      }
    ]
  },
  {
    "key": "0.0.10",
    "title": "0.0.10（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.10（2026-08）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**内容编辑始终只有源码（关键修复）**：文章识别条件 `html.includes('class=\"page-title-main\"')` 无法匹配实际的多 class 写法 `class=\"section-padding page-title-main\"`，导致所有文章（含新闻）都未被识别为文章，编辑器从不显示元数据表单。现改为 class token 匹配，仓库 51 个文章页均可识别；打开中文文章即可看到「元数据 / 正文 / 源码」三标签页，表单（标题/作者/日期/性质/标签增删等）与 Markdown 正文编辑正常工作。英文版（en/）文章由网站同步生成、结构为英文标签，自动排除不做表单编辑"
      },
      {
        "kind": "bullet",
        "text": "**移除无意义的「网站版本（alpha）」**：更新与版本页、首页此前显示图书馆网站的 alpha 版本号（alpha-xxx，久未更新、含义不明、与 App 更新无关）；现已从界面彻底移除，更新页只显示 App 自身版本与 App 仓库 Release，并移除首页「刷新版本号」按钮及登录时的网站版本号拉取请求"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.10（app.json / package.json）"
      },
      {
        "kind": "bullet",
        "text": "APK 构建产物命名同步为 `shepherd-library-app-v0.0.10-release`"
      }
    ]
  },
  {
    "key": "0.0.11",
    "title": "0.0.11（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.11（2026-08）"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**编辑已有文章时支持隐藏**：EditMetaForm 添加「隐藏文章」开关，保存后文章不在 library.html 公开列表与新闻板块展示，仅可通过站内搜索找到。隐藏状态存储在 HTML 中（`data-article-hidden`），下次编辑时自动读取"
      },
      {
        "kind": "bullet",
        "text": "**恢复「网站版本」显示**：更新与版本页重新显示牧羊人图书馆网站（Irikana.github.io）的版本号（alpha-xxx），并附说明\"与 App 更新无关\""
      },
      {
        "kind": "bullet",
        "text": "**App 内直接下载并安装 APK**：更新页「下载 APK」按钮现在使用 expo-file-system 在 App 后台下载，完成后通过系统 Intent 自动弹出安装界面，不再跳转浏览器；若自动安装失败则兜底浏览器下载"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**更新页版本检查混淆**：此前 `fetchLatestRelease` 误用了 `Irikana.github.io`（网站仓库）的 Release tag（alpha-0.0.1），导致更新页始终显示旧版 alpha 信息，无法检测 App 仓库的正确版本；现已拆分为 `fetchAppRelease()`（App 仓库 shepherd-library-app）和 `fetchSiteRelease()`（网站仓库 Irikana.github.io），各自独立"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.11（package.json / app.json / CI artifact name）"
      }
    ]
  },
  {
    "key": "0.0.12",
    "title": "0.0.12（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.12（2026-08）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**编辑已有文章后标签丢失（关键修复）**：标签区段解析正则使用非贪婪 `[\\s\\S]*?` 会在第一个标签的闭合 `</span>` 处截断，导致多标签文章重新拉取后软件内显示为空（每次都要重新选完整标签）。已改为匹配到 `article-meta-value` 区段结束，可完整解析全部标签；纯文本\"无\"字文章也不再被误判"
      },
      {
        "kind": "bullet",
        "text": "**「无」不再是标签**：此前把\"无\"当作一个可选标签（DEFAULT_TAGS 含\"无\"，标签为空时渲染 `<span class=\"article-tag\">无</span>`），导致网站上一部分文章显示标签样式的\"无\"、一部分显示普通\"无\"字，风格不统一。现已统一：无标签时页面直接显示\"无\"字（纯文本），不再提供\"无\"标签选项；旧文章中带标签\"无\"的，编辑保存后会自动转换为\"无\"字"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**编辑页锁定（防误触）**：编辑已有文章时，元数据 / 正文 / 源码三个标签页均可单独锁定（与撰写页一致），锁定后当前页只读，切换查看不会误触修改"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "配置/草稿中的历史遗留「无」标签在加载时自动清理（0.0.12 起「无」不再是标签）"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.12（package.json / app.json / CI artifact name）"
      }
    ]
  },
  {
    "key": "0.0.13",
    "title": "0.0.13（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.13（2026-08）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**上传路径缺少 library/ 前缀（关键修复）**：`compose/preview.tsx` 中文件路径拼接为 `category.dir/titleEn.html`（如 `paper/xxx.html`），实际写到了仓库根目录而非 `library/paper/`。现已添加 `library/` 前缀，同步修正站内搜索 urlPath、library.html 索引链接（现在用 `paper/xxx.html` 相对格式）、新闻板块链接（按分类动态拼接避免硬编码 `paper/`）"
      },
      {
        "kind": "bullet",
        "text": "**编辑页修改 hidden 状态不生效（关键修复）**：之前在 editor.tsx 中修改 hidden 开关仅影响 HTML 文件内的 `data-article-hidden` 标记，不会同步更新 `library.html` 公开列表，导致\"想隐藏已发布文章但网站不变\"。现已实现在保存时自动检测 hidden 状态变化，若从 OFF→ON 则从 library.html 和 en/library.html 中移除文章条目，ON→OFF 则插入条目"
      },
      {
        "kind": "bullet",
        "text": "**APK 自动安装不弹出**：改用 `expo-intent-launcher` 的 `startActivityAsync` 发送 `ACTION_VIEW` Intent（带 `application/vnd.android.package-archive` MIME 和 `FLAG_GRANT_READ_URI_PERMISSION`），正确唤起 Android 安装界面"
      },
      {
        "kind": "bullet",
        "text": "**源码编辑器滚动与误触输入法**：移除 CodeEditor 的 `nestedScrollEnabled` 和 `scrollEnabled={false}` 解决滚动冲突；改用 `keyboardShouldPersistTaps=\"always\"` 避免误触弹出键盘"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**APK 下载进度条**：下载按钮下方显示彩色进度条和百分比，下载中实时更新"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.13（package.json / app.json / CI artifact name）"
      }
    ]
  },
  {
    "key": "0.0.14",
    "title": "0.0.14（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.14（2026-08）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**隐藏文章仍然不生效（关键修复）**：此前编辑页/发布页勾选隐藏后只改 HTML 文件内的 `data-article-hidden` 标记，不会从公开列表移除已存在的条目（发布流程的 hidden 分支甚至只跳过插入、从不删除）。现已修复："
      },
      {
        "kind": "bullet",
        "text": "**发布流程（preview.tsx）**：hidden 文章不再只跳过同步，而是主动从 `library.html` / `en/library/library.html` / 新闻板块（index.html 新闻区、news.html、en/index.html）移除已有条目"
      },
      {
        "kind": "bullet",
        "text": "**编辑页（editor.tsx）**：保存时若 hidden 状态变化，同步从 library.html 移除（中英文）或插入；新闻文章额外同步/移除新闻板块"
      },
      {
        "kind": "bullet",
        "text": "**removeFromLibraryHtml 修复英文版匹配**：英文版链接形如 `href=\"../../library/paper/xxx.html\"`，旧正则只匹配 `href=\"paper/xxx.html\"` 导致英文版移除失败；已改为通用匹配"
      },
      {
        "kind": "bullet",
        "text": "**新增 removeNewsItem**：从 index.html / news.html / en/index.html 移除指定新闻的卡片/列表项/海报块"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**文件打开加载反馈**：内容编辑（文件浏览）点击文件后立即显示加载指示器，读取完成后跳转编辑器，不再\"卡一下没反应\""
      },
      {
        "kind": "bullet",
        "text": "**APK 下载残留优化**：安装包按版本号命名（`app-release-vX.Y.Z.apk`）；检测到已下载的同版本安装包时直接唤起安装界面，不重复下载；清理不同版本的历史残留"
      },
      {
        "kind": "bullet",
        "text": "**国内镜像下载加速**：下载 APK 优先走 `ghproxy.com` 公共代理（零部署），失败自动回退 GitHub 官方直连"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.14（package.json / app.json / CI artifact name）"
      },
      {
        "kind": "bullet",
        "text": "发布约定变更：不再在本地归档 APK（`apk/` 目录已删除），Release 即最终产物"
      }
    ]
  },
  {
    "key": "0.0.15",
    "title": "0.0.15（2026-08）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15（2026-08）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**隐藏新闻会清空整个新闻区（关键修复）**：`removeNewsItem`（0.0.14 新增）隐藏新闻时，删除左侧海报块的正则使用 `[\\s\\S]*?` 跨块匹配——当目标新闻是右侧文字新闻（不在海报中）时，正则会从海报块一路吞到目标卡片所在的文字列表末尾，把整个新闻区（海报 + 全部文字卡）从 `index.html` 与 `en/index.html` 中删除，主页只剩「查阅所有新闻」按钮。现已修复："
      },
      {
        "kind": "bullet",
        "text": "**海报块只按需删除**：新增 `removePosterIfMatches`，仅当目标 href 确实位于海报块内部时才删除整个海报块；目标在文字列表时绝不触碰海报块"
      },
      {
        "kind": "bullet",
        "text": "**卡片/列表项正则健壮化**：`removeAnchor` 改用 lookahead 同时断言 `href` 与 `class` 两个属性，属性顺序无关，避免类名位置变化导致匹配失败"
      },
      {
        "kind": "bullet",
        "text": "回归验证：新增 `scripts/verify-news-remove.js`、`scripts/verify-article-sync.js` 两个验证脚本，覆盖「隐藏文字新闻」「隐藏海报新闻」「en/index.html」「news.html」「英文版 library.html 插入/移除」场景"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15（package.json / app.json / CI artifact name）"
      },
      {
        "kind": "bullet",
        "text": "修复因本次事故被清空的网站新闻区：恢复 index.html / en/index.html / news.html 新闻区至隐藏前状态，取消 3 篇测试新闻的隐藏标记并补齐英文版 library.html 缺失条目（网站仓库 Irikana.github.io 同步处理）"
      }
    ]
  },
  {
    "key": "0.0.15.1",
    "title": "0.0.15.1（2026-08-10）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15.1（2026-08-10）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**隐藏文章偶发残留（关键修复）**：此前编辑页/发布页隐藏文章时，各同步步骤（library.html 中英文、新闻板块 index.html/news.html/en/index.html）独立 try/catch 静默失败——文章文件写入隐藏标记成功，但公开列表移除失败只记一条提示、不报错不重试，导致已隐藏文章仍残留在主页/新闻区/列表页。现已修复："
      },
      {
        "kind": "bullet",
        "text": "**同步逻辑抽为可重试函数** `syncVisibility`（editor.tsx），保存流程与「重试同步」共用同一份逻辑"
      },
      {
        "kind": "bullet",
        "text": "**失败可见**：保存后 Alert 明确列出失败步骤；有失败时提示「可点击『重试同步』再次执行」，重试成功/失败均有明确反馈"
      },
      {
        "kind": "bullet",
        "text": "**发布流程失败标红**：preview.tsx 结果日志中失败步骤以「[失败]」前缀突出显示"
      },
      {
        "kind": "bullet",
        "text": "**网站残留已清除**：隐藏文章「测试新闻20260802N1」在 index.html / news.html / en/index.html / library.html / en/library.html 的残留卡片与列表条目已全部移除"
      },
      {
        "kind": "bullet",
        "text": "**国内镜像下载进度卡 0（关键修复）**：原镜像 `ghproxy.com` 已失效（301 跳转 ghfast.top，后者仍 302 回 GitHub），下载时镜像不返回 Content-Length，进度永远 0%。现已修复："
      },
      {
        "kind": "bullet",
        "text": "镜像更换为 `gh-proxy.com`（实测可用、返回完整 Content-Length）"
      },
      {
        "kind": "bullet",
        "text": "镜像下载失败自动回退 GitHub 官方直连（保留原逻辑）"
      },
      {
        "kind": "bullet",
        "text": "进度兜底：镜像不返回总大小时进度条显示「下载中…」（不确定态），不再卡 0%"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**知识馆词条撰写功能**：SlyWrite 新增「撰写知识词条」入口（首页功能卡片），支持为知识馆（现象 / 可回忆知识 / 可追溯知识）创建词条页："
      },
      {
        "kind": "bullet",
        "text": "词条信息：中文标题 + 英文标题（文件名）+ 近义词/别称 + 知识分类 + 创建日期 + Markdown 正文"
      },
      {
        "kind": "bullet",
        "text": "词条页生成：基于知识馆词条模板（kh-body 布局 + 侧边栏导航 + 词条元数据 + 知识关系图谱），自动适配相对路径"
      },
      {
        "kind": "bullet",
        "text": "自动同步：发布后上传词条页至 `knowledge-hall/categories/{分类}/xxx.html`，并更新对应分类页的词条列表（首次插入替换\"暂无条目\"提示框，之后追加至列表，防重复）"
      },
      {
        "kind": "bullet",
        "text": "草稿支持：知识词条自动保存草稿（草稿箱恢复时自动分流到词条撰写页）"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "**版本号规则变更**：自 0.0.15 起每次工作只自增第四位（0.0.15 → 0.0.15.1 → 0.0.15.2），除非特别强调否则不改前三位；本技能已同步更新（slywrite-changelog-release）"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15.1（package.json / app.json / CI artifact name 三处同步）；app.json 新增 android.versionCode=2（保证覆盖安装）"
      },
      {
        "kind": "bullet",
        "text": "compareVersions 支持四段版本号比较（App 内可正确识别 0.0.15.1 > 0.0.15）"
      },
      {
        "kind": "bullet",
        "text": "网站链接双重箭头清理：chapter 系列（chapter-02 ~ chapter-20）与 answer-01 中链接文本的手动「←」箭头移除（与 CSS 自动箭头重叠），全站统一由 CSS 控制"
      }
    ]
  },
  {
    "key": "0.0.15.2",
    "title": "0.0.15.2（2026-08-10）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15.2（2026-08-10）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**手机端便携式导航仪无法展开（关键修复，App 模板源头）**：文章页模板（`src/templates/article.ts`）的内联脚本与网站 `library-dynamic.js` 的 `MobileNavToggle` 模块同时对便携式导航仪（`.quick-nav`）绑定点击展开/收起事件，两套处理器互相抵消，导致手机端点击导航仪无法展开。现已移除模板内联的 quick-nav 点击绑定，统一交由 `library-dynamic.js` 处理（网站侧 57 个既有页面已同步清理，含标准变量名 46 页与压缩变量名 11 页）"
      },
      {
        "kind": "bullet",
        "text": "**脚注链接双重箭头（App 模板源头）**：正文脚注引用 `[n]` 与脚注返回链接（↩ 文本箭头）位于内容区，被通用链接箭头规则自动追加 SVG 箭头，出现双重箭头。已在网站 CSS 添加 `.article-footnote-ref a::after`、`.article-footnote-back::after { content: none }` 排除规则（App 生成的文章由 `library-dynamic.js` 加载网站 CSS，随网站生效）"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15.2（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 3"
      }
    ]
  },
  {
    "key": "0.0.15.3",
    "title": "0.0.15.3（2026-08-31）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15.3（2026-08-31）"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**毛玻璃主题**：设置页主题选项新增「毛玻璃」（`app/settings.tsx`），主题模式扩展为 浅色 / 深色 / 跟随系统 / 毛玻璃。`src/theme.ts` 新增 `glass` 模式与 `GLASS_PALETTE` 半透明磨砂色板（表面为半透明白色 + 白色描边，文字保持深色保证可读性），`src/store/settings-store.ts` 支持持久化该模式。毛玻璃模式下根布局在 Stack 之下渲染渐变背景层（新组件 `src/components/GlassBackdrop.tsx`，渐变背景图 `src/assets/glass-backdrop.png`，1080×1920 对角三色渐变），所有界面表面呈现磨砂玻璃质感"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15.3（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 4"
      }
    ]
  },
  {
    "key": "0.0.15.4",
    "title": "0.0.15.4（2026-09-01）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15.4（2026-09-01）"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**毛玻璃主题液态化**：新增 `expo-blur` 全屏 BlurView 真实模糊层（`src/components/GlassBackdrop.tsx`，渐变图 + 模糊双层，memo 化），`GLASS_PALETTE` 全面降低透明度（bg 0.14 / bgSubtle 0.26 / bgMuted 0.44，边框为半透明白 0.55~0.75），界面更通透、更有磨砂玻璃质感"
      },
      {
        "kind": "bullet",
        "text": "**App 内直接安装新版 APK**：Android manifest 声明 `REQUEST_INSTALL_PACKAGES` 权限（`app.json`），下载完成后唤起系统安装界面；若系统未授予「安装未知应用」权限，弹窗引导一键跳转系统权限设置页（`MANAGE_UNKNOWN_APP_SOURCES`），或回退浏览器下载（`app/updates.tsx`）"
      },
      {
        "kind": "bullet",
        "text": "**全部更新日志页**：主页新增「全部更新日志」入口（`app/changelog.tsx`），从 App 仓库 `changelog/` 目录拉取所有版本日志，按版本升序展示（最初 → 最新，历史迭代感），支持行内代码/加粗渲染与失败重试"
      },
      {
        "kind": "bullet",
        "text": "**设置独立入口**：主页功能列表新增「设置」卡片（主题 / 站点配置），与品牌栏齿轮图标并存"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "毛玻璃模式下切换页面的短暂卡顿：渐变背景图由 1080×1920 降为 720×1280（约 98KB），背景层 memo 化，降低解码与合成开销"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15.4（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 5"
      }
    ]
  },
  {
    "key": "0.0.15.5",
    "title": "0.0.15.5（2026-09-01）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15.5（2026-09-01）"
      },
      {
        "kind": "section",
        "text": "移除"
      },
      {
        "kind": "bullet",
        "text": "**毛玻璃主题**：删除「毛玻璃」主题模式（`src/theme.ts` 的 `GLASS_PALETTE`、`src/components/GlassBackdrop.tsx` 渐变图 + 全屏 `BlurView` 模糊层、`src/assets/glass-backdrop.png`），并移除 `expo-blur` 依赖；主题模式恢复为纯色扁平化风格（对齐网站扁平化设计）"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**三个温和主题**：新增「暖米」（柔和纸感米白 + 暖棕）、「雾蓝」（静谧灰蓝）、「森绿」（淡雅护眼绿）三种低饱和柔和主题（`WARM_PALETTE` / `MIST_PALETTE` / `SAGE_PALETTE`），在设置页主题列表中选择，温和不刺眼，浅色调兼容 logo 黑白切换与状态栏样式"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**全部更新日志页乱码**：原页面从 GitHub Contents API 拉取 changelog 文件并 `atob` 解码，中文 UTF-8 字节被错误解码为乱码。现已改为静态内置：新增生成脚本 `scripts/gen-changelog.js`，把仓库 `changelog/` 目录全部日志解析为 `src/lib/changelog-data.ts`（App 打包内置，离线展示，不再联网拉取），页面渲染逻辑保留（行内代码 / 加粗 / 版本升序）"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15.5（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 6"
      },
      {
        "kind": "bullet",
        "text": "首页「设置」入口文案同步为主题列表（浅色 / 深色 / 跟随系统 / 暖米 / 雾蓝 / 森绿）"
      }
    ]
  }
];
