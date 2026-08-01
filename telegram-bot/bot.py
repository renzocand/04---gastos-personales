#!/usr/bin/env python3
"""
Bot de Telegram para procesar boletas con OCR.

Comandos:
- /start - Mensaje de bienvenida
- /vincular CODIGO - Vincula tu cuenta de gastos
- /desvincular - Desvincula esta cuenta de Telegram
- /estado - Muestra si estás vinculado

Uso:
- Envía una foto de tu boleta y el bot la procesará automáticamente
- Envía un mensaje de texto con el gasto (ej: "parrillada 45 soles")
"""

import os
import logging
import uuid
import re
import json
from datetime import date
import httpx
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters,
)
from telegram.request import HTTPXRequest

# Configuración
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
OCR_SERVICE_URL = os.getenv("OCR_SERVICE_URL", "http://localhost:8081")
BACKEND_URL = os.getenv("GASTOS_BACKEND_URL", "http://localhost:8080")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

# Template del prompt para procesar gastos de texto (las categorías se inyectan dinámicamente)
TEXT_EXPENSE_PROMPT_TEMPLATE = """Analiza este mensaje de texto que describe uno o más gastos y extrae la información.

CATEGORÍAS DEL USUARIO (usa SOLO estos IDs exactos):
{categories_section}

MONEDAS:
- PEN: Soles peruanos (indicado por: "soles", "S/", "S/.", o sin especificar)
- USD: Dólares americanos (indicado por: "dolares", "dólares", "$", "USD")

INSTRUCCIONES:
1. Identifica cada gasto mencionado (puede ser uno o varios)
2. Extrae el monto de cada gasto. Acepta formatos como:
   - Soles: "45 soles", "S/30", "S/.50", "25.50"
   - Dólares: "$30", "30 dolares", "8 USD"
3. Detecta la moneda de cada gasto (PEN o USD). Si no se especifica, asume PEN.
4. Usa como descripción el nombre del producto/servicio mencionado
5. Asigna la categoría más apropiada según las descripciones del usuario
6. Si no hay tienda específica, usa "Manual" como vendor
7. La fecha es hoy: {today}

RESPONDE ÚNICAMENTE con JSON válido, sin markdown ni explicaciones:
{{"vendor":"nombre o Manual","date":"{today}","currency":"PEN o USD","items":[{{"description":"descripción","amount":0.00,"categoryId":"categoria_id"}}],"total":0.00}}

IMPORTANTE: Si hay gastos en diferentes monedas, usa la moneda del primer gasto. Todos los items deben estar en la misma moneda.

MENSAJE A ANALIZAR:
{message}"""

# Logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# Almacenamiento temporal de boletas pendientes de confirmación
# Cada entrada incluye: ocr_data y categories (lista de categorías del usuario)
pending_receipts = {}

# Cache de categorías por telegram_id (TTL simple de 5 minutos)
_categories_cache = {}
_categories_cache_time = {}
CATEGORIES_CACHE_TTL = 300  # 5 minutos


async def get_user_categories(telegram_id: int) -> list[dict]:
    """Obtiene las categorías del usuario desde el backend."""
    import time

    # Verificar cache
    cache_key = str(telegram_id)
    if cache_key in _categories_cache:
        if time.time() - _categories_cache_time.get(cache_key, 0) < CATEGORIES_CACHE_TTL:
            return _categories_cache[cache_key]

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_URL}/api/telegram/categories/{telegram_id}",
                timeout=30.0,
            )

            if response.status_code == 200:
                categories = response.json()
                # Guardar en cache
                _categories_cache[cache_key] = categories
                _categories_cache_time[cache_key] = time.time()
                return categories
            else:
                logger.warning(f"Failed to get categories for telegram_id {telegram_id}: {response.status_code}")
                return []

    except httpx.RequestError as e:
        logger.error(f"Error getting user categories: {e}")
        return []


def build_categories_prompt_section(categories: list[dict]) -> str:
    """Construye la sección de categorías para el prompt de Gemini."""
    if not categories:
        # Fallback a categorías por defecto si no hay categorías del usuario
        return """- other: Otro (gastos generales)"""

    lines = []
    for cat in categories:
        cat_id = cat.get("id", "")
        name = cat.get("name", "")
        description = cat.get("description", "")
        if description:
            lines.append(f"- {cat_id}: {name} ({description})")
        else:
            lines.append(f"- {cat_id}: {name}")

    return "\n".join(lines)


def build_category_names_map(categories: list[dict]) -> dict[str, str]:
    """Construye un mapa de id -> nombre para mostrar en mensajes."""
    return {cat.get("id", ""): cat.get("name", cat.get("id", "")) for cat in categories}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Mensaje de bienvenida."""
    user = update.effective_user
    await update.message.reply_text(
        f"¡Hola {user.first_name}!\n\n"
        "Soy el bot de Gastos Personales. Puedo procesar tus gastos automáticamente.\n\n"
        "*Cómo empezar:*\n"
        "1. Ve a la web y genera un código de vinculación\n"
        "2. Envíame: /vincular CODIGO\n"
        "3. ¡Listo!\n\n"
        "*Uso:*\n"
        "- Envía una *foto* de tu boleta (OCR automático)\n"
        "- O escribe tu gasto: `parrillada 45 soles`\n"
        "- Soporta soles y dólares: `netflix 8 dolares`\n\n"
        "*Comandos:*\n"
        "/vincular CODIGO - Vincula tu cuenta\n"
        "/desvincular - Desvincula esta cuenta\n"
        "/estado - Ver estado de vinculación",
        parse_mode="Markdown",
    )


async def vincular(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Vincula la cuenta de Telegram con la cuenta de gastos."""
    if not context.args:
        await update.message.reply_text(
            "❌ Uso: /vincular CODIGO\n\n"
            "Genera el código en la web, en Configuración > Telegram."
        )
        return

    code = context.args[0].upper()
    user = update.effective_user

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BACKEND_URL}/api/telegram/link",
                json={
                    "code": code,
                    "telegramId": user.id,
                    "telegramUsername": user.username,
                    "telegramName": user.full_name,
                },
                timeout=30.0,
            )

            if response.status_code == 200:
                data = response.json()
                await update.message.reply_text(
                    f"✅ ¡Vinculado correctamente!\n\n"
                    f"Hola {data['firstName']} {data['lastName']}.\n"
                    f"Ahora puedes enviarme fotos de tus boletas."
                )
            elif response.status_code == 404:
                await update.message.reply_text(
                    "❌ Código inválido o expirado.\n"
                    "Genera uno nuevo en la web."
                )
            elif response.status_code == 400:
                error = response.json().get("message", "Error desconocido")
                await update.message.reply_text(f"❌ {error}")
            else:
                await update.message.reply_text(
                    "❌ Error al vincular. Intenta de nuevo."
                )

    except httpx.RequestError as e:
        logger.error(f"Error connecting to backend: {e}")
        await update.message.reply_text(
            "❌ No pude conectar con el servidor. Intenta más tarde."
        )


async def desvincular(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Desvincula esta cuenta de Telegram."""
    user = update.effective_user

    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{BACKEND_URL}/api/telegram/unlink-by-telegram/{user.id}",
                timeout=30.0,
            )

            if response.status_code == 204:
                await update.message.reply_text(
                    "✅ Cuenta desvinculada.\n"
                    "Ya no recibirás confirmaciones de gastos aquí."
                )
            elif response.status_code == 404:
                await update.message.reply_text(
                    "ℹ️ Esta cuenta de Telegram no está vinculada."
                )
            else:
                await update.message.reply_text(
                    "❌ Error al desvincular. Intenta de nuevo."
                )

    except httpx.RequestError as e:
        logger.error(f"Error connecting to backend: {e}")
        await update.message.reply_text(
            "❌ No pude conectar con el servidor. Intenta más tarde."
        )


async def estado(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Muestra el estado de vinculación."""
    user = update.effective_user

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BACKEND_URL}/api/telegram/user/{user.id}",
                timeout=30.0,
            )

            if response.status_code == 200:
                data = response.json()
                await update.message.reply_text(
                    f"✅ *Cuenta vinculada*\n\n"
                    f"Usuario: {data['firstName']} {data['lastName']}\n"
                    f"DNI: {data['dni']}\n\n"
                    "Envía una foto de boleta para procesarla.",
                    parse_mode="Markdown",
                )
            elif response.status_code == 404:
                await update.message.reply_text(
                    "❌ *No estás vinculado*\n\n"
                    "Usa /vincular CODIGO para vincular tu cuenta.",
                    parse_mode="Markdown",
                )
            else:
                await update.message.reply_text(
                    "❌ Error al consultar estado."
                )

    except httpx.RequestError as e:
        logger.error(f"Error connecting to backend: {e}")
        await update.message.reply_text(
            "❌ No pude conectar con el servidor."
        )


async def process_photo(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Procesa una foto de boleta."""
    user = update.effective_user

    # Verificar vinculación
    try:
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                f"{BACKEND_URL}/api/telegram/user/{user.id}",
                timeout=30.0,
            )

            if user_response.status_code != 200:
                await update.message.reply_text(
                    "❌ Primero debes vincular tu cuenta.\n"
                    "Usa: /vincular CODIGO"
                )
                return

            user_data = user_response.json()

    except httpx.RequestError as e:
        logger.error(f"Error checking user: {e}")
        await update.message.reply_text("❌ Error de conexión. Intenta más tarde.")
        return

    # Obtener categorías del usuario
    categories = await get_user_categories(user.id)
    if not categories:
        await update.message.reply_text(
            "❌ No se pudieron obtener tus categorías.\n"
            "Intenta de nuevo más tarde."
        )
        return

    # Obtener la foto de mayor resolución
    photo = update.message.photo[-1]

    await update.message.reply_text("📸 Procesando tu boleta... esto puede tomar unos minutos.")

    try:
        # Descargar la foto
        photo_file = await photo.get_file()
        photo_bytes = await photo_file.download_as_bytearray()

        # Enviar al servicio OCR
        async with httpx.AsyncClient(timeout=httpx.Timeout(600.0)) as client:
            files = {"image": ("boleta.jpg", bytes(photo_bytes), "image/jpeg")}
            ocr_response = await client.post(
                f"{OCR_SERVICE_URL}/api/ocr/process",
                files=files,
            )

            if ocr_response.status_code != 200:
                await update.message.reply_text(
                    "❌ Error procesando la imagen. Intenta con otra foto."
                )
                return

            ocr_data = ocr_response.json()

        # Generar UUID para esta boleta
        receipt_id = str(uuid.uuid4())

        # Guardar datos en almacenamiento temporal (incluye categorías para uso posterior)
        pending_receipts[receipt_id] = {
            "data": ocr_data,
            "categories": categories
        }

        # Construir mapa de nombres de categorías
        category_names = build_category_names_map(categories)

        # Mostrar resultado
        items_text = "\n".join(
            f"  • {item['description']}: S/ {item['amount']:.2f} — {category_names.get(item['categoryId'], item['categoryId'])}"
            for item in ocr_data.get("items", [])
        )

        result_message = (
            f"✅ *Boleta procesada*\n\n"
            f"🏪 *Tienda:* {ocr_data.get('vendor', 'No detectado')}\n"
            f"📅 *Fecha:* {ocr_data.get('date', 'No detectada')}\n"
            f"💰 *Total:* S/ {ocr_data.get('total', 0):.2f}\n\n"
            f"📝 *Items:*\n{items_text if items_text else '  No se detectaron items'}\n\n"
            f"⏱️ Procesado en {ocr_data.get('processingTimeMs', 0) / 1000:.1f}s"
        )

        # Crear inline keyboard con botones de confirmación
        if ocr_data.get("items"):
            keyboard = [
                [
                    InlineKeyboardButton("✅ Guardar", callback_data=f"save:{receipt_id}"),
                    InlineKeyboardButton("✏️ Corregir categoría", callback_data=f"fix_category:{receipt_id}"),
                ],
                [
                    InlineKeyboardButton("❌ Cancelar", callback_data=f"cancel:{receipt_id}"),
                ]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            await update.message.reply_text(result_message, parse_mode="Markdown", reply_markup=reply_markup)
        else:
            await update.message.reply_text(result_message, parse_mode="Markdown")

    except httpx.RequestError as e:
        logger.error(f"Error processing photo: {e}")
        await update.message.reply_text(
            "❌ Error procesando la imagen. El servicio OCR no responde."
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        await update.message.reply_text(
            "❌ Error inesperado. Intenta de nuevo."
        )


async def call_gemini_for_text(message_text: str, categories: list[dict]) -> dict:
    """Llama a Gemini para procesar un mensaje de texto como gasto."""
    today = date.today().isoformat()
    categories_section = build_categories_prompt_section(categories)
    prompt = TEXT_EXPENSE_PROMPT_TEMPLATE.format(
        today=today,
        message=message_text,
        categories_section=categories_section
    )

    request_body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 2048
        }
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            url,
            json=request_body,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code != 200:
            logger.error(f"Gemini API error: {response.status_code} - {response.text}")
            raise Exception(f"Gemini API error: {response.status_code}")

        data = response.json()

        # Verificar errores
        if "error" in data:
            raise Exception(f"Gemini error: {data['error'].get('message', 'Unknown')}")

        # Extraer texto de respuesta
        candidates = data.get("candidates", [])
        if not candidates:
            raise Exception("No candidates in Gemini response")

        text = candidates[0]["content"]["parts"][0]["text"]
        logger.info(f"Gemini raw response for text expense: {text}")

        # Extraer JSON de la respuesta
        json_str = extract_json_from_text(text)
        return json.loads(json_str)


def extract_json_from_text(text: str) -> str:
    """Extrae JSON válido del texto de respuesta."""
    # Remover bloques de código markdown si existen
    cleaned = re.sub(r'```json\s*', '', text)
    cleaned = re.sub(r'```\s*', '', cleaned).strip()

    # Encontrar el JSON
    start = cleaned.find('{')
    end = cleaned.rfind('}')

    if start == -1 or end == -1 or end < start:
        raise ValueError(f"No valid JSON found in response: {text}")

    return cleaned[start:end + 1]


async def process_text_expense(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Procesa un mensaje de texto como gasto."""
    user = update.effective_user
    message_text = update.message.text.strip()

    # Ignorar mensajes muy cortos o que no parecen gastos
    if len(message_text) < 3:
        return

    # Verificar si parece un gasto (contiene números)
    if not re.search(r'\d', message_text):
        # No tiene números, probablemente no es un gasto
        await update.message.reply_text(
            "Para registrar un gasto, incluye el monto.\n"
            "Ejemplos:\n"
            "  `parrillada 45 soles`\n"
            "  `taxi S/15`\n"
            "  `netflix 8 dolares`",
            parse_mode="Markdown"
        )
        return

    # Verificar API key de Gemini
    if not GEMINI_API_KEY:
        await update.message.reply_text(
            "❌ La función de gastos por texto no está configurada.\n"
            "Contacta al administrador."
        )
        return

    # Verificar vinculación y obtener categorías
    try:
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                f"{BACKEND_URL}/api/telegram/user/{user.id}",
                timeout=30.0,
            )

            if user_response.status_code != 200:
                await update.message.reply_text(
                    "❌ Primero debes vincular tu cuenta.\n"
                    "Usa: /vincular CODIGO"
                )
                return

    except httpx.RequestError as e:
        logger.error(f"Error checking user: {e}")
        await update.message.reply_text("❌ Error de conexión. Intenta más tarde.")
        return

    # Obtener categorías del usuario
    categories = await get_user_categories(user.id)
    if not categories:
        await update.message.reply_text(
            "❌ No se pudieron obtener tus categorías.\n"
            "Intenta de nuevo más tarde."
        )
        return

    await update.message.reply_text("🤖 Procesando tu gasto...")

    try:
        # Llamar a Gemini para procesar el texto con las categorías del usuario
        expense_data = await call_gemini_for_text(message_text, categories)

        # Calcular total si no viene
        items = expense_data.get("items", [])
        if not expense_data.get("total") and items:
            expense_data["total"] = sum(item.get("amount", 0) for item in items)

        # Detectar moneda (por defecto PEN)
        currency = expense_data.get("currency", "PEN").upper()
        currency_symbol = "$" if currency == "USD" else "S/"

        # Generar UUID para este gasto
        receipt_id = str(uuid.uuid4())

        # Guardar datos en almacenamiento temporal (incluye categorías para uso posterior)
        pending_receipts[receipt_id] = {
            "data": expense_data,
            "categories": categories
        }

        # Construir mapa de nombres de categorías
        category_names = build_category_names_map(categories)

        # Mostrar resultado
        items_text = "\n".join(
            f"  • {item['description']}: {currency_symbol} {item['amount']:.2f} — {category_names.get(item['categoryId'], item['categoryId'])}"
            for item in items
        )

        result_message = (
            f"✅ *Gasto procesado*\n\n"
            f"🏪 *Tienda:* {expense_data.get('vendor', 'Manual')}\n"
            f"📅 *Fecha:* {expense_data.get('date', date.today().isoformat())}\n"
            f"💵 *Moneda:* {currency}\n"
            f"💰 *Total:* {currency_symbol} {expense_data.get('total', 0):.2f}\n\n"
            f"📝 *Items:*\n{items_text if items_text else '  No se detectaron items'}"
        )

        # Crear inline keyboard con botones de confirmación
        if items:
            keyboard = [
                [
                    InlineKeyboardButton("✅ Guardar", callback_data=f"save:{receipt_id}"),
                    InlineKeyboardButton("✏️ Corregir categoría", callback_data=f"fix_category:{receipt_id}"),
                ],
                [
                    InlineKeyboardButton("❌ Cancelar", callback_data=f"cancel:{receipt_id}"),
                ]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            await update.message.reply_text(result_message, parse_mode="Markdown", reply_markup=reply_markup)
        else:
            await update.message.reply_text(
                "❌ No pude identificar ningún gasto en tu mensaje.\n"
                "Intenta con un formato como: `parrillada 45 soles`",
                parse_mode="Markdown"
            )

    except json.JSONDecodeError as e:
        logger.error(f"Error parsing Gemini response: {e}")
        await update.message.reply_text(
            "❌ No pude procesar tu mensaje. Intenta con otro formato.\n"
            "Ejemplo: `pollo a la brasa S/30`",
            parse_mode="Markdown"
        )
    except ValueError as e:
        logger.error(f"ValueError processing text expense: {e}")
        await update.message.reply_text(
            "❌ No pude extraer información del mensaje.\n"
            "Intenta con un formato más claro: `237 mantenimiento`",
            parse_mode="Markdown"
        )
    except Exception as e:
        logger.error(f"Error processing text expense: {type(e).__name__}: {e}", exc_info=True)
        await update.message.reply_text(
            "❌ Error procesando el mensaje. Intenta de nuevo."
        )


def build_summary_message(ocr_data: dict, categories: list[dict]) -> str:
    """Construye el mensaje de resumen de la boleta."""
    currency = ocr_data.get("currency", "PEN").upper()
    currency_symbol = "$" if currency == "USD" else "S/"
    category_names = build_category_names_map(categories)

    items_text = "\n".join(
        f"  • {item['description']}: {currency_symbol} {item['amount']:.2f} — {category_names.get(item['categoryId'], item['categoryId'])}"
        for item in ocr_data.get("items", [])
    )

    return (
        f"✅ *Boleta procesada*\n\n"
        f"🏪 *Tienda:* {ocr_data.get('vendor', 'No detectado')}\n"
        f"📅 *Fecha:* {ocr_data.get('date', 'No detectada')}\n"
        f"💵 *Moneda:* {currency}\n"
        f"💰 *Total:* {currency_symbol} {ocr_data.get('total', 0):.2f}\n\n"
        f"📝 *Items:*\n{items_text if items_text else '  No se detectaron items'}"
    )


def build_summary_keyboard(receipt_id: str) -> InlineKeyboardMarkup:
    """Construye el teclado del resumen de boleta."""
    keyboard = [
        [
            InlineKeyboardButton("✅ Guardar", callback_data=f"save:{receipt_id}"),
            InlineKeyboardButton("✏️ Corregir categoría", callback_data=f"fix_category:{receipt_id}"),
        ],
        [
            InlineKeyboardButton("❌ Cancelar", callback_data=f"cancel:{receipt_id}"),
        ]
    ]
    return InlineKeyboardMarkup(keyboard)


def build_items_keyboard(receipt_id: str, items: list, categories: list[dict]) -> InlineKeyboardMarkup:
    """Construye el teclado con la lista de items para editar."""
    category_names = build_category_names_map(categories)
    keyboard = []
    for index, item in enumerate(items):
        category_name = category_names.get(item['categoryId'], item['categoryId'])
        button_text = f"{item['description']} - {category_name}"
        keyboard.append([InlineKeyboardButton(button_text, callback_data=f"edit_item:{receipt_id}:{index}")])

    keyboard.append([InlineKeyboardButton("⬅️ Volver", callback_data=f"back_to_summary:{receipt_id}")])
    return InlineKeyboardMarkup(keyboard)


def build_categories_keyboard(receipt_id: str, item_index: int, categories: list[dict]) -> InlineKeyboardMarkup:
    """Construye el teclado grid de categorías del usuario (2 por fila)."""
    keyboard = []

    # Convertir categorías del usuario a tuplas (id, name)
    cat_list = [(cat.get("id", ""), cat.get("name", "")) for cat in categories if cat.get("id")]

    for i in range(0, len(cat_list), 2):
        row = []
        for cat_id, cat_name in cat_list[i:i+2]:
            row.append(InlineKeyboardButton(cat_name, callback_data=f"set_cat:{receipt_id}:{item_index}:{cat_id}"))
        keyboard.append(row)

    keyboard.append([InlineKeyboardButton("⬅️ Cancelar", callback_data=f"back_to_items:{receipt_id}")])
    return InlineKeyboardMarkup(keyboard)


async def save_receipt_to_backend(query, user, receipt_id: str, ocr_data: dict) -> None:
    """Guarda el recibo en el backend y muestra el resultado."""
    items = ocr_data.get("items", [])
    date = ocr_data.get("date", "")
    vendor = ocr_data.get("vendor", "")
    total = ocr_data.get("total", 0)
    currency = ocr_data.get("currency", "PEN")  # Default PEN

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BACKEND_URL}/api/telegram/expenses",
                json={
                    "telegramId": user.id,
                    "vendor": vendor,
                    "date": date,
                    "total": total,
                    "currency": currency,
                    "items": [
                        {
                            "description": item["description"],
                            "amount": item["amount"],
                            "categoryId": item["categoryId"]
                        }
                        for item in items
                    ]
                },
                timeout=30.0,
            )

            if response.status_code == 200:
                if receipt_id in pending_receipts:
                    del pending_receipts[receipt_id]
                saved_count = len(items)
                await query.edit_message_text(
                    f"✅ *{saved_count} gastos guardados correctamente*\n\n"
                    f"Puedes verlos en la web.",
                    parse_mode="Markdown"
                )
            elif response.status_code == 404:
                await query.edit_message_text(
                    "❌ Tu cuenta de Telegram no está vinculada.\n"
                    "Usa /vincular CODIGO para vincularla primero."
                )
            else:
                error = response.json().get("message", "Error desconocido")
                await query.edit_message_text(f"❌ Error al guardar: {error}")

    except httpx.RequestError as e:
        logger.error(f"Error saving receipt: {e}")
        await query.edit_message_text(
            "❌ No pude conectar con el servidor. Intenta de nuevo."
        )


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Maneja los callbacks de los inline keyboards."""
    query = update.callback_query
    await query.answer()

    # Parsear callback_data
    parts = query.data.split(":")
    action = parts[0]

    if len(parts) < 2:
        return

    receipt_id = parts[1]

    # Verificar si la boleta existe
    if receipt_id not in pending_receipts:
        await query.edit_message_text("⚠️ Esta boleta expiró. Envía la foto de nuevo.")
        return

    receipt_info = pending_receipts[receipt_id]
    # Soportar formato antiguo (solo data) y nuevo (data + categories)
    if isinstance(receipt_info, dict) and "data" in receipt_info:
        ocr_data = receipt_info["data"]
        categories = receipt_info.get("categories", [])
    else:
        ocr_data = receipt_info
        categories = []

    if action == "save":
        # Verificar duplicados antes de guardar
        user = query.from_user
        items = ocr_data.get("items", [])
        expense_date = ocr_data.get("date", "")
        vendor = ocr_data.get("vendor", "")
        total = ocr_data.get("total", 0)

        try:
            async with httpx.AsyncClient() as client:
                # Verificar si es duplicado
                check_response = await client.get(
                    f"{BACKEND_URL}/api/telegram/check-duplicate",
                    params={
                        "telegramId": user.id,
                        "vendor": vendor,
                        "date": expense_date,
                        "total": total
                    },
                    timeout=30.0,
                )

                if check_response.status_code == 200:
                    check_data = check_response.json()
                    if check_data.get("isDuplicate"):
                        # Es duplicado, preguntar al usuario
                        keyboard = [
                            [
                                InlineKeyboardButton("✅ Sí, guardar de todos modos", callback_data=f"force_save:{receipt_id}"),
                                InlineKeyboardButton("❌ No, cancelar", callback_data=f"cancel_save:{receipt_id}"),
                            ]
                        ]
                        reply_markup = InlineKeyboardMarkup(keyboard)
                        await query.edit_message_text(
                            "⚠️ *Esta boleta parece duplicada*\n\n"
                            "Ya existe una con el mismo vendor, fecha y total.\n"
                            "¿Guardar de todas formas?",
                            parse_mode="Markdown",
                            reply_markup=reply_markup
                        )
                        return

                # No es duplicado o no se pudo verificar, guardar normalmente
                await save_receipt_to_backend(query, user, receipt_id, ocr_data)

        except httpx.RequestError as e:
            logger.error(f"Error checking duplicate: {e}")
            # Si falla la verificación, intentar guardar de todas formas
            await save_receipt_to_backend(query, user, receipt_id, ocr_data)

    elif action == "force_save":
        # Guardar sin verificar duplicados
        user = query.from_user
        await save_receipt_to_backend(query, user, receipt_id, ocr_data)

    elif action == "cancel_save" or action == "cancel":
        # Cancelar guardado
        if receipt_id in pending_receipts:
            del pending_receipts[receipt_id]
        await query.edit_message_text(
            "❌ *Cancelado*\n\n"
            "El gasto no fue guardado.",
            parse_mode="Markdown"
        )

    elif action == "fix_category":
        # Mostrar lista de items
        items = ocr_data.get("items", [])
        message = "*Selecciona el item a editar:*"
        keyboard = build_items_keyboard(receipt_id, items, categories)
        await query.edit_message_text(message, parse_mode="Markdown", reply_markup=keyboard)

    elif action == "edit_item":
        # Mostrar grid de categorías
        if len(parts) < 3:
            return
        item_index = int(parts[2])
        items = ocr_data.get("items", [])

        if item_index >= len(items):
            return

        item = items[item_index]
        message = f"*Selecciona la categoría para:*\n{item['description']}"
        keyboard = build_categories_keyboard(receipt_id, item_index, categories)
        await query.edit_message_text(message, parse_mode="Markdown", reply_markup=keyboard)

    elif action == "set_cat":
        # Actualizar categoría del item
        if len(parts) < 4:
            return
        item_index = int(parts[2])
        new_category_id = parts[3]

        items = ocr_data.get("items", [])
        if item_index < len(items):
            items[item_index]['categoryId'] = new_category_id

        # Volver a mostrar lista de items
        message = "*Selecciona el item a editar:*"
        keyboard = build_items_keyboard(receipt_id, items, categories)
        await query.edit_message_text(message, parse_mode="Markdown", reply_markup=keyboard)

    elif action == "back_to_summary":
        # Volver al resumen
        message = build_summary_message(ocr_data, categories)
        keyboard = build_summary_keyboard(receipt_id)
        await query.edit_message_text(message, parse_mode="Markdown", reply_markup=keyboard)

    elif action == "back_to_items":
        # Volver a lista de items
        items = ocr_data.get("items", [])
        message = "*Selecciona el item a editar:*"
        keyboard = build_items_keyboard(receipt_id, items, categories)
        await query.edit_message_text(message, parse_mode="Markdown", reply_markup=keyboard)


async def unknown_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Responde a comandos no reconocidos."""
    await update.message.reply_text(
        "Comando no reconocido.\n\n"
        "*Comandos disponibles:*\n"
        "/start - Ver ayuda\n"
        "/vincular CODIGO - Vincular cuenta\n"
        "/desvincular - Desvincular cuenta\n"
        "/estado - Ver estado\n\n"
        "O envía un gasto: `parrillada 45 soles`",
        parse_mode="Markdown"
    )


def main() -> None:
    """Inicia el bot."""
    if not TELEGRAM_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not set!")
        return

    # Crear aplicación con timeouts extendidos para descargar fotos
    request = HTTPXRequest(
        connection_pool_size=8,
        read_timeout=60.0,
        write_timeout=60.0,
        connect_timeout=30.0,
    )
    application = (
        Application.builder()
        .token(TELEGRAM_TOKEN)
        .request(request)
        .get_updates_request(request)
        .build()
    )

    # Registrar handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("vincular", vincular))
    application.add_handler(CommandHandler("desvincular", desvincular))
    application.add_handler(CommandHandler("estado", estado))
    application.add_handler(MessageHandler(filters.PHOTO, process_photo))
    # Handler para mensajes de texto (gastos manuales) - excluye comandos
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, process_text_expense))
    # Handler para comandos no reconocidos (debe ir después de los comandos conocidos)
    application.add_handler(MessageHandler(filters.COMMAND, unknown_command))
    application.add_handler(CallbackQueryHandler(handle_callback))

    # Iniciar bot
    logger.info("Bot starting...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
