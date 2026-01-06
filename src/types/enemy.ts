/**
 * 敵人系統類型定義
 * 根據設計文件 Act 1 數值基準定義
 */

// ===== 基礎枚舉 =====

/**
 * 敵人類型
 */
export enum EnemyType {
  NORMAL = 'NORMAL',   // 普通怪 (HP 20-25, 傷害 6-8)
  ELITE = 'ELITE',     // 精英怪 (HP 45-60, 傷害 10-14)
  BOSS = 'BOSS'        // Boss (HP 150+, 傷害 15+)
}

/**
 * 敵人行為模式
 */
export enum EnemyBehavior {
  AGGRESSIVE = 'AGGRESSIVE', // 攻擊型 (高傷害)
  DEFENSIVE = 'DEFENSIVE',   // 防禦型 (高護甲)
  BALANCED = 'BALANCED',     // 平衡型
  SPECIAL = 'SPECIAL'        // 特殊模式 (Boss 專用)
}

/**
 * 意圖類型 (敵人下回合行動)
 */
export enum IntentType {
  ATTACK = 'ATTACK',           // 普通攻擊
  HEAVY_ATTACK = 'HEAVY_ATTACK', // 重擊
  DEFEND = 'DEFEND',           // 防禦
  BUFF = 'BUFF',               // 增益自己
  DEBUFF = 'DEBUFF',           // 減益玩家
  SPECIAL = 'SPECIAL'          // 特殊技能
}

// ===== 敵人技能 =====

/**
 * 敵人技能定義
 */
export interface EnemySkill {
  id: string;           // 技能 ID
  name: string;         // 技能名稱
  intent: IntentType;   // 意圖類型
  damage?: number;      // 傷害值
  block?: number;       // 護甲值
  hits?: number;        // 攻擊次數 (多段攻擊)
  effects?: Array<{     // 附加效果
    type: 'DOT' | 'DEBUFF' | 'BUFF' | 'HEAL';
    value: number;
    turns?: number;
  }>;
  description: string;  // 技能描述
  cooldown?: number;    // 冷卻回合數
}

/**
 * AI 行為模式
 */
export interface EnemyAIPattern {
  conditions?: string[]; // 觸發條件 (例: 'hp_below_50%', 'turn_3')
  skills: Array<{
    skillId: string;
    weight: number;      // 權重 (決定選擇概率)
  }>;
}

// ===== 敵人數據 =====

/**
 * 敵人基礎數據
 */
export interface EnemyData {
  id: string;           // 唯一 ID
  name: string;         // 敵人名稱
  type: EnemyType;      // 類型
  behavior: EnemyBehavior; // 行為模式

  // === 數值屬性 ===
  hp: number;           // 最大生命值
  damage: number;       // 基礎傷害
  block?: number;       // 每回合基礎護甲

  // === 技能與 AI ===
  skills: EnemySkill[]; // 可用技能列表
  aiPatterns: EnemyAIPattern[]; // AI 行為模式

  // === 獎勵 ===
  rewards: {
    gold: [number, number]; // 金幣範圍 [最小, 最大]
    cardRewards?: number;   // 可選卡牌數量
    relicChance?: number;   // 遺物掉落概率 (0-1)
  };

  // === 視覺 ===
  emoji?: string;       // 臨時圖標
  imagePath?: string;   // 圖片路徑

  // === 元數據 ===
  act: number;          // 出現章節 (1, 2, 3...)
  description?: string; // 敵人描述
}

/**
 * 敵人戰鬥實例
 */
export interface EnemyInstance {
  instanceId: string;   // 實例 ID
  enemyId: string;      // 對應 EnemyData ID

  // 當前狀態
  currentHp: number;    // 當前生命值
  maxHp: number;        // 最大生命值
  currentBlock: number; // 當前護甲

  // 意圖與 AI
  currentIntent?: {     // 當前意圖 (顯示給玩家)
    type: IntentType;
    value?: number;     // 傷害值或護甲值
    skillId: string;
  };
  skillCooldowns: Map<string, number>; // 技能冷卻狀態

  // Buff/Debuff
  buffs: StatusEffect[];
  debuffs: StatusEffect[];

  // AI 狀態
  turnCount: number;    // 已行動回合數
  lastUsedSkills: string[]; // 最近使用的技能 (避免重複)
}

// ===== 狀態效果 =====

/**
 * 狀態效果 (Buff/Debuff)
 */
export interface StatusEffect {
  id: string;           // 效果 ID
  name: string;         // 效果名稱
  type: 'BUFF' | 'DEBUFF';
  value: number;        // 效果數值
  duration: number;     // 剩餘回合數 (-1 表示永久)
  stackable: boolean;   // 是否可疊加
  description: string;
}

// ===== 戰鬥遭遇 =====

/**
 * 戰鬥遭遇配置 (一場戰鬥可能有多個敵人)
 */
export interface EncounterData {
  id: string;
  name: string;
  enemies: string[];    // EnemyData ID 列表
  act: number;
  difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'ELITE' | 'BOSS';

  // 特殊規則 (可選)
  specialRules?: {
    startingBlock?: number; // 所有敵人起始護甲
    playerDebuff?: StatusEffect; // 玩家起始減益
    turnLimit?: number;     // 回合限制
  };
}

/**
 * 戰鬥遭遇實例
 */
export interface EncounterInstance {
  encounterId: string;
  enemies: EnemyInstance[]; // 當前戰鬥中的敵人實例
  turnCount: number;        // 戰鬥回合數
  isCompleted: boolean;
  victory?: boolean;
}
