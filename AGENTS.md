# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

---

# FitWord 项目交接文档（2026-07-26）

## 我们在做什么

把 FitWord（英语单词学习 App）从旧版 Vite+React web 迁移到 **Expo v57 + Edge TTS 云端语音**。

**核心目标：**
- 所有设备（iOS/Android）听到**完全一样的语音**（Edge 神经 TTS，不依赖设备本地引擎）
- 无需注册云服务（Edge TTS 免费无限量，无需 API Key）
- 离线可用（词书数据打包 App，TTS 音频本地缓存）

## 架构

```
Expo App (React Native)  ──HTTP──▶  Node.js 后端  ──subprocess──▶  edge-tts (Python)
     │                               (Express)                │
     ├─ 词书 JSON 本地打包                                    └─ Bing Speech API (WebSocket)
     ├─ expo-av 播放 MP3
     └─ expo-file-system 缓存音频
```

**为什么用 Edge TTS 而不是 Azure TTS：**
- Azure Portal 国内访问 404，无法创建 Speech 资源
- Edge TTS 与 Azure TTS 使用**同一套神经语音模型**（Jenny, Xiaoxiao 等）
- 完全免费、无需注册、无限量
- 通过 Python `edge-tts` CLI 调用（Node.js 原生 WebSocket 在墙内可能被拦）

## 已经完成的

### Phase 1：数据层
- `assets/books/*.json` — 8 本词书（TOEFL/IELTS/考研1/2/专四/八/BEC/GRE），~47K 单词，已从旧项目 .ts 转为 JSON
- `src/types/word.ts` — Word, BookMeta 类型
- `src/constants/books.ts` — 词书元数据列表
- `src/data/wordLoader.ts` — 懒加载器，用静态 require map 解决 Metro 不支持 `import(variable)` 的问题

### Phase 2：后端（代码完成，未部署）
- `server/` — Express + edge-tts (Python CLI)
- `server/src/services/edgeTts.ts` — synthesize(text, voiceName) → Buffer，通过 `spawn('edge-tts', ...)` 调用 Python CLI
- `server/src/routes/tts.ts` — GET /api/tts?text=...&voice=... 返回 audio/mpeg
- `server/src/index.ts` — Express 入口，含限流、CORS
- `server/.env.example` — 仅需 PORT（默认 3000），无需任何 API Key
- 后端 TypeScript 编译通过 ✅

### Phase 3：App 界面
- `App.tsx` — @react-navigation/native-stack 导航，3 个页面
- `src/screens/HomeScreen.tsx` — "FitWord" 标题 + "开始学习""复习"两个大按钮
- `src/screens/BookSelectScreen.tsx` — 2 列词书网格，FlatList 渲染
- `src/screens/LearnScreen.tsx` — 学习页，组合 WordCard + ProgressBar + ControlButtons
- `src/components/WordCard.tsx` — 显示单词、音标、释义、例句
- `src/components/ProgressBar.tsx` — 进度条
- `src/components/ControlButtons.tsx` — 重播/上一个/暂停/下一个/变速

### Phase 4：音频管线
- `src/services/api.ts` — 后端 API URL 配置（当前为 `http://localhost:3000`，部署时改一行即可）
- `src/services/ttsService.ts` — TTS 缓存逻辑：检查本地 → 下载 → 缓存到 FileSystem.cacheDirectory
- `src/services/audioPlayer.ts` — expo-av Audio.Sound 封装，支持 play/stop/pause/resume/setRate
- `src/hooks/useLearnSession.ts` — 6 步播放状态机：
  0. 释义(zh-CN-XiaoxiaoNeural) → 1. 单词(en-US-JennyNeural) → 2. 拼读(en-US-JennyNeural) → 3. 单词(en-US-JennyNeural) → 4. 例句(en-US-JennyNeural) → 5. 例句翻译(zh-CN-XiaoxiaoNeural)

### 其他
- 旧版项目 `C:\Users\neal\Projects\fitword-app` 已删除
- 桌面 `FitWord.bat` 已删除
- App 和 Server 的 TypeScript 编译均通过 ✅
- 代码已 push 到 GitHub `expo-migration` 分支

## 当前进度 & 下次继续

**已完成（2026-07-26）：**
- ✅ Edge TTS 方案验证通过（Python edge-tts 在本地可正常合成语音）
- ✅ 后端本地运行测试通过（`curl http://localhost:3000/api/tts?text=hello&voice=en-US-JennyNeural` → 200 + MP3 音频）
- ✅ Expo Metro + Web 模式都能启动
- ✅ App/Server TypeScript 编译通过

**下一步（首次真机测试）：**

推荐先走方案 A 快速验证，不需要买服务器：

```
方案 A：内网穿透（免费，今天能跑）
  1. 装 cpolar → https://www.cpolar.com/ 下载安装
  2. 终端跑：cpolar http 3000
  3. 拿到公网 URL（如 https://xxx.cpolar.cn）
  4. 改 src/services/api.ts 的 API_BASE 为这个 URL
  5. 开两个终端：
     终端 1: cd server && npx tsx src/index.ts
     终端 2: npx expo start
  6. 手机装 Expo Go，扫码测试

方案 B：买服务器（稳定，长期用）
  1. 阿里云轻量应用服务器 香港（~¥34/月）
     - 国内访问快 + 免备案 + 能连 Bing Speech API
     - 1核1G内存够用
  2. 服务器上装 Node.js 22+、Python 3 + pip install edge-tts
  3. git clone + npm install + npm run build && npm start
  4. 改 api.ts 的 API_BASE 为服务器 IP
```

## 踩过的坑，绝对不要踩

### 坑 1：expo-file-system SDK 57 API 变了
- ❌ `import * as FileSystem from 'expo-file-system'` — cacheDirectory 不存在
- ✅ `import * as FileSystem from 'expo-file-system/legacy'` — 用 legacy 路径导入才有 `FileSystem.cacheDirectory`、`downloadAsync`、`getInfoAsync` 等
- SDK 57 的新 API 用 `Paths.cache`（返回 Directory 对象），完全不同，别用

### 坑 2：Metro 不支持动态 import()
- ❌ `import(\`./books/${id}\`)` — Metro 打包时不认识变量路径
- ✅ 用 `Record<string, () => Word[]>` + 字符串字面量 `require()`，每个路径写死
- 见 `src/data/wordLoader.ts` 的写法

### 坑 3：Node.js WebSocket 直连 Edge TTS 在墙内 403
- ❌ 用 `ws` 库直连 `wss://speech.platform.bing.com/...` — 返回 403
- ✅ 用 Python `edge-tts` CLI（`pip install edge-tts`），Node.js 通过 `spawn` 调用
- edge-tts 库处理了 WebSocket 握手的所有细节（headers、token 等），比自己写可靠

### 坑 4：tsconfig 要排除 server 目录
- App 的 `tsconfig.json` 必须加 `"exclude": ["server"]`
- 否则 `npx tsc --noEmit` 会去检查 server 代码，报一堆 Node.js 类型错误

### 坑 5：旧方案都不管用
- expo-speech = 设备本地 TTS，iOS/Android/不同厂商音色完全不同，**不能用**
- Web Speech API = 只有浏览器有，Expo App 里没有
- Azure Portal = 国内访问 404，无法注册
- 不要试图回到这些方案

## 项目关键文件速查

| 文件 | 作用 |
|------|------|
| `src/hooks/useLearnSession.ts` | 核心播放状态机，最复杂的逻辑 |
| `src/services/ttsService.ts` | TTS 缓存和下载 |
| `src/services/api.ts` | 后端 URL 配置（当前占位符） |
| `src/data/wordLoader.ts` | 词书加载（静态 require map） |
| `server/src/services/edgeTts.ts` | Edge TTS 封装（spawn edge-tts CLI） |
| `server/src/routes/tts.ts` | TTS API 路由 |
| `server/.env.example` | 仅需 PORT |

## 已安装的关键依赖

**App:**
- expo@~57.0.8, react@19.2.3, react-native@0.86.0
- expo-av@^16.0.8, expo-file-system@~57.0.1, expo-keep-awake@~57.0.1
- @react-navigation/native@^7.3.14, @react-navigation/native-stack@^7.18.6

**Server:**
- express@^4.21.0
- 无需 Node.js TTS 依赖 — 通过 `spawn('edge-tts', ...)` 调用 Python CLI

**Server 运行环境要求：**
- Python 3.x + `pip install edge-tts`
