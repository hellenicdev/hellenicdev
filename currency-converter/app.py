from flask import Flask, render_template, request
import requests
import pycountry
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

# Get API key from .env
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    raise ValueError("API key not found. Make sure API_KEY is set in .env")

API_URL = f"https://v6.exchangerate-api.com/v6/{API_KEY}/pair"

# Get all ISO 4217 currencies (sorted)
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

        url = f"{API_URL}/{from_currency}/{to_currency}"
        response = requests.get(url)
        data = response.json()

        if data.get('result') == 'success':
            rate = data['conversion_rate']
            converted = round(amount * rate, 2)
            result = f"{amount} {from_currency} = {converted} {to_currency}"
        else:
            result = "Conversion failed. Please check your currencies or API key."

    except Exception as e:
        result = f"Error: {str(e)}"

    return render_template('index.html', currencies=CURRENCIES, result=result)

if __name__ == '__main__':
    app.run(debug=True)
