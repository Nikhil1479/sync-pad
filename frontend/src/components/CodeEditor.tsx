import React, { useRef, useEffect, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import './CodeEditor.css';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string, cursorPosition: number) => void;
  suggestion: string | null;
  onAcceptSuggestion: () => void;
  onRejectSuggestion: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  suggestion,
  onAcceptSuggestion,
  onRejectSuggestion,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Calculate line numbers
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Sync scroll between textarea and line numbers
  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Handle text changes
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newCode = e.target.value;
      const cursorPos = e.target.selectionStart || 0;
      onChange(newCode, cursorPos);
    },
    [onChange]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Tab to accept suggestion
      if (e.key === 'Tab' && suggestion) {
        e.preventDefault();
        onAcceptSuggestion();
        return;
      }

      // Escape to reject suggestion
      if (e.key === 'Escape' && suggestion) {
        e.preventDefault();
        onRejectSuggestion();
        return;
      }

      // Handle Tab for indentation (when no suggestion)
      if (e.key === 'Tab' && !suggestion) {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newCode = code.substring(0, start) + '    ' + code.substring(end);
          
          onChange(newCode, start + 4);
          
          // Set cursor position after state update
          setTimeout(() => {
            textarea.selectionStart = start + 4;
            textarea.selectionEnd = start + 4;
          }, 0);
        }
      }
    },
    [suggestion, onAcceptSuggestion, onRejectSuggestion, code, onChange]
  );

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Update textarea value when code changes externally
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== code) {
      const cursorPos = textareaRef.current.selectionStart;
      textareaRef.current.value = code;
      // Try to preserve cursor position
      textareaRef.current.selectionStart = Math.min(cursorPos, code.length);
      textareaRef.current.selectionEnd = Math.min(cursorPos, code.length);
    }
  }, [code]);

  return (
    <div className="code-editor">
      <div className="editor-wrapper">
        <div className="line-numbers" ref={lineNumbersRef}>
          {lineNumbers.map((num) => (
            <div key={num} className="line-number">
              {num}
            </div>
          ))}
        </div>
        
        <div className="editor-content">
          <textarea
            ref={textareaRef}
            className={`code-textarea ${language}`}
            value={code}
            onChange={handleChange}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="Start coding here..."
          />
          
          {suggestion && (
            <div className="suggestion-overlay">
              <pre className="suggestion-text">{suggestion}</pre>
            </div>
          )}
        </div>
      </div>
      
      <div className="editor-footer">
        <span className="language-badge">{language}</span>
        <span className="line-info">
          {lineCount} line{lineCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default CodeEditor;
