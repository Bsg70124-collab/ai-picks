// Performance Tracking JavaScript
class PerformanceTracker {
    constructor() {
        this.historicalData = JSON.parse(localStorage.getItem('aiHist') || '[]');
        this.filteredData = [...this.historicalData];
        this.init();
    }

    init() {
        this.updateSummaryStats();
        this.createCharts();
        this.renderResultsTable();
        this.setupFilters();
        this.updateBettingTips();
    }

    updateSummaryStats() {
        const graded = this.historicalData.filter(r => r.result);
        const wins = graded.filter(r => r.result === 'W').length;
        const losses = graded.filter(r => r.result === 'L').length;
        const pushes = graded.filter(r => r.result === 'P').length;
        
        this.updateElement('total-wins', wins);
        this.updateElement('total-losses', losses);
        this.updateElement('total-pushes', pushes);
        
        // Calculate profit
        const profit = this.calculateProfit();
        this.updateElement('total-profit', `+${profit.toFixed(1)}`);
        
        // Average odds (mock calculation)
        const avgOdds = this.calculateAverageOdds();
        this.updateElement('avg-odds', avgOdds.toFixed(0));
    }

    calculateProfit() {
        return this.historicalData.reduce((total, pick) => {
            if (pick.result === 'W') {
                return total + 1;
            } else if (pick.result === 'L') {
                return total - 1.1;
            }
            return total;
        }, 0);
    }

    calculateAverageOdds() {
        // Mock calculation for average odds
        const graded = this.historicalData.filter(r => r.result);
        return graded.length > 0 ? -110 : 0;
    }

    createCharts() {
        this.createProfitChart();
        this.createWinRateChart();
    }

    createProfitChart() {
        const data = this.getProfitData();
        
        const trace = {
            x: data.dates,
            y: data.profits,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Cumulative Profit',
            line: { color: '#10b981', width: 3 },
            marker: { color: '#10b981', size: 6 },
            fill: 'tonexty',
            fillcolor: 'rgba(16, 185, 129, 0.1)'
        };

        const layout = {
            title: '',
            xaxis: { 
                title: 'Date',
                color: '#9ca3af',
                gridcolor: '#374151'
            },
            yaxis: { 
                title: 'Profit (Units)',
                color: '#9ca3af',
                gridcolor: '#374151'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#9ca3af' },
            margin: { t: 20, r: 20, b: 50, l: 50 },
            showlegend: false
        };

        Plotly.newPlot('profit-chart', [trace], layout, {responsive: true});
    }

    createWinRateChart() {
        const data = this.getWinRateData();
        
        const trace = {
            x: data.periods,
            y: data.winRates,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Win Rate',
            line: { color: '#3b82f6', width: 3 },
            marker: { color: '#3b82f6', size: 6 }
        };

        const layout = {
            title: '',
            xaxis: { 
                title: 'Time Period',
                color: '#9ca3af',
                gridcolor: '#374151'
            },
            yaxis: { 
                title: 'Win Rate (%)',
                color: '#9ca3af',
                gridcolor: '#374151',
                range: [0, 100]
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#9ca3af' },
            margin: { t: 20, r: 20, b: 50, l: 50 },
            showlegend: false
        };

        Plotly.newPlot('winrate-chart', [trace], layout, {responsive: true});
    }

    getProfitData() {
        const graded = this.historicalData.filter(r => r.result).sort((a, b) => new Date(a.date) - new Date(b.date));
        const dates = [];
        const profits = [];
        let cumulativeProfit = 0;

        graded.forEach(pick => {
            dates.push(new Date(pick.date).toLocaleDateString());
            if (pick.result === 'W') {
                cumulativeProfit += 1;
            } else if (pick.result === 'L') {
                cumulativeProfit -= 1.1;
            }
            profits.push(cumulativeProfit);
        });

        return { dates, profits };
    }

    getWinRateData() {
        // Calculate rolling win rate over time
        const graded = this.historicalData.filter(r => r.result).sort((a, b) => new Date(a.date) - new Date(b.date));
        const periods = [];
        const winRates = [];
        
        for (let i = 10; i < graded.length; i += 5) {
            const window = graded.slice(Math.max(0, i - 9), i + 1);
            const wins = window.filter(r => r.result === 'W').length;
            const winRate = (wins / window.length * 100);
            
            periods.push(new Date(window[window.length - 1].date).toLocaleDateString());
            winRates.push(winRate);
        }

        return { periods, winRates };
    }

    renderResultsTable() {
        const tbody = document.getElementById('results-table');
        
        if (this.filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8 text-gray-400">
                        No results to display. Start making predictions to see your performance.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredData.map(pick => {
            const resultColor = {
                'W': 'text-emerald-400',
                'L': 'text-red-400',
                'P': 'text-yellow-400'
            };

            const profit = pick.result === 'W' ? '+1.0' : pick.result === 'L' ? '-1.1' : '0.0';
            const profitColor = pick.result === 'W' ? 'text-emerald-400' : pick.result === 'L' ? 'text-red-400' : 'text-gray-400';

            return `
                <tr class="border-b border-gray-700 hover:bg-slate-800 result-card ${pick.result ? pick.result.toLowerCase() : ''}">
                    <td class="py-3 px-4 text-gray-300">${new Date(pick.date).toLocaleDateString()}</td>
                    <td class="py-3 px-4">
                        <div class="text-white">${pick.away} @ ${pick.home}</div>
                        <div class="text-sm text-gray-400">${pick.league === 'basketball_nba' ? 'NBA' : 'NFL'}</div>
                    </td>
                    <td class="py-3 px-4 text-white">${pick.pick}</td>
                    <td class="py-3 px-4 text-gray-300">-110</td>
                    <td class="py-3 px-4 text-gray-300">${(pick.conf * 100).toFixed(0)}%</td>
                    <td class="py-3 px-4">
                        <span class="${resultColor[pick.result] || 'text-gray-400'} font-semibold">
                            ${pick.result || 'Pending'}
                        </span>
                    </td>
                    <td class="py-3 px-4 ${profitColor} font-semibold">${profit}</td>
                </tr>
            `;
        }).join('');
    }

    setupFilters() {
        // Time filter
        document.getElementById('time-filter').addEventListener('change', (e) => {
            this.filterByTime(e.target.value);
        });

        // Result filter
        document.getElementById('result-filter').addEventListener('change', (e) => {
            this.filterByResult(e.target.value);
        });

        // Search input
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterBySearch(e.target.value);
        });
    }

    filterByTime(period) {
        const now = new Date();
        let cutoffDate;

        switch (period) {
            case 'week':
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'quarter':
                cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                cutoffDate = null;
        }

        if (cutoffDate) {
            this.filteredData = this.historicalData.filter(pick => 
                new Date(pick.date) >= cutoffDate
            );
        } else {
            this.filteredData = [...this.historicalData];
        }

        this.renderResultsTable();
    }

    filterByResult(result) {
        if (result === 'all') {
            this.filteredData = [...this.historicalData];
        } else {
            this.filteredData = this.historicalData.filter(pick => pick.result === result.toUpperCase());
        }
        this.renderResultsTable();
    }

    filterBySearch(query) {
        if (!query.trim()) {
            this.filteredData = [...this.historicalData];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredData = this.historicalData.filter(pick =>
                pick.home.toLowerCase().includes(searchTerm) ||
                pick.away.toLowerCase().includes(searchTerm) ||
                pick.pick.toLowerCase().includes(searchTerm)
            );
        }
        this.renderResultsTable();
    }

    updateBettingTips() {
        // Bankroll management tips
        const totalBets = this.historicalData.filter(r => r.result).length;
        const unitSize = totalBets > 0 ? '1-2%' : '1-2%';
        const dailyRisk = '5 units';
        const currentStreak = this.calculateCurrentStreak();

        this.updateElement('unit-size', unitSize);
        this.updateElement('daily-risk', dailyRisk);
        this.updateElement('current-streak', currentStreak);

        // Performance insights
        const bestSport = this.calculateBestSport();
        const bestBetType = 'Spreads'; // Mock data
        const avgConfidence = this.calculateAverageConfidence();

        this.updateElement('best-sport', bestSport);
        this.updateElement('best-bet-type', bestBetType);
        this.updateElement('avg-confidence', avgConfidence);
    }

    calculateCurrentStreak() {
        const graded = this.historicalData.filter(r => r.result).reverse();
        let streak = 0;
        let streakType = 'W';

        for (const pick of graded) {
            if (streak === 0) {
                streakType = pick.result;
                streak = 1;
            } else if (pick.result === streakType) {
                streak++;
            } else {
                break;
            }
        }

        return `${streakType}${streak}`;
    }

    calculateBestSport() {
        const sportStats = {};
        
        this.historicalData.forEach(pick => {
            if (pick.result) {
                const sport = pick.league === 'basketball_nba' ? 'NBA' : 'NFL';
                if (!sportStats[sport]) {
                    sportStats[sport] = { wins: 0, total: 0 };
                }
                sportStats[sport].total++;
                if (pick.result === 'W') {
                    sportStats[sport].wins++;
                }
            }
        });

        let bestSport = 'N/A';
        let bestAccuracy = 0;

        Object.entries(sportStats).forEach(([sport, stats]) => {
            const accuracy = stats.wins / stats.total;
            if (accuracy > bestAccuracy) {
                bestAccuracy = accuracy;
                bestSport = sport;
            }
        });

        return bestSport;
    }

    calculateAverageConfidence() {
        const graded = this.historicalData.filter(r => r.result);
        if (graded.length === 0) return '0%';
        
        const avgConf = graded.reduce((sum, pick) => sum + pick.conf, 0) / graded.length;
        return `${(avgConf * 100).toFixed(0)}%`;
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
}

// Global functions
function exportResults() {
    const data = JSON.parse(localStorage.getItem('aiHist') || '[]');
    const csv = convertToCSV(data);
    downloadCSV(csv, 'ai-picks-results.csv');
}

function convertToCSV(data) {
    const headers = ['Date', 'League', 'Away Team', 'Home Team', 'Pick', 'Spread', 'Total', 'Confidence', 'Result'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => [
            new Date(row.date).toLocaleDateString(),
            row.league === 'basketball_nba' ? 'NBA' : 'NFL',
            row.away,
            row.home,
            row.pick,
            row.spread,
            row.total,
            (row.conf * 100).toFixed(0) + '%',
            row.result || 'Pending'
        ].join(','))
    ].join('\n');

    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PerformanceTracker();
});