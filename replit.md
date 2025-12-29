# Ebon Shop

## Overview

Ebon Shop is a digital marketplace application with a dark/minimal theme. It provides a credit-based purchasing system where users can buy digital items (instant delivery or sequential delivery), manage support tickets, and redeem voucher codes. The application features role-based access control with admin and user roles, where the first registered user automatically becomes an admin.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Routing**: React Router DOM v7 with HashRouter for client-side navigation
- **Styling**: Tailwind CSS loaded via CDN with custom CSS for dark theme, glow effects, and smooth transitions
- **Build Tool**: Vite for development and production builds
- **Icons**: Lucide React for consistent iconography

### State Management
- Local component state using React useState/useEffect hooks
- User session persisted in localStorage (`ebon_shop_user` key)
- Periodic polling (5-second interval) to sync user credits from the database

### Data Layer (Dual Implementation)
The codebase contains two data approaches:

1. **Client-side LocalStorage DB** (`db.ts`):
   - Simple persistence layer using browser localStorage
   - Stores users, items, purchases, transactions, redeem codes, and tickets
   - Used by the frontend React components directly

2. **Server-side PostgreSQL** (`server/` directory):
   - Express.js backend with PostgreSQL via `pg` driver
   - RESTful API routes for auth and items
   - JWT-based authentication with httpOnly cookies
   - Database schema includes users, items, and purchases tables

### Authentication
- Client-side: Plain password comparison (stored as `passwordHash` but compared directly)
- Server-side: bcrypt password hashing with JWT tokens for session management
- First registered user automatically receives admin role

### Core Features
- **Item Types**: Instant delivery (single content) and Sequential delivery (ordered content pages)
- **Credit System**: Users purchase items using credits, can redeem voucher codes
- **Ticket System**: Support ticket creation and messaging between users and admins
- **Admin Panel**: Manage items, users, billing transactions, redeem codes, and tickets

### Page Structure
- `/login` - User authentication
- `/register` - New user registration
- `/items` - Browse and purchase items
- `/profile` - User identity, voucher redemption, purchase history
- `/tickets` - Support ticket management
- `/admin` - Admin dashboard (admin role only)
- `/verify-email` - Email verification flow

## External Dependencies

### Frontend Dependencies
- `react` / `react-dom` - UI framework
- `react-router-dom` - Client-side routing
- `lucide-react` - Icon library

### Backend Dependencies
- `express` - HTTP server framework
- `pg` - PostgreSQL client
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cookie-parser` - Cookie handling
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### External Services
- **Gemini API**: API key configured via environment variable (`GEMINI_API_KEY`) - purpose unclear from current codebase
- **PostgreSQL Database**: Required for server-side data persistence (connection via `DATABASE_URL` environment variable)

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - JWT signing secret (falls back to 'fallback_secret')
- `GEMINI_API_KEY` - Gemini API key (exposed to frontend via Vite config)