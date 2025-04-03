import { useEffect, useState } from "react";
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
import { useContainerRackState } from "../store/containerRackState";

interface Props {
  queryContainerId: number;
  queryRackId: number;
}

interface SensorData {
  container_id: number;
  rack_id: number;
  fruit: string;
  temperature: number;
  humidity: number;
  methane: number;
  timestamp: string;
  status: string;
  image: string | Record<string, number>;
}

const foodEncoding: Record<string, number> = {
  apple: 0,
  banana: 1,
  orange: 2,
  mango: 3,
  grapes: 4,
};

const warehouseUrl = import.meta.env.VITE_WAREHOUSE_URL || "Connection error";

const RealTimeText = ({
  queryContainerId: containerId,
  queryRackId: rackId,
}: Props) => {
  const [data, setData] = useState<SensorData | null>(null);
  const [rackDataStatus, setRackDataStatus] = useState<string>("");
  const [chartData, setChartData] = useState<Array<any>>([]);
  const [wsStatus, setWsStatus] = useState<
    "Connecting" | "Connected" | "Disconnected"
  >("Connecting");
  const [noDataReceived, setNoDataReceived] = useState<boolean>(false);
  const { addOrUpdateContainerRackState } = useContainerRackState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://" +
            warehouseUrl +
            `/data/?rack_id=${rackId}&container_id=${containerId}`
        );
        const initialData = await response.json();

        if (initialData && Array.isArray(initialData)) {
          const formattedData = initialData.map((entry) => ({
            name: new Date(entry.timestamp).toLocaleTimeString(),
            temperature: entry.temperature,
            humidity: entry.humidity,
            methane: entry.methane,
          }));

          setChartData(formattedData);
          setData(initialData[initialData.length - 1]); // Set latest reading
        } else setRackDataStatus("No data");
      } catch (error) {
        console.error("❌ Error fetching sensor data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let wsTimeout: NodeJS.Timeout;
    const ws = new WebSocket("wss://" + warehouseUrl + "/subscribe");

    ws.onopen = () => {
      console.log("✅ WebSocket connected!");
      setWsStatus("Connected");

      // Start timeout for no data received
      wsTimeout = setTimeout(() => {
        setNoDataReceived(true);
      }, 30000); // 30 seconds
    };

    ws.onmessage = (event) => {
      console.log("📩 Received:", event.data);
      const receivedData = JSON.parse(event.data);

      if (
        !receivedData ||
        receivedData.container_id !== containerId ||
        receivedData.rack_id !== rackId
      ) {
        return;
      }
      setRackDataStatus("");
      setData(receivedData);

      setChartData((prevData) => [
        ...prevData,
        {
          name: new Date().toLocaleTimeString(),
          temperature: receivedData.temperature,
          humidity: receivedData.humidity,
          methane: receivedData.methane,
        },
      ]);

      data && addOrUpdateContainerRackState(data);
      // Reset the timeout when new data arrives
      clearTimeout(wsTimeout);
      setNoDataReceived(false);
      wsTimeout = setTimeout(() => {
        setNoDataReceived(true);
      }, 30000);
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      setWsStatus("Disconnected");
    };

    ws.onclose = () => {
      console.log("⚠️ WebSocket disconnected!");
      setWsStatus("Disconnected");
    };

    return () => {
      ws.close();
      console.log("🛑 WebSocket closed.");
      clearTimeout(wsTimeout);
    };
  }, []);

  useEffect(() => {
    if (data) {
      console.log("🔄 Storing in Zustand:", data);
      addOrUpdateContainerRackState(data);
    }
  }, [data]);

  useEffect(() => {
    console.log("📦 Zustand Store:", useContainerRackState.getState());
  }, [data]);

  return (
    <div className="container bg-dark text-white p-3">
      {rackDataStatus === "" ? (
        <>
          <h2>📡 Real-Time Data</h2>

          {/* ✅ Server Status Indicator */}
          <div className="mb-3">
            {wsStatus === "Connected" ? (
              <span style={{ color: "lightgreen", fontWeight: "bold" }}>
                🟢 Connected to Server
              </span>
            ) : wsStatus === "Connecting" ? (
              <span style={{ color: "yellow", fontWeight: "bold" }}>
                🟡 Connecting to Server...
              </span>
            ) : (
              <span style={{ color: "red", fontWeight: "bold" }}>
                🔴 Server Down
              </span>
            )}
          </div>

          {wsStatus === "Connected" && noDataReceived && (
            <p style={{ color: "orange", fontWeight: "bold" }}>
              ⚠️ No new data received from Sensor!
            </p>
          )}

          <div className="border p-3 mb-4">
            <h4>📊 Latest Sensor Readings</h4>
            {data ? (
              <ul>
                <li>
                  <strong>Food Item:</strong> {data.fruit}
                </li>
                <li>
                  <strong>Status:</strong> {data.status}
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
                  <strong>Last Detected:</strong>{" "}
                  {new Date(data.timestamp).toLocaleString()}
                </li>
              </ul>
            ) : (
              <p>⌛ Loading data...</p>
            )}
          </div>

          <h3>📈 Live Graph</h3>
          <ResponsiveContainer width="100%" height={400}>
            {chartData.length > 0 ? (
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
            ) : (
              <p>📉 Waiting for sensor data...</p>
            )}
          </ResponsiveContainer>

          {data && (
            <SuggestedConditions
              sensorData={{
                foodIndex: foodEncoding[data.fruit] ?? -1,
                methane: data.methane,
                timestamp: data.timestamp,
              }}
            />
          )}
        </>
      ) : (
        <h1>{rackDataStatus}</h1>
      )}
    </div>
  );
};

export default RealTimeText;
