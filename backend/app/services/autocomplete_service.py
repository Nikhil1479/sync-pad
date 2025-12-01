import re
from app.schemas.room import AutocompleteRequest, AutocompleteResponse


class AutocompleteService:
    """Service for providing mocked AI autocomplete suggestions."""

    # Python code patterns and their suggestions
    PYTHON_PATTERNS = {
        r"def\s+(\w*)$": "def function_name(self, arg1, arg2):\n    \"\"\"Function description.\"\"\"\n    pass",
        r"class\s+(\w*)$": "class ClassName:\n    \"\"\"Class description.\"\"\"\n    \n    def __init__(self):\n        pass",
        r"if\s+$": "if condition:\n    pass\nelse:\n    pass",
        r"for\s+$": "for item in items:\n    pass",
        r"while\s+$": "while condition:\n    pass",
        r"try\s*:?\s*$": "try:\n    pass\nexcept Exception as e:\n    print(f\"Error: {e}\")",
        r"import\s+$": "import module_name",
        r"from\s+$": "from module import function",
        r"async\s+def\s+$": "async def async_function():\n    await some_coroutine()",
        r"print\s*\(\s*$": "print(f\"Message: {variable}\")",
        r"return\s+$": "return result",
        r"raise\s+$": "raise ValueError(\"Error message\")",
        r"with\s+$": "with open(filename, 'r') as f:\n    content = f.read()",
        r"lambda\s+$": "lambda x: x * 2",
        r"#\s*TODO\s*$": "# TODO: Implement this feature",
        r"\[\s*$": "[item for item in items if condition]",
        r"\{\s*$": "{key: value for key, value in items.items()}",
    }

    # JavaScript/TypeScript patterns
    JS_PATTERNS = {
        r"function\s+$": "function functionName(param) {\n  return param;\n}",
        r"const\s+$": "const variableName = value;",
        r"let\s+$": "let variableName = value;",
        r"if\s*\(\s*$": "if (condition) {\n  // code\n}",
        r"for\s*\(\s*$": "for (let i = 0; i < array.length; i++) {\n  // code\n}",
        r"=>\s*$": "=> {\n  return result;\n}",
        r"async\s+$": "async function asyncFunction() {\n  await somePromise();\n}",
        r"import\s+$": "import { module } from 'package';",
        r"export\s+$": "export default ComponentName;",
        r"console\.\s*$": "console.log('Debug:', variable);",
    }

    # Generic suggestions based on common keywords
    GENERIC_SUGGESTIONS = {
        "func": "function implementation",
        "class": "class definition",
        "loop": "for loop iteration",
        "cond": "conditional statement",
        "try": "try-catch block",
        "async": "async/await pattern",
    }

    @staticmethod
    def get_autocomplete(request: AutocompleteRequest) -> AutocompleteResponse:
        """Generate a mocked autocomplete suggestion based on code context."""
        code = request.code
        cursor_pos = request.cursorPosition
        language = request.language.lower()

        # Get the code up to cursor position
        code_before_cursor = code[:cursor_pos] if cursor_pos <= len(
            code) else code

        # Get the current line being typed
        lines = code_before_cursor.split('\n')
        current_line = lines[-1] if lines else ""

        # Choose pattern set based on language
        if language in ["python", "py"]:
            patterns = AutocompleteService.PYTHON_PATTERNS
        elif language in ["javascript", "js", "typescript", "ts"]:
            patterns = AutocompleteService.JS_PATTERNS
        else:
            patterns = AutocompleteService.PYTHON_PATTERNS  # Default to Python

        # Try to match patterns
        suggestion = AutocompleteService._find_matching_pattern(
            current_line, patterns)

        # If no pattern matched, provide a context-based suggestion
        if not suggestion:
            suggestion = AutocompleteService._get_context_suggestion(
                current_line, language)

        return AutocompleteResponse(
            suggestion=suggestion,
            insertPosition=cursor_pos
        )

    @staticmethod
    def _find_matching_pattern(line: str, patterns: dict) -> str | None:
        """Find a matching pattern in the line and return suggestion."""
        line_stripped = line.strip()

        for pattern, suggestion in patterns.items():
            if re.search(pattern, line_stripped):
                return suggestion

        return None

    @staticmethod
    def _get_context_suggestion(line: str, language: str) -> str:
        """Get a context-based suggestion when no pattern matches."""
        line_lower = line.lower().strip()

        # Check for partial keywords
        if line_lower.endswith("pr"):
            return "print('Hello, World!')" if language == "python" else "console.log('Hello, World!');"

        if line_lower.endswith("de"):
            return "def new_function():\n    pass" if language == "python" else "function newFunction() {\n  return;\n}"

        if line_lower.endswith("cl"):
            return "class NewClass:\n    def __init__(self):\n        pass" if language == "python" else "class NewClass {\n  constructor() {}\n}"

        if line_lower.endswith("im"):
            return "import os" if language == "python" else "import { } from '';"

        # Default suggestion based on what's commonly needed
        if language == "python":
            return "# Your code here"
        else:
            return "// Your code here"
