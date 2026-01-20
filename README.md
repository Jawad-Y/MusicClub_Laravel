# Music Club Management System

A comprehensive full-stack web application for managing music club operations, including instruments, classes, events, memberships, and more. Built with a Laravel backend API and a Next.js frontend.

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

## Installation

### Backend Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Jawad-Y/MusicClub_Laravel.git
cd MusicClub_Laravel
```

### 2. Install PHP Dependencies

```bash
cd BackEnd
composer install
```

### 3. Environment Configuration

Copy the example environment file and generate application key:

```bash
copy .env.example .env
php artisan key:generate
```

### 4. Configure Database

Edit the `.env` file and set your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=music_club
DB_USERNAME=
DB_PASSWORD=
```

### 5. Run Database Migrations

Create the database tables:

```bash
php artisan migrate
```

### 6. (Optional) Seed the Database

If you want to populate the database with sample data:

```bash
php artisan db:seed
```

### 7. Start the Backend Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

### Frontend Setup

### 1. Install Frontend Dependencies

```bash
cd ../FrontEnd
pnpm install
# or
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the FrontEnd directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Start the Development Server

```bash
pnpm dev
# or
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Build for Production

```bash
pnpm build
# or
npm run build
```

## Project Structure

### Backend (Laravel)
```
BackEnd/
├── app/
│   ├── Http/Controllers/    # API Controllers
│   ├── Models/             # Eloquent Models
├── config/                 # Configuration files
├── database/
│   ├── migrations/         # Database migrations
│   └── seeders/           # Database seeders
├── routes/
│   ├── api.php            # API routes
└── tests/                 # PHPUnit tests
```

### Frontend (Next.js)
```
FrontEnd/
├── app/                   # Next.js App Router pages
│   ├── classes/          # Classes management
│   ├── clothing/         # Clothing assignment
│   ├── departments/      # Department management
│   ├── events/           # Event management
│   ├── homework/         # Homework system
│   ├── instruments/      # Instrument tracking
│   ├── library/          # Library management
│   ├── login/            # Authentication
│   ├── performance/      # Performance reviews
│   ├── profile/          # User profiles
│   ├── reports/          # Reporting
│   ├── training/         # Training modules
│   └── users/            # User management
├── components/            # Reusable React components
│   └── ui/               # UI component library
├── lib/                  # Utility functions
│   ├── api-client.ts     # API integration
│   ├── auth-context.tsx  # Authentication context
│   └── utils.ts          # Helper functions
└── hooks/                # Custom React hooks
```