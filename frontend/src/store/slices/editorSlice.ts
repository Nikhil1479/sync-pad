import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EditorState {
  code: string;
  language: string;
  cursorPosition: number;
  suggestion: string | null;
  isLoadingSuggestion: boolean;
}

const initialState: EditorState = {
  code: '# Start coding here...\n',
  language: 'python',
  cursorPosition: 0,
  suggestion: null,
  isLoadingSuggestion: false,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setCursorPosition: (state, action: PayloadAction<number>) => {
      state.cursorPosition = action.payload;
    },
    setSuggestion: (state, action: PayloadAction<string | null>) => {
      state.suggestion = action.payload;
    },
    setIsLoadingSuggestion: (state, action: PayloadAction<boolean>) => {
      state.isLoadingSuggestion = action.payload;
    },
    clearSuggestion: (state) => {
      state.suggestion = null;
    },
    resetEditor: (state) => {
      state.code = initialState.code;
      state.language = initialState.language;
      state.cursorPosition = 0;
      state.suggestion = null;
    },
  },
});

export const {
  setCode,
  setLanguage,
  setCursorPosition,
  setSuggestion,
  setIsLoadingSuggestion,
  clearSuggestion,
  resetEditor,
} = editorSlice.actions;

export default editorSlice.reducer;
