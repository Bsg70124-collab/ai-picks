// Predictions Page JavaScript
class PredictionsPage {
    constructor() {
        this.currentPredictions = [];
        this.filteredPredictions = [];
        this.init();
    }

    init() {
        this.loadPredictions();
        this.setupFilters();
    }

    async loadPredictions() {
        // Simulate loading predictions (in real app, this would fetch from API)
        this.currentPredictions = this.generateMockPredictions();
        this.filteredPredictions = [...this.currentPredictions];
        this.renderPredictions();
        this.updateMarketInsights();
    }

    generateMockPredictions() {
        const teams = {
            nba: [
                ['Lakers', 'Clippers'],
                ['Warriors', 'Kings'],
                ['Nets', 'Knicks'],
                ['Bucks', 'Bulls'],
                ['Suns', 'Jazz']
            ],
            nfl: [
                ['Chiefs', 'Raiders'],
                ['Patriots', 'Jets'],
                ['Cowboys', 'Giants'],
                ['Packers', 'Bears'],
                ['Rams', 'Seahawks']
            ]
        };

        const predictions = [];
        
        // Generate NBA games
        teams.nba.forEach((matchup, index) => {
            predictions.push({
                id: `nba-${index}`,
                sport: 'nba',
                away_team: matchup[1],
                home_team: matchup[0],
                commence_time: new Date(Date.now() + Math.random() * 86400000).toISOString(),
                spread: (Math.random() * 10 - 5).toFixed(1),
                total: (Math.random() * 40 + 200).toFixed(1),
                pick: Math.random() > 0.5 ? matchup[0] : matchup[1],
                confidence: Math.random() * 0.4 + 0.5,
                confidenceLevel: this.getConfidenceLevel(Math.random() * 0.4 + 0.5),
                odds: Math.floor(Math.random() * 40 + 110)
            });
        });

        // Generate NFL games
        teams.nfl.forEach((matchup, index) => {
            predictions.push({
                id: `nfl-${index}`,
                sport: 'nfl',
                away_team: matchup[1],
                home_team: matchup[0],
                commence_time: new Date(Date.now() + Math.random() * 86400000).toISOString(),
                spread: (Math.random() * 14 - 7).toFixed(1),
                total: (Math.random() * 30 + 35).toFixed(1),
                pick: Math.random() > 0.5 ? matchup[0] : matchup[1],
                confidence: Math.random() * 0.4 + 0.5,
                confidenceLevel: this.getConfidenceLevel(Math.random() * 0.4 + 0.5),
                odds: Math.floor(Math.random() * 40 + 110)
            });
        });

        return predictions.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));
    }

    getConfidenceLevel(confidence) {
        if (confidence > 0.8) return 'high';
        if (confidence > 0.65) return 'medium';
        return 'low';
    }

    renderPredictions() {
        const container = document.getElementById('predictions-container');
        
        if (this.filteredPredictions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-4xl mb-4">🔍</div>
                    <p class="text-gray-300">No predictions match your filters</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredPredictions.map(game => this.createPredictionCard(game)).join('');
    }

    createPredictionCard(game) {
        const stars = '★'.repeat(Math.round(game.confidence * 5)) + '☆'.repeat(5 - Math.round(game.confidence * 5));
        const confidenceColor = {
            'high': 'text-emerald-400',
            'medium': 'text-yellow-400',
            'low': 'text-red-400'
        };

        const sportIcon = game.sport === 'nba' ? '🏀' : '🏈';
        const gameTime = new Date(game.commence_time).toLocaleString();

        return `
            <div class="prediction-card ${game.confidenceLevel}-confidence glass-effect rounded-xl p-6">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="text-2xl">${sportIcon}</div>
                        <div>
                            <h3 class="text-lg font-semibold text-white">${game.away_team} @ ${game.home_team}</h3>
                            <p class="text-sm text-gray-400">${gameTime}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-400">Confidence</div>
                        <div class="${confidenceColor[game.confidenceLevel]} font-bold">${(game.confidence * 100).toFixed(1)}%</div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <div>
                            <span class="text-gray-300">AI Pick:</span>
                            <span class="text-white font-semibold">${game.pick}</span>
                        </div>
                        <div class="stars text-yellow-400">${stars}</div>
                    </div>
                    <div class="text-sm text-gray-400">
                        Odds: ${game.odds > 0 ? '+' : ''}${game.odds}
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div class="text-center">
                        <div class="text-gray-400">Spread</div>
                        <div class="text-white font-semibold">${game.spread > 0 ? '+' : ''}${game.spread}</div>
                    </div>
                    <div class="text-center">
                        <div class="text-gray-400">Total</div>
                        <div class="text-white font-semibold">${game.total}</div>
                    </div>
                    <div class="text-center">
                        <div class="text-gray-400">Sport</div>
                        <div class="text-white font-semibold">${game.sport.toUpperCase()}</div>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="scoreGame('${game.id}', 'W')" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition-all">
                        ✓ Win
                    </button>
                    <button onclick="scoreGame('${game.id}', 'L')" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-all">
                        ✗ Loss
                    </button>
                    <button onclick="scoreGame('${game.id}', 'P')" class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-semibold transition-all">
                        – Push
                    </button>
                </div>
            </div>
        `;
    }

    setupFilters() {
        // Sport filter
        document.getElementById('sport-filter').addEventListener('change', (e) => {
            this.filterBySport(e.target.value);
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active', 'bg-emerald-600', 'text-white');
                    b.classList.add('bg-slate-700', 'text-gray-300');
                });
                
                e.target.classList.add('active', 'bg-emerald-600', 'text-white');
                e.target.classList.remove('bg-slate-700', 'text-gray-300');
                
                const filter = e.target.textContent.toLowerCase().includes('high') ? 'high' :
                              e.target.textContent.toLowerCase().includes('medium') ? 'medium' :
                              e.target.textContent.toLowerCase().includes('low') ? 'low' : 'all';
                
                this.filterByConfidence(filter);
            });
        });
    }

    filterBySport(sport) {
        if (sport === 'all') {
            this.filteredPredictions = [...this.currentPredictions];
        } else {
            this.filteredPredictions = this.currentPredictions.filter(p => p.sport === sport);
        }
        this.renderPredictions();
    }

    filterByConfidence(level) {
        if (level === 'all') {
            this.filteredPredictions = [...this.currentPredictions];
        } else {
            this.filteredPredictions = this.currentPredictions.filter(p => p.confidenceLevel === level);
        }
        this.renderPredictions();
    }

    updateMarketInsights() {
        // Mock market data
        const marketData = {
            publicBetting: 65,
            lineMovement: -2.5,
            sharpMoney: 'Active'
        };

        this.updateElement('public-betting', marketData.publicBetting + '%');
        this.updateElement('line-movement', marketData.lineMovement > 0 ? `+${marketData.lineMovement}` : marketData.lineMovement.toString());
        this.updateElement('sharp-money', marketData.sharpMoney);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
}

// Global functions
function filterPredictions(filter) {
    if (window.predictionsPage) {
        predictionsPage.filterByConfidence(filter);
    }
}

function refreshPredictions() {
    if (window.predictionsPage) {
        window.predictionsPage = new PredictionsPage();
    }
}

function scoreGame(gameId, result) {
    // This would integrate with the main scoring system
    console.log(`Scoring game ${gameId} as ${result}`);
    
    // Show success message
    showNotification(`Game scored as ${result}`, 'success');
}

function showNotification(message, type = 'info') {
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
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.predictionsPage = new PredictionsPage();
});