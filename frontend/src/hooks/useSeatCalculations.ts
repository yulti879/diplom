import { useCallback } from 'react';
import type { Seat } from '../types/client';

interface UseSeatCalculationsReturn {
  calculateTotalPrice: (seats: Seat[][], selectedSeats: string[]) => number;
  getSelectedSeatsInfo: (seats: Seat[][], selectedSeats: string[]) => string[];
}

export const useSeatCalculations = (): UseSeatCalculationsReturn => {

  const calculateTotalPrice = useCallback((seats: Seat[][], selectedSeats: string[]): number => {
    return selectedSeats.reduce((total, seatId) => {
      const [rowStr, seatStr] = seatId.split('-');

      const row = Number(rowStr) - 1;
      const seat = Number(seatStr) - 1;

      // Безопасная проверка — TS доволен
      const seatObj = seats[row]?.[seat];
      if (!seatObj) return total;

      return total + (seatObj.price || 0);
    }, 0);
  }, []);

  const getSelectedSeatsInfo = useCallback((seats: Seat[][], selectedSeats: string[]): string[] => {
    return selectedSeats.map(seatId => {
      const [rowStr, seatStr] = seatId.split('-');

      const row = Number(rowStr) - 1;
      const seat = Number(seatStr) - 1;

      const seatObj = seats[row]?.[seat];

      const seatType =
        seatObj?.type === 'vip'
          ? 'VIP'
          : seatObj?.type === 'standard'
            ? 'Стандарт'
            : 'Неизвестно';

      return `Ряд ${rowStr}, Место ${seatStr} (${seatType})`;
    });
  }, []);

  return {
    calculateTotalPrice,
    getSelectedSeatsInfo
  };
};