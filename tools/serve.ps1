# Serves Looks Good on 127.0.0.1 with Windows PowerShell 5.1+ (no Python needed) and opens the browser.
# Usage: powershell -ExecutionPolicy Bypass -File tools\serve.ps1 [-Port 8765] [-NoBrowser]
param([int]$Port = 8765, [switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$types = @{
  '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8'
  '.json'='application/json; charset=utf-8'; '.svg'='image/svg+xml'; '.woff2'='font/woff2'; '.woff'='font/woff'
  '.ttf'='font/ttf'; '.otf'='font/otf'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.png'='image/png'
  '.txt'='text/plain; charset=utf-8'; '.md'='text/plain; charset=utf-8'
}
$listener = $null
foreach ($p in $Port..($Port + 20)) {
  $l = New-Object System.Net.HttpListener
  $l.Prefixes.Add("http://127.0.0.1:$p/")
  try { $l.Start(); $listener = $l; $Port = $p; break } catch { $l.Close() }
}
if (-not $listener) { Write-Host "Could not find a free port near $Port."; exit 1 }
$url = "http://127.0.0.1:$Port/"
Write-Host "Looks Good is running at $url"
Write-Host "Leave this window open while you use it. Close it to stop."
if (-not $NoBrowser) { Start-Process $url }
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $res = $ctx.Response
  try {
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq '' -or $rel.EndsWith('/')) { $rel += 'index.html' }
    $path = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not $path.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($path)) {
      $res.StatusCode = 404
    } else {
      $ext = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
      $res.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
      $res.Headers.Add('Cache-Control', 'no-cache')
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $res.ContentLength64 = $bytes.Length
      if ($ctx.Request.HttpMethod -ne 'HEAD') { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
    }
  } catch { try { $res.StatusCode = 500 } catch {} }
  finally { try { $res.OutputStream.Close() } catch {} }
}
