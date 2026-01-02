import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'glitz-glamour-admin-secret-key-change-me'
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'data', 'admin.db')
    GALLERY_FOLDER = os.path.join(os.path.dirname(__file__), 'data', 'gallery')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    # Default admin credentials (change these in .env)
    DEFAULT_ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL') or 'admin@glitzandglamour.com'
    DEFAULT_ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') or 'admin123'
