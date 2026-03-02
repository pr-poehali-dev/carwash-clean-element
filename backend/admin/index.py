"""Админ-панель: список записей, клиентов, статистика, обновление статуса"""
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


def get_admin(token: str, cur):
    cur.execute(
        f"""SELECT c.id, c.is_admin FROM {SCHEMA}.cw_sessions s
            JOIN {SCHEMA}.cw_clients c ON c.id = s.client_id
            WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    row = cur.fetchone()
    if row and row[1]:
        return row[0]
    return None


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

    admin_id = get_admin(token, cur)
    if not admin_id:
        conn.close()
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}

    # GET /stats
    if method == "GET" and path.endswith("/stats"):
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.cw_clients WHERE is_admin = FALSE")
        total_clients = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.cw_bookings WHERE status != 'cancelled'")
        total_bookings = cur.fetchone()[0]
        cur.execute(f"SELECT COALESCE(SUM(total_price), 0) FROM {SCHEMA}.cw_bookings WHERE status = 'completed'")
        total_revenue = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.cw_bookings WHERE booking_date = CURRENT_DATE AND status != 'cancelled'")
        today_bookings = cur.fetchone()[0]
        cur.execute(
            f"""SELECT COUNT(*) FROM {SCHEMA}.cw_bookings
                WHERE booking_date = CURRENT_DATE AND status = 'pending'"""
        )
        pending_today = cur.fetchone()[0]
        conn.close()
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({
                "total_clients": total_clients,
                "total_bookings": total_bookings,
                "total_revenue": total_revenue,
                "today_bookings": today_bookings,
                "pending_today": pending_today
            })
        }

    # GET /bookings?date=2026-03-05&status=pending
    if method == "GET" and path.endswith("/bookings"):
        params = event.get("queryStringParameters") or {}
        date_filter = params.get("date", "")
        status_filter = params.get("status", "")
        sql = f"""SELECT b.id, b.booking_date::text, b.booking_time::text,
                         cl.name as client_name, cl.phone,
                         s.name as service, s.emoji,
                         c.name as car_name, c.plate,
                         b.total_price, b.status, b.car_class,
                         b.created_at::text
                  FROM {SCHEMA}.cw_bookings b
                  JOIN {SCHEMA}.cw_clients cl ON cl.id = b.client_id
                  JOIN {SCHEMA}.cw_services s ON s.id = b.service_id
                  LEFT JOIN {SCHEMA}.cw_cars c ON c.id = b.car_id
                  WHERE 1=1"""
        params_list = []
        if date_filter:
            sql += " AND b.booking_date = %s"
            params_list.append(date_filter)
        if status_filter:
            sql += " AND b.status = %s"
            params_list.append(status_filter)
        sql += " ORDER BY b.booking_date DESC, b.booking_time DESC LIMIT 100"
        cur.execute(sql, params_list)
        rows = cur.fetchall()
        conn.close()
        bookings = []
        for r in rows:
            bookings.append({
                "id": r[0], "date": r[1], "time": r[2],
                "client_name": r[3], "phone": r[4],
                "service": r[5], "emoji": r[6],
                "car": r[7], "plate": r[8],
                "price": r[9], "status": r[10],
                "car_class": r[11], "created_at": r[12]
            })
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"bookings": bookings})}

    # GET /clients
    if method == "GET" and path.endswith("/clients"):
        cur.execute(
            f"""SELECT cl.id, cl.name, cl.phone, cl.created_at::text, cl.last_visit_at::text,
                       COUNT(b.id) as booking_count,
                       COALESCE(SUM(b.total_price) FILTER (WHERE b.status='completed'), 0) as total_spent
                FROM {SCHEMA}.cw_clients cl
                LEFT JOIN {SCHEMA}.cw_bookings b ON b.client_id = cl.id
                WHERE cl.is_admin = FALSE
                GROUP BY cl.id ORDER BY cl.created_at DESC"""
        )
        rows = cur.fetchall()
        conn.close()
        clients = []
        for r in rows:
            clients.append({
                "id": r[0], "name": r[1], "phone": r[2],
                "created_at": r[3], "last_visit_at": r[4],
                "booking_count": r[5], "total_spent": r[6]
            })
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"clients": clients})}

    # GET /client/:id — детальная карточка
    if method == "GET" and "/client/" in path:
        client_id = path.split("/client/")[-1]
        cur.execute(
            f"""SELECT cl.id, cl.name, cl.phone, cl.created_at::text, cl.last_visit_at::text
                FROM {SCHEMA}.cw_clients cl WHERE cl.id = %s""",
            (client_id,)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Клиент не найден"})}
        cur.execute(
            f"""SELECT name, plate, car_class FROM {SCHEMA}.cw_cars
                WHERE client_id = %s AND name NOT LIKE 'DELETED%%'""",
            (client_id,)
        )
        cars = [{"name": r[0], "plate": r[1], "car_class": r[2]} for r in cur.fetchall()]
        cur.execute(
            f"""SELECT b.booking_date::text, b.booking_time::text, s.name, b.total_price, b.status
                FROM {SCHEMA}.cw_bookings b
                JOIN {SCHEMA}.cw_services s ON s.id = b.service_id
                WHERE b.client_id = %s ORDER BY b.booking_date DESC LIMIT 20""",
            (client_id,)
        )
        history = [{"date": r[0], "time": r[1], "service": r[2], "price": r[3], "status": r[4]} for r in cur.fetchall()]
        conn.close()
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({
                "id": row[0], "name": row[1], "phone": row[2],
                "created_at": row[3], "last_visit_at": row[4],
                "cars": cars, "history": history
            })
        }

    # PUT /booking/status — обновить статус записи
    if method == "PUT" and path.endswith("/booking/status"):
        booking_id = body.get("booking_id")
        new_status = body.get("status")
        if not booking_id or new_status not in ("pending", "in_progress", "completed", "cancelled"):
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Неверные данные"})}
        cur.execute(
            f"UPDATE {SCHEMA}.cw_bookings SET status = %s WHERE id = %s",
            (new_status, booking_id)
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
