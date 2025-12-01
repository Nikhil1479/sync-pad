import { configureStore } from '@reduxjs/toolkit';
import editorReducer from './slices/editorSlice';
import roomReducer from './slices/roomSlice';

export const store = configureStore({
  reducer: {
    editor: editorReducer,
    room: roomReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore WebSocket in state
        ignoredActions: ['room/setWebSocket'],
        ignoredPaths: ['room.websocket'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
