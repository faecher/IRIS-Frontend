#!/usr/bin/env bash
set -euo pipefail

STACK="iris"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_URL="https://raw.githubusercontent.com/faecher/IRIS-Frontend/refs/heads/main/docker-compose.yml"
INIT_SCRIPT_DIR="./configuration/postgresql/initdb"
INIT_SCRIPT_PATH="${INIT_SCRIPT_DIR}/10-create-users.sh"

gen_secret() { openssl rand -base64 32 | tr -d '\n'; }

ensure_swarm() {
	echo "Ensuring Docker Swarm is initialized..."

	if [ "$(docker info --format '{{.Swarm.LocalNodeState}}')" != "active" ]; then
		docker swarm init
	fi
  
	echo "Docker Swarm is active."
}

ensure_secret() {
  local name="$1" value="$2"

  if docker secret inspect "$name" >/dev/null 2>&1; then
    echo "Secret exists: $name"
  else
    echo "Creating secret: $name"
    printf '%s' "$value" | docker secret create "$name" - >/dev/null
  fi

}

create_db_init_script() {
  mkdir -p "$INIT_SCRIPT_DIR"
  cat > "$INIT_SCRIPT_PATH" <<'EOF'
#!/usr/bin/env sh
set -eu

echo "[initdb] creating/updating DB roles..." >&2

IRIS_SECRET_PATH="/run/secrets/iris_db_password"
CHIRPSTACK_SECRET_PATH="/run/secrets/chirpstack_db_password"

if [ ! -r "$IRIS_SECRET_PATH" ]; then
  echo "Missing readable secret: $IRIS_SECRET_PATH" >&2
  exit 1
fi

if [ ! -r "$CHIRPSTACK_SECRET_PATH" ]; then
  echo "Missing readable secret: $CHIRPSTACK_SECRET_PATH" >&2
  exit 1
fi

IRIS_PASS="$(cat "$IRIS_SECRET_PATH")"
CHIRPSTACK_PASS="$(cat "$CHIRPSTACK_SECRET_PATH")"

psql -v ON_ERROR_STOP=1 \
  --username "${POSTGRES_USER:-postgres}" \
  --dbname "${POSTGRES_DB:-postgres}" \
  --set=iris_pass="$IRIS_PASS" \
  --set=chirp_pass="$CHIRPSTACK_PASS" <<'SQL'

SELECT set_config('app.iris_pass', :'iris_pass', false);
SELECT set_config('app.chirp_pass', :'chirp_pass', false);


DO $$
DECLARE
  v_iris_pass  text := current_setting('app.iris_pass');
  v_chirp_pass text := current_setting('app.chirp_pass');
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'iris') THEN
	EXECUTE format('CREATE ROLE iris LOGIN PASSWORD %L', v_iris_pass);
  ELSE
	EXECUTE format('ALTER ROLE iris LOGIN PASSWORD %L', v_iris_pass);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'chirpstack') THEN
	EXECUTE format('CREATE ROLE chirpstack LOGIN PASSWORD %L', v_chirp_pass);
  ELSE
	EXECUTE format('ALTER ROLE chirpstack LOGIN PASSWORD %L', v_chirp_pass);
  END IF;
END
$$;

SELECT 'CREATE DATABASE iris OWNER iris'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'iris') \gexec

SELECT 'CREATE DATABASE chirpstack OWNER chirpstack'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chirpstack') \gexec

SQL
echo "[initdb] role setup done" >&2
EOF
  chmod 755 "$INIT_SCRIPT_PATH"
}

ensure_swarm

echo "Downloading docker-compose.yml from $COMPOSE_URL..."
wget -O "$COMPOSE_FILE" "$COMPOSE_URL"
create_db_init_script

ensure_secret "iris_db_password" "$(gen_secret)"
ensure_secret "chirpstack_db_password" "$(gen_secret)"
ensure_secret "postgres_db_password" "$(gen_secret)"
docker stack deploy -c "$COMPOSE_FILE" "$STACK"
docker stack services "$STACK"
