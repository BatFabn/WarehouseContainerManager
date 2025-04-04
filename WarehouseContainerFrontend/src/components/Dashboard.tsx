import NavBar from "./NavBar";
import Container from "./Container";
import DeleteContainerButton from "./DeleteContainerButton";
import AddRackButton from "./AddRackButton";
import { useState } from "react";
import AddContainerButton from "./AddContainerButton";

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
      updated[containerId] = [];
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
    <div>
      <NavBar verified={verified} />
      <div className="container overflow-hidden text-center p-5">
        <div className="row g-5">
          {Object.keys(containersRacksCount).map((containerId: string) => (
            <div className="col-6 bg-secondary text-white p-4">
              <Container
                id={containerId}
                rackIds={containersRacksCount[containerId]}
                onDeleteRack={(rackId) => deleteRack(containerId, rackId)}
              />
              <div className="p-3 fs-3">Container #{containerId}</div>
              <div className="hstack px-5">
                <DeleteContainerButton
                  id={containerId}
                  onDeleteContainer={(containerId) =>
                    deleteContainer(containerId)
                  }
                />
                <AddRackButton
                  containerId={containerId}
                  onAddRack={(rackId) => addRack(containerId, rackId)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <AddContainerButton
        onAddContainer={(containerId) => addContainer(containerId)}
      />
    </div>
  );
};

export default Dashboard;
