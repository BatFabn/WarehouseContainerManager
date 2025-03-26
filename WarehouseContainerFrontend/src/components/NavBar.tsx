import { Link } from "react-router-dom";
import HelpOffCanvas from "./HelpOffCanvas";

interface Props {
  verified: () => void;
}

const NavBar = ({ verified }: Props) => {
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid ">
          <Link
            className="navbar-brand"
            to="/dashboard"
            style={{ color: "#ffb2a5" }}
          >
            Warehouse Container Manager
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse " id="navbarNavAltMarkup">
            <div className="navbar-nav ms-auto">
              <Link
                className="nav-link active"
                aria-current="page"
                to="/dashboard"
              >
                Home
              </Link>
              <Link className="nav-link" to="/members">
                Members
              </Link>
              <Link className="nav-link text-danger" to="/" onClick={verified}>
                Log out
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <HelpOffCanvas />
    </div>
  );
};

export default NavBar;
