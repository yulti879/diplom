# Cinema Booking App

Приложение для бронирования билетов в кинотеатр на **Laravel 11+ (API)** и **React (Frontend)**.

---

## Требования

- PHP 8.2+
- Composer
- Node.js 18+
- NPM
- SQLite (по умолчанию; можно использовать MySQL/PostgreSQL)
- Windows / Linux / MacOS

---

## Установка проекта

### 1. Клонирование репозитория

git clone <REPO_URL>
cd <PROJECT_FOLDER>

### 2. Установка зависимостей

Backend (Laravel):
composer install


Frontend (React + Vite):
cd frontend
npm install
cd ..

### 3. Настройка окружения

Скопировать .env.example в .env:
copy .env.example .env


Настроить при необходимости параметры базы данных (по умолчанию SQLite: database/database.sqlite).

### 4. Генерация ключа приложения
php artisan key:generate

### 5. Миграции базы данных
php artisan migrate


Если база уже есть и нужно начать с чистого листа:
php artisan migrate:fresh

## Аутентификация (API)

Используется Laravel Sanctum. Пароль хранится в захешированном виде (bcrypt), токены API генерируются автоматически.

### Регистрация пользователя

POST /api/register

Body (JSON):

{
  "name": "Имя пользователя",
  "email": "email@example.com",
  "password": "пароль123",
  "password_confirmation": "пароль123"
}


Response:

{
  "success": true,
  "data": { ...user },
  "access_token": "TOKEN_STRING",
  "message": "User registered successfully"
}

### Логин

POST /api/login

Body (JSON):

{
  "email": "email@example.com",
  "password": "пароль123"
}


Response:

{
  "success": true,
  "access_token": "TOKEN_STRING",
  "message": "Login successful"
}

### Защищённый маршрут

GET /api/user

Header: Authorization: Bearer <access_token>

Response: данные текущего пользователя

## Структура БД и миграции

Таблицы:

users — пользователи

cinema_halls — залы

movies — фильмы

screenings — сеансы

bookings — бронирования

personal_access_tokens — токены Sanctum

Все данные валидируются на сервере, бронирование не позволяет забронировать занятые места.

## API (выборка)
Получить список фильмов
GET http://localhost:8000/api/movies

Создать зал (требуется токен)
POST http://localhost:8000/api/cinema-halls

Header:
Authorization: Bearer <TOKEN>
Content-Type: application/json


Body:
{
  "name": "Зал 1",
  "rows": 10,
  "seats_per_row": 15
}

Получить занятые места сеанса
GET http://localhost:8000/api/screenings/{id}/booked-seats

Загрузка постера фильма
POST http://localhost:8000/api/upload-poster

FormData: poster=<file>

## Frontend (React + Vite)

### 1. Настройка
cd frontend
npm install

### 2. Запуск разработки
npm run dev


По умолчанию фронтенд доступен на http://localhost:5173

### 3. Сборка для продакшена
npm run build

Сборка будет в папке frontend/dist

### 4. Подключение к API

Базовый URL API в src/services/api.ts:
const API_BASE_URL = '/api';

Для разработки с Vite и Laravel стоит настроить прокси в vite.config.ts, если фронтенд и бэкенд на разных портах:

server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}

## Особенности проекта

- Laravel 11+ (без Http/Kernel.php)

- SQLite по умолчанию

- Sanctum токены для API

- Валидация данных:

email уникальный

пароли захешированы

- бронирование проверяет занятость мест

- Загрузка постеров через /api/upload-poster

- CORS настроен для фронтенда (http://localhost:3000)

- Полная CRUD функциональность для фильмов, залов, сеансов и бронирований