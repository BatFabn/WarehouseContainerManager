import NavBar from "./NavBar";
import Room from "./Area";
import StopAllButton from "./StopAllButton";

interface Props {
  verified: () => void;
}

const Dashboard = ({ verified }: Props) => {
  return (
    <div>
      <NavBar verified={verified} />
      <div className="container overflow-hidden text-center p-5">
        <div className="row g-5">
          <div className="col-6 bg-secondary text-white p-4">
            <Room id="room1" />
            <div className="p-3 fs-3">Area #1</div>
            <div className="hstack px-5">
              <StopAllButton />
              <button type="button" className="btn btn-primary ms-auto">
                Add
              </button>
            </div>
          </div>
          <div className="col-6 bg-secondary text-white p-4">
            <Room id="room2" />
            <div className="p-3 fs-3">Area #2</div>
            <div className="hstack px-5">
              <StopAllButton />
              <button type="button" className="btn btn-primary ms-auto">
                Add
              </button>
            </div>
          </div>
          <div className="col-6 bg-secondary text-white p-4">
            <Room id="room3" />
            <div className="p-3 fs-3">Area #3</div>
            <div className="hstack px-5">
              <StopAllButton />
              <button type="button" className="btn btn-primary ms-auto">
                Add
              </button>
            </div>
          </div>
          <div className="col-6 bg-secondary text-white p-4">
            <Room id="room4" />
            <div className="p-3 fs-3">Area #4</div>
            <div className="hstack px-5">
              <StopAllButton />
              <button type="button" className="btn btn-primary ms-auto">
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
