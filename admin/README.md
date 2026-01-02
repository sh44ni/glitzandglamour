# Glitz & Glamour Admin Panel

A minimal Python Flask admin panel for managing bookings, contact messages, and gallery images.

## Features

- 🔐 **Authentication** - Secure login with bcrypt password hashing
- 📅 **Bookings** - View and manage booking requests (pending/confirmed/completed/cancelled)
- 📧 **Messages** - Read contact form submissions
- 🖼️ **Gallery** - Upload, view, and delete gallery images
- ⚙️ **Settings** - Change admin password

## Setup

### 1. Install Dependencies

```bash
cd admin
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:
```
SECRET_KEY=your-random-secret-key
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
```

### 3. Run the Admin Panel

```bash
python app.py
```

The admin panel will be available at `http://localhost:5000`

## Default Credentials

- **Email:** admin@glitzandglamour.com
- **Password:** admin123

⚠️ **Change these immediately after first login!**

## API Endpoints

The admin panel exposes these API endpoints for the Next.js website:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bookings` | POST | Create a new booking |
| `/api/contacts` | POST | Submit a contact message |
| `/api/gallery` | GET | Get all gallery images |

## Deployment

### Render

1. Create a new Web Service
2. Set Python version: 3.11
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
5. Add environment variables from `.env`

### Railway

1. Create a new project from this directory
2. Add environment variables
3. Deploy automatically

### PythonAnywhere

1. Upload the `admin` folder
2. Set up a Flask web app
3. Configure environment variables in the WSGI file

## File Structure

```
admin/
├── app.py              # Main Flask application
├── config.py           # Configuration settings
├── models.py           # Database models (SQLite)
├── requirements.txt    # Python dependencies
├── templates/          # HTML templates
│   ├── base.html
│   ├── login.html
│   ├── dashboard.html
│   ├── bookings.html
│   ├── contacts.html
│   ├── gallery.html
│   └── settings.html
└── data/
    ├── admin.db        # SQLite database (auto-created)
    └── gallery/        # Uploaded images
```
