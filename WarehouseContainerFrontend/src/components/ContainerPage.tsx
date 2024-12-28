import NavBar from "./NavBar";
import RealTimeGraph from "./RealTimeChart";

interface Props {
  verified: () => void;
}

const ContainerPage = ({ verified }: Props) => {
  return (
    <div className="text-center">
      <NavBar verified={verified} />
      <h1>Container #</h1>
      <RealTimeGraph />
    </div>
  );
};

export default ContainerPage;
