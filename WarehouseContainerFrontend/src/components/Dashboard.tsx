import NavBar from "./NavBar";
import Container from "./Container";
import DeleteContainerButton from "./DeleteContainerButton";
import AddRackButton from "./AddRackButton";
import { useEffect, useState } from "react";
import AddContainersButton from "./AddContainerButton";
import DeleteContainersButton from "./DeleteContainersButton";
import { useNavigate } from "react-router-dom";
import { useUserActionState } from "../store/userActionState";

const Dashboard = () => {
  const [containersRacksCount, setContainersRacksCount] = useState<
    Record<string, string[]>
  >({ "1": ["1", "2", "3"] });
  const [action, setAction] = useState<string>("");
  const navigate = useNavigate();
  const { updateUserActionState } = useUserActionState();

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
      `Added Rack #{rackId} in Container #${containerId} on ${new Date().toLocaleString()}`
    );
    setContainersRacksCount((prev) => ({
      ...prev,
      [containerId]: [...(prev[containerId] || []), rackId],
    }));
  };

  const deleteRack = (containerId: string, rackId: string) => {
    setAction(
      `Deleted Rack #{rackId} in Container #${containerId} on ${new Date().toLocaleString()}`
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

    updateUserActionState(
      JSON.parse(localStorage.getItem("user")!)[0],
      `${action}`
    );
  }, [navigate, action]);

  return (
    <div className="bg-dark min-vh-100">
      <NavBar />

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
