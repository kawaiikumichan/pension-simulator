// src/lib/logic/types.ts

export interface LifeEvent {
    age: number;    // 発生年齢
    amount: number; // 金額 (万円)
    memo: string;   // 用途
}

// ★追加：シミュレーション入力全体の型を定義
export interface SimulationInputs {
    // 既存の項目
    currentAge: number;
    retirementAge: number; // 定年年齢
    workEndAge: number;    // 完全に働くのを辞める年齢 (例: 70歳)
    assumedLifespan: number;
    rate: number;
    monthlyExpense: number; // 月々の支出 (定年後も継続)
    currentSavings: number;
    monthlyContribution: number; // 現役時の月々の積立額（旧項目だが、ここでは「月収」として扱う）
    retirementAllowance: number;
    
    // 年金・定年後収入
    pensionStartAge: number;
    monthlyBasicPension: number;
    monthlyWelfarePension: number;
    monthlyIncomePostPension: number; // 年金開始後（例: 65歳以降）の月収（バイトなど）
    
    // ★新しい項目: 定年前の月収 (積立差分計算用)
    monthlyIncomeBeforePension: number; // 定年前の月収（例: 65歳まで）
    monthlyIncomePostRetirement: number; // 定年（例: 62歳）から年金開始（例: 65歳）までの月収（再雇用）

    // 住宅ローン
    housingLoanBalance: number;
    housingLoanRate: number;
    housingLoanPaymentMonthly: number;

    lifeEvents: LifeEvent[];
}