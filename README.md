# Gastos Personales — Monorepo

App de gastos personales (Perú). Arquitectura cliente-servidor:

```
gastos-personales/
├── frontend/   Angular 21 + NgRx 21 + Tailwind v4
├── backend/    Spring Boot 3.3 + JPA/Hibernate (Java 17)
├── docs/       Diagramas UML (PlantUML): clases, paquetes, ER
└── docker-compose.yml   MySQL 8.4
```

## Requisitos

- Java 17, Maven 3.9+
- Docker (para MySQL)
- Node 20+ (para el frontend)

## Levantar el backend

```bash
# 1. Base de datos (MySQL en Docker, puerto host 3307)
docker compose up -d

# 2. API REST (http://localhost:8080)
cd backend
mvn spring-boot:run
```

La BD `gastos` se crea sola; las tablas las genera Hibernate (`ddl-auto=update`) y las
4 categorías se siembran con `src/main/resources/data.sql`.

## Levantar el frontend

```bash
cd frontend
npm install
npm start            # http://localhost:4200
```

## API REST

Base: `http://localhost:8080/api`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET`    | `/expenses?categoryId=&currency=&dateFrom=&dateTo=` | Lista con filtros opcionales |
| `POST`   | `/expenses` | Crea un gasto |
| `PATCH`  | `/expenses/{id}` | Actualización parcial |
| `DELETE` | `/expenses/{id}` | Elimina |
| `GET`    | `/categories` | Lista de categorías |

## Base de datos

- Host: `localhost:3307` · db `gastos` · user/pass `gastos` / `gastos` (root: `root`).
- Tablas: `category` (PK `id`) y `expense` (PK `id`, FK `category_id → category.id`).

## Diagramas (entregables)

En `docs/` (formato PlantUML `.puml`). Renderizar con la extensión *PlantUML* de
VS Code (Alt+D) o en https://www.plantuml.com/plantuml.

- `class-diagram.puml` — diagrama de clases.
- `package-diagram.puml` — diagrama de paquetes.
- `er-diagram.puml` — diagrama entidad-relación de la BD.
