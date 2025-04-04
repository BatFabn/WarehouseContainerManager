import NavBar from "./NavBar";
import Container from "./Container";
import DeleteContainerButton from "./DeleteContainerButton";
import AddRackButton from "./AddRackButton";
import { useState } from "react";
import AddContainerButton from "./AddContainerButton";
import DeleteContainersButton from "./DeleteContainersButton";

interface Props {
  verified: () => void;
}

const Dashboard = ({ verified }: Props) => {
  const [containersRacksCount, setContainersRacksCount] = useState<
    Record<string, string[]>
  >({ "1": ["1", "2", "3"] });

  const addContainer = (containerId: string) => {
    setContainersRacksCount((prev) => {
      const updated = { ...prev };
      if (!updated[containerId]) updated[containerId] = [];
      return updated;
    });
  };

  const deleteContainer = (containerId: string) => {
    setContainersRacksCount((prev) => {
      const updated = { ...prev };
      delete updated[containerId];
      return updated;
    });
  };

  const deleteContainers = (containerIds: string[]) => {
    setContainersRacksCount((prev) => {
      const updated = { ...prev };
      containerIds.forEach((id) => delete updated[id]);
      return updated;
    });
  };

  const addRack = (containerId: string, rackId: string) => {
    setContainersRacksCount((prev) => ({
      ...prev,
      [containerId]: [...(prev[containerId] || []), rackId],
    }));
  };

  const deleteRack = (containerId: string, rackId: string) => {
    setContainersRacksCount((prev) => ({
      ...prev,
      [containerId]: (prev[containerId] || []).filter(
        (rack) => rack !== rackId
      ),
    }));
  };

  return (
    <div className="bg-dark min-vh-100">
      <NavBar verified={verified} />

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
          <AddContainerButton
            onAddContainer={(containerId) => addContainer(containerId)}
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
