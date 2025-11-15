import { useLocation, useNavigate } from 'react-router-dom';
import { ClientLayout } from '../../components/client/ClientLayout';
import { TicketLayout } from '../../components/client/TicketLayout/TicketLayout';
import type { Ticket } from '../../types/client';

export const TicketPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ticket = location.state as Ticket | null;

  if (!ticket) {
    return (
      <ClientLayout>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Билет не найден</h2>
          <p>Пожалуйста, завершите процесс оплаты</p>
          <button onClick={() => navigate('/')}>
            Вернуться на главную
          </button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <TicketLayout
        type="ticket"
        movieTitle={ticket.movieTitle}
        seats={ticket.seats.join(', ')}
        hall={ticket.hallName}
        startTime={ticket.startTime}
        date={ticket.date}
        qrCodeUrl={ticket.qrCodeUrl}
        bookingCode={ticket.bookingCode}
      />
    </ClientLayout>
  );
};