export interface ApiMovie {
  id: number;
  title: string;
  poster_url: string;
  synopsis: string;
  duration: number;
  origin: string;
  created_at: string;
  updated_at: string;
}

export interface ApiCinemaHall {
  id: number;
  name: string;
  rows: number;
  seats_per_row: number;
  layout: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiScreening {
  id: number;
  movie_id: number;
  cinema_hall_id: number;
  date: string;
  start_time: string;
  created_at: string;
  updated_at: string;
  movie?: ApiMovie;
  cinema_hall?: ApiCinemaHall;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiBooking {
  id: number;
  screening_id: number;
  booking_code: string;
  seats: string[];
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  screening?: ApiScreening;
}

export interface CreateBookingRequest {
  screening_id: number;
  seats: string[];
  total_price: number;
}