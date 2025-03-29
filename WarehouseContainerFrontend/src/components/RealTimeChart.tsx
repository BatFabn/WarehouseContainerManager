import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import SuggestedConditions from "./SuggestedConditions";

interface SensorData {
  foodItem: string;
  methane: number;
  temperature?: number;
  humidity?: number;
  lastDetected: string;
}

const foodEncoding: Record<string, number> = {
  apple: 0,
  banana: 1,
  orange: 2,
  mango: 3,
  grapes: 4,
};

const webSocketUrl = import.meta.env.VITE_WAREHOUSE_URL || "Connection error";

const RealTimeText: React.FC = () => {
  const [data, setData] = useState<SensorData>({
    foodItem: "Empty",
    methane: 0,
    temperature: 0,
    humidity: 0,
    lastDetected: "Nill",
  });

  const [chartData, setChartData] = useState<Array<any>>([]);

  useEffect(() => {
    const ws = new WebSocket(webSocketUrl);

    ws.onopen = () => {
      console.log("✅ WebSocket connected!");
    };

    ws.onmessage = (event) => {
      console.log("📩 Received:", event.data);
      const receivedData = JSON.parse(event.data);

      const foodItem = receivedData.foodItem?.toLowerCase() || "unknown";
      const foodIndex = foodEncoding[foodItem] ?? -1; // Default to -1 if not found

      setData({
        ...receivedData,
        foodItem,
      });

      if (
        receivedData.temperature !== undefined &&
        receivedData.humidity !== undefined &&
        receivedData.methane !== undefined
      ) {
        setChartData((prevData) => [
          ...prevData,
          {
            name: new Date().toLocaleTimeString(),
            temperature: receivedData.temperature,
            humidity: receivedData.humidity,
            methane: receivedData.methane,
          },
        ]);
      }

      console.log("🍎 Encoded Food Index:", foodIndex);
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("⚠️ WebSocket disconnected!");
    };

    return () => {
      ws.close();
      console.log("🛑 WebSocket closed.");
    };
  }, []);

  return (
    <div className="container bg-dark text-white p-3">
      <h2>📡 Real-Time Data</h2>

      <div className="border p-3 mb-4">
        <h4>📊 Latest Sensor Readings</h4>
        <ul>
          <li>
            <strong>Food Item:</strong> {data.foodItem}
          </li>
          <li>
            <strong>Methane (ppm):</strong> {data.methane}
          </li>
          <li>
            <strong>Temperature (°C):</strong> {data.temperature}
          </li>
          <li>
            <strong>Humidity (%):</strong> {data.humidity}
          </li>
          <li>
            <strong>Last Detected:</strong> {data.lastDetected}
          </li>
        </ul>
      </div>

      <h3>📈 Live Graph</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: "white" }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
            <Line type="monotone" dataKey="humidity" stroke="#82ca9d" />
            <Line type="monotone" dataKey="methane" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>📉 Waiting for sensor data...</p>
      )}

      {/* Send food index along with other sensor data */}
      <SuggestedConditions
        sensorData={{ ...data, foodIndex: foodEncoding[data.foodItem] ?? -1 }}
      />
    </div>
  );
};

export default RealTimeText;
