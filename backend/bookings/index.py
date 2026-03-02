"""Записи: создание, список клиента, занятые слоты"""
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
        f"""SELECT c.id, c.name, c.is_admin
            FROM {SCHEMA}.cw_sessions s
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

    # GET /busy-slots?date=2026-03-05
    if method == "GET" and path.endswith("/busy-slots"):
        params = event.get("queryStringParameters") or {}
        date = params.get("date", "")
        if not date:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "date required"})}
        cur.execute(
            f"""SELECT b.booking_time::text, b.booking_time::text,
                       COALESCE(s.duration_class1, 60) as dur1,
                       COALESCE(s.duration_class2, 60) as dur2,
                       COALESCE(s.duration_class3, 60) as dur3,
                       b.car_class
                FROM {SCHEMA}.cw_bookings b
                JOIN {SCHEMA}.cw_services s ON s.id = b.service_id
                WHERE b.booking_date = %s AND b.status != 'cancelled'""",
            (date,)
        )
        rows = cur.fetchall()
        conn.close()
        busy = []
        for row in rows:
            t = row[0][:5]
            dur_map = {1: row[2], 2: row[3], 3: row[4]}
            busy.append({"time": t, "duration": dur_map.get(row[5], 60)})
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"busy": busy})}

    # POST /create
    if method == "POST" and path.endswith("/create"):
        client = get_client(token, cur)
        if not client:
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
        client_id = client[0]
        service_id = body.get("service_id")
        car_class = body.get("car_class")
        booking_date = body.get("date")
        booking_time = body.get("time")
        total_price = body.get("total_price", 0)
        extra_ids = body.get("extras", [])
        car_id = body.get("car_id")
        if not all([service_id, car_class, booking_date, booking_time]):
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}
        cur.execute(
            f"""INSERT INTO {SCHEMA}.cw_bookings
                (client_id, car_id, service_id, booking_date, booking_time, car_class, total_price)
                VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""",
            (client_id, car_id, service_id, booking_date, booking_time, car_class, total_price)
        )
        booking_id = cur.fetchone()[0]
        for eid in extra_ids:
            cur.execute(
                f"INSERT INTO {SCHEMA}.cw_booking_extras (booking_id, service_id) VALUES (%s, %s)",
                (booking_id, eid)
            )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": booking_id, "status": "pending"})}

    # GET /my — история клиента
    if method == "GET" and path.endswith("/my"):
        client = get_client(token, cur)
        if not client:
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
        client_id = client[0]
        cur.execute(
            f"""SELECT b.id, b.booking_date::text, b.booking_time::text,
                       s.name as service, s.emoji,
                       c.name as car_name, c.plate,
                       b.total_price, b.status, b.car_class
                FROM {SCHEMA}.cw_bookings b
                JOIN {SCHEMA}.cw_services s ON s.id = b.service_id
                LEFT JOIN {SCHEMA}.cw_cars c ON c.id = b.car_id
                WHERE b.client_id = %s
                ORDER BY b.booking_date DESC, b.booking_time DESC""",
            (client_id,)
        )
        rows = cur.fetchall()
        conn.close()
        result = []
        for r in rows:
            result.append({
                "id": r[0], "date": r[1], "time": r[2],
                "service": r[3], "emoji": r[4],
                "car": r[5], "plate": r[6],
                "price": r[7], "status": r[8], "car_class": r[9]
            })
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"bookings": result})}

    conn.close()
    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
