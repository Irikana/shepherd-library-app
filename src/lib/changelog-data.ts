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
  },
  {
    "key": "0.0.15.6",
    "title": "0.0.15.6（2026-09-09）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15.6（2026-09-09）"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**5 个全新主题**：在现有 6 个主题基础上，新增 5 个温和主题色板（共 11 个主题可选）："
      },
      {
        "kind": "bullet",
        "text": "**日暮**（`sunset`）：暖色夕阳橙粉调，如晚霞般柔和温暖"
      },
      {
        "kind": "bullet",
        "text": "**海洋**（`ocean`）：深邃蓝调，如深海般静谧沉稳"
      },
      {
        "kind": "bullet",
        "text": "**薰衣草**（`lavender`）：淡紫柔和，如薰衣草田般浪漫优雅"
      },
      {
        "kind": "bullet",
        "text": "**咖啡**（`coffee`）：深棕温润，如咖啡香气般醇厚温暖"
      },
      {
        "kind": "bullet",
        "text": "**薄荷**（`mint`）：清新绿调，如晨露般清爽提神"
      },
      {
        "kind": "bullet",
        "text": "所有新主题均为低饱和柔和色调，浅色调设计，兼容 logo 黑白切换与状态栏样式"
      },
      {
        "kind": "bullet",
        "text": "设置页主题列表扩展至 11 个选项，每个主题配有简明描述"
      },
      {
        "kind": "section",
        "text": "改进"
      },
      {
        "kind": "bullet",
        "text": "**移除首页顶部齿轮图标**：从品牌区移除设置齿轮按钮，保留功能列表中的「设置」卡片作为唯一入口，界面更简洁统一"
      },
      {
        "kind": "bullet",
        "text": "首页「设置」卡片文案更新，列出全部 11 个主题名称"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15.6（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 7"
      },
      {
        "kind": "bullet",
        "text": "主题系统类型定义、持久化逻辑、色板映射逻辑完整同步，支持全部 11 种主题模式"
      }
    ]
  },
  {
    "key": "0.0.15.7",
    "title": "0.0.15.7（2026-09-09）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15.7（2026-09-09）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**更新日志补充（关键修复）**：0.0.15.5 版本引入的更新日志生成脚本（`scripts/gen-changelog.js`）将 changelog 目录内容同步到软件内置数据（`src/lib/changelog-data.ts`），但 0.0.15.6 版本发布时忘记运行该脚本，导致软件内「全部更新日志」页缺失 0.0.15.6 版本内容。现已补充运行脚本，0.0.15.6 与 0.0.15.7 两个版本的更新日志均已写入软件内"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15.7（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 8"
      }
    ]
  },
  {
    "key": "0.0.15.8",
    "title": "0.0.15.8（2026-09-09）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15.8（2026-09-09）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**内容编辑「未能自动还原正文」（关键修复）**：App 打包时 Metro 按 package.json 的 browser 字段把 turndown 重映射为浏览器构建，该构建依赖 `window.DOMParser` / `document.implementation` / ActiveX——React Native 中三者均不存在，导致 HTML → Markdown 还原在 APK 内必然抛错，每篇文章打开「正文」标签页都只会提示改用源码编辑。现新增 `metro.config.js`，用自定义 `resolveRequest` 把 `turndown` 固定到 Node 版构建（内置 @mixmark-io/domino 纯 JS 解析器，无 Node 专属依赖），并把被 browser 字段置空的 `@mixmark-io/domino` 也指回真实实现；仓库全部 45 篇文章已实测可正常还原为 Markdown"
      },
      {
        "kind": "bullet",
        "text": "**非 left-align 结构文章无法定位正文**：正文区段提取此前只认 `<div class=\"left-align\">`，作品文章（`story-work`）、多段 left-align 续篇、练习分区页、视觉组件示例页等共 23 篇提取不到正文。现改为「article-meta 之后、所属容器闭合之前」的通用正文区段定位（含页脚元数据边界切割），并对 left-align / story-work 结构容器自动拆包展示、写回时重包裹（保住网站 `.left-align p` 等容器类样式）；元数据写回（更新标题/页脚）同步改为深度匹配，不再依赖「meta 后紧跟 left-align」的假设"
      },
      {
        "kind": "bullet",
        "text": "**源码标签页编辑后正文页被旧内容覆盖**：「源码」标签页修改后切回「正文」，编辑器此前可能展示过期的 Markdown，保存会反向覆盖源码改动。现源码编辑会标记正文还原过期，切回「正文」标签页时自动从当前正文 HTML 重新还原（惰性刷新，避免每击键跑一次转换卡顿输入）"
      },
      {
        "kind": "section",
        "text": "改进"
      },
      {
        "kind": "bullet",
        "text": "**草稿箱只收「真正编辑过」的内容**：此前每次点开「撰写文章 / 撰写知识词条」都会生成一条未命名草稿（防抖自动保存无条件写入），误点多次后草稿箱冗余严重。现仅在表单相对默认值有实际变化（标题/正文/标签/日期/作者/新闻开关/分类等任一偏离）时才计入草稿箱；进入撰写页后又把内容全部撤销回默认值的，该条草稿会被自动清除。知识词条撰写同样适用"
      },
      {
        "kind": "bullet",
        "text": "**历史空草稿自动清理**：旧版本遗留的「未命名 / 未命名词条」空草稿在启动加载草稿箱时自动过滤并同步清理持久化存储，无需手动逐条删除"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15.8（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 9"
      },
      {
        "kind": "bullet",
        "text": "新增仓库回归探针脚本思路沉淀：正文提取/还原/写回对全部 45 篇文章做了往返与元数据更新无损校验（div 配平、文本量、脚注保留）"
      }
    ]
  },
  {
    "key": "0.0.15.9",
    "title": "0.0.15.9（2026-09-10）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15.9（2026-09-10）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**搜索条目注入可打瘫网站全部动态功能（关键修复）**：`insertSearchEntry` 向网站 `js/library-dynamic.js` 的 `Search.data` 插入条目时，只对标题与关键词做了 JS 字符串转义，`urlPath`（文章文件名）原样拼进单引号字符串。英文文件名含撇号（如 `A Test of Opus 5 Long Shot With No One's Watch.html`）时产生的语法错误会使整个 library-dynamic.js 无法执行，网站所有页面的站内搜索、阅读工具、目录、进度条等动态功能全部失效（已于 2026-09-10 由站点侧手工转义修复该条数据）。现对 `urlPath` 同样执行 `escapeJsString`，防重复检查同时匹配转义前后的路径形态，兼容历史条目"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15.9（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 10"
      }
    ]
  },
  {
    "key": "0.0.15.10",
    "title": "0.0.15.10（2026-09-11）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15.10（2026-09-11）"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**更新日志页可滑动时间条**：`app/changelog.tsx` 顶部新增横向可滑动的版本时间线（菱形时间标记 + 版本号，「最初 / 最新」两端标注）。进度线随当前版本平滑生长，点击节点时游标有轻微弹性缩放，页面进入时时间条淡入上移；时间条与下方日志卡片双向联动——点节点滚动到对应版本卡片，滚动列表时游标跟随并自动把当前节点保持可见；尊重系统「减少动效」偏好（关闭过渡动画）"
      },
      {
        "kind": "bullet",
        "text": "**标签颜色可设置**：任意标签（内置的 新闻 / 小说 / 包含AI / 有删减与自定义标签）都可指定颜色。设置页每个标签行右侧新增色块入口，新建标签时也能先选色；弹出面板提供 16 色预设（靛青、湖蓝、森绿、麦金、砖红、绛紫等）、自定义十六进制输入（实时预览、格式校验）与「清除自定义颜色（跟随主题）」。颜色写入站点配置 `slywrite-config.json` 的 `tagColors` 字段（App 与网站共享），浅色/深色主题下分别推导底色、描边与可读文字色；撰写页与编辑页的标签芯片、上传到网站的文章 HTML（`.article-tag` 内联样式，采用带透明度叠加 + `color-mix` 方案，明暗主题均可读）同步生效"
      },
      {
        "kind": "bullet",
        "text": "**网站联系方式可在 App 编辑**：设置页新增「网站联系方式」区块，可编辑 QQ / 微信 / FaceBook 三项（显示名、展示值、链接、备注）并增删渠道，保存后写入站点配置 `contact` 字段，供网站顶部冻结栏「联系」下拉菜单显示。所有值默认留空，作者未填写时网站只显示「作者尚未设置」提示，不代为填写任何个人信息"
      },
      {
        "kind": "bullet",
        "text": "**内容页面编辑兼容（非 library 文章也能用文章编辑器）**：内容编辑器新增「内容页面」识别（`isPageHtml`），入口页、说明页、知识馆页、主页板块等页面也可用撰写式（Markdown）方式改内容——提供「正文 / 源码」两标签页，正文编辑只替换页面正文容器（`.content-main` / `.kh-main` / `.kh-content` / `.left-align`，兜底 `<main>`），页面骨架、脚本与导航不动；带 `page-title-main` 的页面额外提供「页面标题」直改输入。站点结构化类名（章节标题、`article-list`、视觉组件等）在 HTML→Markdown 还原时原样保留，往返不丢类名，避免保存后样式退化"
      },
      {
        "kind": "section",
        "text": "改进"
      },
      {
        "kind": "bullet",
        "text": "**与网站 alpha-021 改版对齐**：文章与知识馆模板生成时在 `css/style.css` 之后写入 `css/library-refit.css` 引用与主题预应用脚本两行（片段统一由新增 `src/templates/site-assets.ts` 提供，与站点页面逐字一致），App 上传的新页面天然继承冻结顶栏、主题配色与出版化排版"
      },
      {
        "kind": "bullet",
        "text": "**预览渲染新样式层**：`src/lib/site-style.ts` 的 `getSiteCss()` 改为按序抓取 `css/style.css` + `css/library-refit.css` 拼接内联（精修层缺失时自动只用主样式表），预览与网站实际观感一致"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "站点配置读取容错增强：旧 `slywrite-config.json` 缺少 `tagColors` / `contact` 字段时按默认处理，非法颜色项在解析阶段丢弃；删除自定义标签时同步清理其颜色设置"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15.10（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 11"
      },
      {
        "kind": "bullet",
        "text": "配套网站变更（同日发布）：图书馆视觉精修、全站冻结顶栏、六套配色与五套免版权字体方案，站点版本 alpha-020 → alpha-021"
      }
    ]
  },
  {
    "key": "0.0.15.11",
    "title": "0.0.15.11（2026-09-11）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.15.11（2026-09-11）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**更新日志时间条只渲染到某个版本（关键修复）**：时间条轨道缺 `flexDirection: 'row'`，React Native 默认按列排布，24 个节点纵向堆叠后被 66px 的轨道高度裁掉——除最左一个节点外全部不可见，看起来就是「时间条只到 0.0.2，之后的版本完全没渲染」。现补上行排布，轨道改为 `alignItems: 'flex-start'`"
      },
      {
        "kind": "bullet",
        "text": "**点击时间条节点导致软件白屏（关键修复）**：菱形游标同一个 `Animated.View` 上，横向位移用 JS 驱动、点击弹性缩放用原生驱动，RN 不允许同一组件混用两种驱动，点击瞬间抛异常使整页崩溃。现统一为 JS 驱动；同时把整页包进 `ChangelogErrorBoundary`，即使日志数据异常也只降级为一段提示文字，不再白屏，返回按钮仍可用"
      },
      {
        "kind": "bullet",
        "text": "**新闻同步静默失败**：`syncNewsSections` / `removeNewsItem` 的三处失败提示固定为「更新失败（可手动添加）」，不带上任何原因，导致「上传时勾选了新闻展示、站点上却什么都没有」无从排查（本次即由 2026-09-10 一篇勾选了新闻的文章未出现在任何新闻区暴露）。现失败一律附带具体错误信息，内容无变化时也如实回报「无变化 / 未找到该卡片」，并在选了海报形态却没有海报图时明确提示已按文字新闻处理"
      },
      {
        "kind": "bullet",
        "text": "**预览不渲染网站样式（根目录页面）**：`buildPreviewHtml` 替换样式表链接的正则只认 `../css/` 前缀，站点根目录页面的 `./css/style.css` 命中不了，预览退化成无样式裸 HTML。现同时兼容 `./`、`../`、多级 `../../` 与无前缀写法"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**文件编辑器的「预览」标签页**：所有 HTML 文件（文章页、内容页面、普通 HTML）在编辑处即可按网站真实样式渲染，无需先保存回仓库。预览把**未保存的改动**一并合并进去（正文、源码、页面标题实时写回，元数据走与保存流程同一个 `updateArticleHtml`），先看到效果再决定保存；网站样式表首次进入预览时抓取，抓取失败明示「当前为无样式渲染」并在下次进入时自动重试"
      },
      {
        "kind": "bullet",
        "text": "**文件编辑器的「新闻」面板**：`library/<分类>/<文件名>.html` 一文可直接在编辑处管理新闻板块展示，不必重新走上传流程。面板先查询 index.html / news.html / en/index.html 三处的实际收录状态（含当前是否占据主页海报位），再按文字新闻或海报新闻发布、更新或撤下；海报形态沿用撰写页规矩（原图上传 `image/poster/`、不压缩），主页新闻区继续按「左侧 1 张海报 + 右侧最多 6 条文字、按日期降序」的容量规矩自动降级与挤出。此前漏发的新闻可在此直接补发"
      },
      {
        "kind": "bullet",
        "text": "**锁定态可滑动浏览**：正文与源码标签页锁定后改挂只读浏览视图（`ReadOnlyText`），可以上下滑动看全文、可以长按选抄，但不能编辑——此前锁定后 Android 上输入框被禁用连滚动一起失效，既滑不动也看不全。长文按行分块渲染，单块高度可控，数千行的站点文章源码也能稳定滚动浏览；撰写页与内容编辑器一并受益"
      },
      {
        "kind": "bullet",
        "text": "时间条与卡片区域的文案随排序调整：明确「左端为最新版本，向右回溯」「最新版本在前，向下依次回溯到最初版本」，节点首尾标注由「最初 / 最新」改为「最新 / 最初」"
      },
      {
        "kind": "section",
        "text": "改进"
      },
      {
        "kind": "bullet",
        "text": "**全部更新日志改为最新版本置顶**：日志卡片与时间条同步反转为「最新 → 最初」，进入页面默认定位最新版本；内置数据文件仍由脚本按时间升序生成，反转只在展示层，避免历史日志重排"
      },
      {
        "kind": "bullet",
        "text": "代码编辑器输入框补 `scrollEnabled={false}`，与其注释中声明的滚动方案（外层 ScrollView 为唯一滚动容器）一致，消除嵌套滚动手势冲突"
      },
      {
        "kind": "section",
        "text": "其他"
      },
      {
        "kind": "bullet",
        "text": "版本号提升至 0.0.15.11（package.json / app.json / CI artifact name 三处同步），android.versionCode 递增至 12"
      },
      {
        "kind": "bullet",
        "text": "内置全部更新日志数据由 `node scripts/gen-changelog.js` 重新生成，收录本版"
      },
      {
        "kind": "bullet",
        "text": "开放笔记化（通用 Markdown 笔记本）**不再并入本应用**，改由独立的 SlyWrite Lite 承担（本地存储、零账号零 Token）；SlyWrite 保持图书馆写作管理定位，曾为本项工作临时加入的笔记向工具栏预设已从 `MarkdownEditor` 移出"
      },
      {
        "kind": "bullet",
        "text": "配套站点变更（同日发布）：移动端浮层编排整改与新闻补录，站点版本 alpha-021 → alpha-022"
      }
    ]
  },
  {
    "key": "0.0.16",
    "title": "0.0.16（2026-09-15）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.16（2026-09-15）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**点「撰写文章」沿用旧草稿、无法另起新文章（缺陷 A）**：首页两个撰写入口现在总是先开一个**新会话**（清空表单 + 生成新草稿 id）再进撰写页；「继续编辑」只在草稿箱里发生。此前 zustand 会话常驻、草稿 id 只在发布成功后才清，于是草稿箱里已有稿子时再点入口就在接着写同一篇"
      },
      {
        "kind": "bullet",
        "text": "**知识词条的正文会串进文章（缺陷 A 的另一半）**：正文编辑器 `MarkdownEditor` 改为**纯受控**组件（`value` / `onChangeText` 必填），不再在未传参时偷偷读写文章的表单。原先知识词条页没传受控参数，正文实际写进了文章的 `bodyMarkdown`，导致「知识词条写点东西再点撰写文章就继承了正文」，而知识草稿自己反而永远存不下正文"
      },
      {
        "kind": "bullet",
        "text": "**知识词条发布卡死（缺陷 B）**：校验要求「概述 / 详细说明 / 历史」，但界面上没有任何填写与查看这些分节的地方，模板其实也没实现分节渲染，于是提示永远失败。现在模板按正文 H2 真正实现分节，校验逐节给出明确文案（缺哪一节、哪一节还空着、这一节该写什么）"
      },
      {
        "kind": "bullet",
        "text": "**上传到仓库的页面带着一整份内联站点 CSS**：`generatedHtml` 原先存的是套好网站样式的预览产物，发布时把这坨内联 CSS 一起提交、还丢掉了精修样式表的链接。现在上传内容一律是规范 HTML（只留 `<link>`），网站样式只在预览渲染时临时套上。文章与知识词条一并受益"
      },
      {
        "kind": "bullet",
        "text": "**App 生成的知识词条页不跟随网站配色**：模板此前内联一整套知识馆骨架 CSS 与三套手写明暗覆写，颜色写死，把站点六套配色全数盖掉。现在骨架与配色由站点 `css/library-refit.css` 与主题令牌统一承担，模板只保留词条页独有构件"
      },
      {
        "kind": "bullet",
        "text": "**跨零点后空白稿也会掉进草稿箱**：「是否真正编辑过」原来拿表单日期与模块加载时算出的默认日期比，App 常驻跨过后半夜再新建时两者相差一天，空白稿会被误判为已编辑；现改为与「当天」比，文章与词条两条判定一致"
      },
      {
        "kind": "bullet",
        "text": "**生成的知识词条页资源与导航全部指错层级**：词条实际上传到 `knowledge-hall/categories/{分类}/{文件}.html`，模板却按「与分类页同层」计算路径，导致样式、脚本、Logo、知识馆主页、分类页和返回链接失效。现按真实三级目录修正：站点资源上溯三级，知识馆主页上溯两级，分类页与返回链接上溯一级"
      },
      {
        "kind": "section",
        "text": "新增"
      },
      {
        "kind": "bullet",
        "text": "**知识词条分节工具**：正文工具栏「插入分节」只补当前缺失或为空的节（概述 / 详细说明 / 历史），撰写页顶部「分节状态」条逐节显示已填写 / 有标题无内容 / 缺这一节"
      },
      {
        "kind": "bullet",
        "text": "**词条「关联词条」可在 App 里手工管理**：元数据表单的词条块新增「关联词条」多行输入，每行一条 `标题|站内相对路径.html|关系说明（可选）`（容忍全角竖线、尖括号包裹、多余空白；外链与页内锚点会被跳过）。渲染顺序为**手工条目在前**，正文里出现的站内链接按路径去重后自动补在后面（同一链接保留手工写的标题与关系说明）；若正文自己写了「相关词条」一节，仍以该节内容渲染，不破坏手写结构。关系说明输出为站点权威结构的 `span.kh-related-relation`，图谱节点沿用同一份合并结果（最多四枚，不足补分类与知识馆）。进入预览前若有没被识别的行会列出原文提醒，但不阻断发布"
      },
      {
        "kind": "bullet",
        "text": "**词条页结构与站点权威模板一一对应**：`#section-summary`（概述）、`#section-detail`（详细说明）、`#section-history`（历史）、`#section-related`（相关词条）；未归入三节的 H2 转为补充节排在历史之后，内容不丢；全文没有 H2 时降级为详情放全文、概述取首段，保证生成页不空白"
      },
      {
        "kind": "bullet",
        "text": "**发布前按页型校验必需构件**：新增 `validateKnowledgeHtml`（检查侧栏、正文容器、四个分节、页脚、精修样式表与动态脚本链接），词条不再跳过这一步"
      },
      {
        "kind": "bullet",
        "text": "**CI 构建号注入脚本 `scripts/ci-version.js`**：测试构建把版本扩为 `A.B.C-<run_number>` 并填 `versionCode`；tag 正式构建保持 `A.B.C` 但仍注入 `versionCode`，使测试与正式两条通道的安装包不会互相倒退"
      },
      {
        "kind": "bullet",
        "text": "**草稿箱类型标签**：条目上标出「文章 / 知识词条」，两类草稿在同一列表里可辨识"
      },
      {
        "kind": "bullet",
        "text": "**正文插入构件去表情**：Callout 片段图标位由表情符号改为站点统一的排版符号 ※（与站点 alpha-023 的组件标准一致，界面文案不再出现 emoji）"
      },
      {
        "kind": "bullet",
        "text": "**知识词条补齐作者元数据**：生成页的 `.kh-entry-meta` 现在输出经过 HTML 转义的作者字段，供站点读者操作构件生成完整引用条目；缺失时回退为「薛柯道」"
      },
      {
        "kind": "section",
        "text": "改进"
      },
      {
        "kind": "bullet",
        "text": "**知识词条并入文章子类型（缺陷 C）**：表单新增 `entryType`（`article` / `knowledge`）与词条字段（别称、知识分类），不再有两套并行的编辑态与草稿体系；`knowledge-store` 删除，`/compose/knowledge`、`/compose/knowledge-preview` 保留为渲染同一组件的兼容入口；旧草稿在**读取时**迁移（不覆写存储），旧知识草稿的分类字段自动归位到 `knowledgeCategory`"
      },
      {
        "kind": "bullet",
        "text": "**会话生命周期显式化**：退出撰写流程时把最新表单落盘为草稿并结束会话，从预览页返回不算退出（会话保留），草稿 id 的复用规则写在 store 顶部注释里"
      },
      {
        "kind": "bullet",
        "text": "**草稿 id 兜底**：撰写页挂载时若无草稿上下文（直接进入或发布后回到该页）按当前条目类型现开会话，避免出现「有内容却没有可保存的草稿 id」"
      },
      {
        "kind": "bullet",
        "text": "**导航枢纽随发布同步**：发布、隐藏和取消隐藏文章时，除 `library.html` 外同步维护 `navigator.html` 对应分类，重复执行不会生成重复条目；取消隐藏时按目录恢复分类锚点，不再因缺少锚点文本而无法插回清单"
      },
      {
        "kind": "bullet",
        "text": "**旧词条草稿分节引导**：正文已有内容但缺少知识词条三节时，分节状态条直接说明「插入分节」只补标题、不改既有正文，降低旧草稿迁移时的误解"
      },
      {
        "kind": "section",
        "text": "版本与构建"
      },
      {
        "kind": "bullet",
        "text": "**版本号收敛为三段**：`package.json` / `app.json` 由旧规则的 `0.0.15.11` 改为正式版本 `0.0.16`（第四位构建号从此只由 CI 注入，仓库里不再出现四段号）"
      },
      {
        "kind": "bullet",
        "text": "**`build-apk.yml` 与统一发版规则对齐**：新增 tag 触发（`tags: ['v*']`）；**GitHub Release 只在 tag 构建时创建**（此前普通 push 也会自动建 Release，与「测试构建只留 artifact、不建 tag/Release」的规则冲突）；产物名改为从 `package.json` 读取版本，不再硬编码旧版本号"
      },
      {
        "kind": "bullet",
        "text": "**修复 CI 构建在「Setup Android SDK」一步十余秒内失败**：`android-actions/setup-android@v3` 与 `@v4` 都会在 runner 预装版本不匹配时下载已失效的固定 commandline-tools 包，构建尚未走到 `npm ci` 就中断。现移除该 action，直接使用 GitHub runner 镜像自带 Android SDK，并由 `sdkmanager --list_installed` 按需补齐组件；`actions/setup-java` 同步升到 v5，SlyWrite Lite 的同源 CI 一并对齐"
      },
      {
        "kind": "section",
        "text": "配套站点变更（同日发布）"
      },
      {
        "kind": "bullet",
        "text": "牧羊人图书馆站点升至 **alpha-023**：新增分级提示构件（提示 / 通知 / 警告 × 小弹窗 / 模态弹窗 / 轻提示，带「关闭后今日不再提示」与每日 0 点自动恢复）、顶栏历史导航（返回上一页 / 前进到刚才那一页）、知识馆侧边栏改为主题令牌驱动并可收缩；修复移动端顶栏未展开即撑高、海报新闻日期不居中；《Minesia 第一个公开测试》由测试文章归位为普通文章；Callout 图标位全站改用排版符号 ※ 并取消表情例外（站点已发布文章与 App 插入片段一并跟进）。App 的知识词条模板与这些改动逐字对齐"
      }
    ]
  },
  {
    "key": "0.0.17",
    "title": "0.0.17（2026-09-19）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.17（2026-09-19）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**时间条的选中标记整体偏右，压不到版本节点上**：节点中心按「左内边距 + 序号 × 节点宽 + 半格」计算，"
      },
      {
        "kind": "bullet",
        "text": "**从时间条点选版本跳转后不会选中该版本**：跳转是带动画的滚动，飞行途中列表滚动事件连续触发，"
      },
      {
        "kind": "section",
        "text": "版本与构建"
      },
      {
        "kind": "bullet",
        "text": "版本号 `0.0.16` → `0.0.17`（`package.json` / `app.json` 两处同步）；第四位构建号仍只由 CI 注入。"
      },
      {
        "kind": "bullet",
        "text": "按 2026-09-19 起的新发版规则（每批用户可见改动即一次发版），本批提交后随即打 tag `v0.0.17`。"
      },
      {
        "kind": "section",
        "text": "验证"
      },
      {
        "kind": "bullet",
        "text": "`npx tsc --noEmit` 通过。"
      }
    ]
  },
  {
    "key": "0.0.18",
    "title": "0.0.18（2026-09-19）",
    "blocks": [
      {
        "kind": "version",
        "text": "0.0.18（2026-09-19）"
      },
      {
        "kind": "section",
        "text": "修复"
      },
      {
        "kind": "bullet",
        "text": "**「全部更新日志」页看不到 0.0.17 的内容**：该页读的是内置数据 `src/lib/changelog-data.ts`，由 `scripts/gen-changelog.js` 从 `changelog/` 目录生成；0.0.17 发版时漏跑了这一步，页面停在 0.0.16，时间条上也缺最新那一格。现已重新生成（收录 27 → 28 个版本），并在发版流程里把「重跑生成脚本」写成必须的一步，避免再次漏掉"
      },
      {
        "kind": "section",
        "text": "版本与构建"
      },
      {
        "kind": "bullet",
        "text": "版本号 `0.0.17` → `0.0.18`（`package.json` / `app.json` 两处同步），tag `v0.0.18` 触发构建并创建 Release"
      },
      {
        "kind": "bullet",
        "text": "发版链新增检查项：写完 `changelog/CHANGELOG-{A.B.C}.md` 后必须 `node scripts/gen-changelog.js`，再提交、打 tag、推送 tag"
      },
      {
        "kind": "section",
        "text": "验证"
      },
      {
        "kind": "bullet",
        "text": "`npx tsc --noEmit` 通过；生成脚本输出 28 个版本，App 内时间条最左端为 v0.0.18"
      }
    ]
  }
];
