import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import io, { Socket } from "socket.io-client";

// Register Chart.js components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

const socket: Socket = io("http://localhost:3001"); // Connect to the server

// Define the structure of chart data
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

const RealTimeGraph: React.FC = () => {
  const [data, setData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "Live Data",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  });

  useEffect(() => {
    socket.on("newData", (value: number) => {
      setData((prevData) => {
        const labels = [...prevData.labels];
        const datasetData = [...prevData.datasets[0].data];

        // Keep only the last 20 data points
        if (labels.length >= 20) {
          labels.shift();
          datasetData.shift();
        }

        labels.push(new Date().toLocaleTimeString());
        datasetData.push(value);

        return {
          ...prevData,
          labels,
          datasets: [{ ...prevData.datasets[0], data: datasetData }],
        };
      });
    });

    return () => {
      socket.off("newData");
    };
  }, []);

  return (
    <div>
      <h2>Real-Time Graph</h2>
      <Line
        data={data}
        options={{ responsive: true, plugins: { legend: { display: true } } }}
      />
    </div>
  );
};

export default RealTimeGraph;
