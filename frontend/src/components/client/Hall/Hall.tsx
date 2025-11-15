import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Seat } from '../../../types';
import type { BookingData } from '../../../types/client';
import { useSeatSelection } from '../../../hooks/useSeatSelection';
import { useSeatCalculations } from '../../../hooks/useSeatCalculations';
import { cinemaAPI } from '../../../services/api';
import './Hall.css';

interface HallProps {
  movieTitle: string;
  startTime: string;
  hallName: string;
  screeningId?: string;
  date: string;
}

export const Hall: React.FC<HallProps> = ({
  movieTitle,
  startTime,
  hallName,
  screeningId: propScreeningId,
  date
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [hallLayout, setHallLayout] = useState<any>(null);
  const [isZoomed, setIsZoomed] = useState(false); // ← новое состояние для зума

  const {
    selectedSeats,
    handleSeatClick,
    getSelectedCount,
    isSeatSelected
  } = useSeatSelection(6);

  const {
    calculateTotalPrice,
    getSelectedSeatsInfo
  } = useSeatCalculations();

  const {
    movieTitle: stateMovieTitle,
    startTime: stateStartTime,
    hallName: stateHallName,
    screeningId: stateScreeningId,
    date: stateDate
  } = location.state || {};

  const finalScreeningId = propScreeningId || stateScreeningId;
  const finalMovieTitle = stateMovieTitle || movieTitle;
  const finalStartTime = stateStartTime || startTime;
  const finalHallName = stateHallName || hallName;
  const finalDate = stateDate || date;

  useEffect(() => {
    if (finalScreeningId) {
      loadHallData(finalScreeningId);
    }
  }, [finalScreeningId]);

  const loadHallData = async (screeningId: string) => {
    try {
      setSeatsLoading(true);
      
      const screeningsResponse = await cinemaAPI.getScreenings();
      const currentScreening = screeningsResponse.data.data.find(
        (s: any) => s.id.toString() === screeningId
      );

      if (!currentScreening) {
        alert('Сеанс не найден');
        return;
      }

      const hallId = currentScreening.cinema_hall_id.toString();

      const [bookedSeatsResponse, hallsResponse] = await Promise.all([
        cinemaAPI.getBookedSeats(screeningId),
        cinemaAPI.getHalls()
      ]);

      setBookedSeats(bookedSeatsResponse.data.data);

      const hall = hallsResponse.data.data.find((h: any) => h.id.toString() === hallId);
      if (hall && hall.layout) {
        setHallLayout(hall.layout);
      } else {
        alert('Ошибка: схема зала не настроена');
        setHallLayout(null);
      }

    } catch (error) {
      alert('Ошибка загрузки данных зала');
      setBookedSeats([]);
      setHallLayout(null);
    } finally {
      setSeatsLoading(false);
    }
  };

  // Обработчик двойного клика для увеличения
  const handleSchemeDoubleClick = () => {
    setIsZoomed(!isZoomed);
  };

  // Обработчик клика по месту с учетом зума
  const handleSeatClickWithZoom = (rowIndex: number, seatIndex: number, seatType: Seat['type']) => {
    if (seatType !== 'disabled' && seatType !== 'taken') {
      handleSeatClick(rowIndex, seatIndex, seatType);
    }
  };

  const getSeatType = (rowIndex: number, seatIndex: number, baseType: Seat['type']): Seat['type'] => {
    const seatId = `${rowIndex + 1}-${seatIndex + 1}`;
    if (bookedSeats.includes(seatId)) {
      return 'taken';
    }
    return baseType;
  };

  const transformHallLayout = (layout: any) => {
    if (!layout || !Array.isArray(layout)) {
      return null;
    }

    try {
      const transformedLayout = layout.map((row: any, rowIndex: number) => {
        if (Array.isArray(row)) {
          return {
            types: row.map((seat: any) => {
              if (typeof seat === 'string') return seat;
              if (seat && typeof seat === 'object') return seat.type || 'standard';
              return 'standard';
            }),
            price: 500
          };
        } else if (row && typeof row === 'object') {
          return {
            types: Array.isArray(row.types) ? row.types : [],
            price: row.price || 500
          };
        } else {
          return null;
        }
      }).filter(Boolean);

      return transformedLayout;

    } catch (error) {
      return null;
    }
  };

  const seats: Seat[][] = useMemo(() => {
    if (!hallLayout) {
      return [];
    }

    const transformedLayout = transformHallLayout(hallLayout);
    
    if (!transformedLayout || transformedLayout.length === 0) {
      return [];
    }

    return transformedLayout.map((rowConfig: any, rowIndex: number) =>
      rowConfig.types.map((seatType: string, seatIndex: number) => ({
        type: getSeatType(rowIndex, seatIndex, seatType as Seat['type']),
        row: rowIndex + 1,
        number: seatIndex + 1,
        price: seatType === 'disabled' ? 0 : (rowConfig.price || 500)
      }))
    );
  }, [bookedSeats, hallLayout]);

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert('Пожалуйста, выберите хотя бы одно место');
      return;
    }
    if (!finalScreeningId) {
      alert('Ошибка: не найден сеанс для бронирования');
      return;
    }
    if (seats.length === 0) {
      alert('Ошибка: схема зала не загружена');
      return;
    }

    setIsLoading(true);
    try {
      const bookingDataRequest = {
        screening_id: parseInt(finalScreeningId),
        seats: selectedSeats,
        total_price: calculateTotalPrice(seats, selectedSeats)
      };

      const response = await cinemaAPI.createBooking(bookingDataRequest);
      const booking = response.data.data;

      const bookingInfo: BookingData = {
        id: booking.booking_code,
        movieTitle: finalMovieTitle,
        startTime: finalStartTime,
        date: finalDate,
        hallName: finalHallName,
        selectedSeats: getSelectedSeatsInfo(seats, selectedSeats),
        seats: selectedSeats,
        totalPrice: booking.total_price,
        bookingTime: new Date().toLocaleString('ru-RU'),
        bookingCode: booking.booking_code,
        qrCodeUrl: booking.qr_code_url
      };

      navigate('/payment', { state: bookingInfo });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Произошла ошибка при бронировании';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = calculateTotalPrice(seats, selectedSeats);

  return (
    <main>
      <section className="buying">
        <div className="buying__info">
          <div className="buying__info-description">
            <h2 className="buying__info-title">{finalMovieTitle}</h2>
            <p className="buying__info-date">Дата сеанса: {finalDate}</p>
            <p className="buying__info-start">Начало сеанса: {finalStartTime}</p>
            <p className="buying__info-hall">{finalHallName}</p>
            
            {seatsLoading && (
              <div className="loading-info">
                <p>Загружаем информацию о зале...</p>
              </div>
            )}
            
            {!seatsLoading && hallLayout && seats.length === 0 && (
              <div className="hall-info error">
                <p>Ошибка загрузки схемы зала</p>
              </div>
            )}

            {selectedSeats.length > 0 && (
              <div className="buying__info-selected">
                <p className="buying__info-seats">
                  Выбрано мест: {getSelectedCount()}
                </p>
                <p className="buying__info-price">
                  Общая стоимость: {totalPrice} ₽
                </p>
              </div>
            )}
          </div>
          <div className="buying__info-hint">
            <p>Тапните дважды,<br />чтобы увеличить</p>
          </div>
        </div>

        {seatsLoading && (
          <div className="scheme-loading">
            <div className="loading-spinner"></div>
            <p>Загружаем схему зала...</p>
          </div>
        )}

        {!seatsLoading && seats.length > 0 && (
          <div 
            className={`buying-scheme ${isZoomed ? 'buying-scheme--zoomed' : ''}`}
            onDoubleClick={handleSchemeDoubleClick}
          >
            <div className="buying-scheme__wrapper">
              {seats.map((row, rowIndex) => (
                <div key={rowIndex} className="buying-scheme__row">
                  <span className="buying-scheme__row-number">{rowIndex + 1}</span>
                  {row.map((seat, seatIndex) => {
                    const isSelected = isSeatSelected(rowIndex, seatIndex);
                    return (
                      <span
                        key={seatIndex}
                        className={`
                          buying-scheme__chair 
                          buying-scheme__chair_${seat.type}
                          ${isSelected ? 'buying-scheme__chair_selected' : ''}
                        `}
                        onClick={() => handleSeatClickWithZoom(rowIndex, seatIndex, seat.type)}
                        title={`Ряд ${rowIndex + 1}, Место ${seatIndex + 1} - ${seat.type === 'vip' ? 'VIP' : 'Стандарт'}${seat.type === 'taken' ? ' (Занято)' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="buying-scheme__legend">
              <div className="col">
                <div className="buying-scheme__legend-price">
                  <span className="buying-scheme__chair buying-scheme__chair_standard"></span>
                  <span className="buying-scheme__legend-status">Свободно</span>
                  <span className="buying-scheme__legend-cost">500 ₽</span>
                </div>
                <div className="buying-scheme__legend-price">
                  <span className="buying-scheme__chair buying-scheme__chair_vip"></span>
                  <span className="buying-scheme__legend-status">VIP</span>
                  <span className="buying-scheme__legend-cost">800 ₽</span>
                </div>
              </div>
              <div className="col">
                <div className="buying-scheme__legend-price">
                  <span className="buying-scheme__chair buying-scheme__chair_taken"></span>
                  <span className="buying-scheme__legend-status">Занято</span>
                </div>
                <div className="buying-scheme__legend-price">
                  <span className="buying-scheme__chair buying-scheme__chair_selected"></span>
                  <span className="buying-scheme__legend-status">Выбрано</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!seatsLoading && seats.length === 0 && (
          <div className="scheme-error">
            <p>Не удалось загрузить схему зала</p>
          </div>
        )}

        <button
          className={`
            accept-button 
            ${selectedSeats.length === 0 ? 'accept-button--disabled' : ''}
            ${isLoading ? 'accept-button--loading' : ''}
            ${seats.length === 0 ? 'accept-button--disabled' : ''}
          `}
          onClick={handleBooking}
          disabled={selectedSeats.length === 0 || isLoading || seatsLoading || seats.length === 0}
        >
          {isLoading ? (
            'Бронируем...'
          ) : seatsLoading ? (
            'Загрузка...'
          ) : seats.length === 0 ? (
            'Схема не загружена'
          ) : (
            `Забронировать (${getSelectedCount()})`
          )}
        </button>
      </section>
    </main>
  );
};