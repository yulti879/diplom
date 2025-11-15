import { useState, useEffect } from 'react';
import { CinemaHall, SeatType, Seat } from '../../../types';
import { ConfigSection } from '../ConfigSection/ConfigSection';
import { ConfigButton } from '../ConfigButton/ConfigButton';
import { Popup } from '../Popup/Popup';
import './HallConfiguration.css';

interface HallConfigurationProps {
  isOpen: boolean;
  onToggle: () => void;
  halls: CinemaHall[];
  onConfigurationSaved: (config: any) => Promise<void>;
}

export const HallConfiguration: React.FC<HallConfigurationProps> = ({
  isOpen,
  onToggle,
  halls,
  onConfigurationSaved
}) => {
  const [selectedHall, setSelectedHall] = useState(halls[0]?.id || '');
  const [rows, setRows] = useState(halls[0]?.rows || 10);
  const [seatsPerRow, setSeatsPerRow] = useState(halls[0]?.seatsPerRow || 8);
  const [seats, setSeats] = useState<Seat[][]>([]);
  const [isSavePopupOpen, setIsSavePopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем сохраненную схему при смене зала
  useEffect(() => {
    const loadHallLayout = async () => {
      if (!selectedHall) return;
      
      setIsLoading(true);
      try {
        const hall = halls.find(h => h.id === selectedHall);
        if (hall) {
          setRows(hall.rows);
          setSeatsPerRow(hall.seatsPerRow);

          // Используем layout из данных зала (если есть)
          if (hall.layout && Array.isArray(hall.layout)) {
            setSeats(hall.layout);
          } else {
            initializeSeats(hall.rows, hall.seatsPerRow);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки схемы:', error);
        initializeSeats(rows, seatsPerRow);
      } finally {
        setIsLoading(false);
      }
    };

    loadHallLayout();
  }, [selectedHall, halls]);

  // Инициализация схемы зала
  const initializeSeats = (rowsCount: number = rows, seatsCount: number = seatsPerRow) => {
    const newSeats: Seat[][] = [];
    for (let i = 0; i < rowsCount; i++) {
      const row: Seat[] = [];
      for (let j = 0; j < seatsCount; j++) {
        row.push({
          type: 'standard',
          row: i + 1,
          number: j + 1,
          price: 0
        });
      }
      newSeats.push(row);
    }
    setSeats(newSeats);
  };

  const handleSeatClick = (rowIndex: number, seatIndex: number) => {
    const newSeats = [...seats];
    const currentType = newSeats[rowIndex][seatIndex].type;

    const nextType: Record<SeatType, SeatType> = {
      'standard': 'vip',
      'vip': 'disabled',
      'disabled': 'standard',
      'taken': 'taken'
    };

    if (currentType === 'taken') return;

    newSeats[rowIndex][seatIndex] = {
      ...newSeats[rowIndex][seatIndex],
      type: nextType[currentType]
    };
    setSeats(newSeats);
  };

  const handleApplyConfiguration = () => {
    initializeSeats();
  };

  const handleSaveConfiguration = async () => {
    if (!selectedHall) return;

    const configuration = {
      hallId: selectedHall,
      hallName: halls.find(h => h.id === selectedHall)?.name,
      rows,
      seatsPerRow,
      seats
    };

    try {
      setIsLoading(true);
      // Сохраняем в БД через колбэк
      await onConfigurationSaved(configuration);
      setIsSavePopupOpen(true);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении конфигурации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const hall = halls.find(h => h.id === selectedHall);
    if (hall) {
      setRows(hall.rows);
      setSeatsPerRow(hall.seatsPerRow);
      
      // Используем layout из данных зала
      if (hall.layout && Array.isArray(hall.layout)) {
        setSeats(hall.layout);
      } else {
        initializeSeats(hall.rows, hall.seatsPerRow);
      }
    }
  };

  const selectedHallData = halls.find(hall => hall.id === selectedHall);

  if (isLoading) {
    return (
      <ConfigSection
        title="Конфигурация залов"
        isOpen={isOpen}
        onToggle={onToggle}
      >
        <div className="loading">Загрузка...</div>
      </ConfigSection>
    );
  }

  return (
    <ConfigSection
      title="Конфигурация залов"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <p className="conf-step__paragraph">Выберите зал для конфигурации:</p>

      {/* Селектор залов */}
      <ul className="conf-step__selectors-box">
        {halls.map(hall => (
          <li key={hall.id}>
            <input
              type="radio"
              className="conf-step__radio"
              name="chairs-hall"
              value={hall.id}
              checked={selectedHall === hall.id}
              onChange={(e) => setSelectedHall(e.target.value)}
            />
            <span className="conf-step__selector">{hall.name}</span>
          </li>
        ))}
      </ul>

      {selectedHallData && (
        <>
          <p className="conf-step__paragraph">
            Укажите количество рядов и максимальное количество кресел в ряду:
          </p>

          {/* Настройки рядов и мест */}
          <div className="conf-step__legend">
            <label className="conf-step__label">
              Рядов, шт
              <input
                type="number"
                className="conf-step__input"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                min="1"
                max="20"
              />
            </label>
            <span className="multiplier">×</span>
            <label className="conf-step__label">
              Мест, шт
              <input
                type="number"
                className="conf-step__input"
                value={seatsPerRow}
                onChange={(e) => setSeatsPerRow(Number(e.target.value))}
                min="1"
                max="15"
              />
            </label>
          </div>

          <ConfigButton
            variant="accent"
            onClick={handleApplyConfiguration}
          >
            Применить конфигурацию
          </ConfigButton>

          {seats.length > 0 && (
            <>
              <p className="conf-step__paragraph">
                Теперь вы можете указать типы кресел на схеме зала:
              </p>

              {/* Легенда типов кресел */}
              <div className="conf-step__legend">
                <span className="conf-step__chair conf-step__chair_standard"></span> — обычные кресла
                <span className="conf-step__chair conf-step__chair_vip"></span> — VIP кресла
                <span className="conf-step__chair conf-step__chair_disabled"></span> — заблокированные (нет кресла)
                <p className="conf-step__hint">
                  Чтобы изменить вид кресла, нажмите по нему левой кнопкой мыши
                </p>
              </div>

              {/* Схема зала */}
              <div className="conf-step__hall">
                <div className="conf-step__hall-wrapper">
                  {seats.map((row, rowIndex) => (
                    <div key={rowIndex} className="conf-step__row">
                      <span className="conf-step__row-number">{rowIndex + 1}</span>
                      {row.map((seat, seatIndex) => (
                        <span
                          key={seatIndex}
                          className={`conf-step__chair conf-step__chair_${seat.type}`}
                          onClick={() => handleSeatClick(rowIndex, seatIndex)}
                          title={`Ряд ${rowIndex + 1}, Место ${seatIndex + 1}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Кнопки сохранения/отмены */}
      <fieldset className="conf-step__buttons text-center">
        <ConfigButton
          variant="regular"
          onClick={handleCancel}
        >
          Отмена
        </ConfigButton>
        <ConfigButton
          variant="accent"
          onClick={handleSaveConfiguration}
          disabled={!selectedHallData}
        >
          Сохранить
        </ConfigButton>
      </fieldset>

      {/* Попап подтверждения сохранения */}
      <Popup
        isOpen={isSavePopupOpen}
        onClose={() => setIsSavePopupOpen(false)}
        title="Конфигурация сохранена"
      >
        <p className="conf-step__paragraph">
          Конфигурация зала "{selectedHallData?.name}" успешно сохранена.
        </p>
        <div className="conf-step__buttons text-center">
          <ConfigButton
            variant="accent"
            onClick={() => setIsSavePopupOpen(false)}
          >
            ОК
          </ConfigButton>
        </div>
      </Popup>

      {halls.length === 0 && (
        <p className="conf-step__paragraph" style={{ color: '#ff6b6b' }}>
          Нет доступных залов. Сначала создайте зал в разделе "Управление залами".
        </p>
      )}
    </ConfigSection>
  );
};