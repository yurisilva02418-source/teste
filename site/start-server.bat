@echo off
cd /d "%~dp0"
set PYTHON_EXE=%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe
if exist "%PYTHON_EXE%" (
  "%PYTHON_EXE%" server.py
) else (
  echo Python nao foi encontrado no ambiente do Windows.
  echo Instale o Python 3 e tente novamente.
  pause
)
