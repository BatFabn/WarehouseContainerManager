import { useState, useEffect } from "react";
import * as brain from "brain.js";
import { Table, Container, Row, Col } from "react-bootstrap";

interface ContainerItem {
  foodIndex: number;
  methane: number;
  lastDetected: string;
}

interface SuggestedConditionsProps {
  sensorData: ContainerItem | null;
}

interface SuggestedConditions {
  temperature: number | null;
  pressure: number | null;
  humidity: number | null;
}

// 🔹 Define categories for food items (assign a number to each)
const foodEncoding: Record<string, number> = {
  apple: 0,
  banana: 1,
  orange: 2,
  mango: 3,
  grapes: 4,
};

// 🔹 Training Data - Using both `foodItem` and `methane`
const trainingData = [
  {
    input: { food: 0, methane: 0.3 },
    output: { temp: 20, press: 1013, humid: 55 },
  }, // Apple
  {
    input: { food: 1, methane: 1.0 },
    output: { temp: 22, press: 1015, humid: 58 },
  }, // Banana
  {
    input: { food: 2, methane: 2.5 },
    output: { temp: 28, press: 1018, humid: 67 },
  }, // Orange
  {
    input: { food: 3, methane: 3.2 },
    output: { temp: 30, press: 1020, humid: 70 },
  }, // Mango
  {
    input: { food: 4, methane: 1.5 },
    output: { temp: 25, press: 1016, humid: 60 },
  }, // Grapes
];

const SuggestedConditions = ({ sensorData }: SuggestedConditionsProps) => {
  const [item, setItem] = useState<ContainerItem | null>(null);
  const net = new brain.NeuralNetwork();

  useEffect(() => {
    net.train(trainingData, {
      iterations: 200,
      errorThresh: 0.005,
    });
  }, []);

  useEffect(() => {
    if (!sensorData) {
      console.warn("No valid sensor data received.");
      setItem(null);
    } else {
      setItem(sensorData);
    }
  }, [sensorData]);

  const getSuggestedConditions = (item: ContainerItem): SuggestedConditions => {
    try {
      // Convert `foodItem` to a number
      const foodNum = foodEncoding[item.foodIndex] ?? -1;

      if (foodNum === -1) {
        return { temperature: null, pressure: null, humidity: null };
      }

      const prediction = net.run({
        food: foodNum,
        methane: item.methane,
      }) as Partial<{
        temp: number;
        press: number;
        humid: number;
      }>;

      return {
        temperature: Math.round((prediction?.temp ?? 10) * 10) / 10,
        pressure: Math.round(prediction?.press ?? 1013),
        humidity: Math.round(prediction?.humid ?? 85),
      };
    } catch (err) {
      console.error(`Error predicting for ${item.foodIndex}:`, err);
      return { temperature: null, pressure: null, humidity: null };
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h3>Suggested Conditions</h3>
          {!item ? (
            <p>No data available.</p>
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
                <tr>
                  <td>{foodEncoding[item.foodIndex] ?? "Unknown"}</td>
                  <td>{item.methane.toFixed(2)}</td>
                  <td>{getSuggestedConditions(item).temperature}</td>
                  <td>{getSuggestedConditions(item).pressure}</td>
                  <td>{getSuggestedConditions(item).humidity}</td>
                  <td>{new Date(item.lastDetected).toLocaleTimeString()}</td>
                </tr>
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SuggestedConditions;
