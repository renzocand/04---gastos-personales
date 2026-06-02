# Despliegue — Docker local + túnel público (Cloudflare)

La app corre **dockerizada en tu PC** (`docker compose`: mysql + backend + frontend
con nginx) y se expone a internet con un **túnel de Cloudflare**, que da una **URL
pública HTTPS gratis** sin servidor en la nube, sin IP pública y sin abrir puertos.

> Pensado para la demo de universidad: tu PC encendida con Docker + el túnel abierto.

---

## Requisitos

- **Docker Desktop** (Windows).
- **cloudflared** (instalado con `winget install --id Cloudflare.cloudflared`).

---

## 1. Levantar el stack

Desde la raíz del proyecto:

```powershell
# Crear el .env con el secreto JWT (solo la primera vez)
Copy-Item .env.example .env
# editá .env y poné un APP_JWT_SECRET largo y aleatorio

docker compose up -d --build
```

Verificá que los 3 servicios estén arriba y que responda en local:

```powershell
docker compose ps                 # backend, frontend, mysql "Up"
curl http://localhost             # debe responder la app
```

La app queda en **http://localhost** (nginx sirve el frontend y proxea `/api` al backend).

---

## 2. Exponerla a internet (túnel Cloudflare)

En una terminal **nueva** de PowerShell:

```powershell
cloudflared tunnel --url http://localhost:80
```

En la salida aparece la URL pública (cambia en cada arranque):

```
https://xxxx-xxxx-xxxx.trycloudflare.com
```

Esa es la que compartís. **Dejá esa ventana abierta** mientras dure la demo: si la
cerrás, se corta el túnel.

> Si `cloudflared` no se reconoce, abrí una terminal nueva (para refrescar el PATH) o
> usá la ruta completa del ejecutable instalado por winget
> (`...\WinGet\Packages\Cloudflare.cloudflared_...\cloudflared.exe`).

---

## 3. Cómo funciona (sin abrir puertos)

`cloudflared` abre una **conexión saliente** desde tu PC hacia Cloudflare; Cloudflare
publica la URL HTTPS y reenvía el tráfico por ese túnel hasta `http://localhost:80`.
Por eso **no hace falta** IP pública, port-forwarding ni tocar el router/firewall.

Como el frontend usa rutas relativas (`/api`), todo viaja por el **mismo origen** (la
URL del túnel) → no hay problemas de CORS.

Ver el diagrama en [`docs/deployment-diagram.puml`](docs/deployment-diagram.puml).

---

## Operación

```powershell
docker compose logs -f            # ver logs
docker compose restart backend    # reiniciar un servicio
docker compose down               # apagar (conserva los datos)
docker compose down -v            # apagar y BORRAR la BD (arranca limpia)

# Tras cambiar el código, reconstruir:
docker compose up -d --build
```

---

## Notas

- **URL fija:** el "quick tunnel" da una URL distinta cada vez. Si necesitás una URL
  estable, se configura con una cuenta gratis de Cloudflare + *named tunnel* (más pasos).
- **BD limpia antes de presentar:** `docker compose down -v ; docker compose up -d --build`.
- **Portabilidad:** el mismo `docker-compose.yml` corre tal cual en cualquier VPS/servidor
  si en el futuro se quiere alojar 24/7 (ahí sí se abriría el puerto 80 y se usaría la IP
  o un dominio en vez del túnel).

---

## Resumen de puertos

| Puerto | Quién | Expuesto |
|--------|-------|----------|
| (túnel) | Cloudflare → cloudflared | **URL pública HTTPS** |
| 80     | frontend (nginx) | solo local (lo toma el túnel) |
| 8080   | backend (Spring) | solo red interna de docker |
| 3306   | mysql | solo red interna (3307 al host, opcional) |
