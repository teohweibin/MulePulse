# Nexhack — Mule Detection System

## How to open the website locally

1. move to the backend terminal to open the backend locally
cd backend
docker compose up --build

2. If first time download the repo, download the requirements and train the model first.
pip install -r requirements.txt
python ml/data_gen.py
python ml/feature_pipeline.py
python ml/train.py

3. open another terminal (also cd to backend), send trained data to the backend
python ml/data_gen.py --seed-api

4. open localhost server at the frontend folder
python -m http.server 5500

5. open the website in the browser
http://localhost:5500/

## Repositories

- [backend/](./backend) — FastAPI backend, ML pipeline, AI reports
- [frontend_edited/](./frontend_edited) — Modified frontend to connect with backend

