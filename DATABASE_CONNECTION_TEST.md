# Supabase Database Connection Test

This script helps you verify your Green Penny Pal app's connection to Supabase database.

## Method 1: Visual Test (Recommended)

1. Start your development server:
   ```powershell
   npm run dev
   ```

2. Open your browser and navigate to your app
3. You'll see a "Database Connection Test" card on the main page
4. It will automatically test the connection and show:
   - ✅ Connection status
   - 🕐 Response latency
   - 📊 Connection details
   - 🔄 Realtime features test

## Method 2: Manual Environment Check

Check if your environment variables are properly set:

```powershell
# Check if .env file exists and has correct variables
Get-Content .env
```

Expected variables:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY` 
- `VITE_SUPABASE_URL`

## Method 3: CLI Test (Advanced)

```powershell
# Install Supabase CLI if not already installed
npm install -g @supabase/cli

# Test connection to your project
supabase projects list

# Check project status
supabase status --project-ref cyxvsxtxkuqhnnslsfzy
```

## Troubleshooting

### Common Issues:

1. **"No JWT" error**: Normal if not authenticated yet
2. **"Relation does not exist"**: Database tables not created yet - this is OK for testing connection
3. **"Invalid API key"**: Check your .env file
4. **Network errors**: Check internet connection or firewall

### Quick Fixes:

1. **Restart dev server** after changing .env:
   ```powershell
   # Stop server (Ctrl+C), then restart
   npm run dev
   ```

2. **Clear browser cache** if seeing old connection errors

3. **Check Supabase project status** at https://supabase.com/dashboard

## Expected Results

✅ **Successful Connection:**
- Status: Connected
- Latency: < 1000ms
- Can read from database (even if tables are empty)

⚠️ **Partial Connection:**
- Connected to Supabase but tables don't exist yet
- This is normal for new projects

❌ **Failed Connection:**
- Check environment variables
- Verify project is active
- Check network/firewall settings

## Database Tables Status

Your app expects these tables:
- `activities` - For logging eco activities
- `user_profiles` - For user information (created by auth)

If tables don't exist, the connection test will still pass but show a warning that tables need to be created.