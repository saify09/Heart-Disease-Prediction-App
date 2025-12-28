from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import joblib
import os

app = Flask(__name__, static_folder='.')
CORS(app)

# Load model, scaler, and columns
try:
    model = joblib.load('knn_heart_model.pkl')
    scaler = joblib.load('heart_scaler.pkl')
    expected_columns = joblib.load('heart_columns.pkl')
    print("Models and artifacts loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('.', path)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Extract features from request
        raw_input = {
            'Age': data.get('Age'),
            'RestingBP': data.get('RestingBP'),
            'Cholesterol': data.get('Cholesterol'),
            'FastingBS': int(data.get('FastingBS', 0)),
            'MaxHR': data.get('MaxHR'),
            'Oldpeak': data.get('Oldpeak'),
        }

        # Handle categorical features
        raw_input['Sex_' + data.get('Sex')] = 1
        raw_input['ChestPainType_' + data.get('ChestPainType')] = 1
        raw_input['RestingECG_' + data.get('RestingECG')] = 1
        raw_input['ExerciseAngina_' + data.get('ExerciseAngina')] = 1
        raw_input['ST_Slope_' + data.get('ST_Slope')] = 1

        input_df = pd.DataFrame([raw_input])
        for col in expected_columns:
            if col not in input_df.columns:
                input_df[col] = 0

        input_df = input_df[expected_columns]
        scaled_input = scaler.transform(input_df)
        prediction = int(model.predict(scaled_input)[0])
        
        try:
            probability = model.predict_proba(scaled_input)[0][1]
        except:
            probability = None

        return jsonify({
            'prediction': prediction,
            'probability': float(probability) if probability is not None else None,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'failed'}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

if __name__ == '__main__':
    # For local testing, host on 0.0.0.0 and port 7860
    app.run(host='0.0.0.0', port=7860)
