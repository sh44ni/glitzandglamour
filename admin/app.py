import os
from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from config import Config
from models import init_db, Admin, Booking, Contact, Gallery

app = Flask(__name__)
app.config.from_object(Config)

# CORS support for API endpoints
@app.after_request
def after_request(response):
    # Allow requests from Next.js frontend
    origin = request.headers.get('Origin')
    if origin:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route('/api/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return '', 200

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'error'

@login_manager.user_loader
def load_user(user_id):
    return Admin.get_by_id(int(user_id))

# Initialize database
with app.app_context():
    os.makedirs(os.path.dirname(Config.DATABASE_PATH), exist_ok=True)
    os.makedirs(Config.GALLERY_FOLDER, exist_ok=True)
    init_db()

# ============ Authentication Routes ============
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = Admin.verify_password(email, password)
        if user:
            login_user(user)
            flash('Welcome back!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password', 'error')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('login'))

# ============ Dashboard ============
@app.route('/')
@login_required
def dashboard():
    stats = {
        'total_bookings': Booking.count(),
        'pending_bookings': Booking.count_pending(),
        'unread_messages': Contact.count_unread(),
        'gallery_images': Gallery.count()
    }
    return render_template('dashboard.html', stats=stats)

# ============ Bookings ============
@app.route('/bookings')
@login_required
def bookings():
    all_bookings = Booking.get_all()
    return render_template('bookings.html', bookings=all_bookings)

@app.route('/bookings/<int:booking_id>/status', methods=['POST'])
@login_required
def update_booking_status(booking_id):
    status = request.form.get('status')
    Booking.update_status(booking_id, status)
    flash('Booking status updated', 'success')
    return redirect(url_for('bookings'))

@app.route('/bookings/<int:booking_id>/delete', methods=['POST'])
@login_required
def delete_booking(booking_id):
    Booking.delete(booking_id)
    flash('Booking deleted', 'success')
    return redirect(url_for('bookings'))

# ============ Contact Messages ============
@app.route('/contacts')
@login_required
def contacts():
    all_contacts = Contact.get_all()
    return render_template('contacts.html', contacts=all_contacts)

@app.route('/contacts/<int:contact_id>/read', methods=['POST'])
@login_required
def mark_contact_read(contact_id):
    Contact.mark_read(contact_id)
    flash('Message marked as read', 'success')
    return redirect(url_for('contacts'))

@app.route('/contacts/<int:contact_id>/delete', methods=['POST'])
@login_required
def delete_contact(contact_id):
    Contact.delete(contact_id)
    flash('Message deleted', 'success')
    return redirect(url_for('contacts'))

# ============ Gallery ============
@app.route('/gallery')
@login_required
def gallery():
    all_images = Gallery.get_all()
    return render_template('gallery.html', images=all_images)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@app.route('/gallery/upload', methods=['POST'])
@login_required
def upload_image():
    if 'image' not in request.files:
        flash('No file selected', 'error')
        return redirect(url_for('gallery'))
    
    file = request.files['image']
    if file.filename == '':
        flash('No file selected', 'error')
        return redirect(url_for('gallery'))
    
    if file and allowed_file(file.filename):
        # Generate unique filename
        import uuid
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(Config.GALLERY_FOLDER, filename)
        file.save(filepath)
        
        category = request.form.get('category', 'nails')
        alt_text = request.form.get('alt_text', '')
        Gallery.create(filename, category, alt_text)
        
        flash('Image uploaded successfully', 'success')
    else:
        flash('Invalid file type', 'error')
    
    return redirect(url_for('gallery'))

@app.route('/gallery/<int:image_id>/delete', methods=['POST'])
@login_required
def delete_image(image_id):
    filename = Gallery.delete(image_id)
    if filename:
        filepath = os.path.join(Config.GALLERY_FOLDER, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
        flash('Image deleted', 'success')
    return redirect(url_for('gallery'))

@app.route('/gallery/images/<filename>')
def gallery_image(filename):
    from flask import send_from_directory
    return send_from_directory(Config.GALLERY_FOLDER, filename)

# ============ Settings ============
@app.route('/settings')
@login_required
def settings():
    return render_template('settings.html')

@app.route('/settings/password', methods=['POST'])
@login_required
def change_password():
    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')
    confirm_password = request.form.get('confirm_password')
    
    if new_password != confirm_password:
        flash('New passwords do not match', 'error')
        return redirect(url_for('settings'))
    
    if len(new_password) < 6:
        flash('Password must be at least 6 characters', 'error')
        return redirect(url_for('settings'))
    
    # Verify current password
    user = Admin.verify_password(current_user.email, current_password)
    if not user:
        flash('Current password is incorrect', 'error')
        return redirect(url_for('settings'))
    
    Admin.update_password(current_user.id, new_password)
    flash('Password updated successfully', 'success')
    return redirect(url_for('settings'))

# ============ API Endpoints (for Next.js integration) ============
@app.route('/api/bookings', methods=['POST'])
def api_create_booking():
    try:
        data = request.get_json()
        Booking.create(data)
        return jsonify({'success': True, 'message': 'Booking created'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/contacts', methods=['POST'])
def api_create_contact():
    try:
        data = request.get_json()
        Contact.create(data)
        return jsonify({'success': True, 'message': 'Message received'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/gallery', methods=['GET'])
def api_get_gallery():
    images = Gallery.get_all()
    return jsonify([{
        'id': img['id'],
        'url': f"/gallery/images/{img['filename']}",
        'category': img['category'],
        'alt': img['alt_text']
    } for img in images])

if __name__ == '__main__':
    app.run(debug=True, port=5000)
