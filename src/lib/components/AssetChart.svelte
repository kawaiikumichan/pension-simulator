<script>
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto'; // Chart.jsをインポート

    // 親コンポーネントから渡されるプロパティ
    export let assetTimeline = []; 
    export let assumedLifespan = 95; 

    let chartCanvas; 
    let chartInstance = null; 

    // データが変更されたときに自動でグラフを更新するリアクティブな宣言
    $: if (assetTimeline && assetTimeline.length > 0) {
        updateChart();
    }

    onMount(() => {
        if (assetTimeline && assetTimeline.length > 0) {
            createChart();
        }
    });

    onDestroy(() => {
        if (chartInstance) {
            chartInstance.destroy();
        }
    });

    /**
     * Chart.jsでグラフを初期作成する関数
     */
    function createChart() {
        if (chartInstance) {
            chartInstance.destroy(); 
        }

        const labels = assetTimeline.map(d => d.age);
        const dataValues = assetTimeline.map(d => d.assetMan);

        chartInstance = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '想定資産額 (万円)',
                    data: dataValues,
                    borderColor: 'rgb(79, 70, 229)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                    pointRadius: (context) => {
                        const age = labels[context.dataIndex];
                        return age === assumedLifespan ? 6 : 0;
                    },
                    pointBackgroundColor: (context) => {
                        if (context.raw <= 0) return 'rgb(239, 68, 68)';
                        return labels[context.dataIndex] === assumedLifespan ? 'rgb(251, 191, 36)' : 'rgb(79, 70, 229)';
                    },
                    pointBorderColor: 'white',
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `資産: ${Math.round(context.parsed.y).toLocaleString()}万円`;
                            },
                            title: (context) => `${context[0].label}歳`
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: '年齢' },
                        ticks: {
                            callback: function(val, index) {
                                const age = labels[index];
                                return (age % 5 === 0 || age === assumedLifespan || age === labels[0]) ? age : null;
                            }
                        }
                    },
                    y: {
                        title: { display: true, text: '資産額 (万円)' },
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value.toLocaleString()
                        }
                    }
                }
            }
        });
    }

    /**
     * データが変更されたときにグラフを更新する関数
     */
    function updateChart() {
        // Chartのインスタンスがない場合は作成する
        if (!chartInstance) {
            createChart();
            return;
        }
        
        // データとラベルを更新し、グラフを再描画
        chartInstance.data.labels = assetTimeline.map(d => d.age);
        chartInstance.data.datasets[0].data = assetTimeline.map(d => d.assetMan);
        
        chartInstance.update();
    }
</script>

<div class="chart-container">
    <canvas bind:this={chartCanvas}></canvas>
</div>

<style>
    .chart-container {
        height: 400px; 
        width: 100%;
        margin-top: 20px;
    }
</style>