const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE_URL = process.env.REACT_APP_API_URL || (isLocalhost ? 'http://localhost:8000' : 'https://syncpad.azurewebsites.net');
const WS_BASE_URL = process.env.REACT_APP_WS_URL || (isLocalhost ? 'ws://localhost:8000' : 'wss://syncpad.azurewebsites.net');

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
 * Fetch with retry logic to handle Azure cold starts
 */
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay: number = 1000
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        // Ensure credentials and mode are set for CORS
        mode: 'cors',
      });
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      console.log(`Retrying request (${i + 1}/${retries})...`);
    }
  }
  throw new Error('Max retries reached');
};

/**
 * Create a new room
 */
export const createRoom = async (language: string = 'python'): Promise<RoomResponse> => {
  const response = await fetchWithRetry(`${API_BASE_URL}/rooms`, {
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
  const response = await fetchWithRetry(`${API_BASE_URL}/rooms/${roomId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

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
  const response = await fetchWithRetry(`${API_BASE_URL}/autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  }, 2, 500); // Fewer retries, shorter delay for autocomplete

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
