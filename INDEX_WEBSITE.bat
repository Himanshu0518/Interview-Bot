@echo off
echo ============================================
echo Indexing Interview Bot Website
echo ============================================
echo.

cd /d "C:\Users\Kumar Abhishek\OneDrive\Desktop\Interview-Bot\chatbot\backend"

echo Installing required packages...
pip install chromadb sentence-transformers beautifulsoup4 requests --quiet

echo.
echo Running indexing...
python run_indexing.py

echo.
pause
