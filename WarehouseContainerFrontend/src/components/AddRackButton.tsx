import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface Props {
  containerId: string;
  onAddRack: (rackId: string) => void;
}

const AddRackButton: React.FC<Props> = ({ containerId, onAddRack }) => {
  const [show, setShow] = useState(false);
  const [rackId, setRackId] = useState("");

  const handleAddRack = () => {
    const id = rackId;
    if (id) {
      onAddRack(id);
      setShow(false);
      setRackId(""); // Reset input field
    } else {
      alert("Invalid Rack ID! Please enter a valid value.");
    }
  };

  return (
    <div>
      <Button variant="primary" onClick={() => setShow(true)}>
        Add Rack
      </Button>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Rack ID for Container #{containerId}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group controlId="rackId">
              <Form.Label>Rack ID</Form.Label>
              <Form.Control
                type="string"
                value={rackId}
                onChange={(e) => setRackId(e.target.value)}
                placeholder="Enter Rack ID"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddRack}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddRackButton;
