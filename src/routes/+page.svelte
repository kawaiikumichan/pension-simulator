<script lang="ts">
    // ★修正済み: lang="ts" を追記

    // グローバルCSSをインポート (Tailwindの読み込みトリガー)
    import '../app.css'; 

    import InputForm from '$lib/components/InputForm.svelte';
    import AssetChart from '$lib/components/AssetChart.svelte';

    // フォームから受け取るデータ
    let simulationResult: any = null; 
    let inputs: any = {};

    function handleResult(event: CustomEvent) {
        simulationResult = event.detail.result;
        inputs = event.detail.inputs;
    }
</script>

<svelte:head>
    <title>老後資産シミュレーションツール</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <main class="max-w-4xl mx-auto">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 pb-3 border-b-4 border-blue-800 text-center">
            老後資産シミュレーション
        </h1>
        
        <InputForm on:simulated={handleResult} />

        {#if simulationResult && simulationResult.assetTimeline && simulationResult.assetTimeline.length > 0}
            <div class="mt-8 bg-white p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200">
                <h2 class="text-2xl font-semibold text-blue-800 mb-4 border-b pb-2">💰 シミュレーション結果</h2>
                
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-blue-50 border-l-4 border-blue-600 rounded-md mb-6">
                    <div>
                        <p class="text-sm text-gray-600">退職時 ({inputs.retirementAge}歳) 想定資産額</p>
                        <p class="text-3xl font-extrabold text-blue-900">
                            {Math.round(simulationResult.totalAssetAtRetirement).toLocaleString()} 万円
                        </p>
                    </div>
                    
                    <div class="text-right mt-3 sm:mt-0">
                        <p class="text-sm text-gray-600">資産が尽きる年齢</p>
                        {#if simulationResult.assetRunsOutAge > 0}
                            <span class="text-2xl font-bold text-red-600">
                                {simulationResult.assetRunsOutAge} 歳
                            </span>
                            <span class="text-sm text-red-600">(要対策)</span>
                        {:else}
                            <span class="text-2xl font-bold text-green-600">
                                {inputs.assumedLifespan} 歳以降も維持
                            </span>
                        {/if}
                    </div>
                </div>
                
                <AssetChart 
                    assetTimeline={simulationResult.assetTimeline}
                    assumedLifespan={inputs.assumedLifespan}
                />
            </div>
        {/if}
    </main>
</div>