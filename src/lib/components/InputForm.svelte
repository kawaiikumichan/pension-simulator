<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte'; 
    import { runSimulation } from '$lib/logic/simulationLogic.ts'; 
    import type { LifeEvent } from '$lib/logic/types.ts'; 
    import './InputForm.css'; 

    const dispatch = createEventDispatcher(); 

    // --- フォームの入力データ (変更なし) ---
    let inputs = {
        currentAge: 56, retirementAge: 62, assumedLifespan: 95, rate: 3.0, monthlyExpense: 30, 
        currentSavings: 1000, retirementAllowance: 2500, pensionStartAge: 65, monthlyBasicPension: 6,
        monthlyWelfarePension: 13, monthlyIncomePostPension: 10, workEndAge: 70, housingLoanBalance: 1500,
        housingLoanRate: 1.0, housingLoanPaymentMonthly: 8, monthlyIncomeBeforeRetirement: 40,
        monthlyIncomePostRetirementPrePension: 25, 
        lifeEvents: [
            { age: 58, amount: 200, memo: '子供の学費（大学入学金・初年度授業料）' },
            { age: 60, amount: 500, memo: '車の買い替え・住宅リフォーム準備金' },
            { age: 80, amount: 300, memo: '老人ホーム入居一時金' },
        ] as LifeEvent[],
    };

    let simulationResult = null;

    function addLifeEvent() {
        inputs.lifeEvents = [...inputs.lifeEvents, { age: inputs.currentAge + 1, amount: 100, memo: '新規イベント' }];
        run(); // リスト変更時は即実行
    }
    function removeLifeEvent(index: number) {
        inputs.lifeEvents.splice(index, 1);
        inputs.lifeEvents = inputs.lifeEvents; 
        run(); // リスト変更時は即実行
    }
    
    $: {
        if (inputs.lifeEvents) {
            inputs.lifeEvents.sort((a, b) => a.age - b.age);
        }
    }

    /**
     * シミュレーションを実行し、親に結果を通知する関数 (ボタン削除のため名称変更)
     */
    function run() {
        if (!inputs || inputs.currentAge === undefined) return;
        simulationResult = runSimulation(inputs);
        dispatch('simulated', { result: simulationResult, inputs: inputs });
    }

    // ★修正: onMount でブラウザでの表示後に一度だけ初期実行
    onMount(() => {
        run();
    });
</script>

<div class="bg-white p-6 sm:p-8 rounded-lg shadow-xl mb-8 border border-gray-200">
    <h2 class="text-2xl font-semibold text-blue-800 mb-6 border-b pb-2">資産・計画入力</h2>
    
    <div class="grid grid-cols-1 gap-x-8 gap-y-6">

        <div class="section-box">
            <h3 class="text-lg font-medium text-blue-800 border-b pb-1">① 資産と運用計画</h3>
            
            <div class="input-group-top">
                <label for="currentAge">現在の年齢 (歳):</label>
                <input type="number" id="currentAge" bind:value={inputs.currentAge} min="20" max="65" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
            <div class="input-group-top">
                <label for="currentSavings">現在の金融資産額 (万円):</label>
                <input type="number" id="currentSavings" bind:value={inputs.currentSavings} min="0" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
            <div class="input-group-top">
                <label for="rate">概算運用利回り (年率 %):</label>
                <input type="number" id="rate" bind:value={inputs.rate} min="0" step="0.1" class="input-field-full" on:input={run} inputmode="decimal" />
            </div>
            <div class="input-group-top">
                <label for="retirementAllowance">想定退職金 (万円):</label>
                <input type="number" id="retirementAllowance" bind:value={inputs.retirementAllowance} min="0" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
            <div class="input-group-top">
                <label for="assumedLifespan">想定寿命 (歳):</label>
                <input type="number" id="assumedLifespan" bind:value={inputs.assumedLifespan} min="80" max="100" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
        </div>

        <div class="section-box">
            <h3 class="text-lg font-medium text-blue-800 border-b pb-1">② 収入計画 (年齢別)</h3>
            
            <div class="input-group-top">
                <label for="retirementAge">定年予定年齢 (歳):</label>
                <input type="number" id="retirementAge" bind:value={inputs.retirementAge} min="60" max="70" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
            
            <hr class="my-3 border-blue-200">
            <p class="text-sm font-semibold text-gray-700">A. 現役時収入 (現在〜{inputs.retirementAge - 1}歳)</p>
            <div class="input-group-top">
                <label for="monthlyIncomeBeforeRetirement" class="font-bold text-gray-800">現役時の月収 (手取り/万円):</label>
                <input type="number" id="monthlyIncomeBeforeRetirement" bind:value={inputs.monthlyIncomeBeforeRetirement} min="0" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>

            <hr class="my-3 border-blue-200">
            <p class="text-sm font-semibold text-gray-700">B. 定年後収入 ({inputs.retirementAge}歳〜{inputs.pensionStartAge - 1}歳)</p>
            <div class="input-group-top">
                <label for="monthlyIncomePostRetirementPrePension">定年後の月収 (再雇用手取り/万円):</label>
                <input type="number" id="monthlyIncomePostRetirementPrePension" bind:value={inputs.monthlyIncomePostRetirementPrePension} min="0" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>

            <hr class="my-3 border-blue-200">
            <p class="text-sm font-semibold text-gray-700">C. 年金・老後収入 ({inputs.pensionStartAge}歳〜)</p>
            <div class="input-group-top">
                <label for="pensionStartAge">年金受給開始年齢 (歳):</label>
                <input type="number" id="pensionStartAge" bind:value={inputs.pensionStartAge} min="60" max="75" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
            <div class="input-group-top">
                <label for="monthlyBasicPension">国民年金月額 (万円):</label>
                <input type="number" id="monthlyBasicPension" bind:value={inputs.monthlyBasicPension} min="0" step="0.1" class="input-field-full" on:input={run} inputmode="decimal" />
            </div>
            <div class="input-group-top">
                <label for="monthlyWelfarePension">厚生年金月額 (万円):</label>
                <input type="number" id="monthlyWelfarePension" bind:value={inputs.monthlyWelfarePension} min="0" step="1" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
            <div class="input-group-top">
                <label for="workEndAge">完全退職年齢 (歳):</label>
                <input type="number" id="workEndAge" bind:value={inputs.workEndAge} min="65" max="80" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
            <div class="input-group-top">
                <label for="monthlyIncomePostPension">完全退職までの追加月収 (総報酬月額/万円):</label>
                <input type="number" id="monthlyIncomePostPension" bind:value={inputs.monthlyIncomePostPension} min="0" step="1" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
        </div>
        
        <div class="section-box">
            <h3 class="text-lg font-medium text-blue-800 border-b pb-1">③ 支出計画</h3>

            <p class="text-sm font-semibold text-gray-700 mt-2">A. 生活費 (固定支出)</p>
            <div class="input-group-top">
                <label for="monthlyExpense" class="font-bold text-gray-800">月々の生活費 (万円):</label>
                <input type="number" id="monthlyExpense" bind:value={inputs.monthlyExpense} min="10" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
            <div class="p-2 bg-red-100 border-l-4 border-red-600 rounded-md mt-4">
                <p class="text-sm font-bold text-red-800">
                    💡 毎月の余剰金（積立/取崩し）は、**収入 - 生活費 - ローン返済**の差分で自動計算されます。
                </p>
            </div>


            <hr class="my-3 border-gray-200">
            <p class="text-sm font-semibold text-gray-700">B. 住宅ローン (金利考慮)</p>
            <div class="input-group-top">
                <label for="housingLoanBalance">現在のローン残高 (万円):</label>
                <input type="number" id="housingLoanBalance" bind:value={inputs.housingLoanBalance} min="0" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
            <div class="input-group-top">
                <label for="housingLoanRate">ローン金利 (年率 %):</label>
                <input type="number" id="housingLoanRate" bind:value={inputs.housingLoanRate} min="0" step="0.01" class="input-field-full" on:input={run} inputmode="decimal" />
            </div>
            <div class="input-group-top">
                <label for="housingLoanPaymentMonthly">毎月の返済額 (万円):</label>
                <input type="number" id="housingLoanPaymentMonthly" bind:value={inputs.housingLoanPaymentMonthly} min="0" class="input-field-full" on:input={run} inputmode="numeric" />
            </div>
        </div>
    </div>

    <section class="mt-8 pt-6 border-t border-gray-200 space-y-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
        <h3 class="text-lg font-medium text-orange-600 border-b pb-1">C. ライフイベント (特別支出)</h3>
        <p class="text-sm text-gray-600 mb-3">発生年齢と金額を入力すると、その年に一括で資産から控除されます。</p>

        <div class="space-y-3">
            {#each inputs.lifeEvents as event, i (event)}
            <div class="flex items-center gap-2 bg-gray-100 p-3 rounded-md shadow-sm border border-gray-200">
                
                <label class="text-gray-700 w-16 flex items-center gap-1 text-sm">
                    年齢(歳)
                    <input type="number" bind:value={event.age} min={inputs.currentAge} max={inputs.assumedLifespan + 10} inputmode="numeric" class="input-field-sm" on:input={run} />
                </label>
                
                <label class="text-gray-700 w-16 flex items-center gap-1 ml-4 text-sm">
                    金額(万円)
                    <input type="number" bind:value={event.amount} min="0" inputmode="numeric" class="input-field-sm" on:input={run} />
                </label>
                
                <input type="text" bind:value={event.memo} placeholder="用途（例: リフォーム、医療）" class="input-field-full flex-grow text-sm text-left" aria-label="イベント用途" on:input={run} />
                
                <button class="remove-btn bg-red-500 hover:bg-red-600 text-white p-1 rounded transition duration-150" on:click={() => removeLifeEvent(i)} type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.86 11.14a2 2 0 01-2 1.86H7.86a2 2 0 01-2-1.86L5 7m4 0h6m-3 0V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3" />
                    </svg>
                </button>
            </div>
            {/each}
        </div>

        <button on:click={addLifeEvent} class="add-btn mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition duration-150 shadow-md flex items-center justify-center gap-1">
            ＋ ライフイベントを追加
        </button>
    </section>

    <p class="mt-4 text-center text-sm text-gray-500">入力変更時に結果は自動更新されます。</p>
</div>

