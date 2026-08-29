# MedRemind – Smart Medicine Reminder

A full-stack web application for managing medicine schedules with AI-powered explanations and automated reminders.

## Features

- **Add Medicine**: Enter medicine name, dosage, time, and optional description
- **View Medicines**: Display all medicines in a responsive card layout with glassmorphism design
- **Delete Medicine**: Remove medicines with smooth UI animations
- **Reminder System**: Automatic popup notifications and sound alerts when it's time to take medicine
- **AI Medicine Explainer**: Get simple explanations about medicines using Google Gemini AI
- **Live Clock**: Real-time clock display
- **Sound Toggle**: Enable/disable sound notifications
- **Dark Glassmorphism UI**: Modern, aesthetic design with smooth animations

## Tech Stack

### Frontend
- HTML5
- CSS3 (Glassmorphism design)
- Vanilla JavaScript

### Backend
- Node.js
- Express.js
- SQLite (database)
- Google Generative AI (Gemini API)

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Google Gemini API key (free)

## Setup Instructions

### 1. Clone/Download the Project

```bash
cd /home/kyvos/Downloads/med-remind
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Get Google Gemini API Key (Free)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 4. Configure Environment Variables

Edit the `.env` file in the `backend` directory:

```env
PORT=3000
# Get your free API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your actual Gemini API key.

### 5. Start the Backend Server

```bash
cd backend
node server.js
```

You should see:
```
MedRemind Backend running on port 3000
Connected to SQLite database
```

### 6. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## 📖 Usage Guide

### Adding a Medicine

1. Enter the medicine name (required)
2. Enter the dosage (e.g., "500mg")
3. Select the time using the time picker (required)
4. Add an optional description
5. Click "➕ Add Reminder"

### Viewing Medicines

- All medicines are displayed in a responsive grid
- Each card shows name, dosage, time, and description
- Cards appear with smooth animations

### Deleting a Medicine

- Click the "Delete" button on any medicine card
- The card will fade out with a smooth animation

### AI Medicine Explainer

1. Click the "✨ AI Explain" button on any medicine card
2. A modal will appear with the AI-generated explanation
3. The explanation is in plain, simple English

### Reminder System

- The app checks every minute for medicine times
- When the current time matches a medicine time:
  - A popup notification appears
  - A sound alert plays (if sound is enabled)
- Click "🔔 Sound On" to enable sound notifications
- Click "🔕 Sound Off" to disable sound notifications

### Live Clock

- The current time is displayed in the header
- Updates every second

## 🔧 API Endpoints

### GET /medicines
Fetch all medicines ordered by time.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Aspirin",
    "dosage": "500mg",
    "time": "09:00",
    "description": "For headache"
  }
]
```

### POST /addMedicine
Add a new medicine.

**Request Body:**
```json
{
  "name": "Ibuprofen",
  "dosage": "400mg",
  "time": "08:00",
  "description": "Take with breakfast"
}
```

**Response:**
```json
{
  "id": 2,
  "message": "Medicine added successfully"
}
```

### DELETE /medicine/:id
Delete a medicine by ID.

**Response:**
```json
{
  "message": "Medicine deleted successfully"
}
```

### GET /explain/:name
Get AI explanation for a medicine.

**Response:**
```json
{
  "explanation": "Ibuprofen is a pain reliever that reduces inflammation and helps with headaches, muscle aches, and fever."
}
```

## Database

The application uses SQLite for data storage. The database file (`medicines.db`) is automatically created in the `backend` directory when you first run the server.

**Table Schema:**
```sql
CREATE TABLE medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dosage TEXT,
    time TEXT NOT NULL,
    description TEXT
);
```

## Design Features

- **Glassmorphism**: Frosted glass effect with blur and transparency
- **Dark Theme**: Modern dark background with gradient accents
- **Smooth Animations**: Slide-up cards, fade transitions, and hover effects
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Loading States**: Spinners and loading indicators
- **Error Handling**: Graceful error messages and toasts

## Security Notes

- API keys are stored in the backend `.env` file (never exposed to frontend)
- CORS is enabled for development
- Input validation is performed on the backend
- SQL injection prevention through parameterized queries

## Troubleshooting

### Backend won't start
- Ensure Node.js is installed: `node --version`
- Ensure dependencies are installed: `cd backend && npm install`
- Check if port 3000 is already in use

### AI explanation not working
- Verify your Gemini API key is correct in `.env`
- Check your internet connection
- The API key must be valid and active

### Sound not playing
- Click "🔔 Sound On" to enable sound
- Browsers require user interaction before playing audio
- Check your system volume settings

### Database errors
- The SQLite database is automatically created
- Delete `backend/medicines.db` to reset the database
- Ensure write permissions for the backend directory

## Project Structure

```
med-remind/
├── backend/
│   ├── .env                 # Environment variables
│   ├── medicines.db         # SQLite database (auto-created)
│   ├── package.json         # Backend dependencies
│   └── server.js            # Express server with API endpoints
├── frontend/
│   ├── index.html           # Main HTML structure
│   ├── style.css            # Glassmorphism styling
│   └── script.js            # Frontend logic
├── database.sql             # MySQL schema (reference only)
└── README.md                # This file
```

## Development

### Running in Development Mode

```bash
cd backend
node server.js
```

The server will automatically reload when you make changes to `server.js`.

### Adding New Features

1. **Backend**: Add new routes in `server.js`
2. **Frontend**: Add new UI elements in `index.html` and logic in `script.js`
3. **Styling**: Add new styles in `style.css`

## License

This project is open source and available for personal and educational use.

## Contributing

Feel free to fork this project and customize it for your needs!

## 📞 Support

For issues or questions, please refer to the troubleshooting section above.
