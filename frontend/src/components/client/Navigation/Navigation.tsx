import { useState, useEffect } from 'react';
import { useCinema } from '../../../context/CinemaContext';
import type { Day } from '../../../types/client';
import './Navigation.css';

export const Navigation: React.FC = () => {
  const [days, setDays] = useState<Day[]>([]);
  const { selectedDate, setSelectedDate } = useCinema();

  const getMondayOfWeek = (date: Date): Date => {
    const monday = new Date(date);
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diff);
    return monday;
  };

  const canGoBack = (): boolean => {
    const todayMonday = getMondayOfWeek(new Date());
    const selectedMonday = getMondayOfWeek(selectedDate);
    return selectedMonday > todayMonday;
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    const currentMonday = getMondayOfWeek(selectedDate);
    const newMonday = new Date(currentMonday);
    newMonday.setDate(currentMonday.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newMonday);
  };

  const generateWeekDays = (date: Date): Day[] => {
    const monday = getMondayOfWeek(date);
    const today = new Date();
    const todayString = today.toDateString();
    const selectedDateString = selectedDate.toDateString();

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);

      const dayOfWeek = currentDate.getDay();
      return {
        date: currentDate,
        day: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][dayOfWeek],
        number: currentDate.getDate().toString(),
        today: currentDate.toDateString() === todayString,
        chosen: currentDate.toDateString() === selectedDateString,
        weekend: dayOfWeek === 0 || dayOfWeek === 6,
      };
    });

    return weekDays;
  };

  const handleDayClick = (day: Day) => {
    setSelectedDate(day.date);
  };

  const getDayAriaLabel = (day: Day): string => {
    const date = new Date(day.date);
    const fullDate = date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    let label = fullDate;
    if (day.today) label += ' (сегодня)';
    if (day.chosen) label += ' (выбрано)';
    if (day.weekend) label += ' (выходной)';

    return label;
  };

  useEffect(() => {
    const weekDays = generateWeekDays(selectedDate);
    setDays(weekDays);
  }, [selectedDate]);

  return (
    <nav className="page-nav">
      {canGoBack() && (
        <button
          className="page-nav__day page-nav__day_prev"
          onClick={() => handleNavigation('prev')}
          type="button"
          aria-label="Предыдущая неделя"
        >
          <span className="page-nav__day-week"></span>
          <span className="page-nav__day-number"></span>
        </button>
      )}

      {days.map((day, index) => (
        <button
          key={index}
          className={`
            page-nav__day 
            ${day.today ? 'page-nav__day_today' : ''}
            ${day.chosen ? 'page-nav__day_chosen' : ''}
            ${day.weekend ? 'page-nav__day_weekend' : ''}
          `}
          onClick={() => handleDayClick(day)}
          type="button"
          aria-label={getDayAriaLabel(day)}
          aria-current={day.chosen ? 'date' : undefined}
        >
          <span className="page-nav__day-week">{day.day}</span>
          <span className="page-nav__day-number">{day.number}</span>
        </button>
      ))}

      <button
        className="page-nav__day page-nav__day_next"
        onClick={() => handleNavigation('next')}
        type="button"
        aria-label="Следующая неделя"
      >
        <span className="page-nav__day-week"></span>
        <span className="page-nav__day-number"></span>
      </button>
    </nav>
  );
};