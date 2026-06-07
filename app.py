import os
from flask import Flask, request, render_template_string
from transformers import pipeline

app = Flask(__name__)

# --- BULLETPROOF MODEL LOADING ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "distilbert", "model_distilbert")

print(f"Looking for model at: {MODEL_PATH}")
print("Loading model... this might take a few seconds.")

try:
    classifier = pipeline("text-classification", model=MODEL_PATH, tokenizer=MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"\n--- ERROR DETAILS ---")
    print(f"Error loading model: {e}")
    print(f"Make sure the files inside {MODEL_PATH} are valid and not corrupted.")
    classifier = None

# --- HTML TEMPLATE ---
HTML_PAGE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fake News Detector</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; color: #333; display: flex; justify-content: center; padding-top: 50px; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 600px; }
        h2 { margin-top: 0; color: #2c3e50; }
        textarea { width: 100%; height: 150px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-family: inherit; resize: vertical; margin-bottom: 15px;}
        button { background-color: #3498db; color: white; border: none; padding: 10px 20px; font-size: 16px; border-radius: 4px; cursor: pointer; transition: background 0.3s; }
        button:hover { background-color: #2980b9; }
        .result { margin-top: 20px; padding: 15px; border-radius: 4px; font-size: 18px; }
        /* Updated CSS classes to match the new labels */
        .result.Fake { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; } 
        .result.Real { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; } 
        .error { color: red; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Fake News Detector</h2>
        <p>Paste an article or text snippet below to analyze it.</p>
        
        <form method="POST">
            <textarea name="news_text" placeholder="Enter text here..." required>{{ text_input }}</textarea>
            <button type="submit">Analyze Text</button>
        </form>

        {% if error %}
            <p class="error">{{ error }}</p>
        {% endif %}

        {% if result %}
            <div class="result {{ result.display_label }}">
                <strong>Prediction:</strong> {{ result.display_label }} <br>
                <strong>Confidence:</strong> {{ "%.2f"|format(result.score * 100) }}%
            </div>
        {% endif %}
    </div>
</body>
</html>
"""

# --- ROUTES ---
@app.route("/", methods=["GET", "POST"])
def index():
    result = None
    text_input = ""
    error = None

    if request.method == "POST":
        text_input = request.form.get("news_text", "")
        
        if not classifier:
            error = "Model failed to load. Check server logs."
        elif text_input.strip():
            try:
                prediction = classifier(text_input[:512])[0]
                
                # --- LABEL MAPPING LOGIC ---
                LABEL_MAPPING = {
                    "LABEL_0": "Real",
                    "LABEL_1": "Fake"
                }
                
                # Assign the mapped label (or fallback to original if not found)
                prediction['display_label'] = LABEL_MAPPING.get(prediction['label'], prediction['label'])
                result = prediction
                
            except Exception as e:
                error = f"An error occurred during prediction: {e}"

    return render_template_string(HTML_PAGE, result=result, text_input=text_input, error=error)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)