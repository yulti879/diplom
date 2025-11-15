# AI Coding Agent Instructions - Cinema Booking System

This is a Laravel 12 cinema booking REST API backend with QR code ticket generation. The system manages screenings, seat bookings, hall layouts, and ticket QR codes.

## User Roles & Authentication

**System Roles**:
- **Administrator**: Authenticated user with `is_admin = true` in User model. Can manage movies, halls, screenings (no explicit middleware enforced yet - must check manually in controllers)
- **Guest**: Unauthenticated visitor. Can view screenings, query booked seats, generate QR codes. Cannot create bookings without future auth requirement

**Authentication Implementation**:
- User model: Inherits from `Authenticatable`, uses `'password' => 'hashed'` cast for automatic bcrypt hashing
- Password storage: Always hashed with bcrypt (Laravel 12 default via `Hash::make()`)
- Password validation: Use `Hash::check($plaintext, $user->password)` for authentication
- Auth config: `config/auth.php` uses session guard + Eloquent provider (User model)
- Currently: No authentication middleware applied to routes - routes are open

**Data Validation**:
- Server-side validation enforced via `validate()` in all controllers (422 status on failure)
- Email uniqueness: `'email' => 'required|email|unique:users'` pattern
- Password rules (for future login): Minimum 8 chars, confirm field check: `'password' => 'required|min:8|confirmed'`
- All user inputs validated before database operations (no SQL injection risk)

## Project Architecture

**Core Domain**: Cinema ticket reservation system
- **Movies**: Films with metadata (title, poster_url, synopsis, duration, origin)
- **CinemaHalls**: Halls with configurable layouts (rows/seats), VIP pricing, layout JSON schema
- **Screenings**: Movie + Hall + DateTime combinations
- **Bookings**: Seat reservations with status tracking, unique booking codes, and QR codes

**Key Data Flow**:
1. Admin creates CinemaHalls with layout (standard/VIP/disabled seats stored as JSON)
2. Admin creates Screenings (movie + hall + date/time)
3. Users browse Screenings and query booked seats via `GET /api/screenings/{id}/booked-seats`
4. Users create Bookings with seat selections (format: "row-seat", max 6 seats per booking)
5. QR codes generated on demand: `GET /api/qr-code/booking/{bookingCode}/image`

**Database Schema**:
- Bookings have `status` ('pending', 'confirmed', 'cancelled'), `seats` (JSON array), `total_price` (decimal:2), `booking_code` (unique)
- CinemaHalls store `layout` as JSON (schema: marks seats as type 'vip'/'standard'/'disabled')
- Bookings cascade-delete when Screening is deleted via foreign key constraint

## Development Stack & Commands

**Setup**: `composer setup` - Full init (composer install, .env copy, key gen, migrations, npm install)

**Local Dev**: `composer dev` - Concurrent processes (artisan serve, queue:listen, pail logs, vite dev)

**Testing**: 
- `composer test` - Run PHPUnit suite (clears config, uses SQLite in-memory DB)
- Unit tests: `tests/Unit/`
- Feature tests: `tests/Feature/`
- Config: phpunit.xml uses in-memory DB with separate env for testing

**Database**:
- Migrations: `database/migrations/` (Laravel standard format)
- Seeders: Faker-based in `database/seeders/` - Run via `artisan db:seed` or as part of `setup`
- Queue: `queue:listen` used in dev with `--tries=1`

## Code Patterns & Conventions

**API Controllers** (`app/Http/Controllers/Api/`):
- RESTful resources: `apiResource('movies')`, `apiResource('bookings')`, etc.
- Response format: Always return `{'success': bool, 'data': mixed, 'message'?: string}` JSON
- Status codes: 422 for validation errors, 404 for not found, 201 for creation success
- Validation: Use `validate()` method with Rule::[exists/date/etc] from `Illuminate\Validation\Rule`
- Example seat conflict checking in BookingController: Query existing confirmed bookings, merge their seats, check intersection

**Eloquent Models** (`app/Models/`):
- Define `$fillable` arrays for mass assignment (e.g., Booking, CinemaHall)
- Use `$casts` for type safety: `'seats' => 'array'`, `'total_price' => 'decimal:2'`, `'is_active' => 'boolean'`
- Relationships: `belongsTo()` for foreign keys, eager-load with `->with(['relation1', 'relation2'])`
- Custom methods: Static `generateBookingCode()` returns `'BK' . strtoupper(uniqid())`
- Accessors: Use accessor pattern `getQrCodeUrlAttribute()` for computed properties

**Booking Logic**:
- Seats validation: Format is "row-seat" string (regex: `/^\d+-\d+$/`)
- Max 6 seats per request (hard limit in validation rule)
- Booking code generation: Must be unique, used for QR codes
- Conflict resolution: Query all confirmed bookings for screening, extract seats array, use `array_intersect()` to detect conflicts
- Status workflow: Create as 'confirmed' directly (no pending state in current code)

**QR Codes** (`app/Http/Controllers/QrCodeController.php`):
- Uses `SimpleSoftwareIO\QrCode` package (composer requires `simplesoftwareio/simple-qrcode: ^4.2`)
- Generates SVG (not PNG) to avoid imagick dependency
- Encodes JSON: `{'booking_code', 'type': 'cinema_booking', 'timestamp': ISO, 'cinema': 'ИдёмВКино'}`
- Routes: `GET /api/qr-code/booking/{bookingCode}` (returns SVG), `/image` variant exists
- Cache: Response has `Cache-Control: public, max-age=3600`

**Hall Layout Storage**:
- CinemaHall `layout` column is JSON type
- Structure not strictly defined in code - store seat type info (vip/standard/disabled)
- Prices: `standard_price` and `vip_price` as integers (in cents/smallest unit)

## Critical Integration Points

**Foreign Key Constraints**:
- Bookings -> Screenings: `foreignId('screening_id')->constrained()->onDelete('cascade')`
- Screenings -> Movies & CinemaHalls: Both constrained
- Cascade deletes mean: Delete screening = auto-delete all its bookings

**API Routes** (`routes/api.php`):
- Currently: No authentication middleware enforced - all CRUD routes are open
- QR endpoints are public (`GET /api/qr-code/booking/{bookingCode}`)
- Special endpoint: `GET /screenings/{id}/booked-seats` (returns already-booked seat list)
- Poster upload: `POST /upload-poster` (custom, not CRUD)
- Future: Add middleware route groups for admin-only operations (e.g., `Route::middleware('auth')->group()` with `is_admin` checks)

**Seeders** (auto-run on setup):
- MovieSeeder, ScreeningSeeder, BookingSeeder, AdditionalScreeningsSeeder
- Use Faker for test data
- Essential for dev/testing workflow

## Common Development Tasks

- **Add new model feature**: Create migration, Model class with `$fillable` + `$casts`, Controller with CRUD, add route in `api.php`
- **Add validation rule**: Use `validate()` in controller action, add custom messages if needed
- **Debug booking conflicts**: Check BookingController `store()` method - logic is inline (not in separate service)
- **Modify seat format**: Currently "row-seat" string - change regex in BookingController validation if needed
- **Add admin routes**: Create `Api\Admin\*Controller`, require `is_admin` check manually (no middleware yet)
- **Test database operations**: Migrations run fresh per test, use seeders or factories for test data setup
- **Implement user registration**: Create `AuthController`, validate input (email unique, password confirmed, min 8 chars), hash password via `'password' => 'hashed'` cast
- **Implement user login**: Query user by email, use `Hash::check()` to verify password, return user data on success
- **Add role-based authorization**: Check `auth()->user()->is_admin` before allowing admin operations (manually in controllers until middleware is added)

## Environment & Config

- **PHP 8.2+** required (composer.json)
- **Laravel 12** (framework: ^12.0)
- Database config: `.env` file (SQLite for testing, check `DB_*` vars for production)
- CORS: `config/cors.php` exists but may need frontend URL allowlisting
- Vite for asset compilation (js/css in `resources/`)
- Logging: Check `storage/logs/` for Laravel logs

## File Organization Reference

- **Controllers**: `app/Http/Controllers/Api/*Controller.php` (CRUD + custom actions)
- **Models**: `app/Models/` (Movie, Screening, CinemaHall, Booking, User)
- **Routes**: `routes/api.php` (all API endpoints)
- **Migrations**: `database/migrations/*_table.php` (schema definitions)
- **Tests**: `tests/{Unit,Feature}/`
- **Config**: `config/` (app.php, database.php, cors.php, etc.)
