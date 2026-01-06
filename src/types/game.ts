/**
 * 遊戲核心狀態與流程類型定義
 */

import { CardInstance } from './card';
import { EnemyInstance, EncounterInstance, StatusEffect } from './enemy';
import { SynthesisShopState, SynthesisHistory } from './synthesis';

// ===== 遊戲狀態 =====

/**
 * 遊戲整體狀態
 */
export interface GameState {
  // 遊玩會話
  runId: string;          // 本次遊玩 ID
  seed?: string;          // 隨機種子 (可選,用於重現)

  // 進度
  currentAct: number;     // 當前章節 (1, 2, 3...)
  currentFloor: number;   // 當前樓層
  currentNode: MapNode;   // 當前節點

  // 玩家狀態
  player: PlayerState;

  // 遊戲階段
  phase: GamePhase;
  battleState?: BattleState; // 戰鬥中狀態
  shopState?: SynthesisShopState; // 商店中狀態
  eventState?: EventState; // 事件中狀態

  // 地圖
  map: GameMap;

  // 歷史記錄
  history: {
    battles: BattleHistory[];
    synthesis: SynthesisHistory[];
    events: EventHistory[];
  };

  // 元數據
  startTime: number;      // 開始時間戳
  playTime: number;       // 遊玩時間 (秒)
  isGameOver: boolean;
  victory?: boolean;
}

/**
 * 遊戲階段
 */
export enum GamePhase {
  MENU = 'MENU',               // 主選單
  MAP = 'MAP',                 // 地圖選擇
  BATTLE = 'BATTLE',           // 戰鬥中
  BATTLE_REWARD = 'BATTLE_REWARD', // 戰鬥獎勵
  SYNTHESIS_SHOP = 'SYNTHESIS_SHOP', // 合成商店
  EVENT = 'EVENT',             // 事件
  REST = 'REST',               // 休息
  GAME_OVER = 'GAME_OVER'      // 遊戲結束
}

// ===== 玩家狀態 =====

/**
 * 玩家狀態
 */
export interface PlayerState {
  // 生命值
  currentHp: number;
  maxHp: number;

  // 資源
  gold: number;
  energy: number;       // 當前能量 (僅戰鬥中)
  maxEnergy: number;    // 最大能量

  // 牌組
  deck: CardInstance[]; // 完整牌組
  hand: CardInstance[]; // 手牌 (僅戰鬥中)
  drawPile: CardInstance[]; // 抽牌堆 (僅戰鬥中)
  discardPile: CardInstance[]; // 棄牌堆 (僅戰鬥中)
  exhaustPile: CardInstance[]; // 消耗堆 (僅戰鬥中)

  // 狀態效果
  buffs: StatusEffect[];
  debuffs: StatusEffect[];

  // 遺物 (未來擴展)
  relics?: Relic[];

  // 統計
  stats: PlayerStats;
}

/**
 * 玩家統計
 */
export interface PlayerStats {
  cardsPlayed: number;
  damageDealt: number;
  damageTaken: number;
  battlesWon: number;
  elitesKilled: number;
  bossesKilled: number;
  goldEarned: number;
  goldSpent: number;
  cardsAdded: number;
  cardsRemoved: number;
}

// ===== 戰鬥狀態 =====

/**
 * 戰鬥狀態
 */
export interface BattleState {
  encounterId: string;
  encounter: EncounterInstance;

  // 回合狀態
  turn: number;
  phase: BattlePhase;
  isPlayerTurn: boolean;

  // 當前狀態
  player: PlayerState;
  enemies: EnemyInstance[];

  // 戰鬥特殊狀態
  block: number;        // 玩家當前護甲
  combatStarted: boolean;
  combatEnded: boolean;
  victory?: boolean;

  // 戰鬥日誌 (可選)
  log?: BattleLogEntry[];
}

/**
 * 戰鬥階段
 */
export enum BattlePhase {
  START = 'START',           // 戰鬥開始
  PLAYER_TURN = 'PLAYER_TURN', // 玩家回合
  PLAYER_END = 'PLAYER_END',   // 玩家回合結束
  ENEMY_TURN = 'ENEMY_TURN',   // 敵人回合
  ENEMY_END = 'ENEMY_END',     // 敵人回合結束
  END = 'END'                  // 戰鬥結束
}

/**
 * 戰鬥日誌條目
 */
export interface BattleLogEntry {
  turn: number;
  timestamp: number;
  actor: 'PLAYER' | 'ENEMY';
  action: string;        // 描述 (例: "玩家使用火球術")
  target?: string;       // 目標
  damage?: number;
  block?: number;
  effects?: string[];    // 附加效果
}

/**
 * 戰鬥歷史記錄
 */
export interface BattleHistory {
  encounterId: string;
  floor: number;
  victory: boolean;
  turns: number;
  damageDealt: number;
  damageTaken: number;
  cardsPlayed: string[]; // 使用的卡牌 ID
  rewards?: BattleReward;
  timestamp: number;
}

// ===== 戰鬥獎勵 =====

/**
 * 戰鬥獎勵
 */
export interface BattleReward {
  gold: number;
  cardRewards?: CardRewardOption[];
  relicReward?: Relic;
  potionReward?: Potion;
}

/**
 * 卡牌獎勵選項
 */
export interface CardRewardOption {
  cards: string[];       // 可選卡牌 ID 列表 (通常 3 張)
  canSkip: boolean;      // 是否可跳過
}

// ===== 地圖系統 =====

/**
 * 遊戲地圖
 */
export interface GameMap {
  act: number;
  nodes: MapNode[];
  currentNodeId: string;
  paths: MapPath[];      // 節點之間的連接
}

/**
 * 地圖節點
 */
export interface MapNode {
  id: string;
  type: NodeType;
  floor: number;         // 樓層數
  x: number;             // 水平位置 (用於顯示)
  y: number;             // 垂直位置

  // 節點數據
  encounterId?: string;  // 戰鬥節點
  eventId?: string;      // 事件節點

  // 狀態
  visited: boolean;
  available: boolean;    // 當前是否可訪問
}

/**
 * 節點類型
 */
export enum NodeType {
  BATTLE = 'BATTLE',         // 普通戰鬥
  ELITE = 'ELITE',           // 精英戰鬥
  BOSS = 'BOSS',             // Boss
  SYNTHESIS = 'SYNTHESIS',   // 合成商店
  REST = 'REST',             // 休息點 (回血或強化卡牌)
  EVENT = 'EVENT',           // 隨機事件
  TREASURE = 'TREASURE'      // 寶箱
}

/**
 * 地圖路徑
 */
export interface MapPath {
  from: string;          // 起始節點 ID
  to: string;            // 目標節點 ID
}

// ===== 事件系統 =====

/**
 * 事件狀態
 */
export interface EventState {
  eventId: string;
  currentStage: number;  // 當前階段
  choices: EventChoice[];
  history: string[];     // 已做選擇的記錄
}

/**
 * 事件選項
 */
export interface EventChoice {
  id: string;
  text: string;
  requirements?: {       // 選項需求 (可選)
    gold?: number;
    hp?: number;
    cards?: string[];
  };
  outcomes: EventOutcome[];
}

/**
 * 事件結果
 */
export interface EventOutcome {
  probability: number;   // 發生概率 (0-1)
  description: string;

  // 效果
  goldChange?: number;
  hpChange?: number;
  maxHpChange?: number;
  addCards?: string[];
  removeCards?: string[];
  addRelic?: string;

  // 後續
  nextStage?: number;
  endEvent?: boolean;
}

/**
 * 事件歷史
 */
export interface EventHistory {
  eventId: string;
  floor: number;
  choicesMade: string[];
  outcomes: string[];
  timestamp: number;
}

// ===== 遺物與藥水 (預留) =====

/**
 * 遺物
 */
export interface Relic {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'BOSS' | 'STARTER';
  imagePath?: string;
}

/**
 * 藥水
 */
export interface Potion {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE';
  usesRemaining: number;
  maxUses: number;
}

// ===== 遊戲配置 =====

/**
 * 遊戲配置 (全局設定)
 */
export interface GameConfig {
  // 玩家基礎屬性
  startingHp: number;
  startingMaxHp: number;
  startingGold: number;
  startingEnergy: number;
  startingDeck: string[]; // 起始牌組卡牌 ID

  // 戰鬥設置
  handSize: number;       // 手牌上限
  energyPerTurn: number;  // 每回合能量

  // 獎勵設置
  cardRewardOptions: number; // 戰鬥後卡牌選項數量
  goldMultiplier: number;    // 金幣獎勵倍率

  // 難度設置
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;

  // 其他
  enableSeeding: boolean; // 是否允許種子
  debugMode: boolean;     // 調試模式
}

// ===== 儲存資料 =====

/**
 * 存檔資料結構
 */
export interface SaveData {
  version: string;        // 遊戲版本
  saveTime: number;       // 存檔時間
  gameState: GameState;   // 完整遊戲狀態

  // 持久化數據
  totalRuns: number;
  wins: number;
  losses: number;
  unlocks: string[];      // 已解鎖內容
  achievements: string[]; // 成就
}
