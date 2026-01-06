# CLAUDE.md - 開發指南

## 專案概述

**專案名稱**: 元素合成 Deckbuilder (Roguelike Deckbuilder)

**核心理念**: 卡牌同時具備「可使用的技能」與「可拆解重組的零件」雙重身份

**目標平台**:
- MVP: 手機網頁版 (React + TypeScript)
- 未來: Unity/Unreal 完整版

---

## 技術棧

### 前端框架
- **React 18+** + **TypeScript 5+**
- **Vite** (建構工具)
- **CSS Modules** 或 **Tailwind CSS** (樣式方案)

### 數據管理
- **JSON 配置文件** (卡牌、敵人、合成規則)
- **LocalStorage** (遊戲存檔)
- **TypeScript 嚴格類型檢查**

### 美術資源
- MVP 階段: 灰白色 mockup/手繪風格
- 使用 AI 生成必要圖檔
- Emoji 作為臨時 icon (🔥❄⚔🗡🏹🛡🔧🧠💚)

---

## 專案結構

```
DeckBuilder/
├── docs/                          # 設計文檔
│   ├── DESIGN.md                  # 遊戲設計總結
│   ├── ARCHITECTURE.md            # 技術架構
│   ├── BALANCE.md                 # 數值平衡文件
│   └── API.md                     # 內部 API 文件
├── src/
│   ├── assets/                    # 靜態資源
│   │   ├── images/                # 遊戲圖片
│   │   └── styles/                # 全局樣式
│   ├── components/                # React 組件
│   │   ├── Card/                  # 卡牌相關組件
│   │   ├── Battle/                # 戰鬥場景組件
│   │   ├── Synthesis/             # 合成商店組件
│   │   ├── Map/                   # 地圖節點組件
│   │   └── UI/                    # 通用 UI 組件
│   ├── data/                      # 遊戲數據 (JSON)
│   │   ├── cards.json             # 所有卡牌定義
│   │   ├── enemies.json           # 敵人數據
│   │   ├── synthesis-rules.json   # 合成規則配置
│   │   └── game-config.json       # 遊戲基礎配置
│   ├── types/                     # TypeScript 類型定義
│   │   ├── card.ts                # 卡牌類型
│   │   ├── enemy.ts               # 敵人類型
│   │   ├── game.ts                # 遊戲狀態類型
│   │   ├── synthesis.ts           # 合成系統類型
│   │   └── index.ts               # 統一導出
│   ├── game/                      # 遊戲核心邏輯 (純邏輯,無 UI)
│   │   ├── BattleManager.ts       # 戰鬥系統
│   │   ├── DeckManager.ts         # 牌組管理
│   │   ├── SynthesisManager.ts    # 合成系統
│   │   ├── EnemyAI.ts             # 敵人 AI
│   │   └── SaveManager.ts         # 存檔/讀檔
│   ├── utils/                     # 工具函數
│   │   ├── calculate.ts           # 數值計算
│   │   ├── random.ts              # 隨機數生成
│   │   └── validation.ts          # 數據驗證
│   ├── hooks/                     # React Hooks
│   │   ├── useGameState.ts
│   │   ├── useBattle.ts
│   │   └── useSynthesis.ts
│   ├── App.tsx                    # 主應用
│   ├── main.tsx                   # 入口文件
│   └── vite-env.d.ts
├── public/                        # 靜態資源 (favicon 等)
├── tests/                         # 測試文件
├── .gitignore
├── CLAUDE.md                      # 本文件
├── README.md                      # 專案說明
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 開發原則

### 1. 數據驅動設計
- **所有遊戲內容定義在 JSON 文件中**
- TypeScript 類型定義確保數據結構正確
- 遊戲邏輯與數據分離,便於平衡調整

### 2. 組件化設計
- UI 組件與遊戲邏輯分離
- 每個組件單一職責
- 使用 React Hooks 管理狀態

### 3. 類型安全
- 所有函數、變量必須有明確類型
- 啟用 TypeScript strict 模式
- 避免使用 `any` 類型

### 4. 可維護性
- 清晰的文件命名和目錄結構
- 充分的代碼註釋 (中英文皆可)
- 遵循一致的命名規範

---

## 命名規範

### TypeScript/React
- **組件**: PascalCase (例: `CardComponent.tsx`)
- **函數/變量**: camelCase (例: `calculateDamage`)
- **常量**: UPPER_SNAKE_CASE (例: `MAX_HAND_SIZE`)
- **類型/接口**: PascalCase (例: `CardData`, `GameState`)
- **枚舉**: PascalCase (例: `CardType`, `ElementType`)

### 文件命名
- **組件文件**: `ComponentName.tsx`
- **類型文件**: `typename.ts`
- **工具文件**: `功能名.ts`
- **JSON 數據**: `kebab-case.json`

### Git Commit 規範
```
<type>(<scope>): <subject>

type 類型:
- feat: 新功能
- fix: 修復 bug
- docs: 文檔更新
- style: 代碼格式調整
- refactor: 重構
- test: 測試相關
- chore: 建構/工具配置

範例:
feat(card): 新增基礎卡牌數據定義
fix(battle): 修復傷害計算錯誤
docs(design): 更新合成系統設計文件
```

---

## 開發流程

### 階段 1: 基礎架構 (當前)
- [x] 建立專案文檔
- [ ] 定義 TypeScript 類型系統
- [ ] 建立 JSON 數據配置
- [ ] 設置 Git 工作流程

### 階段 2: 核心邏輯
- [ ] 實現卡牌系統
- [ ] 實現戰鬥系統
- [ ] 實現合成系統
- [ ] 實現存檔系統

### 階段 3: UI 實現
- [ ] 卡牌展示組件
- [ ] 戰鬥場景 UI
- [ ] 合成商店 UI
- [ ] 遊戲主流程

### 階段 4: 測試與調整
- [ ] 數值平衡測試
- [ ] 手機適配
- [ ] 性能優化
- [ ] Bug 修復

### 階段 5: MVP 發布
- [ ] 部署到 GitHub Pages / Vercel
- [ ] 收集玩家反饋
- [ ] 迭代優化

---

## 重要設計約束

### 來自設計文件的核心規則
1. **戰鬥中不進行複雜組合** - 深度決策集中在戰鬥外
2. **單張卡最多 2-3 個 Components**
3. **禁止修飾 × 修飾的無限疊加**
4. **治療卡必須稀少且偏弱**
5. **1 Energy ≈ 5 點戰鬥價值** (Act 1 基準)

### 數值平衡參考 (Act 1)
```
玩家:
- 每回合 Energy: 3
- 平均輸出: ~15 傷害/回合

怪物:
- 普通怪: HP 20-25, 傷害 6-8
- 精英怪: HP 45-60, 傷害 10-14
- Boss: HP 150+, 傷害 15+

效果換算 (1 費用):
- 傷害: 5
- 護甲: 6
- 治療: 4
- 抽牌: 1.5-2 張
```

---

## 開發工具建議

### VS Code 擴展
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense (如使用 Tailwind)

### 推薦的 npm 套件
- `react` + `react-dom`
- `typescript`
- `vite`
- `@types/react` + `@types/react-dom`
- `clsx` (條件類名)
- `immer` (不可變狀態管理)

---

## 測試策略

### 單元測試
- 核心遊戲邏輯 (BattleManager, SynthesisManager 等)
- 數值計算函數
- 數據驗證函數

### 集成測試
- 完整戰鬥流程
- 合成系統流程
- 存檔/讀檔功能

### 手動測試
- 遊戲平衡性
- 手機觸控體驗
- 不同屏幕尺寸適配

---

## 性能考量

### MVP 階段優先級
1. **功能完整性** > 性能優化
2. 確保手機流暢運行 (60fps 基本體驗)
3. 避免過早優化

### 基本優化
- 使用 React.memo 避免不必要的重渲染
- 卡牌圖片懶加載
- LocalStorage 批量讀寫

---

## 部署方案

### MVP 推薦平台
- **Vercel** (推薦,自動部署)
- **GitHub Pages** (免費,簡單)
- **Netlify** (功能豐富)

### 部署流程
1. `npm run build` 建構生產版本
2. 推送到 GitHub
3. 平台自動部署 (Vercel/Netlify)
4. 或手動部署到 GitHub Pages

---

## 已知限制與未來擴展

### MVP 階段不包含
- 多角色系統 (後續擴展)
- 第二層/第三層合成
- 音效與音樂
- 多語言支持
- 雲端同步

### Unity/Unreal 移植準備
- 保持遊戲邏輯與 UI 分離
- JSON 數據格式保持一致
- 核心算法可直接翻譯成 C#/C++

---

## 聯絡與協作

### Git 分支策略
- `main`: 穩定版本
- `develop`: 開發分支
- `feature/*`: 功能分支
- `hotfix/*`: 緊急修復

### Issue 追蹤
建議在 GitHub Issues 追蹤:
- Bug 回報
- 功能需求
- 數值平衡調整建議

---

## 參考資源

### 設計文檔
- [遊戲設計總結](./docs/DESIGN.md)
- [技術架構](./docs/ARCHITECTURE.md)
- [數值平衡](./docs/BALANCE.md)

### 遊戲參考
- Slay the Spire (Roguelike Deckbuilder 經典)
- Monster Train (合成機制參考)
- Inscryption (卡牌創新玩法)

---

**最後更新**: 2026-01-06
**維護者**: 開發團隊
