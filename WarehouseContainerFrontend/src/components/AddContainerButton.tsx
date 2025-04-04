import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface Props {
  onAddContainer: (containerId: string) => void;
}
const AddContainerButton: React.FC<Props> = ({ onAddContainer }) => {
  const [show, setShow] = useState(false);
  const [containerId, setContainerId] = useState("");

  const handleAddContainer = () => {
    const id = containerId;
    if (id) {
      onAddContainer(id);
      setShow(false);
      setContainerId(""); // Reset input field
    } else {
      alert("Invalid Container ID! Please enter a valid value.");
    }
  };

  return (
    <div>
      <Button variant="primary" onClick={() => setShow(true)}>
        Add Container
      </Button>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Container ID</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group controlId="containerId">
              <Form.Label>Container ID</Form.Label>
              <Form.Control
                type="string"
                value={containerId}
                onChange={(e) => setContainerId(e.target.value)}
                placeholder="Enter Container ID"
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

export default AddContainerButton;
