# Weather Forecast Application

A full-stack weather forecasting application with machine learning capabilities, featuring real-time weather data, ML-powered predictions, intelligent caching, and a modern responsive UI.

## 🌟 Features

### Core Features
- **Real-time Weather Data** - Get current weather conditions for any location worldwide using OpenWeatherMap API
- **Weather Forecasting** - Extended weather forecasts with detailed predictions
- **Machine Learning Predictions** - LSTM neural network model for advanced weather trend analysis
- **Intelligent Caching** - Optimized performance with smart cache management
- **Search Functionality** - Quick location search with debounced API calls
- **Responsive Design** - Mobile-first design with Tailwind CSS

### Advanced Features
- **Historical Data Analysis** - Track and analyze weather patterns over time
- **Trend Charts** - Visualize weather trends with interactive charts using Recharts
- **Sector Insights** - Weather impact analysis for different sectors
- **Hourly Forecasts** - Detailed hour-by-hour weather predictions
- **Current Weather Display** - Beautiful cards showing current conditions
- **Theme Support** - Light/dark mode capability

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask 3.0.3
- **Language**: Python
- **Database**: SQLAlchemy with SQLite (development)
- **API**: OpenWeatherMap API
- **ML Library**: TensorFlow/Keras (LSTM models)
- **Data Processing**: NumPy, Pandas, Scikit-learn
- **CORS Support**: Flask-CORS for cross-origin requests
- **Environment**: python-dotenv for configuration

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Charting**: Recharts 3
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge
- **Linting**: ESLint

## 📁 Project Structure

```
forecast/
├── backend/                      # Python Flask backend
│   ├── app/
│   │   ├── __init__.py          # Flask app initialization
│   │   ├── config.py            # Configuration settings
│   │   ├── models/
│   │   │   └── db_models.py     # SQLAlchemy ORM models
│   │   ├── routes/
│   │   │   ├── health.py        # Health check endpoint
│   │   │   ├── search.py        # Location search endpoint
│   │   │   └── weather.py       # Main weather endpoints
│   │   └── services/
│   │       ├── cache.py         # Caching service
│   │       ├── ml_service.py    # ML prediction service
│   │       └── weather_api.py   # OpenWeatherMap API wrapper
│   ├── ml/                       # Machine learning models
│   │   ├── data_pipeline.py     # Data processing pipeline
│   │   ├── lstm_model.py        # LSTM model architecture
│   │   ├── train.py             # Model training script
│   │   └── saved_models/
│   │       └── lstm_weather.keras
│   ├── instance/                 # Instance folder for local configs
│   ├── requirements.txt          # Python dependencies
│   └── run.py                   # Application entry point
│
├── frontend/                     # React Vite frontend
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   ├── index.css            # Global styles
│   │   ├── api/
│   │   │   └── weatherApi.js    # API service layer
│   │   ├── components/
│   │   │   ├── CurrentWeather/   # Current conditions display
│   │   │   ├── ForecastCards/    # Forecast cards component
│   │   │   ├── HourlyForecast/   # Hourly forecast view
│   │   │   ├── SearchBar/        # Location search input
│   │   │   ├── SectorInsights/   # Sector analysis component
│   │   │   └── TrendCharts/      # Weather trend visualization
│   │   ├── context/
│   │   │   └── ThemeContext.jsx # Theme state management
│   │   ├── hooks/
│   │   │   └── useDebounce.js   # Debounce hook for search
│   │   ├── assets/               # Static assets
│   │   └── public/               # Public assets
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   ├── postcss.config.js
│   └── index.html
│
├── .env                          # Environment variables
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- OpenWeatherMap API key (free tier available at [openweathermap.org](https://openweathermap.org/))

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create and activate virtual environment**
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python -m venv .venv
source .venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
Edit the `.env` file in the project root:
```env
OPENWEATHERMAP_API_KEY=your_api_key_here
FLASK_SECRET_KEY=your_secret_key
FLASK_ENV=development
DATABASE_URL=sqlite:///weather.db
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

5. **Run the backend server**
```bash
python run.py
```
The backend will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```
The frontend will start on `http://localhost:5173`

4. **Build for production**
```bash
npm run build
```

## 📚 API Endpoints

### Weather Routes

#### Get Current Weather
```
GET /api/weather/current?location=<city_name>
```
Returns current weather conditions for the specified location.

**Example:**
```bash
curl "http://localhost:5000/api/weather/current?location=New%20York"
```

#### Get Weather Forecast
```
GET /api/weather/forecast?location=<city_name>
```
Returns extended weather forecast.

#### Get ML Predictions
```
GET /api/weather/predictions?location=<city_name>
```
Returns machine learning-based weather predictions.

### Search Routes

#### Search Locations
```
GET /api/search?q=<search_query>
```
Search for locations with autocomplete suggestions.

### Health Check

#### Server Status
```
GET /api/health
```
Returns server health status and version information.

## 🤖 Machine Learning

The application includes an LSTM (Long Short-Term Memory) neural network for advanced weather prediction:

### Model Details
- **Architecture**: LSTM layers with dropout regularization
- **Input**: Historical weather data (temperature, humidity, pressure, wind speed)
- **Output**: Future weather trends and anomaly detection
- **Framework**: TensorFlow/Keras
- **Training**: Uses historical weather data pipeline

### Using ML Features

To train or update the model:
```bash
cd backend/ml
python train.py
```

This will:
1. Process historical weather data
2. Train the LSTM model
3. Save the trained model to `saved_models/lstm_weather.keras`
4. Evaluate model performance

## 💾 Database

The application uses SQLAlchemy ORM with SQLite for development:

### Models
- **WeatherRecord**: Stores current weather observations
- **ForecastRecord**: Stores forecast predictions
- **LocationCache**: Caches location search results

To initialize the database:
```bash
cd backend
python -c "from app import create_app; app = create_app(); app.app_context().push(); db.create_all()"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENWEATHERMAP_API_KEY` | OpenWeatherMap API key | `3cc5733aa62f724fb7c9249...` |
| `FLASK_SECRET_KEY` | Flask secret key for sessions | `your-secret-key` |
| `FLASK_ENV` | Flask environment | `development` or `production` |
| `DATABASE_URL` | Database connection URL | `sqlite:///weather.db` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,http://localhost:5174` |

### Backend Configuration
Edit `backend/app/config.py` for:
- Cache settings
- API timeouts
- Database pooling options
- CORS policies

### Frontend Configuration
- **Tailwind CSS**: Customize theme in `frontend/tailwind.config.js`
- **Vite**: Modify build settings in `frontend/vite.config.js`
- **ESLint**: Update rules in `frontend/eslint.config.js`

## 📊 Performance Features

### Caching Strategy
- **Memory Cache**: Fast access for frequently requested locations
- **Cache Expiration**: Configurable TTL (Time To Live)
- **Smart Invalidation**: Automatic cache updates based on data freshness

### Optimization
- **Debounced Search**: Reduces API calls during typing
- **Lazy Loading**: Components load data on demand
- **Efficient Bundle**: Optimized Vite build with tree-shaking

## 🧪 Development

### Code Quality

**Run ESLint**
```bash
cd frontend
npm run lint
```

**Format Code**
```bash
cd frontend
npm run format  # if configured
```

### Testing

For backend (pytest recommended):
```bash
cd backend
pip install pytest
pytest
```

## 🚢 Deployment

### Backend Deployment (Heroku Example)
```bash
heroku create your-app-name
heroku config:set OPENWEATHERMAP_API_KEY=your_key
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**
- Check `CORS_ORIGINS` in `.env`
- Ensure frontend URL matches exactly (including port)

**API Key Error**
- Verify `OPENWEATHERMAP_API_KEY` is valid
- Check API key permissions on OpenWeatherMap dashboard

**Port Already in Use**
- Backend: Change port in `backend/run.py`
- Frontend: Vite will use next available port automatically

**Database Errors**
- Delete `weather.db` to reset
- Check write permissions in backend directory

## 📝 API Response Examples

### Current Weather Response
```json
{
  "location": {
    "name": "New York",
    "lat": 40.7128,
    "lon": -74.0060
  },
  "temperature": 22.5,
  "feels_like": 21.8,
  "humidity": 65,
  "pressure": 1013,
  "wind_speed": 5.2,
  "description": "Partly cloudy",
  "icon": "02d",
  "timestamp": "2026-05-02T14:30:00Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API endpoint specifications

## 🔐 Security Notes

- Never commit `.env` file with real API keys
- Use environment-specific configurations
- Validate all user inputs on backend
- Implement rate limiting in production
- Keep dependencies updated

## 🎯 Roadmap

- [ ] User authentication and profiles
- [ ] Weather alerts and notifications
- [ ] Mobile native app
- [ ] Advanced analytics dashboard
- [ ] Integration with weather IoT devices
- [ ] Multilingual support
- [ ] Historical data export

## 📈 Performance Metrics

- **API Response Time**: < 500ms
- **Frontend Bundle Size**: < 150KB (gzipped)
- **Cache Hit Rate**: Target 70%+
- **ML Model Accuracy**: Continuously monitored

---

**Built with ❤️ for weather forecasting enthusiasts**
#   O W F S  
 #   O W F S  
 #   O W F S  
 # OWFS
# OWFS
# OWFS
