# TanStack Start + Supabase + Drizzle Blog Application

A little demo based on (Tanstack Start Supabase Basic Example)[https://github.com/tanstack/router/tree/main/examples/react/start-supabase-basic]. Using Drizzle for database schema management.

## 🚀 Demo Features

### Current Features

- **User Authentication** - Signup, login, email confirmation, Google OAuth
- **Content Management** - Create, read, update, delete posts
- **Post Status Management** - Draft, published, and archived states
- **Tag System** - Create and assign tags to posts with autocomplete
- **Row Level Security** - Database-level security policies
- **Server-side Data Fetching** - Optimized post retrieval
- **Client-side Data Fetching** - Real-time tag search
- **Database Migrations** - Version-controlled schema changes
- **User Profiles** - Extended user information and customization
- **Image Upload** - Media management and retrieval
- **Shadcn UI** - Enhanced UI components

### Future Roadmap

- **Rich Text Editor** - Enhanced content creation experience
- **Post Search** - Full-text search capabilities
- **Social Features** - Comments, likes, and user interactions

## 🛠️ Technology Stack

### Core Framework

- **[TanStack Start](https://tanstack.com/start)** - Full-stack React framework with file-based routing
- **[TanStack Router](https://tanstack.com/router)** - Type-safe client and server-side routing
- **[React 19](https://react.dev/)** - Latest React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Strict type safety throughout

### Backend & Database

- **[Supabase](https://supabase.com/)** - Authentication and PostgreSQL database
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database operations
- **PostgreSQL** - Robust relational database with RLS

### Styling & UI

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling framework
- **Dark Mode Support** - Complete dark/light theme implementation
- **Responsive Design** - Mobile-first responsive layouts

## 📋 Database Schema

### Tables

#### `posts`

Primary content table with Row Level Security

```sql
- id: UUID (Primary Key)
- title: VARCHAR(255) NOT NULL
- body: TEXT
- user_id: UUID (Foreign Key to auth.users)
- status: ENUM('draft', 'published', 'archived') DEFAULT 'draft'
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
```

**RLS Policies:**

- Users can create, read, update, delete their own posts
- Public can read posts with status = 'published'

#### `tags`

Categorization system for posts

```sql
- id: UUID (Primary Key)
- name: VARCHAR(100) UNIQUE NOT NULL
- slug: VARCHAR(100) UNIQUE NOT NULL
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
```

**RLS Policies:**

- Public read and write access (anyone can create/use tags)

#### `posts_tags`

Many-to-many relationship table

```sql
- post_id: UUID (Foreign Key to posts)
- tag_id: UUID (Foreign Key to tags)
- created_at: TIMESTAMP DEFAULT NOW()
```

#### `profiles`

Extended user information

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to auth.users)
- name: VARCHAR(255)
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
```

## 🏗️ Application Architecture

### Route Structure

#### Public Routes

- `/` - Home page with published posts
- `/posts/[id]` - Individual post view
- `/login` - User authentication
- `/signup` - User registration
- `/signup-success` - Registration confirmation
- `/auth/callback` - Email confirmation handler

#### Protected Routes (`_authed/`)

- `/my-posts` - Post management dashboard
- `/my-posts/new` - Create new post
- `/my-posts/[postId]` - Edit existing post

### Server Functions

#### Authentication (`src/utils/auth.ts`)

- `loginFn` - Email/password authentication
- `signupFn` - User registration with profile creation
- `exchangeCodeFn` - Email confirmation processing

#### Posts (`src/utils/posts.ts`)

- `fetchPost` - Retrieve single post with tags
- `fetchMyPosts` - Get user's posts for dashboard
- `fetchPublicPosts` - Get published posts for home page
- `createPost` - Create new post with tag relationships
- `updatePost` - Update post and manage tags
- `deletePost` - Delete post with cascade operations

#### Tags (`src/utils/tags.ts`)

- `searchTags` - Autocomplete search for existing tags
- `createTag` - Create new tag with slug generation
- `updatePostTags` - Manage post-tag relationships

### Key Components

#### `PostForm` (`src/components/PostForm.tsx`)

Comprehensive form component for post creation and editing

- Form validation and error handling
- Tag management with autocomplete
- Status selection (draft/published/archived)
- Real-time save indicators

#### `TagsInput` (`src/components/TagsInput.tsx`)

Advanced tag input with search capabilities

- Autocomplete with keyboard navigation
- Create new tags on-the-fly
- Visual tag management interface

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- Supabase account and project
- PostgreSQL database (via Supabase)

### Environment Setup

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgresql_connection_string

# Optional: Google OAuth (leave empty to disable Google sign-in)
VITE_GOOGLE_OAUTH_ENABLED=true
```

### Installation

1. **Clone and install dependencies**

```bash
git clone <repository-url>
cd start-supabase-app
yarn install
```

2. **Set up database**

```bash
# Generate migration files from schema
yarn db:generate

# Push schema to database (for development)
yarn db:push

# Or run migrations (for production)
yarn db:migrate

# Generate Supabase types from schema
yarn supabase:gen
```

3. **Start development server**

```bash
yarn dev
```

Visit `http://localhost:3000` to see the application.

## 📜 Development Commands

### Core Development

```bash
yarn dev          # Start development server on port 3000
yarn build        # Build for production (includes TypeScript checking)
yarn start        # Start production server
```

### Database Management (Drizzle ORM)

```bash
yarn db:generate  # Generate SQL migrations from schema changes
yarn db:push      # Push schema changes directly to database (development)
yarn db:migrate   # Run pending migrations (production)
yarn db:studio    # Open Drizzle Studio for database management
yarn supabase:gen # Generate Supabase types from schema
```

### Code Quality

```bash
yarn biome:fix    # Format and fix code issues with Biome
```

## 🔐 Authentication Flow

1. **Registration Process**
   - User provides email, password, and name
   - Email confirmation sent via Supabase Auth
   - User profile created after email verification
   - Alternative: Google OAuth sign-up (if enabled)

2. **Login Process**
   - Email/password authentication via Supabase
   - Google OAuth authentication (if enabled)
   - Session stored in HTTP-only cookies
   - User context available throughout application

3. **Route Protection**
   - `_authed.tsx` guards protected routes
   - Automatic redirect to login for unauthenticated users
   - Server-side session validation on every request

### Google OAuth Setup (Optional)

To enable Google authentication:

1. **Google Cloud Console Setup**
   - Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs:
     - `https://your-supabase-project.supabase.co/auth/v1/callback`

2. **Supabase Configuration**
   - Go to Authentication > Providers > Google in your Supabase dashboard
   - Enable Google provider
   - Enter your Google Client ID and Client Secret
   - Add your site URL to authorized redirect URLs

3. **Environment Variables**

   ```env
   VITE_GOOGLE_OAUTH_ENABLED=true
   ```

4. **Test the Setup**
   - The Google sign-in button will appear on login/signup pages
   - Users can authenticate with their Google accounts
   - Profiles are automatically created for OAuth users

## 🎨 UI/UX Features

### Design System

- **Responsive Layout** - Mobile-first design approach
- **Dark Mode** - Complete dark/light theme support
- **Loading States** - Proper feedback for async operations
- **Error Handling** - User-friendly error messages and boundaries

### User Experience

- **Real-time Updates** - Optimistic UI updates
- **Keyboard Navigation** - Full keyboard accessibility
- **Form Validation** - Client and server-side validation
- **SEO Optimization** - Proper meta tags and structured data

## 🔄 Data Flow Patterns

### Server-Side Rendering

- Initial page load with server-fetched data
- SEO-friendly content delivery
- Optimized performance with TanStack Start

### Client-Side Interactions

- Optimistic updates for better UX
- Real-time search and filtering
- Progressive enhancement approach

## 🧪 Testing & Quality

### Type Safety

- Strict TypeScript configuration
- Database schema types generated by Drizzle
- End-to-end type safety from database to UI

### Development Tools

- TanStack Router Devtools
- Hot module replacement
- Comprehensive error boundaries

## 📚 Learning Resources

This project demonstrates:

- Modern full-stack TypeScript development
- Database-first development with type safety
- Authentication patterns with Supabase
- Server-side rendering with client-side interactivity
- Progressive enhancement strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [TanStack](https://tanstack.com/) for the incredible React ecosystem
- [Supabase](https://supabase.com/) for backend-as-a-service
- [Drizzle](https://orm.drizzle.team/) for type-safe database operations
- [Tailwind CSS](https://tailwindcss.com/) for rapid UI development
