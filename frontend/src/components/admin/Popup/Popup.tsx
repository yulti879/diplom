import { useEffect, useState } from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // Небольшая задержка чтобы успел примениться начальный CSS
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      // Ожидание завершения анимации перед размонтированием
      const timer = setTimeout(() => {
        setIsMounted(false);
        document.body.style.overflow = 'unset';
      }, 500); // Должно совпадать с длительностью анимации (0.5s)
      
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Обработчик закрытия по ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Обработчик клика по оверлею
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isMounted) return null;

  return (
    <div 
      className={`popup ${isVisible ? 'active' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="popup__container">
        <div className="popup__content">
          <div className="popup__header">
            <h2 className="popup__title">
              {title}
              <button 
                className="popup__dismiss" 
                onClick={onClose}
                aria-label="Закрыть"
              >
                <img src="/images/admin/close.png" alt="Закрыть" />
              </button>
            </h2>
          </div>
          <div className="popup__wrapper">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};