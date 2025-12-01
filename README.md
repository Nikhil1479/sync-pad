# Collaborative Code Editor

A real-time pair-programming web application where two or more users can join the same room, edit code simultaneously, and see each other's changes instantly. Features AI-style autocomplete suggestions (Just some regex).

## 🌐 Live Demo

- **Frontend**: [https://nikhil1479.github.io/Collaborative-Editor](https://nikhil1479.github.io/Collaborative-Editor)
- **Backend API**: [https://syncpad.azurewebsites.net](https://syncpad.azurewebsites.net)
- **API Docs**: [https://syncpad.azurewebsites.net/docs](https://syncpad.azurewebsites.net/docs)

![Collaborative Editor](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.9+-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## 🚀 Features

- **Room Creation & Joining**: Create new rooms with unique IDs or join existing rooms via URL
- **Real-Time Collaboration**: WebSocket-based synchronization for instant code updates
- **AI Autocomplete**: Mocked AI suggestions that appear after 600ms of typing pause
- **Multi-Language Support**: Python, JavaScript, and TypeScript
- **Connection Status**: Visual indicators for connection state and user count
- **Persistent Storage**: Room code is persisted to MySQL database

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  FastAPI Backend│────▶│     MySQL       │
│  (TypeScript)   │     │  (Python)       │     │   Database      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │   WebSocket (/ws)     │
         │◀─────────────────────▶│
         │                       │
         │   REST API            │
         │◀─────────────────────▶│
         │   - POST /rooms       │
         │   - POST /autocomplete│
         │   - GET /rooms/:id    │
```

## 📁 Project Structure

```
collaborative-editor/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Application settings
│   │   ├── database.py          # Database connection & session
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── room.py          # Room SQLAlchemy model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── room.py          # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── rooms.py         # Room REST endpoints
│   │   │   ├── autocomplete.py  # Autocomplete endpoint
│   │   │   └── websocket.py     # WebSocket endpoint
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── room_service.py       # Room business logic
│   │       ├── autocomplete_service.py # AI autocomplete logic
│   │       └── connection_manager.py  # WebSocket connection manager
│   ├── alembic/                 # Database migrations
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.tsx            # App entry point
│   │   ├── App.tsx              # Main app component
│   │   ├── store/
│   │   │   ├── index.ts         # Redux store configuration
│   │   │   └── slices/
│   │   │       ├── editorSlice.ts  # Editor state
│   │   │       └── roomSlice.ts    # Room state
│   │   ├── hooks/
│   │   │   ├── useRedux.ts      # Typed Redux hooks
│   │   │   ├── useWebSocket.ts  # WebSocket hook
│   │   │   └── useAutocomplete.ts # Autocomplete hook
│   │   ├── services/
│   │   │   └── api.ts           # API service layer
│   │   ├── pages/
│   │   │   ├── HomePage.tsx     # Landing page
│   │   │   ├── HomePage.css
│   │   │   ├── RoomPage.tsx     # Editor room page
│   │   │   └── RoomPage.css
│   │   └── components/
│   │       ├── CodeEditor.tsx   # Code editor component
│   │       └── CodeEditor.css
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🛠️ Tech Stack

### Backend

- **Python 3.9+**
- **FastAPI** - Modern, fast web framework
- **WebSockets** - Real-time bidirectional communication
- **SQLAlchemy** - ORM for database operations
- **MySQL** - Persistent data storage
- **Pydantic** - Data validation
- **Alembic** - Database migrations

### Frontend

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Redux Toolkit** - State management
- **React Router** - Client-side routing

## 📋 Prerequisites

- Python 3.9+
- Node.js 16+
- MySQL 8.0+
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd collaborative-editor
```

### 2. Set Up MySQL Database

```sql
CREATE DATABASE collaborative_editor;
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 📡 API Documentation

### REST Endpoints

#### Create Room
```http
POST /rooms
Content-Type: application/json

{
  "language": "python"  // optional, defaults to "python"
}

Response:
{
  "roomId": "uuid-string",
  "code": "# Start coding here...\n",
  "language": "python"
}
```

#### Get Room
```http
GET /rooms/{roomId}

Response:
{
  "roomId": "uuid-string",
  "code": "...",
  "language": "python",
  "created_at": "2025-11-29T..."
}
```

#### Autocomplete
```http
POST /autocomplete
Content-Type: application/json

{
  "code": "def ",
  "cursorPosition": 4,
  "language": "python"
}

Response:
{
  "suggestion": "def function_name(self, arg1, arg2):\n    \"\"\"Function description.\"\"\"\n    pass",
  "insertPosition": 4
}
```

### WebSocket Endpoint

```
ws://localhost:8000/ws/{roomId}
```

#### Messages

**Client → Server:**
```json
{
  "type": "code_update",
  "code": "...",
  "cursorPosition": 123
}
```

```json
{
  "type": "cursor_update",
  "cursorPosition": 123,
  "userId": "user-id"
}
```

**Server → Client:**
```json
{
  "type": "init",
  "code": "..."
}
```

```json
{
  "type": "code_update",
  "code": "...",
  "cursorPosition": 123
}
```

```json
{
  "type": "user_joined",
  "users": 2
}
```

```json
{
  "type": "user_left",
  "users": 1
}
```

## 🎯 Usage

1. **Create a Room**: Visit the home page and click "Create Room"
2. **Share the Link**: Copy the room URL and share with your coding partner
3. **Start Coding**: Both users can edit code simultaneously
4. **Get Suggestions**: Stop typing for 600ms to see AI autocomplete suggestions
5. **Accept Suggestions**: Press `Tab` to accept, `Esc` to dismiss

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection URL (async) | `mysql+aiomysql://...` |
| `SYNC_DATABASE_URL` | MySQL connection URL (sync) | `mysql+pymysql://...` |
| `CORS_ORIGINS` | Allowed frontend origins | `["http://localhost:3000"]` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8000` |
| `REACT_APP_WS_URL` | Backend WebSocket URL | `ws://localhost:8000` |

## 🧪 Testing the Application

1. Open two browser windows
2. Create a room in one window
3. Copy the URL and paste in the second window
4. Start typing in either window - changes sync instantly!

## 🚀 Deployment Considerations

- Use environment variables for all sensitive configurations
- Set up proper CORS origins for production
- Consider using Redis for WebSocket connection scaling
- Add authentication if needed
- Use a process manager like PM2 or supervisord
- Set up SSL/TLS for secure WebSocket connections

## 📝 Future Improvements

- [ ] Syntax highlighting with Monaco Editor or CodeMirror
- [ ] Multiple cursor positions display
- [ ] User presence indicators
- [ ] Chat functionality
- [ ] Code execution sandbox
- [ ] Real AI autocomplete integration
- [ ] File system support (multiple files per room)
- [ ] Authentication and user accounts
- [ ] Room persistence and history

---

Built with ❤️ using FastAPI and React

