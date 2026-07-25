# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

---

# FitWord 项目交接文档（2026-07-25）

## 我们在做什么

把 FitWord（英语单词学习 App）从旧版 Vite+React web 迁移到 **Expo v57 + Azure TTS 云端语音**。

**核心目标：**
- 所有设备（iOS/Android）听到**完全一样的语音**（Azure 神经 TTS，不依赖设备本地引擎）
- 国内可访问（后端部署香港，不走 Vercel）
- 离线可用（词书数据打包 App，TTS 音频本地缓存）

## 架构

```
Expo App (React Native)  ──HTTP──▶  Node.js 后端  ──SDK──▶  Azure TTS
     │                               (Express)               (East Asia)
     ├─ 词书 JSON 本地打包
     ├─ expo-av 播放 MP3
     └─ expo-file-system 缓存音频
```

## 已经完成的

### Phase 1：数据层
- `assets/books/*.json` — 8 本词书（TOEFL/IELTS/考研1/2/专四/八/BEC/GRE），~47K 单词，已从旧项目 .ts 转为 JSON
- `src/types/word.ts` — Word, BookMeta 类型
- `src/constants/books.ts` — 词书元数据列表
- `src/data/wordLoader.ts` — 懒加载器，用静态 require map 解决 Metro 不支持 `import(variable)` 的问题

### Phase 2：后端（代码完成，未部署）
- `server/` — Express + Azure TTS SDK
- `server/src/services/azureTts.ts` — synthesize(text, voiceName) → Buffer
- `server/src/routes/tts.ts` — GET /api/tts?text=...&voice=... 返回 audio/mpeg
- `server/src/index.ts` — Express 入口，含限流、CORS
- `server/.env.example` — 需要填入 AZURE_SPEECH_KEY 和 AZURE_SPEECH_REGION
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
- `src/services/api.ts` — 后端 API URL 配置（当前为占位符 `https://api.fitword.example.com`）
- `src/services/ttsService.ts` — TTS 缓存逻辑：检查本地 → 下载 → 缓存到 FileSystem.cacheDirectory
- `src/services/audioPlayer.ts` — expo-av Audio.Sound 封装，支持 play/stop/pause/resume/setRate
- `src/hooks/useLearnSession.ts` — 6 步播放状态机：
  0. 释义(zh-CN-XiaoxiaoNeural) → 1. 单词(en-US-JennyNeural) → 2. 拼读(en-US-JennyNeural) → 3. 单词(en-US-JennyNeural) → 4. 例句(en-US-JennyNeural) → 5. 例句翻译(zh-CN-XiaoxiaoNeural)

### 其他
- 旧版项目 `C:\Users\neal\Projects\fitword-app` 已删除
- App 和 Server 的 TypeScript 编译均通过 ✅
- 代码已 push 到 GitHub `expo-migration` 分支

## 当前卡在：Step ① — 创建 Azure Speech 资源

需要去 Azure Portal 创建一个 Speech 资源，拿到 key 和 region。

**具体操作：**
1. 打开 https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices
2. 订阅：任意（免费试用可）
3. 资源组：新建 `fitword`
4. 区域：**East Asia**（离国内最近）
5. 名称：`fitword-tts`
6. 定价层：**Free F0**（每月 50 万字符免费）
7. 创建完成后 → 密钥和终结点 → 复制密钥 1

## 接下来的步骤

按顺序执行：

1. **创建 Azure Speech 资源**（卡在这里）→ 拿到 key + region
2. **部署后端** → 把 key 填入 `server/.env`，部署到阿里云 ECS 香港（或任何国内能访问的服务器），`npm start` 跑在 3000 端口
3. **配置 App URL** → 编辑 `src/services/api.ts`，把 `API_BASE` 从占位符改成真实服务器地址
4. **测试 App** → `npx expo start`，选词书 → 进入学习页，验证语音播放正常

## 踩过的坑，绝对不要踩

### 坑 1：expo-file-system SDK 57 API 变了
- ❌ `import * as FileSystem from 'expo-file-system'` — cacheDirectory 不存在
- ✅ `import * as FileSystem from 'expo-file-system/legacy'` — 用 legacy 路径导入才有 `FileSystem.cacheDirectory`、`downloadAsync`、`getInfoAsync` 等
- SDK 57 的新 API 用 `Paths.cache`（返回 Directory 对象），完全不同，别用

### 坑 2：Metro 不支持动态 import()
- ❌ `import(\`./books/${id}\`)` — Metro 打包时不认识变量路径
- ✅ 用 `Record<string, () => Word[]>` + 字符串字面量 `require()`，每个路径写死
- 见 `src/data/wordLoader.ts` 的写法

### 坑 3：Azure TTS SDK 枚举大小写
- ❌ `Audio16khz32KBitRateMonoMp3`（小写 k）
- ✅ `Audio16Khz32KBitRateMonoMp3`（大写 K）

### 坑 4：tsconfig 要排除 server 目录
- App 的 `tsconfig.json` 必须加 `"exclude": ["server"]`
- 否则 `npx tsc --noEmit` 会去检查 server 代码，报一堆 Node.js 类型错误

### 坑 5：旧方案都不管用
- expo-speech = 设备本地 TTS，iOS/Android/不同厂商音色完全不同，**不能用**
- Web Speech API = 只有浏览器有，Expo App 里没有
- Vercel 部署 = 国内被墙，用户访问不了
- 不要试图回到这些方案

## 项目关键文件速查

| 文件 | 作用 |
|------|------|
| `src/hooks/useLearnSession.ts` | 核心播放状态机，最复杂的逻辑 |
| `src/services/ttsService.ts` | TTS 缓存和下载 |
| `src/services/api.ts` | 后端 URL 配置（当前占位符） |
| `src/data/wordLoader.ts` | 词书加载（静态 require map） |
| `server/src/services/azureTts.ts` | Azure TTS SDK 封装 |
| `server/src/routes/tts.ts` | TTS API 路由 |
| `server/.env.example` | Azure 密钥模板 |

## 已安装的关键依赖

**App:**
- expo@~57.0.8, react@19.2.3, react-native@0.86.0
- expo-av@^16.0.8, expo-file-system@~57.0.1, expo-keep-awake@~57.0.1
- @react-navigation/native@^7.3.14, @react-navigation/native-stack@^7.18.6

**Server:**
- express@^4.21.0, microsoft-cognitiveservices-speech-sdk@^1.38.0
