import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { PlusCircle } from "lucide-react";

interface Props {
  onAddContainer: (containerId: string[]) => void;
}

const AddContainersButton = ({ onAddContainer }: Props) => {
  const [show, setShow] = useState(false);
  const [containerInput, setContainerInput] = useState("");

  const handleAddContainer = () => {
    const ids = containerInput
      .split(/[,\s]+/)
      .map((id) => id.trim())
      .filter((id) => id !== "");

    const containerIds: string[] = [];
    ids.forEach((id) => {
      containerIds.push(id);
    });

    onAddContainer(containerIds);
    setContainerInput("");
    setShow(false);
  };

  return (
    <div>
      <Button
        variant="success"
        className="d-flex align-items-center gap-2 rounded-pill px-4 py-2 shadow-sm fw-semibold"
        onClick={() => setShow(true)}
      >
        <PlusCircle size={20} />
        Add Container
      </Button>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Container ID(s)</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group controlId="containerIds">
              <Form.Label>Container IDs</Form.Label>
              <Form.Control
                type="text"
                value={containerInput}
                onChange={(e) => setContainerInput(e.target.value)}
                placeholder="Enter IDs separated by comma or space (e.g., 1, 2 3)"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddContainer}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddContainersButton;
