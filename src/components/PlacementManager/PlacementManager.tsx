import React, {useEffect, useState} from "react";
import interact from "interactjs";
import "./PlacementManager.css";
import {Button} from "react-bootstrap";

export type Coordinate = { x: number, y: number, width: number, height: number }

interface PlacementMangerProps {
    width: number,
    height: number,
    initialState: { [key: string]: Coordinate },
    setBoundary: (boundary: { [key: string]: Coordinate }) => void;
}

const PlacementManger: React.FC<PlacementMangerProps> = ({width, height, initialState, setBoundary}) => {

    let manimWidth = 14
    let manimHeight = 8
    const [position, setPosition] = useState<{ [key: string]: Coordinate }>(initialState)

    useEffect(() => {
        setBoundary(position)
    }, [position])

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
        <div style={{height: height + "px", width: width + "px", margin: "0 auto"}}>
            <div className="placementContainer" >
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
    )
};


export default PlacementManger;
