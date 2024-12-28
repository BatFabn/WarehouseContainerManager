interface Props {
  verified: () => void;
}

const NavBar = ({ verified }: Props) => {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid ">
        <a
          className="navbar-brand"
          href="/dashboard"
          style={{ color: "#ffb2a5" }}
        >
          Warehouse Container Manager
        </a>
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
            <a
              className="nav-link active"
              aria-current="page"
              href="/dashboard"
            >
              Home
            </a>
            <a className="nav-link" href="#">
              Members
            </a>
            <a className="nav-link text-danger" href="/" onClick={verified}>
              Log out
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
