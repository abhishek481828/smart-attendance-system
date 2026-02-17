# Smart Attendance System - Start Script
# Run this in PowerShell to start backend and frontend

Write-Host "🚀 Starting Smart Attendance System..." -ForegroundColor Green
Write-Host ""

# Start Backend in new window
Write-Host "📦 Starting Backend Server (Port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "🌐 Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "✅ Servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access URLs:" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:3001"
Write-Host "   Frontend: http://localhost:3000"
Write-Host ""
Write-Host "🌍 To expose via ngrok:" -ForegroundColor Magenta
Write-Host "   1. Open new terminal: ngrok http 3001 (for backend)"
Write-Host "   2. Copy the HTTPS URL from ngrok"
Write-Host "   3. Update frontend/.env.local with that URL"
Write-Host "   4. Restart frontend"
Write-Host "   5. Open new terminal: ngrok http 3000 (for frontend)"
Write-Host "   6. Share the frontend ngrok URL!"
Write-Host ""
Write-Host "📖 See NGROK_SETUP.md for detailed instructions" -ForegroundColor White
