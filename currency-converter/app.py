from flask import Flask, render_template, request
import requests
import pycountry
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# =========================
# API CONFIG
# =========================
API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise ValueError("API key not found")

API_URL = f"https://v6.exchangerate-api.com/v6/{API_KEY}/pair"

# =========================
# CURRENCIES LIST
# =========================
CURRENCIES = sorted([
    (c.alpha_3, c.name) for c in pycountry.currencies
    if hasattr(c, 'alpha_3') and hasattr(c, 'name')
])

# =========================
# FLAG + COUNTRY MAPPINGS
# =========================
CURRENCY_TO_FLAG = {
    "USD": "us",
    "EUR": "eu",
    "GBP": "gb",
    "JPY": "jp",
    "CHF": "ch",
    "CAD": "ca",
    "AUD": "au",
    "CNY": "cn",
    "INR": "in",
}

COUNTRY_TO_CURRENCY = {
    "US": "USD",
    "GB": "GBP",
    "JP": "JPY",
    "CH": "CHF",
    "CA": "CAD",
    "AU": "AUD",
    "CN": "CNY",
    "IN": "INR",
}

EU_COUNTRIES = {
    "GR","DE","FR","IT","ES","NL","BE","PT","AT","FI","IE",
    "CY","EE","LV","LT","LU","MT","SI","SK","HR"
}

# =========================
# HELPERS
# =========================
def detect_user_currency():
    try:
        response = requests.get(
            "https://ipapi.co/json/",
            timeout=3,
            headers={"User-Agent": "CurrencyConverter"}
        )
        data = response.json()

        country = data.get("country_code")

        if country in EU_COUNTRIES:
            return "EUR"

        return COUNTRY_TO_CURRENCY.get(country, "USD")

    except Exception:
        return "USD"

def currency_to_flag(currency):
    return CURRENCY_TO_FLAG.get(currency, "generic")

# =========================
# ROUTES
# =========================
@app.route('/')
def index():
    user_currency = detect_user_currency()

    return render_template(
        "index.html",
        currencies=CURRENCIES,
        from_currency=user_currency,
        to_currency="EUR" if user_currency != "EUR" else "USD",
        from_currency_flag=currency_to_flag(user_currency),
        to_currency_flag=currency_to_flag(
            "EUR" if user_currency != "EUR" else "USD"
        )
    )

@app.route('/convert', methods=['POST'])
def convert():
    try:
        amount = float(request.form['amount'])
        from_currency = request.form['from_currency']
        to_currency = request.form['to_currency']

        response = requests.get(
            f"{API_URL}/{from_currency}/{to_currency}",
            timeout=5
        )
        data = response.json()

        if data.get('result') == 'success':
            converted = round(amount * data['conversion_rate'], 2)
            result = f"{amount} {from_currency} = {converted} {to_currency}"
        else:
            result = "Conversion failed."

    except Exception as e:
        result = f"Error: {e}"

    return render_template(
        "index.html",
        currencies=CURRENCIES,
        result=result,
        from_currency=from_currency,
        to_currency=to_currency,
        from_currency_flag=currency_to_flag(from_currency),
        to_currency_flag=currency_to_flag(to_currency)
    )
