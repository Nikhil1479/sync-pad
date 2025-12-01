import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { setCode, setCursorPosition, setLanguage } from '../store/slices/editorSlice';
import { setRoomId, resetRoom } from '../store/slices/roomSlice';
import { getRoom } from '../services/api';
import CodeEditor from '../components/CodeEditor';
import './RoomPage.css';

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { code, suggestion, language } = useAppSelector((state) => state.editor);
  const { isConnected, isConnecting, userCount, error } = useAppSelector(
    (state) => state.room
  );
  
  const { connect, disconnect, sendCodeUpdate } = useWebSocket(roomId || null);
  const { requestAutocomplete, cancelAutocomplete, acceptSuggestion } = useAutocomplete();
  
  const [isLoading, setIsLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);

  // Initialize room
  useEffect(() => {
    const initRoom = async () => {
      if (!roomId) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const room = await getRoom(roomId);
        
        dispatch(setRoomId(roomId));
        dispatch(setCode(room.code));
        dispatch(setLanguage(room.language));
        
        // Connect to WebSocket
        connect();
      } catch (err) {
        console.error('Error loading room:', err);
        setRoomError('Room not found or failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    initRoom();

    return () => {
      disconnect();
      dispatch(resetRoom());
    };
  }, [roomId, navigate, dispatch, connect, disconnect]);

  // Handle code changes
  const handleCodeChange = useCallback(
    (newCode: string, cursorPos: number) => {
      dispatch(setCode(newCode));
      dispatch(setCursorPosition(cursorPos));
      
      // Send update via WebSocket
      sendCodeUpdate(newCode, cursorPos);
      
      // Request autocomplete
      requestAutocomplete(newCode, cursorPos);
    },
    [dispatch, sendCodeUpdate, requestAutocomplete]
  );

  // Handle accepting suggestion
  const handleAcceptSuggestion = useCallback(() => {
    if (suggestion) {
      const cursorPosition = code.length; // Simplified - use actual cursor position
      const newCode = acceptSuggestion(code, cursorPosition, suggestion);
      dispatch(setCode(newCode));
      sendCodeUpdate(newCode);
    }
  }, [suggestion, code, acceptSuggestion, dispatch, sendCodeUpdate]);

  // Copy room link to clipboard
  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    // Could add a toast notification here
  };

  // Handle leaving room
  const handleLeaveRoom = () => {
    disconnect();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="room-page loading">
        <div className="loader"></div>
        <p>Loading room...</p>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="room-page error">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{roomError}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-page">
      <header className="room-header">
        <div className="header-left">
          <h1>Collaborative Editor</h1>
          <span className="room-id">Room: {roomId}</span>
        </div>
        
        <div className="header-center">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div className="user-count">
            👥 {userCount} user{userCount !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="header-right">
          <select
            value={language}
            onChange={(e) => dispatch(setLanguage(e.target.value))}
            className="language-select"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
          </select>
          <button onClick={handleCopyLink} className="copy-link-button">
            📋 Copy Link
          </button>
          <button onClick={handleLeaveRoom} className="leave-button">
            Leave
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <main className="editor-container">
        <CodeEditor
          code={code}
          language={language}
          onChange={handleCodeChange}
          suggestion={suggestion}
          onAcceptSuggestion={handleAcceptSuggestion}
          onRejectSuggestion={cancelAutocomplete}
        />
      </main>

      {suggestion && (
        <div className="suggestion-hint">
          Press <kbd>Tab</kbd> to accept suggestion, <kbd>Esc</kbd> to dismiss
        </div>
      )}
    </div>
  );
};

export default RoomPage;
