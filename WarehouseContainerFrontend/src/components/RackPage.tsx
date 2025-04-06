import { useNavigate, useParams } from "react-router-dom";
import NavBar from "./NavBar";
import RealTimeGraph from "./RealTimeChart";
import { useEffect, useState } from "react";
import { useContainerRackState } from "../store/containerRackState";
import { useCurrentActor } from "../store/currentActor";

const RackPage = () => {
  const { containerId, rackId } = useParams();
  const [status, setStatus] = useState<string>("success");
  const { getContainerRackState } = useContainerRackState();
  const { getCurrentActor } = useCurrentActor();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("user")) navigate("/");
  }, [navigate]);

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
      <NavBar />
      <h1>Acting as {getCurrentActor().name}</h1>
      <h2>Container #{containerId}</h2>
      <h1>Rack #{rackId}</h1>
      <RealTimeGraph queryContainerId={containerId!} queryRackId={rackId!} />
    </div>
  );
};

export default RackPage;
