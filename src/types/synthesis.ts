/**
 * 合成系統類型定義
 * 核心機制:卡牌可拆解成零件,零件可合成新卡
 */

import { CardComponent, CardData, CardInstance } from './card';

// ===== 合成規則 =====

/**
 * 合成配方
 */
export interface SynthesisRecipe {
  id: string;           // 配方 ID
  name: string;         // 配方名稱
  description: string;  // 配方描述

  // 需求材料
  requiredComponents: Array<{
    componentId: string; // 零件 ID
    count: number;       // 需要數量
  }>;

  // 或者需求卡牌 (直接用整張卡合成)
  requiredCards?: Array<{
    cardId?: string;     // 特定卡牌 ID (可選)
    tags?: string[];     // 或符合特定標籤的卡
    count: number;
  }>;

  // 產出
  resultCardId: string; // 合成結果卡牌 ID
  resultCount: number;  // 產出數量 (通常為 1)

  // 成本
  goldCost?: number;    // 金幣成本
  otherCost?: {         // 其他成本 (擴展用)
    type: string;
    value: number;
  };

  // 解鎖條件
  unlockCondition?: {
    act?: number;       // 需到達章節
    completedRuns?: number; // 需完成遊戲次數
    specialEvent?: string;  // 特殊事件解鎖
  };

  // 元數據
  tier: number;         // 配方等級 (1, 2, 3...)
  discoverable: boolean; // 是否可在遊戲中發現
}

/**
 * 合成結果
 */
export interface SynthesisResult {
  success: boolean;
  resultCard?: CardInstance;  // 合成的卡牌
  consumedCards: CardInstance[]; // 消耗的卡牌
  consumedComponents: CardComponent[]; // 消耗的零件
  goldSpent: number;
  message: string;      // 結果訊息
}

/**
 * 合成選項 (UI 用)
 */
export interface SynthesisOption {
  recipeId: string;
  recipe: SynthesisRecipe;
  canAfford: boolean;   // 是否有足夠材料
  missingComponents?: Array<{ // 缺少的材料
    componentId: string;
    needed: number;
    current: number;
  }>;
  preview: CardData;    // 合成預覽
}

// ===== 拆解系統 =====

/**
 * 拆解結果
 */
export interface DisassembleResult {
  success: boolean;
  card: CardInstance;   // 被拆解的卡
  components: CardComponent[]; // 獲得的零件
  goldRefund?: number;  // 金幣返還 (如有)
  message: string;
}

/**
 * 拆解價值評估
 */
export interface DisassembleValue {
  cardId: string;
  components: CardComponent[];
  estimatedValue: number; // 估計價值 (用於 AI 建議)
  recommendation: 'KEEP' | 'DISASSEMBLE' | 'NEUTRAL';
  reason?: string;
}

// ===== 合成商店 =====

/**
 * 合成商店狀態
 */
export interface SynthesisShopState {
  // 玩家資源
  playerGold: number;
  playerCards: CardInstance[];
  playerComponents: Map<string, number>; // 零件 ID -> 數量

  // 可用選項
  availableRecipes: SynthesisRecipe[];   // 已解鎖配方
  discoveredRecipes: string[];           // 已發現但未解鎖的配方 ID

  // 限制
  maxDisassemblesPerVisit?: number;      // 每次訪問最多拆解次數
  disassemblesUsed: number;

  // 特殊選項 (隨機事件等)
  specialOffers?: SynthesisSpecialOffer[];
}

/**
 * 合成商店特殊優惠
 */
export interface SynthesisSpecialOffer {
  id: string;
  type: 'DISCOUNT' | 'FREE_SYNTHESIS' | 'RARE_RECIPE' | 'COMPONENT_GIFT';
  description: string;

  // 折扣類型
  discountRecipeId?: string;
  discountPercent?: number; // 0-100

  // 免費合成類型
  freeRecipeId?: string;

  // 稀有配方類型
  temporaryRecipe?: SynthesisRecipe;

  // 零件贈送類型
  giftComponents?: Array<{
    componentId: string;
    count: number;
  }>;

  // 限制
  usesRemaining: number;
}

// ===== 合成歷史 =====

/**
 * 合成記錄 (用於統計和成就)
 */
export interface SynthesisHistory {
  runId: string;
  timestamp: number;
  action: 'SYNTHESIZE' | 'DISASSEMBLE';

  // 合成記錄
  recipeId?: string;
  resultCardId?: string;

  // 拆解記錄
  disassembledCardId?: string;

  // 通用
  goldSpent: number;
  componentsUsed: CardComponent[];
}

/**
 * 合成統計
 */
export interface SynthesisStats {
  totalSyntheses: number;
  totalDisassembles: number;
  totalGoldSpent: number;
  mostSynthesizedCard: string;
  recipesDiscovered: string[];
  recipesCompleted: string[];
}

// ===== 合成策略提示 (可選功能) =====

/**
 * AI 合成建議
 */
export interface SynthesisSuggestion {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  action: 'SYNTHESIZE' | 'DISASSEMBLE' | 'KEEP';

  // 合成建議
  suggestedRecipe?: SynthesisRecipe;
  cardsToDisassemble?: CardInstance[];

  // 理由
  reason: string;
  expectedBenefit: string;
}

/**
 * 合成系統配置
 */
export interface SynthesisConfig {
  // 全局設置
  disassembleRefundPercent: number;     // 拆解金幣返還比例 (0-1)
  synthesisFailChance: number;          // 合成失敗概率 (0-1, 默認 0)

  // 商店設置
  shopVisitsPerRun: number;             // 每次遊玩可訪問次數
  recipesShownPerVisit: number;         // 每次顯示配方數量

  // 平衡參數
  higherTierCostMultiplier: number;     // 高階合成成本倍率
  componentDropRateMultiplier: number;  // 零件掉落率倍率
}
