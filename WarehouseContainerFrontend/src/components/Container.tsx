import { Link } from "react-router-dom";
import { useContainerRackState } from "../store/containerRackState";
import { useEffect, useState } from "react";
import DeleteRackButton from "./DeleteRackButton";
import { useCurrentActor } from "../store/currentActor";

interface Props {
  id: string;
  rackIds: string[];
  onDeleteRack: (rackId: string) => void;
}

interface SensorData {
  container_id: string;
  rack_id: string;
  fruit: string;
  temperature: number;
  humidity: number;
  methane: number;
  timestamp: string;
  status: string;
  image: string | Record<string, number>;
}

const warehouseUrl = import.meta.env.VITE_WAREHOUSE_URL || "Connection error";

const Container = ({ id, rackIds, onDeleteRack }: Props) => {
  const [openRack, setOpenRack] = useState<string | null>(null);

  const toggleRack = (rackId: string) => {
    setOpenRack((prev) => (prev === rackId ? null : rackId));
  };
  const getStatus = (value: string | undefined) => {
    if (!value) console.log("Incorrect status received");
    if (value === "Spoiled") return "danger";
    else if (value === "Early Spoilage") return "warning";
    else return "success";
  };
  const { addOrUpdateContainerRackState, getContainerRackState } =
    useContainerRackState();
  const { getCurrentActor } = useCurrentActor();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://" + warehouseUrl + `/data?email=${getCurrentActor().email}`
        );
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
  }, [warehouseUrl]);

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
  }, [warehouseUrl]);

  return (
    <div className="accordion" id={`accordion-${id}`}>
      {rackIds.map((rackId: string) => {
        const rackState = getContainerRackState(id, rackId);
        const isOpen = openRack === rackId;

        return (
          <div className="accordion-item" key={rackId}>
            <h2 className="accordion-header m-1">
              <button
                className={`accordion-button ${
                  !isOpen ? "collapsed" : ""
                } bg-${getStatus(rackState?.status)} text-white`}
                type="button"
                onClick={() => toggleRack(rackId)}
              >
                Rack #{rackId}
              </button>
            </h2>
            <div
              className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
            >
              <div className="accordion-body">
                <div className="card">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      Temperature: {rackState?.temperature}
                    </li>
                    <li className="list-group-item">
                      Humidity: {rackState?.humidity}
                    </li>
                    <li className="list-group-item">
                      Methane: {rackState?.methane}
                    </li>
                    <li className="list-group-item">
                      Time:{" "}
                      {rackState?.timestamp &&
                        new Date(rackState.timestamp).toLocaleString()}
                    </li>
                  </ul>
                </div>
                <div className="d-flex justify-content-between hstack">
                  <Link className="icon-link" to={`/rack/${id}/${rackId}`}>
                    Go to
                  </Link>
                  <DeleteRackButton
                    id={rackId}
                    onDeleteRack={() => onDeleteRack(rackId)}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Container;
