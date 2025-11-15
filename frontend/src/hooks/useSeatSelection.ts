import { useState, useCallback } from 'react';
import type { Seat } from '../types/client';

interface UseSeatSelectionReturn {
  selectedSeats: string[];
  handleSeatClick: (rowIndex: number, seatIndex: number, seatType: Seat['type']) => void;
  clearSelection: () => void;
  getSelectedCount: () => number;
  isSeatSelected: (rowIndex: number, seatIndex: number) => boolean;
}

export const useSeatSelection = (maxSeats: number = 6): UseSeatSelectionReturn => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleSeatClick = useCallback((
    rowIndex: number, 
    seatIndex: number, 
    seatType: Seat['type']
  ) => {
    // Нельзя выбрать отключенные или занятые места
    if (seatType === 'disabled' || seatType === 'taken') {
      return;
    }

    const seatId = `${rowIndex + 1}-${seatIndex + 1}`;

    setSelectedSeats(prev => {
      const isAlreadySelected = prev.includes(seatId);
      
      if (isAlreadySelected) {
        // Убираем место из выбранных
        return prev.filter(id => id !== seatId);
      } else {
        // Проверяем лимит мест
        if (prev.length >= maxSeats) {
          alert(`Можно выбрать не более ${maxSeats} мест`);
          return prev;
        }
        // Добавляем место к выбранным
        return [...prev, seatId];
      }
    });
  }, [maxSeats]);

  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  const getSelectedCount = useCallback(() => {
    return selectedSeats.length;
  }, [selectedSeats.length]);

  const isSeatSelected = useCallback((rowIndex: number, seatIndex: number) => {
    const seatId = `${rowIndex + 1}-${seatIndex + 1}`;
    return selectedSeats.includes(seatId);
  }, [selectedSeats]);

  return {
    selectedSeats,
    handleSeatClick,
    clearSelection,
    getSelectedCount,
    isSeatSelected
  };
};