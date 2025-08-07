# PolicyEngine pulse

Team meeting coordination hub with standup timers and weekly surveys.

## Setup

### Database setup

1. Run `npm run setup` to get the SQL schema
2. Go to your Supabase SQL editor
3. Paste and run the SQL to create tables

### Local development

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials
3. Run `npm install`
4. Run `npm run dev`

## Deployment

The app automatically deploys to GitHub Pages when you push to main. Make sure you've:
1. Enabled GitHub Pages in repository settings (source: GitHub Actions)
2. Set up the database tables in Supabase

The app will be available at `https://[your-username].github.io/pulse/`