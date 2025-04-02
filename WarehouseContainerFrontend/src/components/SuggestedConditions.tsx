import { useState, useEffect } from "react";
import { Architect, Trainer } from "synaptic";
import { Table, Container, Row, Col } from "react-bootstrap";

interface ContainerItem {
  foodIndex: number;
  methane: number;
  timestamp: string;
}

interface SuggestedConditionsProps {
  sensorData: ContainerItem | null;
}

interface SuggestedConditions {
  temperature: number | null;
  pressure: number | null;
  humidity: number | null;
}

// Food encoding
const foodEncoding: Record<string, number> = {
  apple: 0,
  banana: 1,
  orange: 2,
  mango: 3,
  grapes: 4,
};

// Training Data
const trainingData = [
  { input: [0, 0.3], output: [20 / 50, 1013 / 1050, 15 / 30] }, // Apple
  { input: [1, 1.0], output: [22 / 50, 1015 / 1050, 18 / 30] }, // Banana
  { input: [2, 2.5], output: [28 / 50, 1018 / 1050, 20 / 30] }, // Orange
  { input: [3, 3.2], output: [30 / 50, 1020 / 1050, 25 / 30] }, // Mango
  { input: [4, 1.5], output: [25 / 50, 1016 / 1050, 22 / 30] }, // Grapes
];

// Initialize Neural Network (2 inputs, 3 hidden neurons, 3 outputs)
const net = new Architect.Perceptron(2, 3, 3);
const trainer = new Trainer(net);

// Train the Neural Network
trainer.train(
  trainingData.map(({ input, output }) => ({ input, output })),
  {
    iterations: 10000,
    error: 0.001,
    rate: 0.1,
  }
);

const SuggestedConditions = ({ sensorData }: SuggestedConditionsProps) => {
  const [item, setItem] = useState<ContainerItem | null>(null);

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
      const foodNum = item.foodIndex;
      if (!(foodNum in Object.values(foodEncoding))) {
        return { temperature: null, pressure: null, humidity: null };
      }

      const [temp, press, humid] = net.activate([foodNum, item.methane]);
      console.log("Input to NN:", [foodNum, item.methane]);
      console.log("Raw NN Output:", [temp, press, humid]);

      return {
        temperature: Math.round(temp * 50 * 10) / 10, // Scale back to °C
        pressure: Math.round(press * 50 + 1000), // Scale back to hPa
        humidity: Math.round(humid * 30 * 10) / 10, // Scale back to g/m³
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
                  <th>Suggested Humidity (g/m³)</th>
                  <th>Last Detected</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {Object.keys(foodEncoding).find(
                      (key) => foodEncoding[key] === item.foodIndex
                    ) ?? "Unknown"}
                  </td>
                  <td>{item.methane.toFixed(2)}</td>
                  {(() => {
                    const conditions = getSuggestedConditions(item);
                    return (
                      <>
                        <td>{conditions.temperature}</td>
                        <td>{conditions.pressure}</td>
                        <td>{conditions.humidity}</td>
                      </>
                    );
                  })()}
                  <td>{new Date(item.timestamp).toLocaleTimeString()}</td>
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
