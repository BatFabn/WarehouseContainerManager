import { useEffect } from "react";
import { Offcanvas } from "bootstrap";

function StopAllButton() {
  let offcanvasInstance: Offcanvas | null = null;

  useEffect(() => {
    // Initialize the offcanvas when the component mounts
    const offcanvasElement = document.getElementById("StopAllButton");
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
      <button className="btn btn-danger" onClick={openOffcanvas}>
        Stop All
      </button>

      <div
        className="offcanvas offcanvas-top"
        tabIndex={-1}
        id="StopAllButton"
        aria-labelledby="StopAllButtonLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="StopAllButtonLabel">
            Alert
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={closeOffcanvas}
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="alert alert-danger" role="alert">
            Are you sure you want to stop all racks in Container #?
          </div>
          <div className="hstack d-flex justify-content-center gap-2">
            <button
              className="btn btn-primary"
              type="button"
              onClick={closeOffcanvas}
            >
              Yes
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={closeOffcanvas}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StopAllButton;
