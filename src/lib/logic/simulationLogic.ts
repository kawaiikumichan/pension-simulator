// src/lib/logic/simulationLogic.ts

import type { LifeEvent } from './types.ts'; 

const MAN_YEN = 10000;

// ... (calculateSuspension 関数は省略) ...
function calculateSuspension(welfarePensionMonthly: number, totalCompensationMonthly: number): number {
    const adjustmentLimit = 50; 
    const combinedAmount = welfarePensionMonthly + totalCompensationMonthly;
    if (combinedAmount <= adjustmentLimit) { return 0; }
    const suspendedAmount = (combinedAmount - adjustmentLimit) / 2;
    return Math.min(suspendedAmount, welfarePensionMonthly); 
}

/**
 * 年齢ごとの資産推移をシミュレーションし、結果を返すメイン関数（月単位ループ）
 */
export function runSimulation(rawInputs: any) {
    // --- 致命的なエラー回避のための防御的初期化 ---
    const defaultInputs = {
        currentAge: 56, retirementAge: 62, workEndAge: 70, assumedLifespan: 95, rate: 3.0, monthlyExpense: 30,
        currentSavings: 1000, retirementAllowance: 2500, pensionStartAge: 65, monthlyBasicPension: 6,
        monthlyWelfarePension: 13, monthlyIncomePostPension: 10, housingLoanBalance: 1500,
        housingLoanRate: 1.0, housingLoanPaymentMonthly: 8, monthlyIncomeBeforeRetirement: 40,
        monthlyIncomePostRetirementPrePension: 25, lifeEvents: [],
        ...rawInputs 
    };
    
    const inputs = defaultInputs;

    // --- 入力値の取得 ---
    const {
        currentAge, retirementAge, workEndAge, assumedLifespan, rate, monthlyExpense,
        currentSavings, retirementAllowance, pensionStartAge, monthlyBasicPension,
        monthlyWelfarePension, monthlyIncomePostPension, housingLoanBalance,
        housingLoanRate, housingLoanPaymentMonthly, monthlyIncomeBeforeRetirement,
        monthlyIncomePostRetirementPrePension, lifeEvents
    } = inputs;

    // --- 資産初期設定 ---
    let currentBalance = currentSavings * MAN_YEN; 
    let loanBalance = housingLoanBalance * MAN_YEN; 
    
    // 月利の計算
    const monthlyRate = (1 + rate / 100)**(1/12) - 1; // 月利 (運用)
    const monthlyLoanRate = housingLoanRate / 100 / 12; // 月利 (ローン)

    const assetTimeline = [{ age: currentAge, assetMan: currentBalance / MAN_YEN }];
    
    // ライフイベントを事前にソート
    const sortedLifeEvents = [...lifeEvents].sort((a, b) => a.age - b.age);
    let eventIndex = 0;
    let assetRunsOutAge = 0;
    
    // --- 処理対象の年齢ループ (現在年齢〜想定寿命+5年) ---
    for (let year = currentAge; year <= assumedLifespan + 5; year++) {
        
        // ライフイベント費用（年の最初の月で一括控除）
        let annualLifeEventExpense = 0;
        if (sortedLifeEvents) { 
            while (eventIndex < sortedLifeEvents.length && sortedLifeEvents[eventIndex].age === year) {
                annualLifeEventExpense += sortedLifeEvents[eventIndex].amount;
                eventIndex++;
            }
        }
        currentBalance -= annualLifeEventExpense * MAN_YEN;
        
        // 退職金
        if (year === retirementAge) {
            currentBalance += retirementAllowance * MAN_YEN;
        }

        // --- 月単位シミュレーション ---
        for (let month = 1; month <= 12; month++) {
            
            // 1. 資産枯渇チェック (月の初めに確認)
            if (currentBalance <= 0) {
                if (assetRunsOutAge === 0) assetRunsOutAge = year;
                currentBalance = 0;
                continue; 
            }

            let monthlyIncome = 0; 
            let monthlyExpenditure = monthlyExpense; 
            
            // --- 収入フェーズの決定 ---
            if (year < retirementAge) { monthlyIncome = monthlyIncomeBeforeRetirement; } 
            else if (year < pensionStartAge) { monthlyIncome = monthlyIncomePostRetirementPrePension; } 
            else {
                // フェーズ C: 年金開始後
                let pensionWelfare = monthlyWelfarePension;
                let compensation = 0;

                if (year <= workEndAge) {
                    compensation = monthlyIncomePostPension; 
                    const suspension = calculateSuspension(monthlyWelfarePension, compensation);
                    pensionWelfare -= suspension; 
                }

                monthlyIncome = monthlyBasicPension + pensionWelfare + compensation; 
            }

            // --- 住宅ローン処理 (月次) ---
            if (loanBalance > 0) {
                const loanPayment = housingLoanPaymentMonthly * MAN_YEN;
                
                if (loanPayment <= 0 || monthlyLoanRate === 0) { 
                    loanBalance = 0;
                } else {
                    const monthlyInterest = loanBalance * monthlyLoanRate;
                    let principalPayment = loanPayment - monthlyInterest;

                    monthlyExpenditure += housingLoanPaymentMonthly; 
                    
                    if (loanBalance < principalPayment) { principalPayment = loanBalance; }

                    loanBalance -= principalPayment;
                }
                
                if (loanBalance <= 0) {
                    loanBalance = 0;
                }
            }
            
            // --- 資産残高の更新 ---
            const monthlyNetFlowMan = monthlyIncome - monthlyExpenditure;
            currentBalance = currentBalance * (1 + monthlyRate) + monthlyNetFlowMan * MAN_YEN;
            
            // --- 年次の結果記録 ---
            if (month === 12) {
                 assetTimeline.push({ age: year + 1, assetMan: Math.max(0, currentBalance / MAN_YEN) });
                 
                 if (currentBalance <= 0 && assetRunsOutAge === 0) { assetRunsOutAge = year + 1; }
                 
                 if (year >= assumedLifespan && currentBalance > 0) { assetRunsOutAge = 0; break; }
                 if (year >= assumedLifespan + 5 && currentBalance <= 0) { break; }
                 
                 break; 
            }
        }
    }

    return {
        assetTimeline: assetTimeline,
        totalAssetAtRetirement: assetTimeline.find(d => d.age === retirementAge)?.assetMan || 0,
        assetRunsOutAge: assetRunsOutAge
    };
}