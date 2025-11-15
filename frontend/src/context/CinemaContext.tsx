import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cinemaAPI } from '../services/api';
import type { ClientMovie, ClientHall } from '../types/client';
import type { ApiMovie, ApiScreening, ApiResponse } from '../types/api';

interface CinemaContextType {
  movies: ClientMovie[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedMovie?: ClientMovie;
  selectedTime?: string;
  selectedHall?: string;
  selectMovie: (movie: ClientMovie, time: string, hall: string) => void;
  loading: boolean;
  error: string | null;
}

const CinemaContext = createContext<CinemaContextType | undefined>(undefined);

interface CinemaProviderProps {
  children: ReactNode;
}

export const CinemaProvider: React.FC<CinemaProviderProps> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMovie, setSelectedMovie] = useState<ClientMovie>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedHall, setSelectedHall] = useState<string>();
  const [movies, setMovies] = useState<ClientMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем все данные один раз при монтировании
  useEffect(() => {
    loadAllData();
  }, []);

  // Загружаем сеансы при смене даты
  useEffect(() => {
    if (movies.length > 0) {
      loadScreeningsForDate(selectedDate);
    }
  }, [selectedDate, movies.length]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await loadMovies();
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMovies = async () => {
    try {
      const response = await cinemaAPI.getMovies();
      const apiResponse = response.data as ApiResponse<ApiMovie[]>;

      const clientMovies: ClientMovie[] = apiResponse.data.map((movie: ApiMovie) => ({
        id: movie.id.toString(),
        title: movie.title,
        poster: movie.poster_url,
        synopsis: movie.synopsis,
        duration: `${movie.duration} минут`,
        origin: movie.origin,
        halls: []
      }));

      setMovies(clientMovies);
    } catch (err) {
      console.error('Error loading movies:', err);
      throw err;
    }
  };

  const loadScreeningsForDate = async (date: Date) => {
    try {
      const dateString = date.toISOString().split('T')[0];
      const response = await cinemaAPI.getScreenings();
      const apiResponse = response.data as ApiResponse<ApiScreening[]>;

      const screeningsForDate = apiResponse.data.filter(
        (screening: ApiScreening) => screening.date === dateString
      );

      updateMoviesWithScreenings(screeningsForDate);

    } catch (err) {
      console.error('Error loading screenings:', err);
    }
  };

  const updateMoviesWithScreenings = (screeningsData: ApiScreening[]) => {
  setMovies(prevMovies => 
    prevMovies.map(movie => {
      const movieScreenings = screeningsData.filter(
        screening => screening.movie_id.toString() === movie.id
      );

      // Если нет сеансов - возвращаем movie с пустыми halls
      if (movieScreenings.length === 0) {
        return { ...movie, halls: [] };
      }

      // Упрощенная логика для залов
      const hallsMap = new Map<string, ClientHall>();
      
      movieScreenings.forEach(screening => {
        const hallId = screening.cinema_hall_id.toString();
        if (!hallsMap.has(hallId)) {
          hallsMap.set(hallId, {
            id: hallId,
            name: screening.cinema_hall?.name || `Зал ${hallId}`,
            times: [],
            screeningIds: []
          });
        }
        
        const hall = hallsMap.get(hallId)!;
        hall.times.push(screening.start_time);
        hall.screeningIds.push(screening.id.toString());
      });

      const halls = Array.from(hallsMap.values());
      
      halls.forEach(hall => {        
        const sorted = hall.times
          .map((time: string, idx: number) => ({ time, id: hall.screeningIds[idx] }))
          .sort((a: { time: string }, b: { time: string }) => a.time.localeCompare(b.time));
          
        hall.times = sorted.map((item: { time: string }) => item.time);
        hall.screeningIds = sorted.map((item: { id: string }) => item.id);
      });

      return { ...movie, halls };
    })
  );
};

  const selectMovie = (movie: ClientMovie, time: string, hall: string) => {
    setSelectedMovie(movie);
    setSelectedTime(time);
    setSelectedHall(hall);
  };

  const contextValue: CinemaContextType = {
    movies,
    selectedDate,
    setSelectedDate,
    selectedMovie,
    selectedTime,
    selectedHall,
    selectMovie,
    loading,
    error
  };

  return (
    <CinemaContext.Provider value={contextValue}>
      {children}
    </CinemaContext.Provider>
  );
};

export const useCinema = () => {
  const context = useContext(CinemaContext);
  if (!context) {
    throw new Error('useCinema must be used within CinemaProvider');
  }
  return context;
};