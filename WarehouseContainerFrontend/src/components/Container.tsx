import { Link } from "react-router-dom";
import { useContainerRackState } from "../store/containerRackState";
import { useEffect } from "react";

interface Props {
  id: number;
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

const warehouseUrl = import.meta.env.VITE_WAREHOUSE_URL || "Connection error";

const Container = ({ id }: Props) => {
  const { addOrUpdateContainerRackState, getContainerRackState } =
    useContainerRackState();

  const getStatus = (value: string | undefined) => {
    if (!value) console.log("Incorrect status received");
    if (value === "Spoiled") return "danger";
    else if (value === "Early Spoilage") return "warning";
    else return "success";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://" + warehouseUrl + "/data");
        const initialData = await response.json();

        initialData &&
          initialData.forEach((data: SensorData) =>
            addOrUpdateContainerRackState(data)
          );
      } catch (error) {
        console.error("❌ Error fetching sensor data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let wsTimeout: NodeJS.Timeout;
    const ws = new WebSocket("wss://" + warehouseUrl + "/subscribe");

    ws.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);

      receivedData && addOrUpdateContainerRackState(receivedData);
      // Reset the timeout when new data arrives
      clearTimeout(wsTimeout);
      wsTimeout = setTimeout(() => {}, 30000);
    };

    return () => {
      ws.close();
      clearTimeout(wsTimeout);
    };
  }, []);

  return (
    <div className="accordion" id={`accordion-${id}`}>
      <div className="accordion-item">
        <h2 className="accordion-header m-1">
          <button
            className={`accordion-button bg-${getStatus(
              getContainerRackState(id, 1)?.status
            )} text-white`}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#collapse-${id}1`}
            aria-expanded="false"
            aria-controls={`collapse-${id}1`}
          >
            Rack #1
          </button>
        </h2>
        <div
          id={`collapse-${id}1`}
          className="accordion-collapse collapse"
          data-bs-parent={`#accordion-${id}`}
        >
          <div className="accordion-body">
            <div className="card">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  Temperature: {getContainerRackState(id, 1)?.temperature}
                </li>
                <li className="list-group-item">
                  Humidity: {getContainerRackState(id, 1)?.humidity}
                </li>
                <li className="list-group-item">
                  Methane: {getContainerRackState(id, 1)?.methane}
                </li>
                <li className="list-group-item">
                  Time:{" "}
                  {getContainerRackState(id, 3)?.timestamp &&
                    new Date(
                      getContainerRackState(id, 3)?.timestamp!
                    ).toLocaleString()}
                </li>
              </ul>
            </div>
            <div className="hstack gap-3">
              <Link className="icon-link" to={`/rack/${String(id)}/1`}>
                Go to
              </Link>
              <button type="button" className="btn btn-danger ms-auto">
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header m-1">
          <button
            className={`accordion-button bg-${getStatus(
              getContainerRackState(id, 2)?.status
            )} text-white`}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#collapse-${id}2`}
            aria-expanded="false"
            aria-controls={`collapse-${id}2`}
          >
            Rack #2
          </button>
        </h2>
        <div
          id={`collapse-${id}2`}
          className="accordion-collapse collapse"
          data-bs-parent={`#accordion-${id}`}
        >
          <div className="card">
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                Temperature: {getContainerRackState(id, 2)?.temperature}
              </li>
              <li className="list-group-item">
                Humidity: {getContainerRackState(id, 2)?.humidity}
              </li>
              <li className="list-group-item">
                Methane: {getContainerRackState(id, 2)?.methane}
              </li>
              <li className="list-group-item">
                Time:{" "}
                {getContainerRackState(id, 3)?.timestamp &&
                  new Date(
                    getContainerRackState(id, 3)?.timestamp!
                  ).toLocaleString()}
              </li>
            </ul>
          </div>
          <div className="hstack gap-3">
            <Link className="icon-link" to={`/rack/${String(id)}/2`}>
              Go to
            </Link>
            <button type="button" className="btn btn-danger ms-auto">
              Stop
            </button>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header m-1">
          <button
            className={`accordion-button bg-${getStatus(
              getContainerRackState(id, 3)?.status
            )} text-white`}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#collapse-${id}3`}
            aria-expanded="false"
            aria-controls={`collapse-${id}3`}
          >
            Rack #3
          </button>
        </h2>
        <div
          id={`collapse-${id}3`}
          className="accordion-collapse collapse"
          data-bs-parent={`#accordion-${id}`}
        >
          <div className="card">
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                Temperature: {getContainerRackState(id, 3)?.temperature}
              </li>
              <li className="list-group-item">
                Humidity: {getContainerRackState(id, 3)?.humidity}
              </li>
              <li className="list-group-item">
                Methane: {getContainerRackState(id, 3)?.methane}
              </li>
              <li className="list-group-item">
                Time:{" "}
                {getContainerRackState(id, 3)?.timestamp &&
                  new Date(
                    getContainerRackState(id, 3)?.timestamp!
                  ).toLocaleString()}
              </li>
            </ul>
          </div>
          <div className="hstack gap-3">
            <Link className="icon-link" to={`/rack/${String(id)}/3`}>
              Go to
            </Link>
            <button type="button" className="btn btn-danger ms-auto">
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Container;
