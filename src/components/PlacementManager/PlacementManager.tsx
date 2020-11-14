import React, {useEffect, useState} from "react";
import interact from "interactjs";
import "./PlacementManager.css";
import {Button} from "react-bootstrap";

type Coordinate = { x: number, y: number, width: number, height: number }

interface PlacementMangerProps {
    width: number,
    height: number
}

const PlacementManger: React.FC<PlacementMangerProps> = ({width, height}) => {

    let initialState: { [key: string]: Coordinate } = {
        "array": {x: 100, y: 200, width: 100, height: 200},
        "array1": {x: 0, y: 0, width: 200, height: 100}
    };
    const [position, setPosition] = useState<{ [key: string]: Coordinate }>(initialState)

    useEffect(() => {
    }, [])

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

    function computeManimCoordinates() {
        let manimWidth = 14
        let manimHeight = 8
        let manimCoordinates = Object.keys(position).map(shapeName => {
            let shape = position[shapeName]
            let coordinates = {x: 0, y: 0, width: 0, height: 0}
            let heightScaleFactor = manimHeight / height;
            let widthScaleFactor = manimWidth / width;

            coordinates.height = shape.height * heightScaleFactor
            coordinates.width = shape.width * widthScaleFactor

            // Calculations broken down on purpose to make it easier to follow

            // Normalise to manim width
            coordinates.x = shape.x * widthScaleFactor
            // Move x relative to manim origin
            coordinates.x -= manimWidth / 2

            // Normalise to manim height
            coordinates.y = shape.y * heightScaleFactor
            // Move y relative to manim origin
            coordinates.y = (coordinates.y * -1) + manimHeight / 2
            // Move y to coordinate to ll from ul
            coordinates.y -= coordinates.height

            // Fix to 1 decimal place
            coordinates.y = parseFloat(coordinates.y.toFixed(1))
            coordinates.x = parseFloat(coordinates.x.toFixed(1))
            coordinates.width = parseFloat(coordinates.width.toFixed(1))
            coordinates.height = parseFloat(coordinates.height.toFixed(1))
            return {name: shapeName, position: coordinates}
        })
        console.log(manimCoordinates)
    }

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
            <Button style={{float: "right", margin: "20px auto"}} onClick={computeManimCoordinates}>Submit</Button>
        </div>
    )
};


export default PlacementManger;
