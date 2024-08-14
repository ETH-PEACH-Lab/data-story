import React from "react";
import { Button, Card } from "react-bootstrap";

const TextMenu = ({ addComponent }) => {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Button onClick={() => addComponent("text")} variant="secondary">
          Insert
        </Button>
      </Card.Body>
    </Card>
  );
};

export default TextMenu;
