from flask import Flask, request, jsonify
app = Flask(__name__)  # ✅ This must be exactly 'app'
from dotenv import load_dotenv
import os, requests
from flask_cors import CORS
CORS(app)



load_dotenv()
SECRET = os.getenv("RECAPTCHA_SECRET")

app = Flask(__name__)

@app.post("/verify-recaptcha")
def verify_recaptcha():
    token = request.json.get("token")
    if not token:
        return jsonify({"success": False, "error": "no-token"}), 400

    # Verify with Google
    resp = requests.post(
        "https://www.google.com/recaptcha/api/siteverify",
        data={"secret": SECRET, "response": token}
    ).json()

    if resp.get("success"):
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "error": resp.get("error-codes")}), 403


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
