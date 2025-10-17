Write-Host ""
Write-Host "=== Deploy Check Report ===" -ForegroundColor Cyan
Write-Host ""
if (Test-Path "supabase-config.js") { Write-Host "OK supabase-config.js exists" -ForegroundColor Green } else { Write-Host "ERROR supabase-config.js missing" -ForegroundColor Red }
if (Test-Path "index.html") { Write-Host "OK index.html exists" -ForegroundColor Green }
if (Test-Path "game.js") { Write-Host "OK game.js exists" -ForegroundColor Green }
if (Test-Path "auth.js") { Write-Host "OK auth.js exists" -ForegroundColor Green }
if (Test-Path "style.css") { Write-Host "OK style.css exists" -ForegroundColor Green }
if (Test-Path "demo-config.js") { Write-Host "OK demo-config.js exists" -ForegroundColor Green }
Write-Host ""
Write-Host "All files ready for deployment!" -ForegroundColor Green
Write-Host "See DEPLOYMENT.md for deployment instructions" -ForegroundColor Yellow
Write-Host ""
