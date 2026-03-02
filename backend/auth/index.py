"""Авторизация: регистрация, вход, выход, проверка токена"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p72039120_carwash_clean_elemen")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    # POST /register
    if method == "POST" and path.endswith("/register"):
        name = body.get("name", "").strip()
        phone = body.get("phone", "").strip()
        password = body.get("password", "")
        if not name or not phone or not password:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.cw_clients WHERE phone = %s", (phone,))
        if cur.fetchone():
            conn.close()
            return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Номер уже зарегистрирован"})}

        pw_hash = hash_password(password)
        cur.execute(
            f"INSERT INTO {SCHEMA}.cw_clients (name, phone, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (name, phone, pw_hash)
        )
        client_id = cur.fetchone()[0]
        token = secrets.token_hex(32)
        cur.execute(
            f"INSERT INTO {SCHEMA}.cw_sessions (client_id, token) VALUES (%s, %s)",
            (client_id, token)
        )
        conn.commit()
        conn.close()
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"token": token, "id": client_id, "name": name, "phone": phone, "is_admin": False})
        }

    # POST /login
    if method == "POST" and path.endswith("/login"):
        phone = body.get("phone", "").strip()
        password = body.get("password", "")
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, name, password_hash, is_admin FROM {SCHEMA}.cw_clients WHERE phone = %s",
            (phone,)
        )
        row = cur.fetchone()
        if not row or row[2] != hash_password(password):
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный номер или пароль"})}

        client_id, name, _, is_admin = row
        token = secrets.token_hex(32)
        cur.execute(
            f"INSERT INTO {SCHEMA}.cw_sessions (client_id, token) VALUES (%s, %s)",
            (client_id, token)
        )
        cur.execute(
            f"UPDATE {SCHEMA}.cw_clients SET last_visit_at = NOW() WHERE id = %s",
            (client_id,)
        )
        conn.commit()
        conn.close()
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"token": token, "id": client_id, "name": name, "phone": phone, "is_admin": is_admin})
        }

    # GET /me — проверка токена
    if method == "GET" and path.endswith("/me"):
        token = event.get("headers", {}).get("X-Auth-Token", "")
        if not token:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT c.id, c.name, c.phone, c.is_admin
                FROM {SCHEMA}.cw_sessions s
                JOIN {SCHEMA}.cw_clients c ON c.id = s.client_id
                WHERE s.token = %s AND s.expires_at > NOW()""",
            (token,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"id": row[0], "name": row[1], "phone": row[2], "is_admin": row[3]})
        }

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
