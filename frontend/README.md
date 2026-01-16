# Blog Platform Frontend

React frontend application for the Blog Platform with AI Writing Assistant.

## Features

- User Authentication (Signup, Login, Logout)
- Profile Management
- Blog CRUD Operations
- AI Writing Assistant (Enhancement, Grammar, Summarize, Title Suggestions)
- Blog Search (by title, tag, author)
- Responsive Design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will run on http://localhost:3000

## API Configuration

The app connects to the Spring Boot backend running on http://localhost:8080
This is configured in `vite.config.js` with proxy settings.

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.
