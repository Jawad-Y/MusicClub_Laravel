# Music Club Management System

A comprehensive Laravel-based web application for managing music club operations, including instruments, classes, events, memberships, and more.

## Features

- **Instrument Management**: Track instruments, types, assignments, and maintenance
- **Class Management**: Manage music classes, members, and attendance
- **Event Management**: Organize events and track participant involvement
- **Membership System**: Handle club memberships and user assignments
- **Library Management**: Catalog music library materials
- **Performance Reviews**: Track student progress and reviews
- **Homework System**: Assign and track homework submissions
- **Clothing Assignment**: Manage uniform and clothing inventory
- **Export Functionality**: Export data to Excel and CSV formats

## Requirements

- **PHP**: >= 8.2
- **Composer**: Latest version
- **Node.js**: >= 18.x
- **NPM**: >= 9.x
- **Database**: MySQL 5.7+ / PostgreSQL 12+ / SQLite 3.8.8+
- **Web Server**: Apache / Nginx

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Jawad-Y/MusicClub_Laravel.git
cd MusicClub_Laravel
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node.js Dependencies

```bash
npm install
```

### 4. Environment Configuration

Copy the example environment file and generate application key:

```bash
copy .env.example .env
php artisan key:generate
```

### 5. Configure Database

Edit the `.env` file and set your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=music_club
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 6. Run Database Migrations

Create the database tables:

```bash
php artisan migrate
```

### 7. (Optional) Seed the Database

If you want to populate the database with sample data:

```bash
php artisan db:seed
```

### 8. Build Frontend Assets

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
```

### 9. Start the Development Server

```bash
php artisan serve
```

The application will be available at `http://localhost:8000`

## Running Both Servers Concurrently

To run both the Laravel development server and Vite asset server simultaneously:

```bash
php artisan serve
```

In a separate terminal:
```bash
npm run dev
```

## API Endpoints

The application provides RESTful API endpoints for all resources:

- `/api/instruments` - Instrument management
- `/api/instrument-types` - Instrument type management
- `/api/classes` - Class management
- `/api/events` - Event management
- `/api/memberships` - Membership management
- `/api/users` - User management
- And more...


## Project Structure

```
app/
├── Http/Controllers/    # API Controllers
├── Models/             # Eloquent Models
├── Policies/           # Authorization Policies
├── Exports/            # Excel Export Classes
config/                 # Configuration files
database/
├── migrations/         # Database migrations
├── seeders/           # Database seeders
resources/
├── js/                # JavaScript files
├── css/               # CSS files
└── views/             # Blade templates
routes/
├── api.php            # API routes
└── web.php            # Web routes
```

## Technologies Used

- **Framework**: Laravel 12
- **Frontend**: Vite, Tailwind CSS 4.0
- **Authentication**: Laravel Sanctum
- **Export**: Maatwebsite Excel
- **Database**: Eloquent ORM
- **Testing**: PHPUnit

## Quick Start Guide

For a fresh installation on Windows:

```powershell
# Install dependencies
composer install
npm install

# Setup environment
copy .env.example .env
php artisan key:generate

# Configure database in .env, then migrate
php artisan migrate

# Build assets and start server
npm run dev
# In another terminal:
php artisan serve
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Support

For issues and questions, please open an issue on the GitHub repository.
