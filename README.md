# Realtime Todo App

A full-stack realtime todo application with project management, task tracking, and live updates using Socket.io.

## Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- Socket.io for realtime communication
- JWT for authentication
- Zod for validation

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Socket.io client
- Zustand for state management
- Shadcn/ui for components

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local installation or cloud service like MongoDB Atlas)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd realtime-todo
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

## Setup

1. **Database Setup:**
   - Install MongoDB locally or use a cloud service
   - Update the `MONGODB_URI` in `backend/.env` if needed

2. **Environment Variables:**
   - Copy the example environment file:
     ```bash
     cd backend
     cp .env.example .env
     ```
   - Update the values in `.env`:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_ACCESS_SECRET`: A secure random string for JWT access tokens
     - `JWT_REFRESH_SECRET`: A secure random string for JWT refresh tokens
     - Other variables can use defaults for development

## Running the Application

1. **Start the Backend:**

   ```bash
   cd backend
   npm run dev
   ```

   The backend will run on `http://localhost:8000`

2. **Start the Frontend:**
   Open a new terminal and run:

   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

3. Open your browser and navigate to `http://localhost:3000` to access the application.

## Features

- User authentication (register/login)
- Project management
- Task creation and management
- Drag-and-drop task organization
- Realtime updates across multiple clients
- Responsive design

## Development

- **Linting:** `npm run lint` (in frontend)
- **Formatting:** `npm run format` (in frontend)
- **Type checking:** `npm run typecheck` (in frontend)
- **Build:** `npm run build` (in both backend and frontend)

## Project Structure

```
realtime-todo/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── config/   # Database and environment config
│   │   ├── middleware/ # Auth and error handling
│   │   ├── models/   # Mongoose schemas
│   │   ├── modules/  # Feature modules (auth, project, task, user)
│   │   ├── sockets/  # Socket.io handlers
│   │   └── utils/    # Utility functions
│   └── ...
├── frontend/         # Next.js application
│   ├── app/          # Next.js app router
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility libraries
│   ├── store/        # Zustand stores
│   └── ...
└── README.md
```
