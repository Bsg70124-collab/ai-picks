// Bankroll Management System
class BankrollManager {
    constructor() {
        this.settings = this.loadSettings();
        this.bettingHistory = this.loadBettingHistory();
        this.activeBets = this.loadActiveBets();
        this.init();
    }

    init() {
        this.updateBankrollDisplay();
        this.createBankrollChart();
        this.populateGameSelector();
        this.renderActiveBets();
        this.renderBettingHistory();
        this.setupEventListeners();
        
        // Auto-update every 30 seconds
        setInterval(() => {
            this.updateBankrollDisplay();
        }, 30000);
    }

    loadSettings() {
        const defaultSettings = {
            startingBankroll: 1000,
            currentBankroll: 1000,
            unitPercentage: 1,
            maxDailyRisk: 5,
            peakBankroll: 1000,
            totalRisked: 0,
            totalProfit: 0
        };
        
        const saved = localStorage.getItem('bankrollSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('bankrollSettings', JSON.stringify(this.settings));
    }

    loadBettingHistory() {
        const saved = localStorage.getItem('bettingHistory');
        return saved ? JSON.parse(saved) : [];
    }

    saveBettingHistory() {
        localStorage.setItem('bettingHistory', JSON.stringify(this.bettingHistory));
    }

    loadActiveBets() {
        const saved = localStorage.getItem('activeBets');
        return saved ? JSON.parse(saved) : [];
    }

    saveActiveBets() {
        localStorage.setItem('activeBets', JSON.stringify(this.activeBets));
    }

    updateBankrollDisplay() {
        const change = this.settings.currentBankroll - this.settings.startingBankroll;
        const changePercentage = (change / this.settings.startingBankroll * 100).toFixed(2);
        
        this.updateElement('current-bankroll', `$${this.settings.currentBankroll.toFixed(2)}`);
        this.updateElement('bankroll-change', `${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${changePercentage}%)`);
        this.updateElement('total-profit', `$${this.settings.totalProfit.toFixed(2)}`);
        this.updateElement('profit-percentage', `${this.settings.totalProfit >= 0 ? '+' : ''}${(this.settings.totalProfit / this.settings.startingBankroll * 100).toFixed(2)}%`);
        
        const currentUnit = (this.settings.currentBankroll * (this.settings.unitPercentage / 100));
        this.updateElement('current-unit', `$${currentUnit.toFixed(2)}`);
        
        const maxDrawdown = this.settings.peakBankroll - Math.min(this.settings.currentBankroll, this.settings.peakBankroll);
        this.updateElement('max-drawdown', `$${maxDrawdown.toFixed(2)}`);
        
        this.updateElement('nav-bankroll', `$${this.settings.currentBankroll.toFixed(0)}`);
    }

    createBankrollChart() {
        const chartData = this.generateBankrollChartData();
        
        const trace = {
            x: chartData.dates,
            y: chartData.bankrolls,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Bankroll',
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
                title: 'Bankroll ($)',
                color: '#9ca3af',
                gridcolor: '#374151'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#9ca3af' },
            margin: { t: 20, r: 20, b: 50, l: 50 },
            showlegend: false
        };

        Plotly.newPlot('bankroll-chart', [trace], layout, {responsive: true});
    }

    generateBankrollChartData() {
        const dates = [];
        const bankrolls = [];
        
        // Start with initial bankroll
        dates.push(new Date().toLocaleDateString());
        bankrolls.push(this.settings.startingBankroll);
        
        // Add historical data points
        this.bettingHistory.forEach(bet => {
            if (bet.result && bet.result !== 'pending') {
                dates.push(new Date(bet.date).toLocaleDateString());
                
                const lastBankroll = bankrolls[bankrolls.length - 1];
                let newBankroll = lastBankroll;
                
                if (bet.result === 'win') {
                    newBankroll += bet.potentialWin;
                } else if (bet.result === 'loss') {
                    newBankroll -= bet.riskAmount;
                }
                
                bankrolls.push(newBankroll);
            }
        });

        return { dates, bankrolls };
    }

    async populateGameSelector() {
        const selector = document.getElementById('bet-game');
        
        try {
            // Try to fetch today's games
            const response = await fetch('./data/latest-predictions.json');
            const data = await response.json();
            
            selector.innerHTML = '<option value="">Select Game</option>';
            
            data.predictions.forEach(game => {
                const option = document.createElement('option');
                option.value = JSON.stringify(game);
                option.textContent = `${game.awayTeam} @ ${game.homeTeam}`;
                selector.appendChild(option);
            });
        } catch (error) {
            // Fallback to mock games
            const mockGames = [
                { awayTeam: 'Lakers', homeTeam: 'Clippers' },
                { awayTeam: 'Warriors', homeTeam: 'Kings' },
                { awayTeam: 'Chiefs', homeTeam: 'Raiders' }
            ];
            
            selector.innerHTML = '<option value="">Select Game</option>';
            
            mockGames.forEach(game => {
                const option = document.createElement('option');
                option.value = JSON.stringify(game);
                option.textContent = `${game.awayTeam} @ ${game.homeTeam}`;
                selector.appendChild(option);
            });
        }
    }

    placeBet() {
        const gameSelect = document.getElementById('bet-game');
        const unitsInput = document.getElementById('bet-units');
        const oddsInput = document.getElementById('bet-odds');
        
        if (!gameSelect.value) {
            this.showNotification('Please select a game', 'error');
            return;
        }
        
        const game = JSON.parse(gameSelect.value);
        const units = parseFloat(unitsInput.value);
        const odds = parseFloat(oddsInput.value);
        
        if (units <= 0) {
            this.showNotification('Please enter a valid unit size', 'error');
            return;
        }
        
        const unitSize = this.settings.currentBankroll * (this.settings.unitPercentage / 100);
        const riskAmount = units * unitSize;
        
        // Check daily risk limit
        const today = new Date().toDateString();
        const todayBets = this.activeBets.filter(bet => 
            new Date(bet.date).toDateString() === today
        );
        const todayRisk = todayBets.reduce((total, bet) => total + bet.riskAmount, 0);
        
        const maxDailyRisk = this.settings.currentBankroll * (this.settings.maxDailyRisk / 100);
        
        if (todayRisk + riskAmount > maxDailyRisk) {
            this.showNotification('Daily risk limit exceeded', 'error');
            return;
        }
        
        // Check sufficient bankroll
        if (riskAmount > this.settings.currentBankroll) {
            this.showNotification('Insufficient bankroll', 'error');
            return;
        }
        
        const potentialWin = this.calculatePotentialWin(riskAmount, odds);
        
        const bet = {
            id: Date.now().toString(),
            game: game,
            units: units,
            odds: odds,
            riskAmount: riskAmount,
            potentialWin: potentialWin,
            result: 'pending',
            date: new Date().toISOString()
        };
        
        this.activeBets.push(bet);
        this.saveActiveBets();
        
        // Reset form
        gameSelect.value = '';
        unitsInput.value = '1';
        
        this.renderActiveBets();
        this.showNotification(`Bet placed: $${riskAmount.toFixed(2)} risked`, 'success');
    }

    calculatePotentialWin(riskAmount, odds) {
        if (odds > 0) {
            return riskAmount * (odds / 100);
        } else {
            return riskAmount * (100 / Math.abs(odds));
        }
    }

    renderActiveBets() {
        const container = document.getElementById('active-bets');
        
        if (this.activeBets.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-4">
                    <p>No active bets</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.activeBets.map(bet => `
            <div class="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                <div>
                    <div class="text-white font-semibold">${bet.game.awayTeam} @ ${bet.game.homeTeam}</div>
                    <div class="text-sm text-gray-400">Risk: $${bet.riskAmount.toFixed(2)}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <div class="text-right">
                        <div class="text-emerald-400">$${bet.potentialWin.toFixed(2)}</div>
                        <div class="text-sm text-gray-400">To Win</div>
                    </div>
                    <button onclick="resolveBet('${bet.id}', 'win')" class="text-emerald-400 hover:text-emerald-300">✓</button>
                    <button onclick="resolveBet('${bet.id}', 'loss')" class="text-red-400 hover:text-red-300">✗</button>
                    <button onclick="resolveBet('${bet.id}', 'push')" class="text-yellow-400 hover:text-yellow-300">–</button>
                </div>
            </div>
        `).join('');
    }

    resolveBet(betId, result) {
        const betIndex = this.activeBets.findIndex(bet => bet.id === betId);
        if (betIndex === -1) return;
        
        const bet = this.activeBets[betIndex];
        bet.result = result;
        bet.resolvedDate = new Date().toISOString();
        
        // Update bankroll
        if (result === 'win') {
            this.settings.currentBankroll += bet.potentialWin;
            this.settings.totalProfit += bet.potentialWin;
        } else if (result === 'loss') {
            this.settings.currentBankroll -= bet.riskAmount;
            this.settings.totalProfit -= bet.riskAmount;
        }
        // Push: no change to bankroll
        
        // Update peak bankroll
        if (this.settings.currentBankroll > this.settings.peakBankroll) {
            this.settings.peakBankroll = this.settings.currentBankroll;
        }
        
        // Move to history
        this.bettingHistory.push(bet);
        this.activeBets.splice(betIndex, 1);
        
        this.saveSettings();
        this.saveBettingHistory();
        this.saveActiveBets();
        
        this.updateBankrollDisplay();
        this.createBankrollChart();
        this.renderActiveBets();
        this.renderBettingHistory();
        
        const resultText = result === 'win' ? 'Won' : result === 'loss' ? 'Lost' : 'Pushed';
        this.showNotification(`Bet ${resultText}: $${bet.game.awayTeam} @ $${bet.game.homeTeam}`, 'success');
    }

    renderBettingHistory() {
        const tbody = document.getElementById('betting-history');
        const filter = document.getElementById('history-filter').value;
        
        let filteredHistory = this.bettingHistory;
        if (filter !== 'all') {
            filteredHistory = this.bettingHistory.filter(bet => bet.result === filter);
        }
        
        if (filteredHistory.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-8 text-gray-400">
                        No betting history available
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = filteredHistory.reverse().map(bet => {
            const resultColor = {
                'win': 'text-emerald-400',
                'loss': 'text-red-400',
                'push': 'text-yellow-400',
                'pending': 'text-gray-400'
            };
            
            const profit = bet.result === 'win' ? `+$${bet.potentialWin.toFixed(2)}` :
                          bet.result === 'loss' ? `-$${bet.riskAmount.toFixed(2)}` :
                          bet.result === 'push' ? '$0.00' : 'Pending';
            
            const profitColor = bet.result === 'win' ? 'text-emerald-400' :
                               bet.result === 'loss' ? 'text-red-400' :
                               bet.result === 'push' ? 'text-yellow-400' : 'text-gray-400';
            
            return `
                <tr class="border-b border-gray-700 hover:bg-slate-800">
                    <td class="py-3 px-4 text-gray-300">${new Date(bet.date).toLocaleDateString()}</td>
                    <td class="py-3 px-4">
                        <div class="text-white">${bet.game.awayTeam} @ ${bet.game.homeTeam}</div>
                    </td>
                    <td class="py-3 px-4 text-white">${bet.units} units</td>
                    <td class="py-3 px-4 text-gray-300">${bet.units}</td>
                    <td class="py-3 px-4 text-gray-300">${bet.odds > 0 ? '+' : ''}${bet.odds}</td>
                    <td class="py-3 px-4 text-gray-300">$${bet.riskAmount.toFixed(2)}</td>
                    <td class="py-3 px-4">
                        <span class="${resultColor[bet.result]} font-semibold capitalize">
                            ${bet.result}
                        </span>
                    </td>
                    <td class="py-3 px-4 ${profitColor} font-semibold">${profit}</td>
                </tr>
            `;
        }).join('');
    }

    setupEventListeners() {
        document.getElementById('history-filter').addEventListener('change', () => {
            this.renderBettingHistory();
        });
        
        document.getElementById('starting-bankroll').value = this.settings.startingBankroll;
        document.getElementById('unit-percentage').value = this.settings.unitPercentage;
        document.getElementById('max-daily-risk').value = this.settings.maxDailyRisk;
    }

    updateSettings() {
        const startingBankroll = parseFloat(document.getElementById('starting-bankroll').value);
        const unitPercentage = parseFloat(document.getElementById('unit-percentage').value);
        const maxDailyRisk = parseFloat(document.getElementById('max-daily-risk').value);
        
        if (startingBankroll < 100) {
            this.showNotification('Starting bankroll must be at least $100', 'error');
            return;
        }
        
        if (unitPercentage < 0.1 || unitPercentage > 10) {
            this.showNotification('Unit percentage must be between 0.1% and 10%', 'error');
            return;
        }
        
        if (maxDailyRisk < 1 || maxDailyRisk > 50) {
            this.showNotification('Max daily risk must be between 1% and 50%', 'error');
            return;
        }
        
        this.settings.startingBankroll = startingBankroll;
        this.settings.currentBankroll = startingBankroll + this.settings.totalProfit;
        this.settings.unitPercentage = unitPercentage;
        this.settings.maxDailyRisk = maxDailyRisk;
        
        this.saveSettings();
        this.updateBankrollDisplay();
        this.createBankrollChart();
        
        this.showNotification('Settings updated successfully', 'success');
    }

    resetBankroll() {
        if (confirm('Are you sure you want to reset your bankroll? This will clear all data.')) {
            localStorage.removeItem('bankrollSettings');
            localStorage.removeItem('bettingHistory');
            localStorage.removeItem('activeBets');
            
            location.reload();
        }
    }

    exportBankrollData() {
        const data = {
            settings: this.settings,
            bettingHistory: this.bettingHistory,
            activeBets: this.activeBets,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bankroll-data-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg text-white transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-emerald-600',
            error: 'bg-red-600',
            info: 'bg-blue-600'
        };
        
        notification.classList.add(colors[type] || colors.info);
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions
function placeBet() {
    bankrollManager.placeBet();
}

function resolveBet(betId, result) {
    bankrollManager.resolveBet(betId, result);
}

function updateSettings() {
    bankrollManager.updateSettings();
}

function resetBankroll() {
    bankrollManager.resetBankroll();
}

function exportBankrollData() {
    bankrollManager.exportBankrollData();
}

// Initialize when DOM is loaded
let bankrollManager;
document.addEventListener('DOMContentLoaded', () => {
    bankrollManager = new BankrollManager();
});