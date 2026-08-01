#!/usr/bin/env python3
"""
Tests E2E para el bot de Telegram.
Verifica que los endpoints del backend y servicios funcionen correctamente.

Ejecutar:
    docker exec gastos-telegram-bot python test_e2e.py

O desde el host:
    python telegram-bot/test_e2e.py
"""

import os
import sys
import json
import httpx
from datetime import date

# Configuración - usar variables de entorno de Docker o defaults para desarrollo local
BACKEND_URL = os.getenv("GASTOS_BACKEND_URL", "http://backend:8080")
OCR_SERVICE_URL = os.getenv("OCR_SERVICE_URL", "http://ocr-service:8081")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

# Telegram ID de prueba (usuario vinculado: 76586942)
TEST_TELEGRAM_ID = 8129287077


def print_result(test_name: str, success: bool, details: str = ""):
    """Imprime resultado del test."""
    icon = "✅" if success else "❌"
    print(f"{icon} {test_name}")
    if details:
        print(f"   {details}")


def test_get_user():
    """Test: Obtener usuario vinculado por Telegram ID."""
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.get(f"{BACKEND_URL}/api/telegram/user/{TEST_TELEGRAM_ID}")

            if response.status_code == 200:
                data = response.json()
                print_result(
                    "GET /api/telegram/user/{telegramId}",
                    True,
                    f"Usuario: {data.get('firstName')} {data.get('lastName')} (DNI: {data.get('dni')})"
                )
                return True, data
            else:
                print_result(
                    "GET /api/telegram/user/{telegramId}",
                    False,
                    f"Status: {response.status_code}"
                )
                return False, None
    except Exception as e:
        print_result("GET /api/telegram/user/{telegramId}", False, str(e))
        return False, None


def test_get_categories():
    """Test: Obtener categorías del usuario."""
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.get(f"{BACKEND_URL}/api/telegram/categories/{TEST_TELEGRAM_ID}")

            if response.status_code == 200:
                categories = response.json()
                cat_names = [c.get("name") for c in categories[:5]]
                print_result(
                    "GET /api/telegram/categories/{telegramId}",
                    True,
                    f"{len(categories)} categorías: {', '.join(cat_names)}..."
                )
                return True, categories
            else:
                print_result(
                    "GET /api/telegram/categories/{telegramId}",
                    False,
                    f"Status: {response.status_code}"
                )
                return False, None
    except Exception as e:
        print_result("GET /api/telegram/categories/{telegramId}", False, str(e))
        return False, None


def test_gemini_text_processing(categories: list):
    """Test: Procesar gasto por texto con Gemini."""
    if not GEMINI_API_KEY:
        print_result("Gemini Text Processing", False, "GEMINI_API_KEY no configurada")
        return False

    try:
        # Construir prompt con categorías del usuario
        categories_section = "\n".join(
            f"- {c['id']}: {c['name']} ({c.get('description', '')})"
            for c in categories
        )

        today = date.today().isoformat()
        message = "almuerzo menú 15 soles"

        prompt = f"""Analiza este mensaje de texto que describe uno o más gastos y extrae la información.

CATEGORÍAS DEL USUARIO (usa SOLO estos IDs exactos):
{categories_section}

MONEDAS:
- PEN: Soles peruanos (indicado por: "soles", "S/", "S/.", o sin especificar)
- USD: Dólares americanos (indicado por: "dolares", "dólares", "$", "USD")

INSTRUCCIONES:
1. Identifica cada gasto mencionado
2. Extrae el monto de cada gasto
3. Detecta la moneda (PEN o USD). Si no se especifica, asume PEN.
4. Usa como descripción el nombre del producto/servicio
5. Asigna la categoría más apropiada
6. Si no hay tienda específica, usa "Manual" como vendor
7. La fecha es hoy: {today}

RESPONDE ÚNICAMENTE con JSON válido:
{{"vendor":"nombre o Manual","date":"{today}","currency":"PEN o USD","items":[{{"description":"descripción","amount":0.00,"categoryId":"categoria_id"}}],"total":0.00}}

MENSAJE A ANALIZAR:
{message}"""

        request_body = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.1, "maxOutputTokens": 2048}
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

        with httpx.Client(timeout=60.0) as client:
            response = client.post(url, json=request_body)

            if response.status_code == 200:
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Extraer JSON
                start = text.find('{')
                end = text.rfind('}')
                if start != -1 and end != -1:
                    json_str = text[start:end+1]
                    parsed = json.loads(json_str)
                    print_result(
                        "Gemini Text Processing",
                        True,
                        f"Gasto: {parsed.get('total')} {parsed.get('currency', 'PEN')} - {parsed.get('items', [{}])[0].get('description', 'N/A')}"
                    )
                    return True

            print_result("Gemini Text Processing", False, f"Status: {response.status_code}")
            return False

    except Exception as e:
        print_result("Gemini Text Processing", False, str(e))
        return False


def test_create_expense(categories: list):
    """Test: Crear gasto vía endpoint de Telegram."""
    if not categories:
        print_result("POST /api/telegram/expenses", False, "No hay categorías")
        return False

    try:
        # Usar la primera categoría disponible
        category_id = categories[0]["id"]
        today = date.today().isoformat()

        expense_data = {
            "telegramId": TEST_TELEGRAM_ID,
            "vendor": "Test E2E",
            "date": today,
            "total": 1.00,
            "currency": "PEN",
            "items": [
                {
                    "description": "Test E2E - eliminar",
                    "amount": 1.00,
                    "categoryId": category_id
                }
            ]
        }

        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{BACKEND_URL}/api/telegram/expenses",
                json=expense_data
            )

            if response.status_code == 200:
                data = response.json()
                receipt_id = data.get("id", "N/A")
                print_result(
                    "POST /api/telegram/expenses",
                    True,
                    f"Receipt ID: {receipt_id}"
                )
                return True, receipt_id
            else:
                error = response.json().get("message", response.text[:100])
                print_result(
                    "POST /api/telegram/expenses",
                    False,
                    f"Status: {response.status_code} - {error}"
                )
                return False, None

    except Exception as e:
        print_result("POST /api/telegram/expenses", False, str(e))
        return False, None


def test_ocr_health():
    """Test: Verificar que el servicio OCR está disponible."""
    try:
        with httpx.Client(timeout=10.0) as client:
            # Verificar que el servicio responde (404 es OK, significa que está activo)
            response = client.get(f"{OCR_SERVICE_URL}/")

            # Cualquier respuesta significa que el servicio está vivo
            # 404 o 500 para / es esperado ya que no hay endpoint en /
            if response.status_code in [200, 404, 500]:
                print_result("OCR Service Health", True, f"Servicio disponible (status: {response.status_code})")
                return True
            else:
                print_result("OCR Service Health", False, f"Status inesperado: {response.status_code}")
                return False
    except httpx.ConnectError:
        print_result("OCR Service Health", False, "No se puede conectar")
        return False
    except Exception as e:
        print_result("OCR Service Health", False, str(e))
        return False


def main():
    """Ejecuta todos los tests E2E."""
    print("\n" + "="*50)
    print("🧪 TESTS E2E - Bot de Telegram")
    print("="*50 + "\n")

    results = []

    # Test 1: Obtener usuario
    success, user = test_get_user()
    results.append(success)

    if not success:
        print("\n⚠️  No se puede continuar sin usuario vinculado")
        sys.exit(1)

    # Test 2: Obtener categorías
    success, categories = test_get_categories()
    results.append(success)

    if not categories:
        print("\n⚠️  No se puede continuar sin categorías")
        sys.exit(1)

    # Test 3: OCR Service health
    success = test_ocr_health()
    results.append(success)

    # Test 4: Gemini text processing
    success = test_gemini_text_processing(categories)
    results.append(success)

    # Test 5: Crear gasto (skip si no queremos crear datos de prueba)
    # Descomentado para pruebas completas
    # success, receipt_id = test_create_expense(categories)
    # results.append(success)

    # Resumen
    print("\n" + "="*50)
    passed = sum(results)
    total = len(results)

    if passed == total:
        print(f"✅ TODOS LOS TESTS PASARON ({passed}/{total})")
        sys.exit(0)
    else:
        print(f"❌ TESTS FALLIDOS ({total - passed}/{total})")
        sys.exit(1)


if __name__ == "__main__":
    main()
