import React, {useEffect, useState} from "react";
import interact from "interactjs";
import "./PlacementManager.css";
import {Boundaries} from "../../utils/BoundaryManager";
import {Button, Card, Col, Form, Modal, Row} from "react-bootstrap";


interface PlacementMangerProps {
    width: number,
    height: number,
    initialState: Boundaries,
    autoState: Boundaries,
    showModal: boolean;
    hideModal: (boundary: Boundaries, save: boolean) => void;
    submitCode: (boundary: Boundaries) => void;
}

const PlacementManger: React.FC<PlacementMangerProps> = ({width, height, initialState, autoState, showModal, hideModal, submitCode}) => {

    const [position, setPosition] = useState<Boundaries>({})
    const [refresh, setRefresh] = useState(true)
    const [hiddenShapes, setHiddenShapes] = useState(new Set<string>())

    useEffect(() => {
        if (!refresh) {
            setRefresh(true)
        }
    }, [refresh])

    useEffect(() => {
        let newInitalState = JSON.parse(JSON.stringify(initialState));
        Object.keys(newInitalState).forEach(shapeId => {
            if (newInitalState[shapeId].width === 0) {
                hiddenShapes.add(shapeId)
                newInitalState[shapeId] = autoState[shapeId]
            }
        })
        setHiddenShapes(hiddenShapes)
        setPosition(newInitalState)
        // eslint-disable-next-line
    }, [initialState, autoState])

    function removeHiddenFromBoundary() {
        let newPosition: Boundaries = {}
        Object.keys(position).forEach(shapeId => {
            let positionElement = position[shapeId];
            newPosition[shapeId] = { x: positionElement.x, y: positionElement.y, width: positionElement.width, height: positionElement.height }
            if (hiddenShapes.has(shapeId)) {
                newPosition[shapeId].width = 0
                newPosition[shapeId].height = 0
            }
        })
        return newPosition
    }

    interact('.resize-drag')
        .resizable({
            // resize from all edges and corners
            edges: {left: true, right: true, bottom: true, top: true},

            listeners: {
                move(event) {
                    let target = event.target;
                    let x = position[target.id].x;
                    let y = position[target.id].y;


                    // update the element's style
                    target.style.width = event.rect.width + 'px'
                    target.style.height = event.rect.height + 'px'

                    // translate when resizing from top or left edges
                    x += event.deltaRect.left
                    y += event.deltaRect.top

                    target.style.webkitTransform = target.style.transform =
                        'translate(' + x + 'px,' + y + 'px)'
                    position[target.id].x = x;
                    position[target.id].y = y;
                    position[target.id].width = event.rect.width;
                    position[target.id].height = event.rect.height;
                    setPosition(position)
                }
            },
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent',
                }),

                // minimum size
                interact.modifiers.restrictSize({
                    min: {width: 50, height: 50}
                })
            ],

            inertia: true
        })
        .draggable({
            inertia: true,
            listeners: {
                move(event) {

                    let new_x = position[event.target.id].x + event.dx
                    let new_y = position[event.target.id].y + event.dy
                    position[event.target.id].x = new_x;
                    position[event.target.id].y = new_y;
                    setPosition(position)
                    event.target.style.transform =
                        `translate(${new_x}px, ${new_y}px)`
                }
            },
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ]
        })

    function resetPosition() {
        hiddenShapes.clear()
        setHiddenShapes(hiddenShapes)
        setPosition(JSON.parse(JSON.stringify(initialState)))
        setRefresh(false)
    }

    function setAutoPostion() {
        setPosition(JSON.parse(JSON.stringify(autoState)))
        setRefresh(false)
    }

    function isRendered(shapeId: string) {
        return !hiddenShapes.has(shapeId)
    }

    function setIsRendered(shapeId: string, flag: boolean) {
        flag ? hiddenShapes.delete(shapeId) : hiddenShapes.add(shapeId)
        setHiddenShapes(hiddenShapes)
        setRefresh(false)
    }

    return (
        <Modal show={showModal} onHide={() => hideModal(position, false)} size={"xl"}>
            <Modal.Header closeButton>
                <Modal.Title>Place Data Structures</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={9}>
                        <div style={{height: height + "px", width: width + "px", margin: "0 auto"}}>
                            <div className="placementContainer">
                                {refresh && Object.entries(position).map((shape, index) => {
                                    if (hiddenShapes.has(shape[0])) {
                                        return <div key={index}/>
                                    } else {
                                        return <div key={index} id={shape[0]} style={{
                                            transform: `translate(${shape[1].x}px, ${shape[1].y}px)`,
                                            height: shape[1].height,
                                            width: shape[1].width
                                        }} className={"resize-drag " + (shape[0].startsWith("_") ? " resize-drag-grey" : "")}>
                                            {shape[0].replace("_", "")}
                                        </div>
                                    }
                                })}
                            </div>
                        </div>

                    </Col>
                    <Col md={3}>
                        <Card style={{width: "100%"}}>
                            <Card.Header>
                                Hide Datastructures
                            </Card.Header>
                            <Card.Body>
                                {Object.keys(position).map((shapeID, index) => {
                                    if(shapeID.startsWith("_")) {
                                        return <div key={index}/>
                                    } else {
                                        return <Form.Check type="checkbox" key={index} label={shapeID} name={shapeID}
                                                           checked={isRendered(shapeID)}
                                                           onChange={() => setIsRendered(shapeID, !isRendered(shapeID))}/>
                                    }
                                })}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={() => setAutoPostion()}>Auto-calculate</Button>
                <Button variant="secondary" onClick={() => resetPosition()}>Reset</Button>
                <Button variant="primary" onClick={() => submitCode(removeHiddenFromBoundary())}>Save and Compile!</Button>
                <Button variant="primary" onClick={() => hideModal(removeHiddenFromBoundary(), true)}>Save Changes</Button>
            </Modal.Footer>
        </Modal>
    )
};


export default PlacementManger;
