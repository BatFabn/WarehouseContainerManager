interface Props {
  id: string;
}
const Room = ({ id }: Props) => {
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
            Container #
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
              <a className="icon-link" href="/container">
                Go to
              </a>
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
            Container #
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
            <a className="icon-link" href="#">
              <svg className="bi" aria-hidden="true">
                <use xlinkHref="#box-seam"></use>
              </svg>
              Go to
            </a>
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
            Container #
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
            <a className="icon-link" href="#">
              <svg className="bi" aria-hidden="true">
                <use xlinkHref="#box-seam"></use>
              </svg>
              Go to
            </a>
            <button type="button" className="btn btn-danger ms-auto">
              Stop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
