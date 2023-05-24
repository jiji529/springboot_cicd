@echo off
setlocal

rem bundle vue.js to dist
set "_vcs=node_modules\@vue\cli-service\bin\vue-cli-service.js"
set "_dist=%workspace%\dist_ready"
"%_node%" "%_vcs%" build --dest="%_dist%"

rem replace old dist with new one and preserve php
if not exist "%workspace%\fetch.ftp" copy "fetch.ftp" "%workspace%\fetch.ftp"
if not exist "%workspace%\WinSCP.com" copy "WinSCP.com" "%workspace%\WinSCP.com"
if not exist "%workspace%\WinSCP.exe" copy "WinSCP.exe" "%workspace%\WinSCP.exe"
cd %workspace%
move dist\api dist_ready\api
rd /s /q dist
move dist_ready dist

rem update php if required
winscp.com /ini=nul /script=fetch.ftp

endlocal
exit /b %errorlevel%
