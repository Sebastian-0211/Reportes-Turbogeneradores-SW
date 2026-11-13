@echo off
title Turbomachine Orbit Analyzer - SW
echo ========================================================
echo   Iniciando Reporte de Orbitas Turbogeneradores SW
echo   Modo Local Seguro / SharePoint - 100%% Confidencial
echo ========================================================

:: Prioridad: Si existe el standalone en la raiz, usarlo; sino, dist\index.html
if exist "%~dp0Reporte_Turbogeneradores_Standalone.html" (
    set "APP_PATH=%~dp0Reporte_Turbogeneradores_Standalone.html"
) else (
    set "APP_PATH=%~dp0dist\index.html"
)

:: Flags para permitir ejecucion local sin restricciones CORS en protocolo file://
set "EDGE_FLAGS=--allow-file-access-from-files --user-data-dir="%TEMP%\turbomachine_edge_app" --app="file:///%APP_PATH%""

:: Intentar abrir en Microsoft Edge en modo aplicación
where msedge >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start msedge %EDGE_FLAGS%
    goto :fin
)

if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" %EDGE_FLAGS%
    goto :fin
)

if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" %EDGE_FLAGS%
    goto :fin
)

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files --user-data-dir="%TEMP%\turbomachine_chrome_app" --app="file:///%APP_PATH%"
    goto :fin
)

:: Fallback: abrir en el navegador predeterminado
start "" "%APP_PATH%"

:fin
exit
