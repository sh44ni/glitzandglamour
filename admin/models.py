import sqlite3
import bcrypt
from datetime import datetime
from config import Config

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Admin users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Bookings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            service TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            notes TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Contact messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Gallery images table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS gallery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            category TEXT DEFAULT 'nails',
            alt_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    
    # Create default admin if not exists
    cursor.execute('SELECT * FROM admins WHERE email = ?', (Config.DEFAULT_ADMIN_EMAIL,))
    if not cursor.fetchone():
        password_hash = bcrypt.hashpw(
            Config.DEFAULT_ADMIN_PASSWORD.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
        cursor.execute(
            'INSERT INTO admins (email, password_hash) VALUES (?, ?)',
            (Config.DEFAULT_ADMIN_EMAIL, password_hash)
        )
        conn.commit()
        print(f"Default admin created: {Config.DEFAULT_ADMIN_EMAIL}")
    
    conn.close()

class Admin:
    def __init__(self, id, email):
        self.id = id
        self.email = email
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
    
    def get_id(self):
        return str(self.id)
    
    @staticmethod
    def get_by_id(user_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM admins WHERE id = ?', (user_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return Admin(row['id'], row['email'])
        return None
    
    @staticmethod
    def get_by_email(email):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM admins WHERE email = ?', (email,))
        row = cursor.fetchone()
        conn.close()
        return row
    
    @staticmethod
    def verify_password(email, password):
        user = Admin.get_by_email(email)
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return Admin(user['id'], user['email'])
        return None
    
    @staticmethod
    def update_password(user_id, new_password):
        conn = get_db()
        cursor = conn.cursor()
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute('UPDATE admins SET password_hash = ? WHERE id = ?', (password_hash, user_id))
        conn.commit()
        conn.close()

class Booking:
    @staticmethod
    def get_all():
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM bookings ORDER BY created_at DESC')
        rows = cursor.fetchall()
        conn.close()
        return rows
    
    @staticmethod
    def get_by_id(booking_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM bookings WHERE id = ?', (booking_id,))
        row = cursor.fetchone()
        conn.close()
        return row
    
    @staticmethod
    def create(data):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO bookings (name, email, phone, service, date, time, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (data['name'], data['email'], data['phone'], data['service'], 
              data['date'], data['time'], data.get('notes', '')))
        conn.commit()
        conn.close()
    
    @staticmethod
    def update_status(booking_id, status):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('UPDATE bookings SET status = ? WHERE id = ?', (status, booking_id))
        conn.commit()
        conn.close()
    
    @staticmethod
    def delete(booking_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM bookings WHERE id = ?', (booking_id,))
        conn.commit()
        conn.close()
    
    @staticmethod
    def count():
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as count FROM bookings')
        row = cursor.fetchone()
        conn.close()
        return row['count']
    
    @staticmethod
    def count_pending():
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'")
        row = cursor.fetchone()
        conn.close()
        return row['count']

class Contact:
    @staticmethod
    def get_all():
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM contacts ORDER BY created_at DESC')
        rows = cursor.fetchall()
        conn.close()
        return rows
    
    @staticmethod
    def create(data):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO contacts (name, email, message)
            VALUES (?, ?, ?)
        ''', (data['name'], data['email'], data['message']))
        conn.commit()
        conn.close()
    
    @staticmethod
    def mark_read(contact_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('UPDATE contacts SET is_read = 1 WHERE id = ?', (contact_id,))
        conn.commit()
        conn.close()
    
    @staticmethod
    def delete(contact_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM contacts WHERE id = ?', (contact_id,))
        conn.commit()
        conn.close()
    
    @staticmethod
    def count_unread():
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as count FROM contacts WHERE is_read = 0')
        row = cursor.fetchone()
        conn.close()
        return row['count']

class Gallery:
    @staticmethod
    def get_all():
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM gallery ORDER BY created_at DESC')
        rows = cursor.fetchall()
        conn.close()
        return rows
    
    @staticmethod
    def create(filename, category='nails', alt_text=''):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO gallery (filename, category, alt_text)
            VALUES (?, ?, ?)
        ''', (filename, category, alt_text))
        conn.commit()
        conn.close()
    
    @staticmethod
    def delete(image_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT filename FROM gallery WHERE id = ?', (image_id,))
        row = cursor.fetchone()
        if row:
            cursor.execute('DELETE FROM gallery WHERE id = ?', (image_id,))
            conn.commit()
        conn.close()
        return row['filename'] if row else None
    
    @staticmethod
    def count():
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) as count FROM gallery')
        row = cursor.fetchone()
        conn.close()
        return row['count']
