import { useLocation } from 'react-router-dom';
import { ClientLayout } from '../../components/client/ClientLayout';
import { ClientHeader } from '../../components/client/ClientHeader/ClientHeader';
import { Hall } from '../../components/client/Hall/Hall';

export const HallPage: React.FC = () => {
  const location = useLocation();
  
  const { movieTitle, startTime, hallName, screeningId, date } = location.state || {
    movieTitle: 'Фильм не выбран',
    startTime: '--:--',
    hallName: '--',
    screeningId: undefined,
    date: new Date().toLocaleDateString('ru-RU')
  };

  return (
    <ClientLayout>
      <ClientHeader />
      <Hall 
        movieTitle={movieTitle}
        startTime={startTime}
        hallName={hallName}
        screeningId={screeningId}
        date={date} // ← ПЕРЕДАЕМ ДАТУ
      />
    </ClientLayout>
  );
};