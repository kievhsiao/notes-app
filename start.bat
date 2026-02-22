@echo off
title Notes App
cd /d "%~dp0"

echo Opening browser...
start http://localhost:3000

echo Starting Next.js Dev Server...
npm run dev
