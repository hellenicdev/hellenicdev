from flask import Flask, render_template, request
import requests
import pycountry
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise ValueError("API key not found")

API_URL = f"https://v6.exchangerate-api.com/v6/{API_KEY}/pair"

CURRENCIES = sorted([
    (c.alpha_3, c.name) for c in pycountry.currencies
    if hasattr(c, 'alpha_3') and hasattr(c, 'name')
])

@app.route('/')
def index():
    return render_template('index.html', currencies=CURRENCIES)

@app.route('/convert', methods=['POST'])
def convert():
    try:
        amount = float(request.form['amount'])
        from_currency = request.form['from_currency']
        to_currency = request.form['to_currency']

        response = requests.get(f"{API_URL}/{from_currency}/{to_currency}")
        data = response.json()

        if data.get('result') == 'success':
            converted = round(amount * data['conversion_rate'], 2)
            result = f"{amount} {from_currency} = {converted} {to_currency}"
        else:
            result = "Conversion failed."

    except Exception as e:
        result = f"Error: {e}"

    return render_template('index.html', currencies=CURRENCIES, result=result)
