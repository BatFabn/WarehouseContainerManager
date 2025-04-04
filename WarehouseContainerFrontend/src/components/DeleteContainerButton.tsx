import { useEffect, useRef } from "react";
import { Offcanvas } from "bootstrap";

interface Props {
  id: string;
  onDeleteContainer: (containerId: string) => void;
}

const DeleteContainerButton = ({ id, onDeleteContainer }: Props) => {
  const offcanvasRef = useRef<Offcanvas | null>(null);

  useEffect(() => {
    // Initialize the offcanvas when the component mounts
    const element = document.getElementById(`DeleteContainerButton-${id}`);
    if (element) {
      offcanvasRef.current = new Offcanvas(element);
    }
  }, []);

  const openOffcanvas = () => {
    if (offcanvasRef) {
      offcanvasRef.current?.show();
    }
  };

  const closeOffcanvas = () => {
    if (offcanvasRef) {
      offcanvasRef.current?.hide();
    }
  };

  return (
    <div>
      <button className="btn btn-danger" onClick={openOffcanvas}>
        Remove All
      </button>

      <div
        className="offcanvas offcanvas-top"
        tabIndex={-1}
        id={`DeleteContainerButton-${id}`}
        aria-labelledby="StopAllButtonLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id={`StopAllButtonLabel-${id}`}>
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
            Are you sure you want to delete all racks in Container #{id}?
          </div>
          <div className="hstack d-flex justify-content-center gap-2">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                onDeleteContainer(id);
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

export default DeleteContainerButton;
