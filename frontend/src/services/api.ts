const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://syncpad.azurewebsites.net';
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'wss://syncpad.azurewebsites.net';

export interface RoomResponse {
  roomId: string;
  code: string;
  language: string;
}

export interface AutocompleteRequest {
  code: string;
  cursorPosition: number;
  language: string;
}

export interface AutocompleteResponse {
  suggestion: string;
  insertPosition: number;
}

/**
 * Create a new room
 */
export const createRoom = async (language: string = 'python'): Promise<RoomResponse> => {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ language }),
  });

  if (!response.ok) {
    throw new Error('Failed to create room');
  }

  return response.json();
};

/**
 * Get room details by ID
 */
export const getRoom = async (roomId: string): Promise<RoomResponse> => {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Room not found');
    }
    throw new Error('Failed to get room');
  }

  return response.json();
};

/**
 * Get autocomplete suggestions
 */
export const getAutocomplete = async (
  request: AutocompleteRequest
): Promise<AutocompleteResponse> => {
  const response = await fetch(`${API_BASE_URL}/autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to get autocomplete');
  }

  return response.json();
};

/**
 * Create WebSocket connection for a room
 */
export const createWebSocketConnection = (roomId: string): WebSocket => {
  return new WebSocket(`${WS_BASE_URL}/ws/${roomId}`);
};

export { API_BASE_URL, WS_BASE_URL };
