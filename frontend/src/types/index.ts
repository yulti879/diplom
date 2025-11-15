export type SeatType = 'disabled' | 'standard' | 'vip' | 'taken';

export interface CinemaHall {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  layout?: Seat[][];
  standardPrice?: number;
  vipPrice?: number;
}

export interface Seat {
  type: SeatType;
  row: number;
  number: number;
  price: number;
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  synopsis: string;
  duration: number;
  origin: string;
}

export interface Screening {
  id: string;
  movieId: string;
  hallId: string;
  startTime: string; // "HH:MM"
  date: string;      // "YYYY-MM-DD"
  duration: number;  // в минутах
}