import { useState, useRef, useEffect } from "react";
import { Offcanvas } from "bootstrap";
import { Button } from "react-bootstrap";
import { MinusCircle } from "lucide-react";

interface Props {
  containers: Record<string, string[]>;
  onDeleteContainers: (ids: string[]) => void;
}

const DeleteContainerButton = ({ containers, onDeleteContainers }: Props) => {
  const offcanvasRef = useRef<Offcanvas | null>(null);
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);

  useEffect(() => {
    const element = document.getElementById("DeleteContainerOffcanvas");
    if (element) {
      offcanvasRef.current = new Offcanvas(element);
    }
  }, []);

  const openOffcanvas = () => offcanvasRef.current?.show();
  const closeOffcanvas = () => offcanvasRef.current?.hide();

  const toggleContainerSelection = (id: string) => {
    setSelectedContainers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    onDeleteContainers(selectedContainers);
    setSelectedContainers([]);
    closeOffcanvas();
  };

  return (
    <div>
      <Button
        variant="danger"
        className="d-flex align-items-center gap-2 rounded-pill px-4 py-2 shadow-sm fw-semibold"
        onClick={openOffcanvas}
      >
        <MinusCircle size={20} />
        Remove Containers
      </Button>
      <div
        className="offcanvas offcanvas-top"
        tabIndex={-1}
        id="DeleteContainerOffcanvas"
        aria-labelledby="DeleteContainerLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="DeleteContainerLabel">
            Select Containers to Delete
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={closeOffcanvas}
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body">
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            {Object.keys(containers).map((id) => (
              <button
                key={id}
                className={`btn btn-outline-danger ${
                  selectedContainers.includes(id) ? "active" : ""
                }`}
                onClick={() => toggleContainerSelection(id)}
              >
                Container #{id}
              </button>
            ))}
          </div>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <button className="btn btn-primary" onClick={handleDelete}>
              Confirm
            </button>
            <button className="btn btn-secondary" onClick={closeOffcanvas}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteContainerButton;
