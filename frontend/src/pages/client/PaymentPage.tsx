import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BookingData, Ticket } from '../../types/client';
import { TicketLayout } from '../../components/client/TicketLayout/TicketLayout';
import { ClientLayout } from '../../components/client/ClientLayout';

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const bookingData = location.state as BookingData;

  if (!bookingData) {
    return (
      <ClientLayout>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Данные бронирования не найдены</h2>
          <p>Пожалуйста, начните процесс бронирования заново</p>
          <button onClick={() => navigate('/')}>
            Вернуться на главную
          </button>
        </div>
      </ClientLayout>
    );
  }

  const handleGetTicket = async () => {
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const ticket: Ticket = {
        id: bookingData.id,
        movieTitle: bookingData.movieTitle,
        hallName: bookingData.hallName,
        startTime: bookingData.startTime,
        date: bookingData.date,
        seats: bookingData.selectedSeats,
        totalPrice: bookingData.totalPrice,
        qrCodeUrl: bookingData.qrCodeUrl,
        bookingTime: bookingData.bookingTime,
        bookingCode: bookingData.bookingCode
      };

      navigate('/ticket', { state: ticket });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientLayout>
      <TicketLayout
        type="payment"
        movieTitle={bookingData.movieTitle}
        seats={bookingData.selectedSeats.join(', ')}
        hall={bookingData.hallName}
        startTime={bookingData.startTime}
        date={bookingData.date}
        cost={bookingData.totalPrice}
        onGetTicket={handleGetTicket}
        isButtonDisabled={isLoading}
      />
    </ClientLayout>
  );
}