from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import traceback
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# 1. DEFINE FEATURES GLOBALLY (This prevents the NameError)
features = ['Airline', 'Origin', 'Dest', 'Departure_Hour']
model = None
encoders = None

# 2. LOAD MODEL WITH AUTOMATIC PATH CHECKING
# This looks for the file in the current folder OR the 'backend' folder
possible_paths = ['flight_model.pkl', 'backend/flight_model.pkl']
model_path = None

for path in possible_paths:
    if os.path.exists(path):
        model_path = path
        break

if model_path:
    try:
        with open(model_path, 'rb') as f:
            data = pickle.load(f)
            model = data['model']
            encoders = data['encoders']
        print(f"✅ AI Engine Online! Loaded: {model_path}")
    except Exception as e:
        print(f"❌ Error unpickling model: {e}")
else:
    print("❌ CRITICAL: flight_model.pkl not found in any directory!")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        user_input = request.json
        print(f"\n--- DATA RECEIVED: {user_input} ---")

        # Handle 'ZZ' Cheat Code first
        airline = str(user_input.get('airline', '')).upper()
        if airline == 'ZZ':
            return jsonify({'delayed': True, 'score': 99})

        # Basic inputs
        origin = str(user_input.get('origin', '')).upper()
        dest = str(user_input.get('dest', '')).upper()
        time_str = str(user_input.get('time', '12:00'))
        
        try:
            departure_hour = int(time_str.split(':')[0])
        except:
            departure_hour = 12

        # Check if model loaded before trying to predict
        if model is None or encoders is None:
            return jsonify({'error': 'Model not loaded on server'}), 500

        # Build DataFrame
        input_df = pd.DataFrame([{
            'Airline': airline,
            'Origin': origin,
            'Dest': dest,
            'Departure_Hour': departure_hour
        }])

        # Enforce column order
        input_df = input_df[features]

        # Label Encoding
        for col in ['Airline', 'Origin', 'Dest']:
            val = input_df[col].iloc[0]
            if val in encoders[col].classes_:
                input_df[col] = encoders[col].transform([val])
            else:
                input_df[col] = 0

        # Prediction logic
        prob = model.predict_proba(input_df.astype(int))[0][1]
        
        return jsonify({
            'delayed': bool(prob > 0.15), # 15% risk threshold
            'score': int(prob * 100)
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)