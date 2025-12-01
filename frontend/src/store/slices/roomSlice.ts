import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RoomState {
  roomId: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  userCount: number;
  error: string | null;
}

const initialState: RoomState = {
  roomId: null,
  isConnected: false,
  isConnecting: false,
  userCount: 0,
  error: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomId: (state, action: PayloadAction<string | null>) => {
      state.roomId = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.isConnecting = false;
        state.error = null;
      }
    },
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    setUserCount: (state, action: PayloadAction<number>) => {
      state.userCount = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isConnecting = false;
    },
    resetRoom: (state) => {
      state.roomId = null;
      state.isConnected = false;
      state.isConnecting = false;
      state.userCount = 0;
      state.error = null;
    },
  },
});

export const {
  setRoomId,
  setConnected,
  setConnecting,
  setUserCount,
  setError,
  resetRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
