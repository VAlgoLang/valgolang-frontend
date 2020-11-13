import React, {useEffect, useState} from "react";
import interact from "interactjs";
import "./PlacementManager.css";

type Coordinate = {x: number, y: number}

const PlacementManger: React.FC = () => {

    const [position, setPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
    }, [])

    interact('.resize-drag')
        .resizable({
            // resize from all edges and corners
            edges: { left: true, right: true, bottom: true, top: true },

            listeners: {
                move (event) {
                    let target = event.target;
                    let x = position.x;
                    let y = position.y;

                    // update the element's style
                    target.style.width = event.rect.width + 'px'
                    target.style.height = event.rect.height + 'px'

                    // translate when resizing from top or left edges
                    x += event.deltaRect.left
                    y += event.deltaRect.top

                    target.style.webkitTransform = target.style.transform =
                        'translate(' + x + 'px,' + y + 'px)'
                    setPosition({x: x, y: y})
                    target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
                },
                end (event) {
                    console.log(event)
                }
            },
            modifiers: [
                // keep the edges inside the parent
                interact.modifiers.restrictEdges({
                    outer: 'parent'
                }),

                // minimum size
                interact.modifiers.restrictSize({
                    min: { width: 100, height: 50 }
                })
            ],

            inertia: true
        })
        .draggable({
            inertia: true,
            listeners: {
                start (event) {
                    console.log(event.type, event.target)
                },
                move (event) {
                    let new_x = position.x + event.dx
                    let new_y = position.y + event.dy
                    setPosition({x: new_x, y: new_y})
                    event.target.style.transform =
                        `translate(${position.x}px, ${position.y}px)`
                },
                end (event) {
                    console.log(event)
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
        <div style={{height: "400px", width: "700px", margin: "0 auto", backgroundColor: "#f5f5f5"}}>
            <div className="resize-drag">
                Resize from any edge or corner
            </div>
        </div>

    )
};


export default PlacementManger;
