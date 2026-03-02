"""Новости и статьи: список для клиентов, CRUD для администратора"""
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
        f"""SELECT c.id FROM {SCHEMA}.cw_sessions s
            JOIN {SCHEMA}.cw_clients c ON c.id = s.client_id
            WHERE s.token = %s AND s.expires_at > NOW() AND c.is_admin = TRUE""",
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

    # GET / — список опубликованных статей для клиентов
    if method == "GET" and not any(p in path for p in ["/all", "/create", "/update", "/toggle"]):
        cur.execute(
            f"""SELECT id, tag, title, content, emoji, color, is_promo, created_at::text
                FROM {SCHEMA}.cw_articles
                WHERE is_published = TRUE
                ORDER BY is_promo DESC, created_at DESC""",
        )
        rows = cur.fetchall()
        conn.close()
        articles = [
            {"id": r[0], "tag": r[1], "title": r[2], "content": r[3],
             "emoji": r[4], "color": r[5], "is_promo": r[6], "created_at": r[7]}
            for r in rows
        ]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"articles": articles})}

    # GET /all — все статьи для админа
    if method == "GET" and path.endswith("/all"):
        admin = get_admin(token, cur)
        if not admin:
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        cur.execute(
            f"""SELECT id, tag, title, content, emoji, color, is_promo, is_published, created_at::text, updated_at::text
                FROM {SCHEMA}.cw_articles ORDER BY created_at DESC"""
        )
        rows = cur.fetchall()
        conn.close()
        articles = [
            {"id": r[0], "tag": r[1], "title": r[2], "content": r[3],
             "emoji": r[4], "color": r[5], "is_promo": r[6], "is_published": r[7],
             "created_at": r[8], "updated_at": r[9]}
            for r in rows
        ]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"articles": articles})}

    # POST /create
    if method == "POST" and path.endswith("/create"):
        admin = get_admin(token, cur)
        if not admin:
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        title = body.get("title", "").strip()
        content = body.get("content", "").strip()
        tag = body.get("tag", "Новость")
        emoji = body.get("emoji", "📰")
        color = body.get("color", "from-cyan-500/20 to-blue-500/10")
        is_promo = body.get("is_promo", False)
        if not title or not content:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните заголовок и текст"})}
        cur.execute(
            f"""INSERT INTO {SCHEMA}.cw_articles (tag, title, content, emoji, color, is_promo)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
            (tag, title, content, emoji, color, is_promo)
        )
        article_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": article_id})}

    # PUT /update
    if method == "PUT" and path.endswith("/update"):
        admin = get_admin(token, cur)
        if not admin:
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        article_id = body.get("id")
        title = body.get("title", "").strip()
        content = body.get("content", "").strip()
        tag = body.get("tag", "Новость")
        emoji = body.get("emoji", "📰")
        color = body.get("color", "from-cyan-500/20 to-blue-500/10")
        is_promo = body.get("is_promo", False)
        if not article_id or not title or not content:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Неверные данные"})}
        cur.execute(
            f"""UPDATE {SCHEMA}.cw_articles
                SET tag=%s, title=%s, content=%s, emoji=%s, color=%s, is_promo=%s, updated_at=NOW()
                WHERE id=%s""",
            (tag, title, content, emoji, color, is_promo, article_id)
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    # PUT /toggle — опубликовать / снять с публикации
    if method == "PUT" and path.endswith("/toggle"):
        admin = get_admin(token, cur)
        if not admin:
            conn.close()
            return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}
        article_id = body.get("id")
        cur.execute(
            f"UPDATE {SCHEMA}.cw_articles SET is_published = NOT is_published, updated_at=NOW() WHERE id=%s RETURNING is_published",
            (article_id,)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"is_published": row[0] if row else False})}

    conn.close()
    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
