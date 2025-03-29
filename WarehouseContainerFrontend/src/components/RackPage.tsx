import NavBar from "./NavBar";
import RealTimeGraph from "./RealTimeChart";

interface Props {
  verified: () => void;
}

const RackPage = ({ verified }: Props) => {
  return (
    <div className="text-center bg-success">
      <NavBar verified={verified} />
      <h1>Rack #</h1>
      <RealTimeGraph />
    </div>
  );
};

export default RackPage;
