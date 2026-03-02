"""Гараж: список авто, добавление, удаление"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p72039120_carwash_clean_elemen")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_client(token: str, cur):
    cur.execute(
        f"""SELECT c.id FROM {SCHEMA}.cw_sessions s
            JOIN {SCHEMA}.cw_clients c ON c.id = s.client_id
            WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    path = event.get("path", "/")
    method = event.get("httpMethod", "GET")
    token = event.get("headers", {}).get("X-Auth-Token", "")
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = get_conn()
    cur = conn.cursor()

    client = get_client(token, cur)
    if not client:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
    client_id = client[0]

    # GET /list
    if method == "GET":
        cur.execute(
            f"""SELECT id, name, plate, car_class, created_at::text
                FROM {SCHEMA}.cw_cars WHERE client_id = %s ORDER BY created_at""",
            (client_id,)
        )
        rows = cur.fetchall()
        conn.close()
        cars = [{"id": r[0], "name": r[1], "plate": r[2], "car_class": r[3], "created_at": r[4]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"cars": cars})}

    # POST /add
    if method == "POST" and path.endswith("/add"):
        name = body.get("name", "").strip()
        plate = body.get("plate", "").strip().upper()
        car_class = body.get("car_class")
        if not name or not plate or not car_class:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}
        cur.execute(
            f"INSERT INTO {SCHEMA}.cw_cars (client_id, name, plate, car_class) VALUES (%s, %s, %s, %s) RETURNING id",
            (client_id, name, plate, car_class)
        )
        car_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": car_id, "name": name, "plate": plate, "car_class": car_class})}

    # PUT /update — пометить авто как удалённое (soft)
    if method == "PUT" and path.endswith("/remove"):
        car_id = body.get("car_id")
        cur.execute(
            f"SELECT id FROM {SCHEMA}.cw_cars WHERE id = %s AND client_id = %s",
            (car_id, client_id)
        )
        if not cur.fetchone():
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        cur.execute(f"UPDATE {SCHEMA}.cw_cars SET name = 'DELETED_' || name WHERE id = %s", (car_id,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
