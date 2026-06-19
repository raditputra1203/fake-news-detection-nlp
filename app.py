import os
from flask import Flask, request, jsonify
from transformers import pipeline

import sys
sys.path.append('backend/preprocess/')
from backend.preprocess import prepare_for_distilbert

app = Flask(__name__)

# --- ALLOW LIVE SERVER (CORS) ---
@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response

# LOADING THE MODEL
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "distilbert", "model_distilbert")

print(f"Looking for model at: {MODEL_PATH}")
print("Loading model... this might take a while.")

try:
    classifier = pipeline("text-classification", model=MODEL_PATH, tokenizer=MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"\n--- ERROR DETAILS ---")
    print(f"Error loading model: {e}")
    classifier = None

# --- API ROUTE ---
@app.route("/api/analyze", methods=["POST", "OPTIONS"])
def analyze():
    # Handle preflight request from browser
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    if not classifier:
        return jsonify({"error": "Model failed to load. Check server logs."}), 500

    # Get data sent via JavaScript fetch
    data = request.get_json() or {}
    text_input = data.get("news_text", "")

    if not text_input.strip():
        return jsonify({"error": "No text provided"}), 400

    try:
        preprocessed_text = prepare_for_distilbert(body=text_input)
        prediction = classifier(preprocessed_text[:512])[0]
        
        LABEL_MAPPING = {
            "LABEL_0": "Fake",
            "LABEL_1": "Real"
        }
        
        display_label = LABEL_MAPPING.get(prediction['label'], prediction['label'])
        
        return jsonify({
            "display_label": display_label,
            "score": prediction['score']
        })
        
    except Exception as e:
        return jsonify({"error": f"An error occurred during prediction: {e}"}), 500

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)