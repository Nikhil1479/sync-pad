import { useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  setSuggestion,
  setIsLoadingSuggestion,
  clearSuggestion,
} from '../store/slices/editorSlice';
import { getAutocomplete } from '../services/api';

const DEBOUNCE_DELAY = 600; // ms

export const useAutocomplete = () => {
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const language = useAppSelector((state) => state.editor.language);

  const requestAutocomplete = useCallback(
    async (code: string, cursorPosition: number) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Clear current suggestion while typing
      dispatch(clearSuggestion());

      // Set up debounced request
      timeoutRef.current = setTimeout(async () => {
        try {
          dispatch(setIsLoadingSuggestion(true));

          const response = await getAutocomplete({
            code,
            cursorPosition,
            language,
          });

          if (response.suggestion) {
            dispatch(setSuggestion(response.suggestion));
          }
        } catch (error) {
          console.error('Autocomplete error:', error);
          dispatch(clearSuggestion());
        } finally {
          dispatch(setIsLoadingSuggestion(false));
        }
      }, DEBOUNCE_DELAY);
    },
    [dispatch, language]
  );

  const cancelAutocomplete = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    dispatch(clearSuggestion());
  }, [dispatch]);

  const acceptSuggestion = useCallback(
    (currentCode: string, cursorPosition: number, suggestion: string): string => {
      // Insert the suggestion at the cursor position
      const before = currentCode.slice(0, cursorPosition);
      const after = currentCode.slice(cursorPosition);
      
      dispatch(clearSuggestion());
      
      return before + suggestion + after;
    },
    [dispatch]
  );

  return {
    requestAutocomplete,
    cancelAutocomplete,
    acceptSuggestion,
  };
};
