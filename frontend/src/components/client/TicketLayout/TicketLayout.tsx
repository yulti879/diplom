import './TicketLayout.css';

interface TicketLayoutProps {
  type: 'payment' | 'ticket';
  movieTitle: string;
  seats: string;
  hall: string;
  startTime: string;
  date: string;
  cost?: number;
  qrCode?: string;
  qrCodeUrl?: string;
  bookingCode?: string;
  onGetTicket?: () => void;
  isButtonDisabled?: boolean;
}

export const TicketLayout: React.FC<TicketLayoutProps> = ({
  type,
  movieTitle,
  seats,
  hall,
  startTime,
  date,
  cost,
  qrCode,
  qrCodeUrl,
  bookingCode,
  onGetTicket,
  isButtonDisabled = false
}) => {
  const isPayment = type === 'payment';
  const qrSrc = qrCodeUrl || qrCode;

  return (
    <main>
      <section className="ticket">
        <header className="ticket__check">
          <h2 className="ticket__check-title">
            {isPayment ? 'Вы выбрали билеты:' : 'Электронный билет'}
          </h2>
        </header>

        <div className="ticket__info-wrapper">
          <p className="ticket__info">
            На фильм: <span className="ticket__details ticket__title">{movieTitle}</span>
          </p>
          <p className="ticket__info">
            Дата: <span className="ticket__details ticket__date">{date}</span>
          </p>
          <p className="ticket__info">
            Начало: <span className="ticket__details ticket__start">{startTime}</span>
          </p>
          <p className="ticket__info">
            Зал: <span className="ticket__details ticket__hall">{hall}</span>
          </p>
          <p className="ticket__info">
            Места: <span className="ticket__details ticket__chairs">{seats}</span>
          </p>

          {bookingCode && (
            <p className="ticket__info">
              Код брони: <span className="ticket__details ticket__code">{bookingCode}</span>
            </p>
          )}

          {isPayment && cost !== undefined && (
            <p className="ticket__info">
              Стоимость: <span className="ticket__details ticket__cost">{cost}</span> рублей
            </p>
          )}

          {!isPayment && qrSrc && (
            <div className="ticket__info-qr-container">
              <img
                className="ticket__info-qr"
                src={qrSrc}
                alt="QR код билета"
              />
              <p className="ticket__qr-hint">Покажите QR-код контролёру</p>
            </div>
          )}

          {isPayment ? (
            <>
              <button
                className="accept-button"
                onClick={onGetTicket}
                disabled={isButtonDisabled}
              >
                {isButtonDisabled ? 'Обработка...' : 'Получить код бронирования'}
              </button>
              <p className="ticket__hint">
                После оплаты билет будет доступен в этом окне, а также придёт вам на почту.
                Покажите QR-код нашему контролёру у входа в зал.
              </p>
            </>
          ) : (
            <p className="ticket__hint">
              Покажите QR-код нашему контролёру для подтверждения бронирования.
            </p>
          )}

          <p className="ticket__hint">Приятного просмотра!</p>
        </div>
      </section>
    </main>
  );
};