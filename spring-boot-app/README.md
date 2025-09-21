# Spring Boot App (Spring Boot 3.0)

A minimal REST API to access the `velo_users` table in a local PostgreSQL "entitlement" database using Spring Boot 3.0 and `JdbcTemplate`.

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL running locally with a database named `entitlement`
- Table `velo_users` present in the `entitlement` database

## Configuration

Environment variables (all have sensible defaults):

- `ENT_DB_HOST` (default: `localhost`)
- `ENT_DB_PORT` (default: `5432`)
- `ENT_DB_NAME` (default: `entitlement`)
- `ENT_DB_USERNAME` (default: `postgres`)
- `ENT_DB_PASSWORD` (default: `postgres`)
- `ENT_DB_URL` (optional, full JDBC URL overrides host/port/name)
- `ENT_DB_ID_COLUMN` (default: `id`) — column used by `GET /api/velo-users/{id}`

You can also change the server port with `PORT` (default `8080`).

## Run

```bash
mvn -q -DskipTests spring-boot:run -f spring-boot-app/pom.xml
```

Or from inside the project directory:

```bash
mvn -q -DskipTests spring-boot:run
```

## Endpoints

- `GET /api/velo-users?limit=100&offset=0&orderBy=id` — returns a list of rows (as maps)
- `GET /api/velo-users/{id}` — returns a single row by `ENT_DB_ID_COLUMN` (default `id`)

Notes:
- `orderBy` is validated to be an identifier (`[a-zA-Z_][a-zA-Z0-9_]*`). If invalid, it falls back to `id`.
- If your `velo_users` table uses a different primary key column (e.g. `user_id`), set `ENT_DB_ID_COLUMN=user_id`.

## Example

```bash
# List first 5 users
curl "http://localhost:8080/api/card-data?limit=5"

# Get user by id (assuming primary key column 'id')
curl "http://localhost:8080/api/card-data/123"
```

## Packaging

```bash
mvn -q -DskipTests clean package
java -jar target/spring-boot-app-0.0.1-SNAPSHOT.jar
```
