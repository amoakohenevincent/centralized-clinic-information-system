# Patient and Appointment Management

Development of a Centralized Clinic Information System (CCIS) using the MERN stack to manage patient registration, appointments, clinical records, prescriptions, and pharmacy inventory.

## Patient and Appointment Module

This module provides patient profiles and appointment scheduling.

## Structure

- `frontend/`: React and Vite user interface.
- `backend/`: Express and MongoDB API.

## Requirements

- Node.js 18 or newer
- MongoDB
- Access to the team's shared authentication adapter

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and configure MongoDB and the shared authentication module.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Install and run the backend:

   ```powershell
   cd backend
   npm install
   npm start
   ```

4. In another terminal, install and run the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:4000`.

## Validation

```powershell
cd backend
npm test

cd ../frontend
npm run build
```
