import React, { useState, useEffect } from 'react';
import { CinemaHall, Movie, Screening } from '../../types';
import { AdminLayout } from '../../components/admin/AdminLayout/AdminLayout';
import { AdminHeader } from '../../components/admin/AdminHeader/AdminHeader';
import { HallManagement } from '../../components/admin/HallManagement/HallManagement';
import { HallConfiguration } from '../../components/admin/HallConfiguration/HallConfiguration';
import { PriceConfiguration } from '../../components/admin/PriceConfiguration/PriceConfiguration';
import { ScheduleManagement } from '../../components/admin/ScheduleManagement/ScheduleManagement';
import { SalesControl } from '../../components/admin/SalesControl/SalesControl';
import { useAccordeon } from '../../hooks/useAccordeon';
import { cinemaAPI } from '../../services/api';
import './AdminPage.css';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);

  const { openSections, toggleSection } = useAccordeon({
    hallManagement: true,
    hallConfiguration: false,
    priceConfiguration: false,
    scheduleManagement: false,
    salesControl: false
  });

  // Функции загрузки данных
  const loadHalls = async () => {
    try {
      const response = await cinemaAPI.getHalls();
      const hallsData = response.data.data.map((hall: any) => ({
        id: hall.id.toString(),
        name: hall.name,
        rows: hall.rows,
        seatsPerRow: hall.seats_per_row,
        standardPrice: hall.standard_price,
        vipPrice: hall.vip_price,
        layout: hall.layout || null
      }));
      setHalls(hallsData);
    } catch (error) {
      console.error('Ошибка загрузки залов:', error);
    }
  };

  const loadMovies = async () => {
    try {
      const response = await cinemaAPI.getMovies();
      const moviesData = response.data.data.map((movie: any) => ({
        id: movie.id.toString(),
        title: movie.title,
        poster: movie.poster_url,
        synopsis: movie.synopsis,
        duration: movie.duration,
        origin: movie.origin
      }));
      setMovies(moviesData);
    } catch (error) {
      console.error('Ошибка загрузки фильмов:', error);
    }
  };

  const loadScreenings = async () => {
    try {
      const response = await cinemaAPI.getScreenings();
      const screeningsData = response.data.data.map((screening: any) => ({
        id: screening.id.toString(),
        movieId: screening.movie_id.toString(),
        hallId: screening.cinema_hall_id.toString(),
        startTime: screening.start_time,
        date: screening.date,
        duration: screening.duration || 120
      }));
      setScreenings(screeningsData);
    } catch (error) {
      console.error('Ошибка загрузки сеансов:', error);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth') === 'true';
    setIsAuthenticated(auth);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadHalls();
      loadMovies();
      loadScreenings();
    }
  }, [isAuthenticated]);

  const handleLogin = (email: string, password: string): boolean => {
    if (email === 'admin@vkino.ru' && password === 'admin') {
      localStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setHalls([]);
    setMovies([]);
    setScreenings([]);
  };

  // Обработчики для HallManagement
  const handleHallCreated = async (newHall: CinemaHall) => {
    try {
      const hallToSend = {
        name: newHall.name,
        rows: newHall.rows,
        seats_per_row: newHall.seatsPerRow,
        is_active: true
      };

      const response = await cinemaAPI.createHall(hallToSend);
      const createdHall = response.data.data;

      setHalls(prev => [...prev, {
        id: createdHall.id.toString(),
        name: createdHall.name,
        rows: createdHall.rows,
        seatsPerRow: createdHall.seats_per_row,
        standardPrice: createdHall.standard_price,
        vipPrice: createdHall.vip_price,
        layout: createdHall.layout || null
      }]);
    } catch (error) {
      alert('Ошибка при создании зала');
      throw error;
    }
  };

  const handleHallDeleted = async (hallId: string) => {
    try {
      await cinemaAPI.deleteHall(hallId);
      setHalls(prev => prev.filter(hall => hall.id !== hallId));
      setScreenings(prev => prev.filter(screening => screening.hallId !== hallId));
    } catch (error) {
      alert('Ошибка при удалении зала');
      throw error;
    }
  };

  // Обработчики для ScheduleManagement
  const handleMovieAdded = async (newMovie: Movie) => {
    try {
      const movieToSend = {
        title: newMovie.title.trim(),
        poster_url: newMovie.poster,
        synopsis: newMovie.synopsis.trim(),
        duration: parseInt(newMovie.duration.toString()) || 120,
        origin: newMovie.origin.trim()
      };

      if (!movieToSend.title) {
        alert('Название фильма обязательно');
        return;
      }
      if (!movieToSend.synopsis) {
        alert('Описание фильма обязательно');
        return;
      }
      if (!movieToSend.origin) {
        alert('Страна производства обязательна');
        return;
      }
      if (movieToSend.duration < 1) {
        alert('Продолжительность должна быть положительным числом');
        return;
      }

      const response = await cinemaAPI.createMovie(movieToSend);
      const createdMovie = response.data.data;

      setMovies(prev => [...prev, {
        id: createdMovie.id.toString(),
        title: createdMovie.title,
        poster: createdMovie.poster_url || '/images/posters/default.jpg',
        synopsis: createdMovie.synopsis,
        duration: createdMovie.duration,
        origin: createdMovie.origin
      }]);

    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        alert(`Ошибки валидации: ${errorMessages}`);
      } else {
        alert('Ошибка при добавлении фильма. Проверьте все поля.');
      }
      throw error;
    }
  };

  const handleMovieDeleted = async (movieId: string) => {
    try {
      await cinemaAPI.deleteMovie(movieId);
      setMovies(prev => prev.filter(movie => movie.id !== movieId));
      setScreenings(prev => prev.filter(screening => screening.movieId !== movieId));
    } catch (error) {
      alert('Ошибка при удалении фильма');
      throw error;
    }
  };

  const handleScreeningAdded = async (newScreening: Omit<Screening, 'id'>) => {
    try {
      const screeningToSend = {
        movie_id: parseInt(newScreening.movieId),
        cinema_hall_id: parseInt(newScreening.hallId),
        date: newScreening.date,
        start_time: newScreening.startTime
      };

      const response = await cinemaAPI.createScreening(screeningToSend);
      const createdScreening = response.data.data;

      setScreenings(prev => [...prev, {
        id: createdScreening.id.toString(),
        movieId: createdScreening.movie_id.toString(),
        hallId: createdScreening.cinema_hall_id.toString(),
        startTime: createdScreening.start_time,
        date: createdScreening.date,
        duration: newScreening.duration
      }]);
    } catch (error) {
      alert('Ошибка при добавлении сеанса');
      throw error;
    }
  };

  const handleScreeningDeleted = async (screeningId: string) => {
    try {
      await cinemaAPI.deleteScreening(screeningId);
      setScreenings(prev => prev.filter(screening => screening.id !== screeningId));
    } catch (error) {
      alert('Ошибка при удалении сеанса');
      throw error;
    }
  };

  // Обработчики для HallConfiguration
  const handleHallConfigurationSaved = async (hallConfig: any) => {
    try {
      const updateData = {
        rows: hallConfig.rows,
        seats_per_row: hallConfig.seatsPerRow,
        layout: hallConfig.seats
      };

      await cinemaAPI.updateHall(hallConfig.hallId, updateData);

      setHalls(prev => prev.map(hall =>
        hall.id === hallConfig.hallId
          ? {
            ...hall,
            rows: hallConfig.rows,
            seatsPerRow: hallConfig.seatsPerRow,
            layout: hallConfig.seats
          }
          : hall
      ));

    } catch (error) {
      alert('Ошибка при сохранении конфигурации зала');
      throw error;
    }
  };

  // Обработчики для PriceConfiguration
  const handlePricesSaved = async (prices: any) => {
    try {
      await cinemaAPI.updateHall(prices.hallId, {
        standard_price: prices.standardPrice,
        vip_price: prices.vipPrice
      });

      setHalls(prev => prev.map(hall =>
        hall.id === prices.hallId
          ? {
            ...hall,
            standardPrice: prices.standardPrice,
            vipPrice: prices.vipPrice
          }
          : hall
      ));

      alert('Цены успешно сохранены!');
    } catch (error) {
      alert('Ошибка при сохранении цен');
      throw error;
    }
  };

  // Обработчики для SalesControl
  const handleSalesToggle = async (salesOpen: boolean) => {
    try {
      alert(`Продажи ${salesOpen ? 'открыты' : 'приостановлены'}!`);
    } catch (error) {
      alert('Ошибка при переключении продаж');
      throw error;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="loading">Загрузка...</div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <AdminLayout>
      <AdminHeader onLogout={handleLogout} />

      <main className="conf-steps">
        <HallManagement
          isOpen={openSections.hallManagement}
          onToggle={() => toggleSection('hallManagement')}
          halls={halls}
          onHallCreated={handleHallCreated}
          onHallDeleted={handleHallDeleted}
        />

        <HallConfiguration
          isOpen={openSections.hallConfiguration}
          onToggle={() => toggleSection('hallConfiguration')}
          halls={halls}
          onConfigurationSaved={handleHallConfigurationSaved}
        />

        <PriceConfiguration
          isOpen={openSections.priceConfiguration}
          onToggle={() => toggleSection('priceConfiguration')}
          halls={halls}
          onPricesSaved={handlePricesSaved}
        />

        <ScheduleManagement
          isOpen={openSections.scheduleManagement}
          onToggle={() => toggleSection('scheduleManagement')}
          halls={halls}
          movies={movies}
          screenings={screenings}
          onMovieAdded={handleMovieAdded}
          onMovieDeleted={handleMovieDeleted}
          onScreeningAdded={handleScreeningAdded}
          onScreeningDeleted={handleScreeningDeleted}
        />

        <SalesControl
          isOpen={openSections.salesControl}
          onToggle={() => toggleSection('salesControl')}
          onSalesToggle={handleSalesToggle}
        />
      </main>
    </AdminLayout>
  );
};

// Компонент формы логина
interface LoginFormProps {
  onLogin: (email: string, password: string) => boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(email, password);
    if (!success) {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="admin-login">
      <header className="page-header">
        <h1 className="page-header__title">Идём<span>в</span>кино</h1>
        <span className="page-header__subtitle">Администраторррская</span>
      </header>

      <main>
        <section className="login">
          <header className="login__header">
            <h2 className="login__title">Авторизация</h2>
          </header>
          <div className="login__wrapper">
            <form className="login__form" onSubmit={handleSubmit}>
              <label className="login__label" htmlFor="email">
                E-mail
                <input
                  className="login__input"
                  type="email"
                  placeholder="example@domain.xyz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="login__label" htmlFor="pwd">
                Пароль
                <input
                  className="login__input"
                  type="password"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              {error && <div className="login__error">{error}</div>}
              <div className="text-center">
                <button type="submit" className="login__button">
                  Авторизоваться
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};