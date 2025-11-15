import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const fileApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

fileApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('File API Error:', error);
    return Promise.reject(error);
  }
);

export const cinemaAPI = {
  // Залы
  getHalls: () => api.get('/cinema-halls'),
  createHall: (hall: any) => api.post('/cinema-halls', hall),
  deleteHall: (hallId: string) => api.delete(`/cinema-halls/${hallId}`),
  updateHall: (hallId: string, data: any) => api.put(`/cinema-halls/${hallId}`, data),
  
  // Фильмы
  getMovies: () => api.get('/movies'),
  createMovie: (movie: any) => api.post('/movies', movie),
  deleteMovie: (movieId: string) => api.delete(`/movies/${movieId}`),
  updateMovie: (movieId: string, data: any) => api.put(`/movies/${movieId}`, data),
  
  // Загрузка файлов
  uploadPoster: (formData: FormData) => fileApi.post('/upload-poster', formData),
  
  // Сеансы
  getScreenings: () => api.get('/screenings'),
  createScreening: (screening: any) => api.post('/screenings', screening),
  deleteScreening: (screeningId: string) => api.delete(`/screenings/${screeningId}`),
  
  // Клиентские методы
  getScreeningsByDate: (date: string) => api.get(`/screenings?date=${date}`),  
  createBooking: (data: any) => api.post('/bookings', data),
  getBooking: (code: string) => api.get(`/bookings/${code}`),
  getBookedSeats: (screeningId: string) => api.get(`/screenings/${screeningId}/booked-seats`),
};

export default api;