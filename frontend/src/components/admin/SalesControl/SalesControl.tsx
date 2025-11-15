import { useState } from 'react';
import { ConfigSection } from '../ConfigSection/ConfigSection';
import { ConfigButton } from '../ConfigButton/ConfigButton';
import { Popup } from '../Popup/Popup';
import { DeleteForm } from '../DeleteForm/DeleteForm';

interface SalesControlProps {
  isOpen: boolean;
  onToggle: () => void;
  onSalesToggle: (salesOpen: boolean) => void;
}

export const SalesControl: React.FC<SalesControlProps> = ({ 
  isOpen, 
  onToggle,
  onSalesToggle 
}) => {
  const [salesOpen, setSalesOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);

  const handleToggleSales = () => {
    if (!salesOpen) {
      setSalesOpen(true);
      onSalesToggle(true);
    } else {
      setIsConfirmPopupOpen(true);
    }
  };

  const confirmStopSales = (e: React.FormEvent) => {
    e.preventDefault();
    setSalesOpen(false);
    onSalesToggle(false);
    setIsConfirmPopupOpen(false);
  };

  const cancelStopSales = () => {
    setIsConfirmPopupOpen(false);
  };

  return (
    <ConfigSection 
      title="Открыть продажи"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="conf-step__wrapper text-center">
        <p className="conf-step__paragraph">Всё готово, теперь можно:</p>
        
        <ConfigButton 
          variant={salesOpen ? "regular" : "accent"}
          onClick={handleToggleSales}
          className={salesOpen ? 'conf-step__button-warning' : ''}
        >
          {salesOpen ? 'Приостановить продажу билетов' : 'Открыть продажу билетов'}
        </ConfigButton>
        
        {salesOpen && (
          <div className="conf-step__status conf-step__status--active">
            Продажа билетов активна
          </div>
        )}
      </div>

      <Popup
        isOpen={isConfirmPopupOpen}
        onClose={cancelStopSales}
        title="Приостановка продаж"
      >
        <DeleteForm
          message="Вы действительно хотите приостановить продажу билетов"
          itemName=""
          onSubmit={confirmStopSales}
          onCancel={cancelStopSales}
          submitText="Приостановить"
        />
      </Popup>
    </ConfigSection>
  );
};