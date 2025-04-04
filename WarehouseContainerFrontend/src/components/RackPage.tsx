import { useParams } from "react-router-dom";
import NavBar from "./NavBar";
import RealTimeGraph from "./RealTimeChart";
import { useEffect, useState } from "react";
import { useContainerRackState } from "../store/containerRackState";

interface Props {
  verified: () => void;
}

const RackPage = ({ verified }: Props) => {
  const { containerId, rackId } = useParams();
  const [status, setStatus] = useState<string>("success");
  const { getContainerRackState } = useContainerRackState();

  const updateStatus = (value: string | undefined) => {
    if (!value) console.log("Incorrect status received");
    if (value === "Spoiled") setStatus("danger");
    else if (value === "Early Spoilage") setStatus("warning");
    else setStatus("success");
  };
  const value = getContainerRackState(containerId ?? "", rackId ?? "")?.status;

  useEffect(() => {
    updateStatus(value);
    console.log(
      "Rack State:",
      getContainerRackState(containerId ?? "", rackId ?? "")
    );
  }, [value]);

  return (
    <div className={`text-center bg-${status}`}>
      <NavBar verified={verified} />
      <h2>Container #{containerId}</h2>
      <h1>Rack #{rackId}</h1>
      <RealTimeGraph queryContainerId={containerId!} queryRackId={rackId!} />
    </div>
  );
};

export default RackPage;
