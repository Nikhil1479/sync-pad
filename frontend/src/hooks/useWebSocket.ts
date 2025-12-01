import { useRef, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setCode } from '../store/slices/editorSlice';
import {
  setConnected,
  setConnecting,
  setUserCount,
  setError,
} from '../store/slices/roomSlice';
import { createWebSocketConnection } from '../services/api';

interface WebSocketMessage {
  type: string;
  code?: string;
  cursorPosition?: number;
  users?: number;
  userId?: string;
}

export const useWebSocket = (roomId: string | null) => {
  const dispatch = useAppDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnected = useAppSelector((state) => state.room.isConnected);

  const connect = useCallback(() => {
    if (!roomId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    dispatch(setConnecting(true));

    try {
      const ws = createWebSocketConnection(roomId);
      wsRef.current = ws;

      ws.onopen = () => {
        dispatch(setConnected(true));
        dispatch(setUserCount(1));
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'init':
              if (message.code !== undefined) {
                dispatch(setCode(message.code));
              }
              break;

            case 'code_update':
              if (message.code !== undefined) {
                dispatch(setCode(message.code));
              }
              break;

            case 'user_joined':
              if (message.users !== undefined) {
                dispatch(setUserCount(message.users));
              }
              break;

            case 'user_left':
              if (message.users !== undefined) {
                dispatch(setUserCount(message.users));
              }
              break;

            case 'pong':
              // Keep-alive response
              break;

            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        dispatch(setConnected(false));
        console.log('WebSocket disconnected');

        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          if (roomId) {
            connect();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        dispatch(setError('Connection error'));
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      dispatch(setError('Failed to connect'));
    }
  }, [roomId, dispatch]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    dispatch(setConnected(false));
  }, [dispatch]);

  const sendCodeUpdate = useCallback((code: string, cursorPosition?: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'code_update',
          code,
          cursorPosition,
        })
      );
    }
  }, []);

  const sendCursorUpdate = useCallback((cursorPosition: number, userId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'cursor_update',
          cursorPosition,
          userId,
        })
      );
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    sendCodeUpdate,
    sendCursorUpdate,
    isConnected,
  };
};
