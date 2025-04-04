import { useEffect, useRef } from "react";
import { Offcanvas } from "bootstrap";

interface Props {
  id: string;
  onDeleteRack: () => void;
}

const DeleteRackButton = ({ id, onDeleteRack }: Props) => {
  const offcanvasRef = useRef<Offcanvas | null>(null);

  useEffect(() => {
    const element = document.getElementById(`DeleteRackButton-${id}`);
    if (element) {
      offcanvasRef.current = new Offcanvas(element);
    }
  }, [id]);

  const openOffcanvas = () => {
    offcanvasRef.current?.show();
  };

  const closeOffcanvas = () => {
    offcanvasRef.current?.hide();
  };

  return (
    <div>
      <button type="button" className="btn btn-danger" onClick={openOffcanvas}>
        Delete
      </button>

      <div
        className="offcanvas offcanvas-top"
        tabIndex={-1}
        id={`DeleteRackButton-${id}`}
        aria-labelledby={`DeleteRackButtonLabel-${id}`}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id={`DeleteRackButtonLabel-${id}`}>
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
            Are you sure you want to delete Rack #{id}?
          </div>
          <div className="hstack d-flex justify-content-center gap-2">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                onDeleteRack();
                closeOffcanvas();
              }}
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
};

export default DeleteRackButton;
