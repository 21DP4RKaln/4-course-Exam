# Prettier Configuration

This project uses Prettier for code formatting to ensure consistent code style across the codebase.

## Configuration Files

- `.prettierrc` - Main Prettier configuration
- `.prettierignore` - Files to exclude from formatting
- VS Code settings in `.vscode/settings.json` - Editor integration

## VS Code Integration

The project is configured to:
- Format on save
- Format on paste
- Use Prettier as the default formatter for supported file types

## Scripts

- `npm run format` - Format all files
- `npm run format:check` - Check if files are properly formatted

## ESLint Integration

The project includes `eslint-config-prettier` and `eslint-plugin-prettier` to ensure Prettier and ESLint work together without conflicts.

## Prettier Rules

- Semi-colons: enabled
- Single quotes: enabled
- Print width: 80 characters
- Tab width: 2 spaces
- Trailing commas: ES5 compatible
- Arrow function parentheses: avoid when possible
