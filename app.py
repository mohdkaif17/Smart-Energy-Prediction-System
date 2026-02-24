import os
from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Debug: list templates
print("Templates folder files:", os.listdir("templates"))

# Load model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "energy_model.pkl"))

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/predict-page")
def predict_page():
    return render_template("predict.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/csv")
def csv_page():
    return render_template("csv.html")

@app.route("/about")
def about():
    return render_template("about.html")

# Single Prediction
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        input_df = pd.DataFrame([{
            "Temperature": float(data["temperature"]),
            "Humidity": float(data["humidity"])
        }])

        pred = model.predict(input_df)[0]

        return jsonify({
            "success": True,
            "prediction": round(float(pred), 2)
        })

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"success": False, "error": "Prediction failed"}), 500


# CSV Prediction
@app.route("/predict_csv", methods=["POST"])
def predict_csv():
    try:
        file = request.files["file"]
        df = pd.read_csv(file)

        features = ["Temperature", "Humidity"]
        preds = model.predict(df[features])

        total_kwh = round(float(preds.sum()), 2)
        bill = round(total_kwh * 6, 2)  # ₹6 per kWh example

        return jsonify({"total_kwh": total_kwh, "bill": bill})

    except Exception as e:
        print("CSV prediction error:", e)
        return jsonify({"error": "CSV prediction failed"}), 500


if __name__ == "__main__":
    app.run(debug=True)