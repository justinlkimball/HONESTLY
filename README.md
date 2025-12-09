# HONESTLY

## Setup

### Supabase Configuration

This project uses Supabase as its backend. To get started:

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

The `.env` file has been pre-configured with the project credentials and is gitignored for security.

## Environment Variables

- `SUPABASE_URL`: The URL of your Supabase project
- `SUPABASE_ANON_KEY`: The anonymous/public key for client-side access