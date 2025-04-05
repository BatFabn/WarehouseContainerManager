import { useEffect } from "react";
import { Offcanvas } from "bootstrap";

function HelpOffCanvas() {
  let offcanvasInstance: Offcanvas | null = null;

  useEffect(() => {
    const offcanvasElement = document.getElementById("HelpOffCanvas");
    if (offcanvasElement) {
      offcanvasInstance = new Offcanvas(offcanvasElement);
    }
  }, [offcanvasInstance]);

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
      <button
        className="btn btn-info d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
        onClick={openOffcanvas}
      >
        Help
      </button>

      <div
        className="offcanvas offcanvas-top"
        tabIndex={-1}
        id="HelpOffCanvas"
        aria-labelledby="HelpOffCanvasLabel"
      >
        <div className="offcanvas-header text-white">
          <h5 className="offcanvas-title" id="HelpOffCanvasLabel">
            Help
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={closeOffcanvas}
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="container py-3">
            <div className="row g-3">
              <div className="col-md-4 text-center">
                <div className="alert alert-success mb-2">Rack #</div>
                <div className="text-success fw-semibold">Good Condition</div>
              </div>
              <div className="col-md-4 text-center">
                <div className="alert alert-warning mb-2">Rack #</div>
                <div className="text-warning fw-semibold">
                  Spoilage Detected
                </div>
              </div>
              <div className="col-md-4 text-center">
                <div className="alert alert-danger mb-2">Rack #</div>
                <div className="text-danger fw-semibold">Spoilt</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpOffCanvas;
