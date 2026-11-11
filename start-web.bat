@echo off
title School Budget Tracker Server
cd /d "%~dp0"
echo ========================================================
echo   School Budget Tracking System - Next.js
echo   ระบบติดตามการใช้งบประมาณตามแผนปฏิบัติการประจำปี
echo ========================================================
echo.
echo กำลังเริ่มต้นระบบ...
echo กรุณารอสักครู่ จากนั้นเปิดเบราว์เซอร์ไปที่: http://localhost:3000
echo.
node node_modules\next\dist\bin\next start -p 3000
pause
