# Frontend Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Installation Steps

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file (optional):**
Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:8080/api
```

4. **Start development server:**
```bash
npm run dev
```

The application will run on `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Features Implemented

### Authentication
- User signup with profile image upload
- User login with JWT tokens
- Protected routes
- Token refresh handling

### User Profile
- View profile with AI usage statistics
- Edit profile (username, email, bio, website, mobile)
- Update profile image

### Blog Management
- Create new blog posts
- Edit existing blogs
- Publish drafts
- Delete blogs
- View published blogs (public)
- View own drafts and published blogs

### AI Writing Assistant
- Writing enhancement
- Grammar correction
- Content summarization
- Title suggestions
- Daily usage tracking

### Search
- Search blogs by title
- Search blogs by tag
- Search blogs by author
- Pagination support

## API Integration

The frontend connects to the Spring Boot backend running on `http://localhost:8080`.

Make sure the backend is running before starting the frontend.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── auth/        # Authentication components
│   │   ├── blog/        # Blog management components
│   │   ├── ai/          # AI assistant components
│   │   ├── profile/     # Profile management components
│   │   ├── search/      # Search components
│   │   └── layout/      # Layout components (Navbar, etc.)
│   ├── context/         # React Context (AuthContext)
│   ├── services/        # API service layer
│   ├── utils/           # Utility functions (API config)
│   ├── pages/           # Page components
│   ├── App.jsx          # Main App component
│   └── main.jsx         # Entry point
├── package.json
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## Technologies Used

- **React 18** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Query (TanStack Query)** - Data fetching and caching
- **React Hot Toast** - Notifications
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **date-fns** - Date formatting

## Troubleshooting

### CORS Issues
If you encounter CORS issues, make sure:
1. Backend CORS configuration allows requests from `http://localhost:3000`
2. Frontend proxy is configured correctly in `vite.config.js`

### Token Refresh Issues
If token refresh fails:
1. Check browser console for errors
2. Verify refresh token endpoint is working in backend
3. Check localStorage for stored tokens

### Image Upload Issues
- Ensure backend file storage directory exists
- Check file size limits (default: 10MB)
- Verify multipart/form-data is being sent correctly
