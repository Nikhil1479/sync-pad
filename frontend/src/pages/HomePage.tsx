import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../services/api';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [roomIdInput, setRoomIdInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await createRoom('python');
      navigate(`/room/${response.roomId}`);
    } catch (err) {
      setError('Failed to create room. Please try again.');
      console.error('Error creating room:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomIdInput.trim()) {
      navigate(`/room/${roomIdInput.trim()}`);
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <h1>🖥️ SyncPad</h1>
          <p className="subtitle">
            Real-time collaborative code editor for pair programming
          </p>
        </div>

        <div className="home-content">
          <div className="action-card">
            <h2>Create New Room</h2>
            <p>Start a new coding session and invite others to join</p>
            <button
              className="primary-button"
              onClick={handleCreateRoom}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </button>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="action-card">
            <h2>Join Existing Room</h2>
            <p>Enter a room ID to join an existing session</p>
            <form onSubmit={handleJoinRoom} className="join-form">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="room-input"
              />
              <button
                type="submit"
                className="secondary-button"
                disabled={!roomIdInput.trim()}
              >
                Join Room
              </button>
            </form>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <h3>Real-time Sync</h3>
            <p>See changes instantly as your partner types</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <h3>AI Autocomplete</h3>
            <p>Smart code suggestions as you type</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🔗</span>
            <h3>Easy Sharing</h3>
            <p>Share a link to invite collaborators</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
