import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const weatherApi = {
  getCurrentWeather: async (location) => {
    const response = await api.get(`/weather/current?location=${encodeURIComponent(location)}`);
    return response.data;
  },

  getForecast: async (location, days = 7) => {
    const response = await api.get(`/weather/forecast?location=${encodeURIComponent(location)}&days=${days}`);
    return response.data;
  },

  getHistory: async (location, from, to) => {
    const params = new URLSearchParams({ location });
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const response = await api.get(`/weather/history?${params.toString()}`);
    return response.data;
  },

  autocomplete: async (query) => {
    if (query.length < 2) return [];
    const response = await api.get(`/search/autocomplete?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};
