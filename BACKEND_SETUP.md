# Backend & Blog Editor Setup Guide

## 🎯 Overview

You now have a **production-ready blog backend** imported from Amit Kumar's portfolio. This includes:

- ✅ **Admin Dashboard** at `/admin` with authentication
- ✅ **Rich Text Editor** with Markdown support & live preview
- ✅ **Blog Post CRUD** API routes (`/api/admin/posts`)
- ✅ **Image Upload** endpoint (`/api/admin/upload`)
- ✅ **Better Auth** integration for secure admin access
- ✅ **Supabase** PostgreSQL database integration
- ✅ **Rate Limiting** & input validation
- ✅ **SEO Metadata** management per post

---

## 📦 Step 1: Install Dependencies

Run the following command to install all required packages:

```bash
npm install
# or
pnpm install
```

**New dependencies added:**
- `better-auth` - Authentication system
- `zod` - Input validation
- `@tiptap/*` - Rich text editor packages
- `@notionhq/client` - Optional Notion integration

---

## 🗄️ Step 2: Set Up Supabase Database

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Note your **Project URL** and **API Keys** from Settings → API

### 2.2 Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Posts table
CREATE TABLE IF NOT EXISTS post (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  "coverImage" TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  tags TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "authorId" TEXT NOT NULL,
  "publishedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Better Auth tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_status ON post(status);
CREATE INDEX IF NOT EXISTS idx_post_published_at ON post("publishedAt");
CREATE INDEX IF NOT EXISTS idx_post_slug ON post(slug);
CREATE INDEX IF NOT EXISTS idx_post_author ON post("authorId");
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE post ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post table
CREATE POLICY "Public can read published posts" ON post
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can manage their posts" ON post
  FOR ALL USING (auth.uid()::text = "authorId");

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- RLS Policies for sessions table
CREATE POLICY "Users can manage own sessions" ON sessions
  FOR ALL USING (auth.uid()::text = user_id);

-- RLS Policies for accounts table
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (auth.uid()::text = user_id);
```

### 2.3 Create Admin User

Run this SQL to create your admin user (update email/name):

```sql
INSERT INTO users (id, name, email, email_verified, image)
VALUES (
  'admin-uuid-here', -- Generate with: SELECT uuid_generate_v4();
  'Amit Kumar',
  'hi@iamamitkumar.dev',
  TRUE,
  'https://avatars.githubusercontent.com/u/16732608?v=4'
);
```

---

## 🔐 Step 3: Configure Environment Variables

Create or update your `.env` file:

```bash
# ─── Supabase ──────────────────────────────────────────────────────────────
PROJECT_URL=https://your-project.supabase.co
ANON_KEY=your-anon-key-here
SERVICE_ROLE=your-service-role-key-here

# ─── Better Auth ───────────────────────────────────────────────────────────
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:3000

# ─── Optional: Notion Integration ─────────────────────────────────────────
# NOTION_INTEGRATION_SECRET=ntn_your_integration_secret
# NOTION_CONTENT_CALENDAR_DB_ID=your_db_id
```

### Generate Secure Secrets

```bash
# Generate BETTER_AUTH_SECRET
openssl rand -base64 32

# Or use this online: https://generate-secret.vercel.app/32
```

---

## 🚀 Step 4: Start Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit:
- **Blog**: http://localhost:3000/blog
- **Admin Dashboard**: http://localhost:3000/admin
- **Editor**: http://localhost:3000/admin/dashboard/editor/new

---

## ✍️ Step 5: Create Your First Blog Post

### Via Admin Dashboard (Recommended)

1. Go to `/admin/dashboard`
2. Click **"New Post"** or navigate to `/admin/dashboard/editor/new`
3. Fill in the form:
   - **Title**: Your blog post title
   - **Slug**: Auto-generated (e.g., `my-first-post`)
   - **Content**: Write with rich text editor or Markdown
   - **Excerpt**: Brief summary (optional)
   - **Cover Image**: URL to cover image
   - **Tags**: Comma-separated (e.g., `nextjs, react, tutorial`)
   - **Status**: Draft or Published
   - **SEO**: Meta title & description (optional)
4. Click **Save** or **Publish**

### Via API (Advanced)

```bash
curl -X POST http://localhost:3000/api/admin/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "# Hello World\n\nThis is my first blog post!",
    "excerpt": "Welcome to my blog",
    "status": "published",
    "tags": ["hello", "world"],
    "metaTitle": "My First Post | Amit Kumar",
    "metaDescription": "Welcome to my blog"
  }'
```

---

## 📁 File Structure Overview

```
mypersonalportfolio/
├── app/
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx              # Admin login/landing
│   │   └── dashboard/
│   │       ├── page.tsx          # Dashboard home (post list)
│   │       ├── layout.tsx        # Admin layout with auth
│   │       ├── editor/
│   │       │   ├── new/          # Create new post
│   │       │   └── [id]/         # Edit existing post
│   │       └── leads/            # Lead management (optional)
│   ├── api/
│   │   └── admin/
│   │       ├── posts/            # Post CRUD endpoints
│   │       ├── upload/           # Image upload endpoint
│   │       └── leads/            # Lead management (optional)
│   └── blog/
│       ├── page.tsx              # Blog listing
│       └── [slug]/               # Individual post page
├── components/
│   ├── admin/
│   │   └── rich-text-editor.tsx  # TipTap-based editor
│   ├── layout/
│   │   └── container.tsx         # Layout container
│   └── ui/                       # Reusable UI components
├── hooks/
│   └── use-toast.ts              # Toast notifications
├── lib/
│   ├── auth/
│   │   ├── auth.ts               # Better Auth config
│   │   └── authorize.ts          # Auth middleware
│   ├── auth-client.ts            # Client-side auth
│   ├── blog.ts                   # Blog utilities
│   ├── env.ts                    # Environment validation
│   ├── rate-limit.ts             # Rate limiting
│   ├── security.ts               # Input sanitization
│   ├── supabase.ts               # Supabase client
│   └── validation.ts             # Zod schemas
└── types/
    └── supabase.ts               # Database types
```

---

## 🔧 Troubleshooting

### Issue: "Unauthorized" on admin routes

**Solution:**
1. Ensure you have a user in the `users` table
2. Check `BETTER_AUTH_SECRET` is set correctly
3. Clear browser cookies and re-login

### Issue: Database connection errors

**Solution:**
1. Verify `PROJECT_URL`, `ANON_KEY`, `SERVICE_ROLE` in `.env`
2. Check Supabase project is active
3. Ensure RLS policies are configured correctly

### Issue: Editor not loading

**Solution:**
1. Run `npm install` to ensure all TipTap packages are installed
2. Check browser console for errors
3. Clear `.next` cache: `rm -rf .next && npm run dev`

### Issue: Images not uploading

**Solution:**
1. Configure Supabase Storage bucket for images
2. Update `/api/admin/upload/route.ts` with your bucket name
3. Ensure storage policies allow uploads

---

## 🎨 Editor Features

The rich text editor includes:

- ✅ **WYSIWYG editing** with live preview
- ✅ **Markdown support** with syntax highlighting
- ✅ **Split view** (write + preview side-by-side)
- ✅ **Auto-save** every 30 seconds
- ✅ **Unsaved changes warning** before leaving
- ✅ **Image embedding** via URL
- ✅ **Link insertion**
- ✅ **Task lists** & checklists
- ✅ **Code blocks** with language detection
- ✅ **Headings**, bold, italic, underline
- ✅ **SEO metadata** editor

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/posts` | List all posts (paginated) |
| `POST` | `/api/admin/posts` | Create new post |
| `GET` | `/api/admin/posts/:id` | Get single post |
| `PUT` | `/api/admin/posts/:id` | Update post |
| `DELETE` | `/api/admin/posts/:id` | Delete post |
| `POST` | `/api/admin/upload` | Upload image |

---

## 🔒 Security Features

- ✅ **Authentication required** for all admin routes
- ✅ **Rate limiting** (20 req/min for writes, 60 for reads)
- ✅ **Input validation** with Zod schemas
- ✅ **Markdown sanitization** to prevent XSS
- ✅ **Row Level Security** on database tables
- ✅ **CSRF protection** via Better Auth
- ✅ **Session management** with expiry

---

## 📝 Next Steps

1. **Customize the admin UI** - Update branding in `/app/admin/dashboard/layout.tsx`
2. **Add image upload** - Configure Supabase Storage in `/api/admin/upload/route.ts`
3. **Set up Notion sync** - Add Notion integration for content calendar (optional)
4. **Add analytics** - Integrate PostHog/Google Analytics in admin dashboard
5. **Deploy** - Push to Vercel/Netlify with environment variables

---

## 📚 Additional Resources

- [Better Auth Documentation](https://www.better-auth.com)
- [TipTap Editor Documentation](https://tiptap.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Zod Documentation](https://zod.dev)

---

**Need help?** Check the [developerreadme.md](./developerreadme.md) for more details on the full system architecture.