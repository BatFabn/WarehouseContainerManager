import { Link } from "react-router-dom";

interface Props {
  id: number;
}
const Container = ({ id }: Props) => {
  return (
    <div className="accordion" id={`accordion-${id}`}>
      <div className="accordion-item">
        <h2 className="accordion-header m-1">
          <button
            className="accordion-button bg-success text-white"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#collapse-${id}1`}
            aria-expanded="false"
            aria-controls={`collapse-${id}1`}
          >
            Rack #1
          </button>
        </h2>
        <div
          id={`collapse-${id}1`}
          className="accordion-collapse collapse"
          data-bs-parent={`#accordion-${id}`}
        >
          <div className="accordion-body">
            <div className="card">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Temperature: </li>
                <li className="list-group-item">Pressure: </li>
                <li className="list-group-item">Humidity: </li>
              </ul>
            </div>
            <div className="hstack gap-3">
              <Link className="icon-link" to="/rack/${id}/1">
                Go to
              </Link>
              <button type="button" className="btn btn-danger ms-auto">
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header m-1">
          <button
            className="accordion-button bg-success text-white"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#collapse-${id}2`}
            aria-expanded="false"
            aria-controls={`collapse-${id}2`}
          >
            Rack #2
          </button>
        </h2>
        <div
          id={`collapse-${id}2`}
          className="accordion-collapse collapse"
          data-bs-parent={`#accordion-${id}`}
        >
          <div className="card">
            <ul className="list-group list-group-flush">
              <li className="list-group-item">Temperature: </li>
              <li className="list-group-item">Pressure: </li>
              <li className="list-group-item">Humidity: </li>
            </ul>
          </div>
          <div className="hstack gap-3">
            <Link className="icon-link" to="/rack/${id}/2">
              Go to
            </Link>
            <button type="button" className="btn btn-danger ms-auto">
              Stop
            </button>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header m-1">
          <button
            className="accordion-button bg-success text-white"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#collapse-${id}3`}
            aria-expanded="false"
            aria-controls={`collapse-${id}3`}
          >
            Rack #3
          </button>
        </h2>
        <div
          id={`collapse-${id}3`}
          className="accordion-collapse collapse"
          data-bs-parent={`#accordion-${id}`}
        >
          <div className="card">
            <ul className="list-group list-group-flush">
              <li className="list-group-item">Temperature: </li>
              <li className="list-group-item">Pressure: </li>
              <li className="list-group-item">Humidity: </li>
            </ul>
          </div>
          <div className="hstack gap-3">
            <Link className="icon-link" to="/rack/${id}/3">
              Go to
            </Link>
            <button type="button" className="btn btn-danger ms-auto">
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Container;
