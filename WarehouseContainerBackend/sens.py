from flask import Flask, request, jsonify
from flask_socketio import SocketIO
import csv

# Initialize Flask app and SocketIO
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

data_store = []  # Store received data
METHANE_THRESHOLD = 1100  # Define threshold for spoiled fruit


@app.route('/sensor', methods=['POST'])
def receive_data():
    """Receives sensor data and processes it."""
    data = request.json
    print(
        f"Received Data -> Temp: {data['temperature']}°C | Humidity: {data['humidity']}% | Methane: {data['methane']}")

    data_store.append(data)

    # Save to CSV
    with open('sensor_data.csv', 'a', newline='') as f:
        writer = csv.writer(f)
        if f.tell() == 0:
            writer.writerow(["Response ID", "Temperature",
                            "Humidity", "Methane", "Spoiled"])
        writer.writerow([
            data['Response ID'],
            data['temperature'],
            data['humidity'],
            data['methane'],
            data['methane'] > METHANE_THRESHOLD
        ])

    # Optional: emit real-time data to a frontend
    socketio.emit('new_data', data)
    return jsonify({"status": "success", "message": "Data received!"}), 200


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
