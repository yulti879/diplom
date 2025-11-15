import { useState, useEffect } from 'react';
import { CinemaHall } from '../../../types';
import { ConfigSection } from '../ConfigSection/ConfigSection';
import { ConfigButton } from '../ConfigButton/ConfigButton';
import { FormField } from '../FormField/FormField';
import { Popup } from '../Popup/Popup';
import './PriceConfiguration.css';

interface PriceConfigurationProps {
  isOpen: boolean;
  onToggle: () => void;
  halls: CinemaHall[];
  onPricesSaved: (prices: any) => void;
}

export const PriceConfiguration: React.FC<PriceConfigurationProps> = ({
  isOpen,
  onToggle,
  halls,
  onPricesSaved
}) => {
  const [selectedHall, setSelectedHall] = useState(halls[0]?.id || '');
  const [standardPrice, setStandardPrice] = useState(500);
  const [vipPrice, setVipPrice] = useState(800);
  const [isSavePopupOpen, setIsSavePopupOpen] = useState(false);

  // Загрузка сохраненных цен
  useEffect(() => {
    if (selectedHall) {
      const savedPrices = localStorage.getItem(`prices_${selectedHall}`);
      if (savedPrices) {
        try {
          const { standard, vip } = JSON.parse(savedPrices);
          setStandardPrice(standard || 500);
          setVipPrice(vip || 800);
        } catch (error) {
          console.error('Ошибка загрузки цен:', error);
        }
      }
    }
  }, [selectedHall]);

  // Валидация ввода цен
  const handlePriceChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
    const numValue = Number(value.replace(/\D/g, '')); // убираем нецифровые символы
    if (!isNaN(numValue) && numValue >= 0) {
      setter(numValue);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (standardPrice < 0 || vipPrice < 0) {
      alert('Цена не может быть отрицательной');
      return;
    }

    const pricesData = {
      hallId: selectedHall,
      hallName: halls.find(h => h.id === selectedHall)?.name,
      standardPrice,
      vipPrice,
      timestamp: new Date().toISOString()
    };

    onPricesSaved(pricesData);
    
    // Сохранение в localStorage
    localStorage.setItem(`prices_${selectedHall}`, JSON.stringify({
      standard: standardPrice,
      vip: vipPrice
    }));
    
    setIsSavePopupOpen(true);
  };

  const handleCancel = () => {
    // Сброс к значениям по умолчанию или загруженным
    const savedPrices = localStorage.getItem(`prices_${selectedHall}`);
    if (savedPrices) {
      const { standard, vip } = JSON.parse(savedPrices);
      setStandardPrice(standard);
      setVipPrice(vip);
    } else {
      setStandardPrice(500);
      setVipPrice(800);
    }
  };

  const selectedHallData = halls.find(hall => hall.id === selectedHall);

  // Если нет залов
  if (halls.length === 0) {
    return (
      <ConfigSection title="Конфигурация цен" isOpen={isOpen} onToggle={onToggle}>
        <p className="conf-step__paragraph" style={{ color: '#ff6b6b' }}>
          Нет доступных залов. Сначала создайте зал в разделе "Управление залами".
        </p>
      </ConfigSection>
    );
  }

  return (
    <ConfigSection 
      title="Конфигурация цен"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <p className="conf-step__paragraph">Выберите зал для конфигурации:</p>

      <ul className="conf-step__selectors-box">
        {halls.map(hall => (
          <li key={hall.id}>
            <input
              type="radio"
              className="conf-step__radio"
              name="prices-hall"
              value={hall.id}
              checked={selectedHall === hall.id}
              onChange={(e) => setSelectedHall(e.target.value)}
            />
            <span className="conf-step__selector">{hall.name}</span>
          </li>
        ))}
      </ul>

      {selectedHallData && (
        <form onSubmit={handleSave}>
          <p className="conf-step__paragraph">
            Установите цены для типов кресел:
          </p>

          <div className="conf-step__legend">
            <FormField
              label="Цена, рублей"
              name="standardPrice"
              type="text"
              placeholder="0"
              value={standardPrice.toString()}
              onChange={(e) => handlePriceChange(setStandardPrice, e.target.value)}
            />
            за <span className="conf-step__chair conf-step__chair_standard"></span> обычные кресла
          </div>

          <div className="conf-step__legend">
            <FormField
              label="Цена, рублей"
              name="vipPrice"
              type="text"
              placeholder="0"
              value={vipPrice.toString()}
              onChange={(e) => handlePriceChange(setVipPrice, e.target.value)}
            />
            за <span className="conf-step__chair conf-step__chair_vip"></span> VIP кресла
          </div>

          <div className="conf-step__buttons text-center">
            <ConfigButton 
              variant="regular" 
              onClick={handleCancel}
              type="button"
            >
              Отмена
            </ConfigButton>
            <ConfigButton 
              variant="accent" 
              type="submit"
            >
              Сохранить
            </ConfigButton>
          </div>
        </form>
      )}

      <Popup
        isOpen={isSavePopupOpen}
        onClose={() => setIsSavePopupOpen(false)}
        title="Цены сохранены"
      >
        <p className="conf-step__paragraph">
          Цены для зала "{selectedHallData?.name}" успешно сохранены.
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
    </ConfigSection>
  );
};