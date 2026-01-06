/**
 * 卡牌系統類型定義
 * 根據設計文件定義卡牌的雙態特性:使用面與結構面
 */

// ===== 基礎枚舉 =====

/**
 * 元素類型
 */
export enum ElementType {
  FIRE = 'FIRE',     // 🔥 火
  ICE = 'ICE',       // ❄ 冰
  PHYSICAL = 'PHYSICAL' // ⚔ 物理
}

/**
 * 型態類型
 */
export enum FormType {
  MELEE = 'MELEE',     // 🗡 近戰
  RANGED = 'RANGED',   // 🏹 遠程
  DEFENSE = 'DEFENSE'  // 🛡 防禦
}

/**
 * 功能類型
 */
export enum UtilityType {
  BUFF = 'BUFF',       // 🔧 強化
  DRAW = 'DRAW',       // 🧠 抽牌
  HEAL = 'HEAL'        // 💚 治療
}

/**
 * 卡牌標籤 (用於戰鬥互動與合成相容性判斷)
 */
export enum CardTag {
  // 元素標籤
  FIRE = 'FIRE',
  ICE = 'ICE',
  PHYSICAL = 'PHYSICAL',

  // 型態標籤
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  DEFENSE = 'DEFENSE',

  // 功能標籤
  BUFF = 'BUFF',
  DRAW = 'DRAW',
  HEAL = 'HEAL',

  // 特殊標籤
  AOE = 'AOE',           // 範圍攻擊
  DOT = 'DOT',           // 持續傷害
  CONTROL = 'CONTROL',   // 控制效果
  PIERCING = 'PIERCING', // 穿透護甲
  RETAIN = 'RETAIN',     // 保留到下回合
  EXHAUST = 'EXHAUST'    // 用後消耗
}

/**
 * 效果類型
 */
export enum EffectType {
  DAMAGE = 'DAMAGE',           // 造成傷害
  BLOCK = 'BLOCK',             // 獲得護甲
  HEAL = 'HEAL',               // 治療
  DRAW = 'DRAW',               // 抽牌
  ENERGY = 'ENERGY',           // 能量修改
  BUFF_DAMAGE = 'BUFF_DAMAGE', // 增加傷害
  DEBUFF = 'DEBUFF',           // 減益
  SLOW = 'SLOW',               // 緩速
  DOT = 'DOT'                  // 持續傷害
}

/**
 * 卡牌稀有度
 */
export enum CardRarity {
  BASIC = 'BASIC',       // 基礎卡 (起始牌組)
  COMMON = 'COMMON',     // 普通 (容易獲得)
  UNCOMMON = 'UNCOMMON', // 罕見 (合成得到)
  RARE = 'RARE',         // 稀有 (高階合成)
  LEGENDARY = 'LEGENDARY' // 傳說 (特殊合成)
}

// ===== 效果結構 =====

/**
 * 單一效果定義
 */
export interface CardEffect {
  type: EffectType;
  value: number;
  target?: 'SELF' | 'ENEMY' | 'ALL_ENEMIES' | 'RANDOM_ENEMY';
  turns?: number; // 持續回合數 (DOT, BUFF 等)
  condition?: string; // 觸發條件 (可選)
}

// ===== 合成零件 =====

/**
 * 合成零件 (拆解卡牌後獲得)
 */
export interface CardComponent {
  id: string;         // 零件 ID (例: 'comp_fire', 'comp_melee')
  name: string;       // 零件名稱
  type: ElementType | FormType | UtilityType | 'MODIFIER'; // 零件類型
  description?: string; // 零件描述
}

// ===== 卡牌數據 =====

/**
 * 卡牌完整數據結構
 */
export interface CardData {
  // === 基本信息 ===
  id: string;           // 唯一 ID (例: 'card_fireball')
  name: string;         // 卡牌名稱
  description: string;  // 效果描述
  rarity: CardRarity;   // 稀有度

  // === 使用面 (戰鬥) ===
  cost: number;         // 能量消耗
  effects: CardEffect[]; // 卡牌效果列表
  tags: CardTag[];      // 標籤 (影響互動與合成)

  // === 結構面 (合成) ===
  components: CardComponent[]; // 拆解後提供的零件
  synthesisLevel: number;      // 合成層級 (1=基礎, 2=一階合成, 3=二階...)

  // === 視覺 ===
  emoji?: string;       // 臨時圖標 (MVP 階段)
  imagePath?: string;   // 圖片路徑 (未來使用)

  // === 元數據 ===
  isStarterCard?: boolean;  // 是否為起始卡
  obtainableInRun?: boolean; // 是否可在遊戲中獲得
}

/**
 * 卡牌實例 (遊戲中實際使用的卡牌)
 * 與 CardData 的區別:實例可能有強化、狀態等動態屬性
 */
export interface CardInstance {
  instanceId: string;   // 實例唯一 ID (用於追蹤特定卡牌)
  cardId: string;       // 對應的 CardData ID

  // 動態屬性 (可變)
  upgraded: boolean;    // 是否已強化
  upgradedCost?: number;     // 強化後消耗
  upgradedEffects?: CardEffect[]; // 強化後效果

  // 戰鬥中臨時狀態
  costModifier?: number; // 本回合費用修正
  tempBuff?: number;     // 臨時增傷
}

// ===== 工具類型 =====

/**
 * 卡牌過濾器
 */
export interface CardFilter {
  tags?: CardTag[];
  rarity?: CardRarity[];
  costRange?: [number, number]; // [最小, 最大]
  synthesisLevel?: number;
}

/**
 * 卡牌排序選項
 */
export type CardSortBy = 'cost' | 'name' | 'rarity' | 'synthesisLevel';

/**
 * 卡牌選擇結果
 */
export interface CardSelection {
  selected: CardInstance[];
  deselected: CardInstance[];
}
