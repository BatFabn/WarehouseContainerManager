import { useEffect } from "react";
import { Offcanvas } from "bootstrap";

function HelpOffCanvas() {
  let offcanvasInstance: Offcanvas | null = null;

  useEffect(() => {
    // Initialize the offcanvas when the component mounts
    const offcanvasElement = document.getElementById("HelpOffCanvas");
    if (offcanvasElement) {
      offcanvasInstance = new Offcanvas(offcanvasElement);
    }
  }, []);

  const openOffcanvas = () => {
    if (offcanvasInstance) {
      offcanvasInstance.show();
    }
  };

  const closeOffcanvas = () => {
    if (offcanvasInstance) {
      offcanvasInstance.hide();
    }
  };

  return (
    <div>
      <button className="btn btn-secondary" onClick={openOffcanvas}>
        Help
      </button>

      <div
        className="offcanvas offcanvas-top"
        tabIndex={-1}
        id="HelpOffCanvas"
        aria-labelledby="HelpOffCanvasLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="HelpOffCanvasLabel">
            Help
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={closeOffcanvas}
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="d-flex justify-content-around">
            <div className="alert alert-success" role="alert">
              Rack #
            </div>
            - Good condition
          </div>
          <div className="d-flex justify-content-around">
            <div className="alert alert-warning" role="alert">
              Rack #
            </div>
            - Spoilage detected
          </div>
          <div className="d-flex justify-content-around">
            <div className="alert alert-danger" role="alert">
              Rack #
            </div>
            - Spoilt
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpOffCanvas;
