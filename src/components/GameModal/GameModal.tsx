import React from "react";
import {SnakeGame} from "react-game-snake";
import {Modal} from "react-bootstrap";

const GameModal: React.FC = () => {
    return (
        <Modal show={true} size={"lg"}>
            <Modal.Header closeButton>
                <Modal.Title>This might take a while...</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{textAlign: "center"}}>
                <p>Your video is being generated...</p>
                <SnakeGame
                    colors={{
                        field: "#bdc3c7",
                        food: "#9b59b6",
                        snake: "#3498db",
                    }}
                    countOfHorizontalFields={20}
                    countOfVerticalFields={20}
                    fieldSize={20}
                    loopTime={200}
                    pauseAllowed={true}
                    restartAllowed={true}
                />
            </Modal.Body>
        </Modal>
    )
};

export default GameModal;
