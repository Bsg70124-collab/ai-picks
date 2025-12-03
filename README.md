# AI Sports Picks - Intelligent Betting Platform

[![Daily Updates](https://github.com/yourusername/ai-sports-picks/workflows/Daily%20Predictions%20Update/badge.svg)](https://github.com/yourusername/ai-sports-picks/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An advanced AI-powered sports betting platform with professional bankroll management, real-time analytics, and automated daily predictions.

## 🏆 Features

### Core Functionality
- **AI-Powered Predictions**: Advanced machine learning algorithms for NBA and NFL games
- **Real-time Odds**: Integration with BallDon'tLie API for live betting odds
- **Automated Updates**: Daily predictions updated automatically via GitHub Actions
- **Professional Analytics**: Comprehensive performance tracking and visualization

### Bankroll Management
- **Dynamic Unit Sizing**: Kelly Criterion-based betting unit calculation
- **Risk Management**: Daily risk limits and bankroll protection
- **Performance Tracking**: Detailed betting history and profit analysis
- **Bankroll Growth**: Visual tracking of bankroll progression over time

### User Interface
- **Modern Design**: Dark theme with glass morphism effects
- **Interactive Charts**: Plotly.js powered data visualizations
- **Responsive Layout**: Mobile-friendly design
- **Real-time Updates**: Live data synchronization

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)
1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" and choose "main"
4. Your site will be available at `https://yourusername.github.io/ai-sports-picks/`

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/ai-sports-picks.git
cd ai-sports-picks

# Install dependencies
npm install

# Fetch initial predictions (optional)
npm run fetch-predictions

# Start local server
npm run dev
```

## 📊 Usage

### Dashboard
- View today's AI predictions with confidence ratings
- Track overall performance and accuracy
- Monitor active games and recent results

### Analytics
- Detailed performance charts and trends
- Sport-specific accuracy analysis
- Risk assessment and betting insights

### Predictions
- Filter predictions by confidence level
- View detailed game analysis
- Place bets with integrated bankroll management

### Bankroll Management
- Set custom bankroll and unit sizes
- Track all bets and results
- Monitor bankroll growth and drawdown
- Export data for external analysis

### Performance Tracking
- Comprehensive betting history
- Win rate and ROI calculations
- Streak tracking and performance metrics

## 🔧 Configuration

### API Keys
The system uses the BallDon'tLie API for sports data. You can:
- Use the provided demo key (limited requests)
- Get your own free API key at [BallDon'tLie](https://balldontlie.io/)
- Add it to your repository secrets as `BDL_API_KEY`

### Customization
Edit `scripts/fetch-predictions.js` to:
- Adjust prediction algorithms
- Modify confidence calculations
- Add new sports or leagues

### Bankroll Settings
- Starting Bankroll: Default $1,000 (customizable)
- Unit Size: 1% of bankroll (adjustable 0.5% - 5%)
- Daily Risk Limit: 5% of bankroll (configurable)

## 📈 Prediction Algorithm

The AI uses a sophisticated model considering:
- Team strength analysis
- Home field advantage
- Point spread impact
- Historical performance patterns
- Confidence scoring (0-100%)

### Kelly Criterion Integration
Bet sizes are calculated using a conservative Kelly fraction:
```
Unit Size = (Expected Value × Kelly Fraction) × Bankroll
Where Kelly Fraction = 0.25 (conservative)
```

## 🔄 Automation

### Daily Updates
- Automatically runs every day at 6 AM UTC
- Fetches new predictions and results
- Updates historical data and analytics
- Commits changes to repository

### Manual Updates
You can manually trigger updates:
1. Go to Actions tab in your repository
2. Select "Daily Predictions Update"
3. Click "Run workflow"

## 📱 Pages

- **Dashboard**: Main overview and today's picks
- **Analytics**: Performance charts and insights
- **Predictions**: Detailed game analysis
- **Performance**: Historical results and tracking
- **Bankroll**: Betting management and tracking

## 🛡️ Risk Management

### Built-in Protections
- Maximum daily risk limits
- Automatic unit size adjustment
- Drawdown monitoring
- Streak analysis

### Best Practices
- Never risk more than 5% per day
- Adjust unit size based on bankroll
- Track performance by sport and bet type
- Use confidence ratings for bet sizing

## 📊 Data Management

### Storage
- Local browser storage for user data
- GitHub repository for historical data
- JSON format for easy analysis

### Export Options
- CSV export for spreadsheet analysis
- JSON export for data science
- Real-time API access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational and entertainment purposes only. Sports betting involves risk, and past performance does not guarantee future results. Always gamble responsibly and within your means.

## 🔮 Future Features

- [ ] Multiple sportsbook odds comparison
- [ ] Advanced machine learning models
- [ ] Social betting features
- [ ] Mobile app version
- [ ] Real-time bet tracking
- [ ] Advanced analytics dashboard

## 📞 Support

For issues, feature requests, or questions:
- Open an issue in the GitHub repository
- Check the wiki for detailed documentation
- Join our community discussions

---

**Built with ❤️ for the sports betting community**

*Remember: Bet responsibly and within your means.*