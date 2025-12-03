// Analytics Dashboard JavaScript
class AnalyticsDashboard {
    constructor() {
        this.historicalData = JSON.parse(localStorage.getItem('aiHist') || '[]');
        this.init();
    }

    init() {
        this.updateMetrics();
        this.createCharts();
        this.updateTopTeams();
        this.updateBettingTrends();
        this.updateRiskAnalysis();
    }

    updateMetrics() {
        const graded = this.historicalData.filter(r => r.result);
        const wins = graded.filter(r => r.result === 'W').length;
        const losses = graded.filter(r => r.result === 'L').length;
        
        // Total profit
        const profit = this.calculateProfit();
        this.updateElement('total-profit', `+${profit.toFixed(1)}`);
        
        // Average confidence
        const avgConf = this.historicalData.length > 0 
            ? (this.historicalData.reduce((sum, r) => sum + r.conf, 0) / this.historicalData.length * 100).toFixed(1) + '%'
            : '0%';
        this.updateElement('avg-confidence', avgConf);
        
        // Best streak
        const bestStreak = this.calculateBestStreak();
        this.updateElement('best-streak', bestStreak);
        
        // ROI
        const roi = this.calculateROI();
        this.updateElement('roi-percentage', roi.toFixed(1) + '%');
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

    calculateROI() {
        const totalBets = this.historicalData.filter(r => r.result).length;
        const profit = this.calculateProfit();
        const totalWagered = totalBets * 1.1; // Assuming 1.1 units per bet
        return totalWagered > 0 ? (profit / totalWagered * 100) : 0;
    }

    calculateBestStreak() {
        let currentStreak = 0;
        let bestStreak = 0;
        
        this.historicalData.forEach(pick => {
            if (pick.result === 'W') {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });
        
        return bestStreak;
    }

    createCharts() {
        this.createPerformanceChart();
        this.createSportAccuracyChart();
        this.createConfidenceChart();
        this.createMonthlyChart();
    }

    createPerformanceChart() {
        const data = this.getPerformanceData();
        
        const trace = {
            x: data.dates,
            y: data.cumulativeProfit,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Cumulative Profit',
            line: { color: '#10b981', width: 3 },
            marker: { color: '#10b981', size: 6 }
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
            margin: { t: 20, r: 20, b: 50, l: 50 }
        };

        Plotly.newPlot('performance-chart', [trace], layout, {responsive: true});
    }

    createSportAccuracyChart() {
        const sportData = this.getSportAccuracyData();
        
        const trace = {
            x: sportData.sports,
            y: sportData.accuracies,
            type: 'bar',
            marker: {
                color: ['#10b981', '#3b82f6'],
                line: { color: '#374151', width: 1 }
            }
        };

        const layout = {
            title: '',
            xaxis: { 
                color: '#9ca3af',
                gridcolor: '#374151'
            },
            yaxis: { 
                title: 'Accuracy (%)',
                color: '#9ca3af',
                gridcolor: '#374151'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#9ca3af' },
            margin: { t: 20, r: 20, b: 50, l: 50 }
        };

        Plotly.newPlot('sport-accuracy-chart', [trace], layout, {responsive: true});
    }

    createConfidenceChart() {
        const confidenceData = this.getConfidenceDistribution();
        
        const trace = {
            x: confidenceData.ranges,
            y: confidenceData.counts,
            type: 'bar',
            marker: {
                color: ['#ef4444', '#f59e0b', '#10b981'],
                line: { color: '#374151', width: 1 }
            }
        };

        const layout = {
            title: '',
            xaxis: { 
                title: 'Confidence Range',
                color: '#9ca3af',
                gridcolor: '#374151'
            },
            yaxis: { 
                title: 'Number of Picks',
                color: '#9ca3af',
                gridcolor: '#374151'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#9ca3af' },
            margin: { t: 20, r: 20, b: 50, l: 50 }
        };

        Plotly.newPlot('confidence-chart', [trace], layout, {responsive: true});
    }

    createMonthlyChart() {
        const monthlyData = this.getMonthlyResults();
        
        const trace = {
            x: monthlyData.months,
            y: monthlyData.results,
            type: 'bar',
            marker: {
                color: monthlyData.results.map(r => r >= 0 ? '#10b981' : '#ef4444'),
                line: { color: '#374151', width: 1 }
            }
        };

        const layout = {
            title: '',
            xaxis: { 
                title: 'Month',
                color: '#9ca3af',
                gridcolor: '#374151'
            },
            yaxis: { 
                title: 'Net Profit (Units)',
                color: '#9ca3af',
                gridcolor: '#374151'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#9ca3af' },
            margin: { t: 20, r: 20, b: 50, l: 50 }
        };

        Plotly.newPlot('monthly-chart', [trace], layout, {responsive: true});
    }

    getPerformanceData() {
        const graded = this.historicalData.filter(r => r.result).sort((a, b) => new Date(a.date) - new Date(b.date));
        const dates = [];
        const cumulativeProfit = [];
        let profit = 0;

        graded.forEach(pick => {
            dates.push(new Date(pick.date).toLocaleDateString());
            if (pick.result === 'W') {
                profit += 1;
            } else if (pick.result === 'L') {
                profit -= 1.1;
            }
            cumulativeProfit.push(profit);
        });

        return { dates, cumulativeProfit };
    }

    getSportAccuracyData() {
        const sports = ['NBA', 'NFL'];
        const accuracies = sports.map(sport => {
            const sportPicks = this.historicalData.filter(r => 
                r.league === (sport === 'NBA' ? 'basketball_nba' : 'americanfootball_nfl') && r.result
            );
            const wins = sportPicks.filter(r => r.result === 'W').length;
            return sportPicks.length > 0 ? (wins / sportPicks.length * 100).toFixed(1) : 0;
        });

        return { sports, accuracies };
    }

    getConfidenceDistribution() {
        const ranges = ['0-60%', '60-70%', '70-100%'];
        const counts = [
            this.historicalData.filter(r => r.conf <= 0.6).length,
            this.historicalData.filter(r => r.conf > 0.6 && r.conf <= 0.7).length,
            this.historicalData.filter(r => r.conf > 0.7).length
        ];

        return { ranges, counts };
    }

    getMonthlyResults() {
        const monthlyData = {};
        
        this.historicalData.forEach(pick => {
            if (pick.result) {
                const month = new Date(pick.date).toISOString().slice(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = 0;
                }
                
                if (pick.result === 'W') {
                    monthlyData[month] += 1;
                } else if (pick.result === 'L') {
                    monthlyData[month] -= 1.1;
                }
            }
        });

        const months = Object.keys(monthlyData).sort();
        const results = months.map(month => monthlyData[month]);

        return { months, results };
    }

    updateTopTeams() {
        const teamPerformance = {};
        
        this.historicalData.forEach(pick => {
            if (pick.result) {
                const teams = [pick.home, pick.away];
                teams.forEach(team => {
                    if (!teamPerformance[team]) {
                        teamPerformance[team] = { wins: 0, total: 0 };
                    }
                    teamPerformance[team].total++;
                    
                    if (pick.result === 'W' && pick.pick === team) {
                        teamPerformance[team].wins++;
                    }
                });
            }
        });

        const topTeams = Object.entries(teamPerformance)
            .filter(([_, data]) => data.total >= 3)
            .map(([team, data]) => ({
                team,
                accuracy: (data.wins / data.total * 100).toFixed(1)
            }))
            .sort((a, b) => b.accuracy - a.accuracy)
            .slice(0, 5);

        const container = document.getElementById('top-teams');
        if (topTeams.length === 0) {
            container.innerHTML = '<div class="text-gray-400">Not enough data</div>';
        } else {
            container.innerHTML = topTeams.map(team => `
                <div class="flex justify-between items-center">
                    <span class="text-gray-300">${team.team}</span>
                    <span class="text-emerald-400 font-semibold">${team.accuracy}%</span>
                </div>
            `).join('');
        }
    }

    updateBettingTrends() {
        // Mock betting trends data
        const trends = {
            home: 65,
            away: 35,
            over: 58
        };

        this.updateElement('home-trend', trends.home + '%');
        this.updateElement('away-trend', trends.away + '%');
        this.updateElement('over-trend', trends.over + '%');

        document.getElementById('home-bar').style.width = trends.home + '%';
        document.getElementById('away-bar').style.width = trends.away + '%';
        document.getElementById('over-bar').style.width = trends.over + '%';
    }

    updateRiskAnalysis() {
        const highRisk = this.historicalData.filter(r => r.conf <= 0.55).length;
        const mediumRisk = this.historicalData.filter(r => r.conf > 0.55 && r.conf <= 0.65).length;
        const lowRisk = this.historicalData.filter(r => r.conf > 0.65).length;
        const total = this.historicalData.length;

        this.updateElement('high-risk', total > 0 ? Math.round(highRisk / total * 100) + '%' : '0%');
        this.updateElement('medium-risk', total > 0 ? Math.round(mediumRisk / total * 100) + '%' : '0%');
        this.updateElement('low-risk', total > 0 ? Math.round(lowRisk / total * 100) + '%' : '0%');

        // Average odds (mock data)
        this.updateElement('avg-odds', '-110');
        
        // Max drawdown (mock calculation)
        this.updateElement('max-drawdown', '-5.2');
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsDashboard();
});