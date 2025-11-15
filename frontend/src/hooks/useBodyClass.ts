import { useEffect } from 'react';

export const useBodyClass = (className: string) => {
  useEffect(() => {
    // Добавляем класс при монтировании
    document.body.classList.add(className);
    
    // Убираем класс при размонтировании
    return () => {
      document.body.classList.remove(className);
    };
  }, [className]);
};