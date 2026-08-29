# Docker Setup Guide for MedRemind Spring Boot (Windows)

## What is Docker?

Docker is a platform that allows you to package applications into containers. A container includes everything needed to run the application (code, libraries, dependencies, settings) so it runs consistently across different environments.

## Why Use Docker for MedRemind?

- **Consistent Environment**: Works the same on any machine
- **Easy Deployment**: Simple commands to start/stop
- **Isolation**: Doesn't conflict with other applications
- **Portability**: Can run on any system with Docker installed

---

## Step 1: Install Docker Desktop for Windows

### System Requirements:
- Windows 10 64-bit: Pro, Enterprise, or Education (version 1607 or later)
- Windows 11 64-bit: Home, Pro, Enterprise, or Education
- BIOS-level hardware virtualization support
- At least 4GB RAM

### Installation Steps:

1. **Download Docker Desktop**
   - Go to https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - Save the installer (Docker Desktop Installer.exe)

2. **Run the Installer**
   - Double-click the downloaded installer
   - Follow the installation wizard
   - Make sure to check "Use WSL 2 instead of Hyper-V" (recommended)
   - Click "OK" and restart your computer when prompted

3. **Start Docker Desktop**
   - After restart, open Docker Desktop from Start menu
   - Docker will start automatically (look for the whale icon in system tray)
   - Wait for it to fully start (the whale icon will stop spinning)

4. **Verify Installation**
   - Open Command Prompt or PowerShell
   - Run:
   ```cmd
   docker --version
   docker-compose --version
   ```
   - You should see version numbers (e.g., Docker version 24.x.x, Docker Compose version 2.x.x)

### Troubleshooting Windows Installation:

**If WSL 2 is not installed:**
- Docker Desktop will prompt you to install WSL 2
- Follow the on-screen instructions
- Or manually install from: https://aka.ms/wsl2kernel

**If virtualization is disabled:**
- Restart your computer
- Enter BIOS/UEFI setup
- Enable Virtualization Technology (VT-x or AMD-V)
- Save and restart

**If Docker won't start:**
- Make sure WSL 2 is enabled: Open PowerShell as Administrator and run:
  ```powershell
  wsl --install
  ```
- Restart your computer
- Start Docker Desktop again

---

## Step 2: Navigate to Project Directory

Open Command Prompt or PowerShell and navigate to your project folder. Based on your current location, the path would be:

```cmd
cd C:\Users\YourUsername\Downloads\med-remind
```

**Note:** Replace `YourUsername` with your actual Windows username.

---

## Step 3: Build and Run with Docker Compose

```cmd
# Build and start the application
docker-compose up --build

# Or run in background (detached mode)
docker-compose up --build -d
```

This will:
- Build the Docker image for the Spring Boot backend
- Start the container
- Map port 8080 on your machine to port 8080 in the container
- Use H2 in-memory database (no persistence needed)

**Tip:** The first build may take a few minutes as it downloads the Maven and OpenJDK images and builds the application.

---

## Step 4: Access the Application

Open your browser and go to:
```
http://localhost:8080
```

Note: This is the Spring Boot backend API. To access the full application, you also need to run the frontend separately (see below).

You should see the MedRemind application running!

---

## Common Docker Commands (Windows)

### View Running Containers
```cmd
docker-compose ps
# or
docker ps
```

### View Logs
```cmd
docker-compose logs
# or for specific service
docker-compose logs medremind-backend
```

### Stop the Application
```cmd
docker-compose down
```

### Restart the Application
```cmd
docker-compose restart
```

### Rebuild the Application
```cmd
docker-compose up --build
```

### Remove All Containers and Volumes
```cmd
docker-compose down -v
```

---

## File Structure for Docker

```
med-remind/
├── docker-compose.yml          # Orchestration file
├── springboot-backend/
│   ├── Dockerfile              # Spring Boot container definition
│   ├── .dockerignore           # Files to exclude from Docker build
│   ├── pom.xml                 # Maven dependencies
│   ├── src/
│   │   └── main/
│   │       ├── java/com/medremind/
│   │       │   ├── MedRemindApplication.java
│   │       │   ├── controller/
│   │       │   ├── service/
│   │       │   ├── repository/
│   │       │   └── model/
│   │       └── resources/
│   │           └── application.properties
│   └── target/                # Compiled JAR (created during build)
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

---

## Troubleshooting (Windows)

### Port Already in Use

If you get an error that port 8080 is already in use:

```cmd
# Option 1: Find and stop the process using port 8080
netstat -ano | findstr :8080
# Note the PID from the output
taskkill /PID <PID> /F

# Option 2: Change the port in docker-compose.yml
# Change "8080:8080" to "8081:8080"
# Then access at http://localhost:8081
```

### Docker Desktop Won't Start

**Check if Docker Desktop is running:**
- Look for the whale icon in your system tray
- If it's not there, open Docker Desktop from Start menu
- Wait for the whale icon to stop spinning (fully started)

**Restart Docker Desktop:**
- Right-click the whale icon in system tray
- Select "Restart Docker Desktop"

**Check WSL 2:**
- Open PowerShell as Administrator
- Run: `wsl --status`
- If WSL 2 is not installed, run: `wsl --install`
- Restart your computer

### Container Won't Start

```cmd
# View logs to see the error
docker-compose logs medremind-backend

# Rebuild from scratch
docker-compose down
docker-compose up --build
```

### Database Issues

The application uses H2 in-memory database, so data is lost when the container stops. To reset the application:

```cmd
# Stop and remove containers
docker-compose down

# Start again (will create fresh H2 database)
docker-compose up --build
```

### "docker-compose" command not found

Newer versions of Docker use `docker compose` (without hyphen). Try:

```cmd
docker compose up --build
```

If that doesn't work, ensure Docker Desktop is running and you've restarted your terminal after installation.

---

## Development with Docker (Windows)

### Making Changes to Code

1. Make your changes to the files
2. Rebuild and restart:
```cmd
docker-compose down
docker-compose up --build
```

### Viewing Container Shell

```cmd
# Access the container shell
docker-compose exec medremind-backend sh

# Inside the container, you can:
# - View files
# - Check logs
# - Run Java commands

# Exit with: exit
```

### Accessing Docker Desktop Dashboard

- Open Docker Desktop
- Click on "Containers" tab
- You can view logs, stats, and manage containers from the GUI

---

## Stopping Docker When Done

```cmd
# Stop the application
docker-compose down

# Verify no containers are running
docker ps
```

### Closing Docker Desktop

When you're completely done:
- Stop the application: `docker-compose down`
- Close Docker Desktop (right-click whale icon → Quit Docker Desktop)
- Docker will stop using system resources

---

## Quick Reference (Windows)

**Start the application:**
```cmd
docker-compose up --build
```

**Stop the application:**
```cmd
docker-compose down
```

**View logs:**
```cmd
docker-compose logs medremind-backend
```

**Access the backend API:**
```
http://localhost:8080
```

**Access the full application (requires frontend):**
```
http://localhost:3000 (after starting frontend separately)
```

---

## Summary

**To run MedRemind Spring Boot backend with Docker on Windows:**
1. Install Docker Desktop for Windows
2. Navigate to project directory: `cd C:\Users\YourUsername\Downloads\med-remind`
3. Run: `docker-compose up --build`
4. Access backend API at: http://localhost:8080
5. Start frontend separately (see SPRINGBOOT_SETUP.md for full app access)

**To stop:**
- Run: `docker-compose down`

That's it! Your Spring Boot backend is now running in a Docker container with all dependencies isolated and consistent across any Windows machine.

---

## Need Help?

If you encounter any issues not covered here:
- Check Docker Desktop logs (click the whale icon → Diagnostics → Logs)
- Visit Docker documentation: https://docs.docker.com/desktop/windows/
- Make sure Windows updates are installed
- Ensure WSL 2 is properly installed and enabled
