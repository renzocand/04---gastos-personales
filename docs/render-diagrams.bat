@echo off
REM Renderiza TODOS los diagramas .puml de esta carpeta a PNG usando PlantUML.
REM Si agregas un nuevo .puml, este script lo incluye automaticamente.
cd /d "%~dp0"
echo Renderizando todos los .puml en: %cd%
where plantuml >nul 2>&1
if %errorlevel%==0 (
    plantuml -tpng "*.puml"
) else (
    "C:\plantuml\plantuml.exe" -tpng "*.puml"
)
echo.
echo Listo. Se generaron los PNG en la carpeta docs.
