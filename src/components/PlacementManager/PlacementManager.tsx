import React, {useState} from "react";
import interact from "interactjs";
import "./PlacementManager.css";
import {Boundaries} from "../../utils/BoundaryManager";
import {Button, Modal} from "react-bootstrap";


interface PlacementMangerProps {
    width: number,
    height: number,
    initialState: Boundaries,
    showModal: boolean;
    hideModal: (boundary: Boundaries, save: boolean) => void;
    submitCode: (boundary: Boundaries) => void;
}

const PlacementManger: React.FC<PlacementMangerProps> = ({width, height, initialState, showModal, hideModal, submitCode}) => {

    const [position, setPosition] = useState<Boundaries>(initialState)

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


    return (
        <Modal show={showModal} onHide={() => hideModal(position, false)} size={"lg"}>
            <Modal.Header closeButton>
                <Modal.Title>Place Data Structures</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{height: height + "px", width: width + "px", margin: "0 auto"}}>
                    <div className="placementContainer">
                        {Object.keys(initialState).map((shape, index) => {
                            return <div key={index} id={shape} style={{
                                transform: `translate(${position[shape].x}px, ${position[shape].y}px)`,
                                height: position[shape].height,
                                width: position[shape].width
                            }} className="resize-drag">
                                {shape}
                            </div>
                        })}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button style={{float: "right"}} onClick={() => submitCode(position)}>Save and Compile!</Button>
                <Button variant="primary" onClick={() => hideModal(position, true)}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    )
};


export default PlacementManger;
