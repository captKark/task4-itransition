import axios from 'axios';

const api = axios.create({
  baseURL: 'https://task4-backend-itransition.onrender.com/'
});

export default api;