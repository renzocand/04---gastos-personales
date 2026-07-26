# Gastos Personales

Aplicación para gestión de gastos personales con OCR y bot de Telegram.

## Arquitectura

- **backend/**: API REST en Spring Boot (Java)
- **frontend/**: SPA en React
- **telegram-bot/**: Bot de Telegram en Python para registro de gastos
- **ocr-service/**: Servicio OCR para procesar boletas

## Configuración

### Variables de entorno

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

Variables requeridas:
- `TELEGRAM_BOT_TOKEN`: Token del bot de Telegram
- `GEMINI_API_KEY`: API key de Google Gemini (https://aistudio.google.com/apikey)
- `GEMINI_MODEL`: Modelo de Gemini (default: `gemini-flash-latest`)

### Docker

```bash
docker compose up -d
```

## Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| frontend | 3080 | Interfaz web |
| backend | 8080 | API REST |
| ocr-service | 8081 | Procesamiento OCR |
| mysql | 3307 | Base de datos |

## Bot de Telegram

El bot permite registrar gastos de dos formas:
1. **Foto de boleta**: Enviar imagen para OCR
2. **Texto**: Enviar mensaje como "237 mantenimiento casa"

Comandos:
- `/start` - Bienvenida
- `/vincular CODIGO` - Vincular cuenta
- `/desvincular` - Desvincular cuenta
- `/estado` - Ver estado de vinculación
