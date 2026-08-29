# MedRemind Spring Boot Setup Guide

This guide will help you set up and run the MedRemind application with a Spring Boot backend.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17** or higher
- **Maven 3.6+** 
- **MySQL 8.0+**
- **OpenRouter API Key** (Get it from https://openrouter.ai/)

## 🗄️ Database Setup

### 1. Install MySQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**Windows:**
- Download MySQL Installer from https://dev.mysql.com/downloads/installer/
- Install MySQL Server during setup
- Remember your root password

### 2. Create Database

The application will automatically create the database, but you can also create it manually:

```sql
CREATE DATABASE medremind;
```

## ⚙️ Configuration

### 1. Configure Database Credentials

Edit `springboot-backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/medremind?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL root password.

### 2. Configure OpenRouter API Key

In the same `application.properties` file:

```properties
openrouter.api.key=YOUR_OPENROUTER_API_KEY_HERE
```

Replace `YOUR_OPENROUTER_API_KEY_HERE` with your actual OpenRouter API key.

## 🚀 Running the Application

### Step 1: Build the Spring Boot Backend

Navigate to the Spring Boot backend directory:

```bash
cd springboot-backend
```

Build the project with Maven:

```bash
mvn clean install
```

### Step 2: Run the Spring Boot Backend

```bash
mvn spring-boot:run
```

Or run the JAR file directly:

```bash
java -jar target/med-remind-backend-1.0.0.jar
```

The backend will start on **http://localhost:8080**

You should see:
```
🚀 MedRemind Spring Boot Backend running on port 8080
```

### Step 3: Run the Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

You can serve the frontend using any static file server. Here are some options:

**Option 1: Python Simple HTTP Server**
```bash
python3 -m http.server 3000
```

**Option 2: Node.js http-server**
```bash
npx http-server -p 3000
```

**Option 3: VS Code Live Server Extension**
- Install the "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

The frontend will be available at **http://localhost:3000**

## 🧪 Testing the Application

1. Open your browser and go to `http://localhost:3000`
2. Add a medicine using the form
3. Verify it appears in the medicine cards
4. Test the AI features:
   - Click "✨ Explain" to get medicine explanation
   - Click "💊 Alternatives" to get Indian alternatives
   - Click "💰 Price Compare" to get price comparison
   - Use the symptom section to get medicine suggestions
5. Test edit functionality by clicking "✏️ Edit"
6. Test delete functionality by clicking "🗑️ Delete"
7. Test the reminder system (wait for the scheduled time)

## 📁 Project Structure

```
med-remind/
├── frontend/                          # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── springboot-backend/                 # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/medremind/
│   │   │   │   ├── controller/        # REST Controllers
│   │   │   │   │   └── MedicineController.java
│   │   │   │   ├── service/           # Business Logic
│   │   │   │   │   ├── MedicineService.java
│   │   │   │   │   └── AIService.java
│   │   │   │   ├── repository/        # Data Access
│   │   │   │   │   └── MedicineRepository.java
│   │   │   │   ├── model/             # JPA Entities
│   │   │   │   │   └── Medicine.java
│   │   │   │   ├── dto/               # Data Transfer Objects
│   │   │   │   │   ├── AIRequest.java
│   │   │   │   │   └── AIResponse.java
│   │   │   │   └── MedRemindApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml                        # Maven Dependencies
└── SPRINGBOOT_SETUP.md                # This file
```

## 🔌 API Endpoints

### Medicine CRUD
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines` - Add a medicine
- `PUT /api/medicines/{id}` - Update a medicine
- `DELETE /api/medicines/{id}` - Delete a medicine

### AI Features
- `POST /api/explain` - Get medicine explanation
- `GET /api/alternatives/{name}` - Get Indian alternatives
- `POST /api/symptom-to-medicine` - Get medicine suggestions from symptoms
- `POST /api/price-comparison` - Get price comparison

## 🐛 Troubleshooting

### Backend won't start
- Ensure MySQL is running: `sudo systemctl status mysql`
- Check database credentials in `application.properties`
- Verify Java version: `java -version` (should be 17+)
- Check if port 8080 is already in use

### Frontend can't connect to backend
- Ensure backend is running on port 8080
- Check CORS configuration in `application.properties`
- Verify API_BASE in `frontend/script.js` is set to `http://localhost:8080/api`

### AI features not working
- Verify OpenRouter API key is set correctly in `application.properties`
- Check your OpenRouter API key has credits
- Check browser console for network errors

### Database connection errors
- Ensure MySQL service is running
- Verify database credentials
- Check if MySQL is accepting connections on port 3306

## 📝 Features Implemented

✅ Medicine CRUD Operations (Add, Edit, Delete, View)
✅ AI Medicine Explanation (OpenRouter API)
✅ Alternative Drug Suggestions (India-specific)
✅ Symptom-to-Medicine AI
✅ Price Comparison AI
✅ Reminder System with Notifications
✅ Live Clock
✅ Search Functionality
✅ Modern Glassmorphism UI
✅ Responsive Design
✅ Markdown Rendering for AI Responses

## 🔒 Security Notes

- Never commit your OpenRouter API key to version control
- Use environment variables for sensitive data in production
- Configure proper CORS settings for production deployment
- Add authentication/authorization for production use

## 📦 Production Deployment

For production deployment, consider:

1. Use environment variables for configuration:
   ```properties
   spring.datasource.url=${DB_URL}
   spring.datasource.username=${DB_USERNAME}
   spring.datasource.password=${DB_PASSWORD}
   openrouter.api.key=${OPENROUTER_API_KEY}
   ```

2. Build a production JAR:
   ```bash
   mvn clean package -Pprod
   ```

3. Deploy to a cloud platform (AWS, Heroku, etc.)

4. Configure a proper reverse proxy (Nginx, Apache)

5. Set up SSL/TLS certificates

## 📞 Support

If you encounter any issues:
1. Check the Spring Boot logs in the terminal
2. Check browser console for frontend errors
3. Verify all prerequisites are installed
4. Review the troubleshooting section above

---

**Enjoy using MedRemind! 🚀**
