
export type Coordinate = { x: number, y: number, width: number, height: number }

export type Boundaries = { [key: string]: Coordinate }

class BoundaryManager {

    height: number
    width : number
    manimWidth = 14
    manimHeight = 8

    constructor(width: number, height: number) {
        this.height = height
        this.width = width
    }

    computeManimCoordinates(position: Boundaries) {
        let currPosition : {[key: string]: Coordinate} = {}
        Object.keys(position).forEach(shapeName => {
            let shape = position[shapeName]
            let coordinates = {x: 0, y: 0, width: 0, height: 0}
            let heightScaleFactor = this.manimHeight / this.height;
            let widthScaleFactor = this.manimWidth / this.width;

            coordinates.height = shape.height * heightScaleFactor
            coordinates.width = shape.width * widthScaleFactor

            // Calculations broken down on purpose to make it easier to follow

            // Normalise to manim width
            coordinates.x = shape.x * widthScaleFactor
            // Move x relative to manim origin
            coordinates.x -= this.manimWidth / 2

            // Normalise to manim height
            coordinates.y = shape.y * heightScaleFactor
            // Move y relative to manim origin
            coordinates.y = (coordinates.y * -1) + this.manimHeight / 2
            // Move y to coordinate to ll from ul
            coordinates.y -= coordinates.height

            // Fix to 1 decimal place
            coordinates.y = parseFloat(coordinates.y.toFixed(1))
            coordinates.x = parseFloat(coordinates.x.toFixed(1))
            coordinates.width = parseFloat(coordinates.width.toFixed(1))
            coordinates.height = parseFloat(coordinates.height.toFixed(1))
            currPosition[shapeName] =  coordinates
        })
        return currPosition
    }

    getRectangleBoundary(position: Boundaries): Boundaries {
        let positionNew: Boundaries = {};
        Object.keys(position).forEach(shapePosition => {
            let shape = position[shapePosition]
            let coordinate = {width: 0, height: 0, x: 0, y: 0}
            coordinate.width  = (shape.width / this.manimWidth) * this.width
            coordinate.height  = (this.height / this.manimHeight) * shape.height
            coordinate.x = shape.x + (this.manimWidth / 2)
            coordinate.x = coordinate.x * (this.width / this.manimWidth)
            coordinate.y = ((-shape.y) + 4)
            coordinate.y = coordinate.y * (this.height/ this.manimHeight)
            coordinate.y -= coordinate.height
            positionNew[shapePosition] = coordinate
        })
        return positionNew
    }


}

export default BoundaryManager;
