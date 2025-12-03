const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');

class PredictionFetcher {
    constructor() {
        this.BDL_KEY = process.env.BDL_API_KEY || '59f29e05-1e15-4a7b-a237-c17d5ae79b';
        this.SPORTS = ['americanfootball_nfl', 'basketball_nba'];
        this.today = new Date().toISOString().slice(0, 10);
        this.dataDir = path.join(__dirname, '../data');
        this.init();
    }

    async init() {
        await fs.ensureDir(this.dataDir);
        await this.fetchAllPredictions();
        await this.updateHistoricalData();
        await this.generateAnalytics();
    }

    async fetchAllPredictions() {
        console.log(`Fetching predictions for ${this.today}...`);
        
        const allPredictions = [];
        
        for (const sport of this.SPORTS) {
            try {
                const predictions = await this.fetchSportPredictions(sport);
                allPredictions.push(...predictions);
                console.log(`Fetched ${predictions.length} ${sport} games`);
            } catch (error) {
                console.error(`Error fetching ${sport} predictions:`, error.message);
            }
        }

        // Save today's predictions
        const todayData = {
            date: this.today,
            timestamp: new Date().toISOString(),
            predictions: allPredictions,
            totalGames: allPredictions.length
        };

        await fs.writeJSON(path.join(this.dataDir, `predictions-${this.today}.json`), todayData, { spaces: 2 });
        await fs.writeJSON(path.join(this.dataDir, 'latest-predictions.json'), todayData, { spaces: 2 });
        
        console.log(`Saved ${allPredictions.length} total predictions`);
    }

    async fetchSportPredictions(sport) {
        const league = sport === 'basketball_nba' ? 'nba' : 'nfl';
        const url = `https://api.balldontlie.io/${league}/v1/odds?dates[]=${this.today}&per_page=100`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': this.BDL_KEY }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return this.processGameData(data.data || [], sport);
    }

    processGameData(games, sport) {
        return games.map(game => {
            const spread = game.spread_open || 0;
            const total = game.total_open || 0;
            const analysis = this.analyzeGame(game, sport);
            
            return {
                id: game.id,
                sport: sport,
                gameDate: this.today,
                commenceTime: game.game.date,
                homeTeam: game.game.home_team.name,
                awayTeam: game.game.away_team.name,
                spread: spread,
                total: total,
                homeTeamScore: null,
                awayTeamScore: null,
                ...analysis,
                status: 'scheduled',
                lastUpdated: new Date().toISOString()
            };
        });
    }

    analyzeGame(game, sport) {
        const homeAdvantage = 0.025;
        const spreadImpact = Math.abs(game.spread_open || 0) * 0.015;
        
        // Simulate team strength analysis
        const homeStrength = Math.random() * 0.4 + 0.3;
        const awayStrength = Math.random() * 0.4 + 0.3;
        
        let homeWinProb = 0.5 + homeAdvantage + (homeStrength - awayStrength) * 0.3;
        
        if ((game.spread_open || 0) < 0) {
            homeWinProb += spreadImpact;
        } else {
            homeWinProb -= spreadImpact;
        }
        
        homeWinProb = Math.max(0.1, Math.min(0.9, homeWinProb));
        
        const pick = homeWinProb > 0.5 ? game.game.home_team.name : game.game.away_team.name;
        const confidence = Math.max(homeWinProb, 1 - homeWinProb);
        
        let confidenceLevel = 'low';
        if (confidence > 0.7) confidenceLevel = 'high';
        else if (confidence > 0.6) confidenceLevel = 'medium';
        
        return {
            pick: pick,
            confidence: confidence,
            confidenceLevel: confidenceLevel,
            homeWinProb: homeWinProb,
            recommendedUnitSize: this.calculateUnitSize(confidence),
            analysis: {
                homeAdvantage: homeAdvantage,
                spreadImpact: spreadImpact,
                homeStrength: homeStrength,
                awayStrength: awayStrength,
                modelVersion: '1.0'
            }
        };
    }

    calculateUnitSize(confidence) {
        // Kelly Criterion-based unit sizing
        const bankroll = 1000; // Default bankroll
        const odds = -110; // Standard -110 odds
        const decimalOdds = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
        
        const winProb = confidence;
        const loseProb = 1 - winProb;
        const expectedValue = (winProb * (decimalOdds - 1)) - (loseProb * 1);
        
        // Conservative Kelly fraction (0.25)
        const kellyFraction = 0.25;
        const unitSize = Math.max(0.01, Math.min(0.05, expectedValue * kellyFraction));
        
        return Math.round(unitSize * bankroll * 100) / 100;
    }

    async updateHistoricalData() {
        const historicalFile = path.join(this.dataDir, 'historical-data.json');
        let historicalData = [];
        
        try {
            historicalData = await fs.readJSON(historicalFile);
        } catch (error) {
            // File doesn't exist, start fresh
        }

        // Load previous day's results if available
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        const yesterdayFile = path.join(this.dataDir, `predictions-${yesterdayStr}.json`);
        
        try {
            const yesterdayData = await fs.readJSON(yesterdayFile);
            // Update with actual results (this would normally come from a results API)
            await this.updateResults(yesterdayData);
        } catch (error) {
            console.log('No yesterday data to update');
        }

        await fs.writeJSON(historicalFile, historicalData, { spaces: 2 });
    }

    async updateResults(data) {
        // Mock results update - in real implementation, this would fetch actual game results
        data.predictions.forEach(prediction => {
            if (prediction.status === 'scheduled') {
                // Simulate result (60% win rate for testing)
                const result = Math.random() > 0.4 ? 'W' : 'L';
                const homeScore = Math.floor(Math.random() * 50) + 80;
                const awayScore = Math.floor(Math.random() * 50) + 80;
                
                prediction.result = result;
                prediction.homeTeamScore = homeScore;
                prediction.awayTeamScore = awayScore;
                prediction.status = 'completed';
                prediction.profit = result === 'W' ? 0.91 : -1.1; // Assuming -110 odds
            }
        });

        await fs.writeJSON(path.join(this.dataDir, `predictions-${data.date}.json`), data, { spaces: 2 });
    }

    async generateAnalytics() {
        const analytics = await this.calculateAnalytics();
        await fs.writeJSON(path.join(this.dataDir, 'analytics.json'), analytics, { spaces: 2 });
        console.log('Analytics updated');
    }

    async calculateAnalytics() {
        const historicalFile = path.join(this.dataDir, 'historical-data.json');
        let historicalData = [];
        
        try {
            historicalData = await fs.readJSON(historicalFile);
        } catch (error) {
            // Start with empty array
        }

        const graded = historicalData.filter(r => r.result);
        const wins = graded.filter(r => r.result === 'W').length;
        const losses = graded.filter(r => r.result === 'L').length;
        
        return {
            lastUpdated: new Date().toISOString(),
            totalPicks: historicalData.length,
            gradedPicks: graded.length,
            wins: wins,
            losses: losses,
            pushes: graded.filter(r => r.result === 'P').length,
            accuracy: graded.length > 0 ? (wins / graded.length * 100).toFixed(2) : 0,
            profit: this.calculateTotalProfit(graded),
            roi: this.calculateROI(graded),
            averageConfidence: historicalData.length > 0 ? 
                (historicalData.reduce((sum, r) => sum + r.conf, 0) / historicalData.length * 100).toFixed(1) : 0,
            bestStreak: this.calculateBestStreak(graded),
            currentStreak: this.calculateCurrentStreak(graded),
            bankroll: this.calculateBankroll(graded)
        };
    }

    calculateTotalProfit(graded) {
        return graded.reduce((total, pick) => {
            if (pick.result === 'W') {
                return total + (pick.profit || 0.91);
            } else if (pick.result === 'L') {
                return total - 1.1;
            }
            return total;
        }, 0);
    }

    calculateROI(graded) {
        const profit = this.calculateTotalProfit(graded);
        const totalWagered = graded.length * 1.1;
        return totalWagered > 0 ? (profit / totalWagered * 100).toFixed(2) : 0;
    }

    calculateBestStreak(graded) {
        let currentStreak = 0;
        let bestStreak = 0;
        
        graded.forEach(pick => {
            if (pick.result === 'W') {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });
        
        return bestStreak;
    }

    calculateCurrentStreak(graded) {
        let streak = 0;
        for (let i = graded.length - 1; i >= 0; i--) {
            if (graded[i].result === 'W') {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    calculateBankroll(graded) {
        const startingBankroll = 1000;
        return startingBankroll + this.calculateTotalProfit(graded);
    }
}

// Run the prediction fetcher
if (require.main === module) {
    new PredictionFetcher().catch(console.error);
}

module.exports = PredictionFetcher;