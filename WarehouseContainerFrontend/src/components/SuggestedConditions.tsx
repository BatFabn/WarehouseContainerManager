import React, { useState, useEffect } from "react";
import * as brain from "brain.js";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Button,
  Table,
  Alert,
  Spinner,
  Container,
  Row,
  Col,
} from "react-bootstrap";

// Type definitions
interface ContainerItem {
  foodItem: string;
  methane: number; // Current methane reading in ppm
  lastDetected: string; // ISO date string from server
}

interface SuggestedConditions {
  temperature: number; // Suggested temperature in °C
  pressure: number; // Suggested pressure in hPa
  humidity: number; // Suggested humidity in %
}

// Training data types for Brain.js
interface TrainingInput {
  methane: number;
}

interface TrainingOutput {
  temp: number;
  press: number;
  humid: number;
}

const SuggestedConditions: React.FC = () => {
  const [items, setItems] = useState<ContainerItem[]>([]);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Replace with your actual server endpoint when ready
  const SERVER_URL = "http://your-server:port/containers/container-1/items";

  // Initialize Brain.js neural networks
  const spinachNet = new brain.NeuralNetwork();
  const beefNet = new brain.NeuralNetwork();

  // Training data
  const spinachTrainingData: {
    input: TrainingInput;
    output: TrainingOutput;
  }[] = [
    { input: { methane: 5 }, output: { temp: 10, press: 1013, humid: 85 } },
    { input: { methane: 20 }, output: { temp: 8, press: 1015, humid: 90 } },
    { input: { methane: 50 }, output: { temp: 5, press: 1018, humid: 95 } },
  ];

  const beefTrainingData: { input: TrainingInput; output: TrainingOutput }[] = [
    { input: { methane: 10 }, output: { temp: 2, press: 1010, humid: 90 } },
    { input: { methane: 30 }, output: { temp: 1, press: 1012, humid: 92 } },
    { input: { methane: 60 }, output: { temp: 0, press: 1015, humid: 95 } },
  ];

  // Fetch data and train AI on mount
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        // Train networks with logging
        const spinachTrainResult = spinachNet.train(spinachTrainingData, {
          iterations: 200, // Increase iterations for better training
          errorThresh: 0.005, // Lower error threshold
          log: true, // Log training progress
          logPeriod: 50, // Log every 50 iterations
        });
        const beefTrainResult = beefNet.train(beefTrainingData, {
          iterations: 200,
          errorThresh: 0.005,
          log: true,
          logPeriod: 50,
        });
        console.log("Spinach Net Training Result:", spinachTrainResult);
        console.log("Beef Net Training Result:", beefTrainResult);

        // Mock data
        const itemsArray: ContainerItem[] = [
          {
            foodItem: "Fresh Spinach",
            methane: 12.5,
            lastDetected: "2025-03-23T17:00:00Z",
          },
          {
            foodItem: "Ground Beef",
            methane: 18.0,
            lastDetected: "2025-03-23T17:00:05Z",
          },
        ];
        setItems(itemsArray);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // Poll server for updates (simulated with mock data for now)
  const startMonitoring = () => {
    setIsMonitoring(true);
    const interval = setInterval(async () => {
      try {
        // Uncomment when server is ready
        // const response = await fetch(SERVER_URL);
        // if (!response.ok) throw new Error("Failed to fetch updated data");
        // const data = await response.json();
        // const itemsArray = Array.isArray(data) ? data : Object.values(data);
        // setItems(itemsArray);

        // Simulate methane variation
        setItems((prevItems) =>
          prevItems.map((item) => ({
            ...item,
            methane: item.methane + (Math.random() - 0.5) * 2, // ±1 ppm
            lastDetected: new Date().toISOString(),
          }))
        );
      } catch (err) {
        setError((err as Error).message);
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  // Predict suggested conditions
  const getSuggestedConditions = (item: ContainerItem): SuggestedConditions => {
    const net = item.foodItem === "Fresh Spinach" ? spinachNet : beefNet;
    try {
      const prediction = net.run({ methane: item.methane });
      console.log(
        `Raw prediction for ${item.foodItem} (methane: ${item.methane}):`,
        prediction
      );

      // Ensure prediction has expected keys, fallback to defaults if not
      const temp = typeof prediction.temp === "number" ? prediction.temp : 10; // Default to 10 if invalid
      const press =
        typeof prediction.press === "number" ? prediction.press : 1013; // Default to 1013
      const humid =
        typeof prediction.humid === "number" ? prediction.humid : 85; // Default to 85

      return {
        temperature: Math.round(temp * 10) / 10,
        pressure: Math.round(press),
        humidity: Math.round(humid),
      };
    } catch (err) {
      console.error(`Error predicting for ${item.foodItem}:`, err);
      return { temperature: 10, pressure: 1013, humidity: 85 }; // Reasonable defaults
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2 className="mb-4">Container Manager (Container #1)</h2>
          <Button
            variant={isMonitoring ? "danger" : "primary"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            disabled={loading}
            className="mb-4"
          >
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </Button>

          {loading && (
            <div className="text-center">
              <Spinner animation="border" role="status" />
              <span className="ms-2">Loading data...</span>
            </div>
          )}
          {error && <Alert variant="danger">{error}</Alert>}

          <h3>Suggested Conditions for Container #1</h3>
          {items.length === 0 ? (
            <p>No items detected in the container.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Methane (ppm)</th>
                  <th>Suggested Temp (°C)</th>
                  <th>Suggested Pressure (hPa)</th>
                  <th>Suggested Humidity (%)</th>
                  <th>Last Detected</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const suggested = getSuggestedConditions(item);
                  return (
                    <tr key={index}>
                      <td>{item.foodItem}</td>
                      <td>{item.methane.toFixed(1)}</td>
                      <td>{suggested.temperature}</td>
                      <td>{suggested.pressure}</td>
                      <td>{suggested.humidity}</td>
                      <td>
                        {new Date(item.lastDetected).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SuggestedConditions;
