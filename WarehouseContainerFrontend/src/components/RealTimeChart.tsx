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

const RealTimeText: React.FC = () => {
  const [data, setData] = useState<Record<string, any>>({}); // State to store the received map (key-value pairs)
  const [chartData, setChartData] = useState<Array<any>>([]); // State for chart data

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000/subscribe");

    ws.onopen = () => {
      console.log("WebSocket connected!");
    };

    ws.onmessage = (event) => {
      console.log("Received:", event.data);
      const receivedData = JSON.parse(event.data); // Parse the received JSON
      setData(receivedData); // Update the state with the received map

      // Append the relevant data to chartData
      if (
        receivedData.temperature !== undefined &&
        receivedData.humidity !== undefined &&
        receivedData.methane !== undefined
      ) {
        setChartData((prevData) => [
          ...prevData,
          {
            name: new Date().toLocaleTimeString(), // Timestamp as X-axis
            temperature: receivedData.temperature,
            humidity: receivedData.humidity,
            methane: receivedData.methane,
          },
        ]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected!");
    };

    return () => {
      ws.close(); // Cleanup the WebSocket connection
    };
  }, []);

  return (
    <div className="container bg-dark text-white">
      <h2>Real-Time Data</h2>
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            <strong>{key}</strong>: {value.toString()}
          </li>
        ))}
      </ul>
      <h3>Graph</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
          <Line type="monotone" dataKey="humidity" stroke="#82ca9d" />
          <Line type="monotone" dataKey="methane" stroke="#ff7300" />
        </LineChart>
      </ResponsiveContainer>
      <SuggestedConditions />
    </div>
  );
};

export default RealTimeText;
