# Example: call live sync every 30s from Task Scheduler or a small VPS loop.
# Set CRON_SECRET in .env.local to match CRON_SECRET on the server.
$base = "http://localhost:3000"
$secret = $env:CRON_SECRET
Invoke-WebRequest -Uri "$base/api/cron/live" -Headers @{ Authorization = "Bearer $secret" } -UseBasicParsing
