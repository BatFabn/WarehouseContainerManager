import joblib
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler

rf_model = joblib.load("random_forest_spoilage_finetuned.pkl")
scaler = joblib.load("scaler.pkl")


def process_num_inputs(fruit, temperature, humidity, methane):
    # (Fruit, Temperature = 25°C, Humidity = 58%, Methane = 1.2 ppm)
    # new_data = np.array([[2, 28, 72, 2]])
    new_data = np.array([[fruit, temperature, humidity, methane]])

    new_data_scaled = scaler.transform(new_data)

    prediction = rf_model.predict(new_data_scaled)

    spoilage_labels = ["Fresh", "Early Spoilage", "Spoiled"]
    return {"status": spoilage_labels[prediction[0]]}
