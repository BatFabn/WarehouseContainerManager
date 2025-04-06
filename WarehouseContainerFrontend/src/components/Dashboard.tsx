import NavBar from "./NavBar";
import Container from "./Container";
import DeleteContainerButton from "./DeleteContainerButton";
import AddRackButton from "./AddRackButton";
import { useEffect, useState, useRef } from "react";
import AddContainersButton from "./AddContainerButton";
import DeleteContainersButton from "./DeleteContainersButton";
import { useNavigate } from "react-router-dom";
import { useUserActionState } from "../store/userActionState";
import axios from "axios";
import { useCurrentActor } from "../store/currentActor";

const warehouseUrl = import.meta.env.VITE_WAREHOUSE_URL || "Connection error";

const Dashboard = () => {
  const [containersRacksCount, setContainersRacksCount] = useState<
    Record<string, string[]>
  >({});
  const [hasFetched, setHasFetched] = useState(false);
  const [action, setAction] = useState<string>("");
  const prevDataRef = useRef<Record<string, string[]>>({});
  const { updateUserActionState } = useUserActionState();
  const { getCurrentActor } = useCurrentActor();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "[]");
  const email = user?.[0];

  const addContainers = (containerIds: string[]) => {
    setAction(
      `Added Container #${containerIds.join(
        ", "
      )} on ${new Date().toLocaleString()}`
    );
    setContainersRacksCount((prev) => {
      const updated = { ...prev };
      containerIds.forEach((containerId) => {
        if (!updated[containerId]) updated[containerId] = [];
      });
      return updated;
    });
  };

  const deleteContainer = (containerId: string) => {
    setAction(
      `Deleted Container #${containerId} on ${new Date().toLocaleString()}`
    );
    setContainersRacksCount((prev) => {
      const updated = { ...prev };
      delete updated[containerId];
      return updated;
    });
  };

  const deleteContainers = (containerIds: string[]) => {
    setAction(
      `Deleted Containers #${containerIds.join(
        ", "
      )} on ${new Date().toLocaleString()}`
    );
    setContainersRacksCount((prev) => {
      const updated = { ...prev };
      containerIds.forEach((id) => delete updated[id]);
      return updated;
    });
  };

  const addRack = (containerId: string, rackId: string) => {
    setAction(
      `Added Rack #${rackId} in Container #${containerId} on ${new Date().toLocaleString()}`
    );
    setContainersRacksCount((prev) => ({
      ...prev,
      [containerId]: [...(prev[containerId] || []), rackId],
    }));
  };

  const deleteRack = (containerId: string, rackId: string) => {
    setAction(
      `Deleted Rack #${rackId} in Container #${containerId} on ${new Date().toLocaleString()}`
    );
    setContainersRacksCount((prev) => ({
      ...prev,
      [containerId]: (prev[containerId] || []).filter(
        (rack) => rack !== rackId
      ),
    }));
  };

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/");
    }

    if (email) {
      updateUserActionState(email, `${action}`);
    }
  }, [navigate, action, email]);

  useEffect(() => {
    const fetchData = async () => {
      const localData: Record<string, string[]> = JSON.parse(
        localStorage.getItem("containers_managed") || "{}"
      );

      let backendData: Record<string, string[]> = {};

      try {
        const response = await fetch(
          `https://${warehouseUrl}/containers_managed?email=${email}`
        );
        const containers = await response.json();
        containers.forEach(
          (c: { container_id: string; rack_ids: string[] }) =>
            (backendData[c.container_id] = c.rack_ids)
        );
      } catch (error) {
        console.error("❌ Error fetching containers managed data:", error);
      }

      // Merge with local taking precedence
      const merged = { ...backendData, ...localData };

      setContainersRacksCount(merged);
      localStorage.setItem("containers_managed", JSON.stringify(merged));
      prevDataRef.current = merged;
      setHasFetched(true);
    };

    fetchData();
  }, [warehouseUrl, email]);

  useEffect(() => {
    if (!hasFetched) return;

    const hasChanges =
      JSON.stringify(prevDataRef.current) !==
      JSON.stringify(containersRacksCount);

    if (!hasChanges) return;

    prevDataRef.current = containersRacksCount;

    localStorage.setItem(
      "containers_managed",
      JSON.stringify(containersRacksCount)
    );

    const postData = async () => {
      const data: { container_id: string; rack_ids: string[] }[] = [];
      Object.entries(containersRacksCount).forEach(([container_id, rack_ids]) =>
        data.push({ container_id, rack_ids })
      );

      try {
        await axios.post(`https://${warehouseUrl}/containers_managed`, {
          email,
          containers: data,
        });
      } catch (err: any) {
        console.error("❌ Error syncing local changes to backend:", err);
      }
    };

    postData();
  }, [containersRacksCount, hasFetched, email]);

  return (
    <div className="bg-dark min-vh-100">
      <NavBar />
      <div className="container d-flex flex-column align-items-center py-5">
        <h1>Acting as {getCurrentActor()}</h1>
        <div className="container py-5">
          <div className="row gy-5 justify-content-center">
            {Object.keys(containersRacksCount).map((containerId: string) => (
              <div key={containerId} className="col-md-6">
                <div className="card shadow rounded-4 overflow-hidden">
                  <div className="card-header text-white fs-4 fw-semibold">
                    Container #{containerId}
                  </div>
                  <div className="card-body bg-dark">
                    <Container
                      id={containerId}
                      rackIds={containersRacksCount[containerId]}
                      onDeleteRack={(rackId) => deleteRack(containerId, rackId)}
                    />
                  </div>
                  <div className="card-footer bg-dark d-flex justify-content-between">
                    <DeleteContainerButton
                      id={containerId}
                      onDeleteContainer={(id) => deleteContainer(id)}
                    />
                    <AddRackButton
                      containerId={containerId}
                      onAddRack={(rackId) => addRack(containerId, rackId)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex justify-content-center mt-5 gap-3">
          <AddContainersButton
            onAddContainer={(containerIds) => addContainers(containerIds)}
          />
          <DeleteContainersButton
            containers={containersRacksCount}
            onDeleteContainers={(containerIds: string[]) =>
              deleteContainers(containerIds)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
