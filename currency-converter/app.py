from flask import Flask, render_template, request, jsonify, make_response
import requests, os, time
import pycountry
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

API_KEY = os.getenv("API_KEY")
API_URL = f"https://v6.exchangerate-api.com/v6/{API_KEY}/pair"

# ======================
# DATA
# ======================
CURRENCIES = sorted([
    (c.alpha_3, c.name)
    for c in pycountry.currencies
    if hasattr(c, "alpha_3")
])

CURRENCY_TO_FLAG = {
    "USD": "us", "EUR": "eu", "GBP": "gb", "JPY": "jp",
    "CHF": "ch", "CAD": "ca", "AUD": "au", "CNY": "cn", "INR": "in"
}

EU = {
    "GR","DE","FR","IT","ES","NL","BE","PT","AT","FI","IE",
    "CY","EE","LV","LT","LU","MT","SI","SK","HR"
}

# ======================
# CACHE & RATE LIMIT
# ======================
RATE_CACHE = {}
CACHE_TTL = 600  # 10 minutes

REQUESTS = defaultdict(list)
LIMIT = 30  # per IP / minute

# ======================
# HELPERS
# ======================
def rate_limited(ip):
    now = time.time()
    REQUESTS[ip] = [t for t in REQUESTS[ip] if now - t < 60]
    if len(REQUESTS[ip]) >= LIMIT:
        return True
    REQUESTS[ip].append(now)
    return False

def detect_currency():
    try:
        data = requests.get("https://ipapi.co/json/", timeout=3).json()
        cc = data.get("country_code")
        if cc in EU:
            return "EUR"
        return data.get("currency", "USD")
    except:
        return "USD"

def get_rate(frm, to):
    key = (frm, to)
    now = time.time()

    if key in RATE_CACHE and now - RATE_CACHE[key]["time"] < CACHE_TTL:
        return RATE_CACHE[key]["rate"]

    r = requests.get(f"{API_URL}/{frm}/{to}", timeout=5).json()
    if r.get("result") != "success":
        raise ValueError("API error")

    RATE_CACHE[key] = {
        "rate": r["conversion_rate"],
        "time": now
    }
    return r["conversion_rate"]

# ======================
# ROUTES
# ======================
@app.route("/")
def index():
    from_cur = request.cookies.get("from") or detect_currency()
    to_cur = request.cookies.get("to") or ("USD" if from_cur == "EUR" else "EUR")

    return render_template(
        "index.html",
        currencies=CURRENCIES,
        from_currency=from_cur,
        to_currency=to_cur,
        from_flag=CURRENCY_TO_FLAG.get(from_cur, "generic"),
        to_flag=CURRENCY_TO_FLAG.get(to_cur, "generic")
    )

@app.route("/convert", methods=["POST"])
def convert():
    ip = request.remote_addr
    if rate_limited(ip):
        return jsonify({"error": "Too many requests"}), 429

    data = request.json
    amount = float(data["amount"])
    frm = data["from"]
    to = data["to"]

    rate = get_rate(frm, to)
    result = round(amount * rate, 2)

    resp = make_response(jsonify({
        "result": result,
        "rate": rate,
        "from_flag": CURRENCY_TO_FLAG.get(frm, "generic"),
        "to_flag": CURRENCY_TO_FLAG.get(to, "generic")
    }))

    resp.set_cookie("from", frm, max_age=86400 * 30)
    resp.set_cookie("to", to, max_age=86400 * 30)
    return resp

@app.route("/health")
def health():
    return jsonify({"status": "ok"})
