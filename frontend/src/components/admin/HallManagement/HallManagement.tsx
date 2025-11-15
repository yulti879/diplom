import { useState } from 'react';
import { CinemaHall } from '../../../types';
import { ConfigSection } from '../ConfigSection/ConfigSection';
import { ConfigButton } from '../ConfigButton/ConfigButton';
import { Popup } from '../Popup/Popup';
import { DeleteForm } from '../DeleteForm/DeleteForm';
import './HallManagement.css';

interface HallManagementProps {
  isOpen: boolean;
  onToggle: () => void;
  halls: CinemaHall[];
  onHallCreated: (hall: CinemaHall) => void;
  onHallDeleted: (hallId: string) => void;
}

export const HallManagement: React.FC<HallManagementProps> = ({
  isOpen,
  onToggle,
  halls,
  onHallCreated,
  onHallDeleted
}) => {
  const [isAddHallPopupOpen, setIsAddHallPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [newHallName, setNewHallName] = useState('');
  const [hallToDelete, setHallToDelete] = useState<CinemaHall | null>(null);

  const handleAddHall = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHallName.trim()) {
      const newHall: CinemaHall = {
        id: Date.now().toString(),
        name: newHallName,
        rows: 10,
        seatsPerRow: 8
      };

      onHallCreated(newHall);
      setIsAddHallPopupOpen(false);
      setNewHallName('');
    }
  };

  const handleDeleteClick = (hall: CinemaHall) => {
    setHallToDelete(hall);
    setIsDeletePopupOpen(true);
  };

  const confirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (hallToDelete) {
      onHallDeleted(hallToDelete.id);
      setIsDeletePopupOpen(false);
      setHallToDelete(null);
    }
  };

  const cancelAddHall = () => {
    setIsAddHallPopupOpen(false);
    setNewHallName('');
  };

  const cancelDelete = () => {
    setIsDeletePopupOpen(false);
    setHallToDelete(null);
  };

  return (
    <ConfigSection 
      title="Управление залами"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <p className="conf-step__paragraph">Доступные залы:</p>     
      <ul className="conf-step__list">
        {halls.map((hall: CinemaHall) => (
          <li key={hall.id}>
            {hall.name}
            <ConfigButton 
              variant="trash" 
              onClick={() => handleDeleteClick(hall)}
              title="Удалить зал"
            />
          </li>
        ))}
      </ul>

      {/* Кнопка добавления зала */}
      <ConfigButton 
        variant="accent" 
        onClick={() => setIsAddHallPopupOpen(true)}
      >
        Создать зал
      </ConfigButton>

      {/* Попап добавления зала */}
      <Popup
        isOpen={isAddHallPopupOpen}
        onClose={cancelAddHall}
        title="Добавление зала"
      >
        <form onSubmit={handleAddHall}>
          <label className="conf-step__label conf-step__label-fullsize">
            Название зала
            <input
              className="conf-step__input"
              type="text"
              placeholder="Например, &laquo;Зал 1&raquo;"
              value={newHallName}
              onChange={(e) => setNewHallName(e.target.value)}
              required
              autoFocus
            />
          </label>
          <div className="conf-step__buttons text-center">
            <ConfigButton 
              variant="accent" 
              type="submit"
            >
              Добавить зал
            </ConfigButton>
            <ConfigButton 
              variant="regular" 
              onClick={cancelAddHall}
              type="button"
            >
              Отменить
            </ConfigButton>
          </div>
        </form>
      </Popup>

      {/* Попап удаления зала с использованием DeleteForm */}
      <Popup
        isOpen={isDeletePopupOpen}
        onClose={cancelDelete}
        title="Удаление зала"
      >
        <DeleteForm
          message="Вы действительно хотите удалить зал"
          itemName={hallToDelete?.name || ''}
          onSubmit={confirmDelete}
          onCancel={cancelDelete}
          submitText="Удалить"
        />
      </Popup>

      {/* Сообщение если нет залов */}
      {halls.length === 0 && (
        <p className="conf-step__paragraph" style={{ color: '#848484', fontStyle: 'italic' }}>
          Пока нет созданных залов. Нажмите "Создать зал" чтобы добавить первый зал.
        </p>
      )}
    </ConfigSection>
  );
};