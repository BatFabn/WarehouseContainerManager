import { useParams } from "react-router-dom";
import NavBar from "./NavBar";
import RealTimeGraph from "./RealTimeChart";

interface Props {
  verified: () => void;
}

const RackPage = ({ verified }: Props) => {
  const { containerId, rackId } = useParams();

  return (
    <div className="text-center bg-success">
      <NavBar verified={verified} />
      <h2>Container #{containerId}</h2>
      <h1>Rack #{rackId}</h1>
      <RealTimeGraph
        queryContainerId={parseInt(containerId!)}
        queryRackId={parseInt(rackId!)}
      />
    </div>
  );
};

export default RackPage;
