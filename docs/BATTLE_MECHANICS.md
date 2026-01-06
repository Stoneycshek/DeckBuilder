# 戰鬥機制詳細定義

## 目錄
1. [戰鬥初始化](#戰鬥初始化)
2. [回合流程](#回合流程)
3. [傷害與護甲計算](#傷害與護甲計算)
4. [特殊效果機制](#特殊效果機制)
5. [戰鬥結束條件](#戰鬥結束條件)

---

## 戰鬥初始化

### 玩家初始狀態
```
起始能量: 3 點
起始手牌: 5 張 (從抽牌堆隨機抽取)
起始護甲: 0 點
初始狀態: 無 Buff/Debuff
手牌上限: 10 張

抽牌堆: 玩家完整牌組 (洗牌後)
棄牌堆: 空
手牌: 5 張
消耗堆: 空
```

### 敵人初始狀態
```
生命值: 根據敵人數據的 hp 值
護甲: 根據敵人數據的 block 值 (如有)
初始意圖: 根據 AI Pattern 決定
技能冷卻: 全部可用
```

### 戰鬥開始流程
```
1. 載入敵人數據,生成敵人實例
2. 載入玩家牌組,洗牌形成抽牌堆
3. 抽取初始手牌 (5 張)
4. 敵人決定首回合意圖 (顯示給玩家)
5. 玩家回合開始
```

---

## 回合流程

### 完整回合循環

```
┌─────────────────────────────────┐
│      玩家回合開始階段            │
├─────────────────────────────────┤
│ 1. 回合開始觸發                  │
│    - 回合數 +1                   │
│    - 恢復能量到最大值 (3 點)     │
│    - 補牌到 5 張 (從抽牌堆)      │
│    - 護甲重置為 0*               │
│    - 處理 DOT 傷害               │
│    - 更新 Buff/Debuff 持續時間   │
│                                  │
│    *有 RETAIN 效果則護甲保留     │
├─────────────────────────────────┤
│ 2. 玩家行動階段                  │
│    - 玩家可使用卡牌              │
│    - 消耗對應能量                │
│    - 執行卡牌效果                │
│    - 用過的牌進入棄牌堆          │
│    - 可重複直到結束回合          │
├─────────────────────────────────┤
│ 3. 玩家回合結束階段              │
│    - 剩餘手牌全部棄牌            │
│    - 護甲歸零 (除非有 RETAIN)    │
│    - 臨時 Buff 消失              │
│    - 進入敵人回合                │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│      敵人回合開始階段            │
├─────────────────────────────────┤
│ 1. 回合開始觸發                  │
│    - 處理 DOT 傷害               │
│    - 更新 Buff/Debuff 持續時間   │
├─────────────────────────────────┤
│ 2. 敵人行動階段                  │
│    - 依序對每個存活敵人:         │
│      a. 執行當前意圖的技能       │
│      b. 更新技能冷卻             │
│      c. 根據 AI 決定下回合意圖   │
├─────────────────────────────────┤
│ 3. 敵人回合結束階段              │
│    - 護甲歸零 (除非有特殊)       │
│    - 進入下一個玩家回合          │
└─────────────────────────────────┘
         ↓
    回到玩家回合
```

---

## 傷害與護甲計算

### 傷害計算公式

```typescript
// 基礎傷害
baseDamage = 卡牌效果 value

// 增傷計算
totalDamage = baseDamage + 玩家 Buff 增傷

// 護甲減免
if (卡牌有 PIERCING 標籤) {
  finalDamage = totalDamage  // 無視護甲
} else {
  damageToBlock = Math.min(totalDamage, 敵人護甲)
  敵人護甲 -= damageToBlock
  finalDamage = totalDamage - damageToBlock
}

// 扣血
敵人生命值 -= finalDamage
```

### 護甲計算

```typescript
// 獲得護甲
玩家護甲 += 卡牌效果 value

// 護甲上限: 999 (實際上不限制,但 UI 顯示限制)

// 護甲衰減
if (卡牌沒有 RETAIN 標籤) {
  // 回合結束時護甲歸零
  玩家護甲 = 0
} else {
  // 有 RETAIN 標籤,護甲保留
}
```

### 治療計算

```typescript
healAmount = 卡牌效果 value
玩家生命值 = Math.min(玩家生命值 + healAmount, 玩家最大生命值)
// 治療不能超過最大生命值
```

---

## 特殊效果機制

### DOT (持續傷害)

**施加時機**: 卡牌使用時立即施加 Debuff
**結算時機**: 每回合開始時 (玩家回合開始 & 敵人回合開始)

```typescript
interface DOTEffect {
  type: 'DOT',
  value: 4,        // 每回合傷害
  turns: 3         // 持續回合數
}

// 回合開始時處理
每回合開始時:
  for (DOT in 目標的 DOT 列表) {
    目標生命值 -= DOT.value
    DOT.turns -= 1
    if (DOT.turns <= 0) {
      移除此 DOT
    }
  }
```

**範例**: 烈焰法術
- 使用時:造成 8 點傷害
- 施加 DOT:接下來 3 回合,每回合開始造成 4 點傷害
- 總傷害:8 + 4×3 = 20 (分 4 個時間點)

### 緩速 (SLOW)

**效果**: 敵人下回合傷害減少

```typescript
interface SlowEffect {
  type: 'SLOW',
  value: 1,        // 減少傷害的百分比或固定值
  turns: 1         // 持續回合數
}

// 敵人攻擊時
if (敵人有 SLOW Debuff) {
  傷害 = 原始傷害 - SLOW.value  // 或 *= (1 - SLOW.value%)
}
```

**確定規則** (MVP):
```
緩速效果: 敵人下次攻擊傷害 -2
持續時間: 1 回合 (敵人攻擊後消失)
堆疊規則: 可堆疊 (多次緩速累加)
多段攻擊: 只在第一段攻擊生效,之後移除
```

**範例**:
- 敵人原本攻擊 10 點傷害
- 受到緩速後,攻擊變成 8 點傷害
- 最低傷害不低於 1 (Math.max(damage - 2, 1))

### Buff (增益)

**類型**:
1. **臨時增傷** (例:蓄力、火焰附魔)
   - 持續回合數:1 (使用一次後消失)
   - 下一張攻擊牌額外 +X 傷害

2. **永久增傷** (例:敵人的黑暗儀式)
   - 持續回合數:999 (視為永久)
   - 所有攻擊 +X 傷害

```typescript
// 臨時增傷
if (玩家有臨時增傷 Buff) {
  if (卡牌是攻擊類型) {
    傷害 += Buff.value
    Buff.turns -= 1
    if (Buff.turns <= 0) 移除 Buff
  }
}
```

### 能量修改 (ENERGY)

**類型 1**: 減少下一張牌費用 (例:集中)
```typescript
// 使用集中卡
添加 Buff: { type: 'COST_REDUCTION', value: -1, turns: 1 }

// 使用下一張牌時
if (玩家有費用減免 Buff) {
  實際消耗 = Math.max(0, 卡牌費用 + Buff.value)
  移除此 Buff
}
```

**類型 2**: 直接增加/減少能量 (未來擴展)

### 穿透 (PIERCING)

```typescript
// 有 PIERCING 標籤的攻擊
傷害直接扣除生命值,無視護甲
```

**範例**: 突刺 (4 點穿透傷害)

### 保留護甲 (RETAIN)

```typescript
// 玩家回合結束時
if (卡牌有 RETAIN 效果 || 玩家有保留護甲 Buff) {
  // 護甲不歸零
} else {
  玩家護甲 = 0
}
```

**範例**: 冰霜護盾 (護甲保留到下回合)

### 消耗 (EXHAUST)

```typescript
// 使用帶 EXHAUST 標籤的卡牌後
卡牌進入消耗堆 (而非棄牌堆)
本局戰鬥中無法再次使用
```

**注意**: MVP 階段暫無 EXHAUST 卡牌,預留機制

---

## 抽牌機制

### 抽牌流程

```typescript
function drawCards(count: number) {
  for (let i = 0; i < count; i++) {
    if (手牌數量 >= 最大手牌數 10) {
      break  // 手牌已滿,停止抽牌
    }

    if (抽牌堆為空) {
      if (棄牌堆為空) {
        break  // 無牌可抽
      }
      // 重洗棄牌堆
      抽牌堆 = 洗牌(棄牌堆)
      棄牌堆 = []
    }

    手牌.push(抽牌堆.pop())
  }
}
```

### 抽牌時機

1. **戰鬥開始**: 抽 5 張
2. **回合開始**: 抽 0 張 (預設,除非有特殊效果)
3. **卡牌效果**: 例如「戰鬥專注」抽 2 張

---

## 戰鬥結束條件

### 勝利條件
```
所有敵人生命值 <= 0
```

### 失敗條件
```
玩家生命值 <= 0
```

### 戰鬥結束流程

**勝利時**:
```
1. 停止所有行動
2. 播放勝利動畫 (可選)
3. 計算獎勵:
   - 金幣:根據敵人獎勵範圍隨機
   - 卡牌選項:隨機 3 張可選卡牌
   - 遺物:根據概率掉落 (精英/Boss)
4. 進入獎勵界面
```

**失敗時**:
```
1. 停止所有行動
2. 播放失敗動畫 (可選)
3. 顯示戰鬥統計
4. 進入遊戲結束界面
   - 選項:重新開始 / 返回主選單
```

---

## 敵人 AI 決策

### 意圖決定流程

```typescript
function determineEnemyIntent(enemy: EnemyInstance): Intent {
  // 1. 檢查條件觸發的技能
  for (pattern of enemy.aiPatterns) {
    if (checkConditions(pattern.conditions, enemy)) {
      return selectSkillByWeight(pattern.skills)
    }
  }

  // 2. 使用預設技能池
  const defaultPattern = enemy.aiPatterns.find(p => !p.conditions)
  return selectSkillByWeight(defaultPattern.skills)
}

function checkConditions(conditions: string[], enemy: EnemyInstance): boolean {
  // 條件範例:
  // "hp_below_50%" -> enemy.currentHp < enemy.maxHp * 0.5
  // "turn_1" -> battleState.turn === 1
  // "player_has_buff" -> player.buffs.length > 0
}

function selectSkillByWeight(skills: SkillWeight[]): string {
  // 根據權重隨機選擇
  const totalWeight = skills.reduce((sum, s) => sum + s.weight, 0)
  let random = Math.random() * totalWeight

  for (skill of skills) {
    random -= skill.weight
    if (random <= 0) return skill.skillId
  }
}
```

### 意圖顯示

玩家可看到敵人下回合的意圖:
- **攻擊**: 顯示傷害值 (例:⚔️ 12)
- **重擊**: 顯示高傷害 + 警告 (例:⚔️⚔️ 18)
- **防禦**: 顯示護甲值 (例:🛡️ 8)
- **增益**: 顯示 Buff 圖標 (例:🔺)
- **減益**: 顯示 Debuff 圖標 (例:🔻)

---

## 特殊規則

### 多段攻擊

```typescript
// 例:史萊姆 Boss 的多重攻擊 (3 次 × 10 傷害)
for (let i = 0; i < hits; i++) {
  dealDamage(target, damagePerHit)
  // 每次攻擊獨立計算護甲減免
}
```

### AOE (範圍攻擊)

```typescript
// 例:火焰箭雨 (對所有敵人 6 點傷害)
for (enemy of enemies) {
  dealDamage(enemy, damage)
}
// 注意:護甲獨立計算,不共享
```

---

## MVP 階段未實現的機制 (預留)

以下機制在類型定義中已預留,但 MVP 暫不實現:

- ⏸️ 遺物系統
- ⏸️ 藥水系統
- ⏸️ 複雜的狀態效果 (例:易傷、虛弱、中毒等)
- ⏸️ 棄牌選擇 (目前蓄力強制棄 1 張)
- ⏸️ 費用動態調整 (例:本回合費用 +1/-1)

---

## 已確認設計決策總結

### ✅ 核心數值
- 起始手牌: 5 張
- 最大手牌: 10 張
- 每回合能量: 3 點
- 每回合補牌: 補滿到 5 張

### ✅ 機制細節
1. **緩速**: 減少敵人 2 點攻擊傷害,可堆疊,持續 1 回合
2. **Buff 堆疊**: 同類型 Buff 數值累加 (例:火焰附魔 +4 + 蓄力 +6 = +10)
3. **護甲保留**: RETAIN 效果的護甲保留 1 個完整回合,之後歸零
4. **護甲上限**: 無上限 (但 UI 建議顯示上限 999)


### ✅ 已確認的設計決策

1. **緩速機制**: 減少固定值 -2 傷害
2. **Buff 堆疊**: 同類型 Buff 可以堆疊
3. **護甲保留**: 冰霜護盾保留 1 回合 (下回合結束歸零)
4. **回合抽牌**: 每回合開始補滿到 5 張手牌

---

**文檔版本**: 0.1.0
**最後更新**: 2026-01-06
**狀態**: 待確認設計決策
