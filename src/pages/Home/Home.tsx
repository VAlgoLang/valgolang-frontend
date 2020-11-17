import React, {useState} from "react";
import "./Home.css";
import {Alert, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, Row} from "react-bootstrap";
import ManimEditor from "../../components/Editor/Editor";
import FileSelector from "../../components/FileSelector/FileSelector";
import * as monaco from 'monaco-editor-core';
import {apiService} from "../../index";
import PlacementManger, {Coordinate} from "../../components/PlacementManager/PlacementManager";

export enum FileType {
    STYLESHEET,
    MANIMDSLCODE
}


const Home: React.FC = () => {
    let height = 400
    let width = 700
    let manimWidth = 14
    let manimHeight = 8
    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()
    const [currentFileType, setFileType] = useState<FileType>(FileType.MANIMDSLCODE);
    const [manimDSL, setManimDSL] = useState<string>();
    const [stylesheet, setStylesheet] = useState<string>();
    const [manimFileName, setManimFileName] = useState<string>("code.manimdsl");
    const [stylesheetFileName, setStylesheetFileName] = useState<string>("test.json");
    const [alertMessage, setAlertMessage] = useState("");
    const [boundary, setBoundary] = useState<{ [key: string]: Coordinate }>({})
    const [pageNumber, setPageNumber] = useState(0);

    async function filePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
        let files = e.target.files!;
        for (let i = 0; i < files.length; i++) {
            let file = files.item(i)!;
            if (file.name.endsWith(".manimdsl")) {
                let text = await file.text();
                setManimDSL(text)
                setManimFileName(file.name)
                editor?.setValue(text)
                setFileType(FileType.MANIMDSLCODE)
            } else if (file.name.endsWith(".json")) {
                let text = await file.text();
                setStylesheet(text)
                setStylesheetFileName(file.name)
                editor?.setValue(text)
                setFileType(FileType.STYLESHEET)
            }
        }
    }


    function switchFileType(flag: FileType) {
        if (flag === currentFileType) {
            return;
        }
        if (flag === FileType.STYLESHEET) {
            setManimDSL(editor?.getValue())
            editor?.setValue(stylesheet || "")
        } else {
            setStylesheet(editor?.getValue())
            editor?.setValue(manimDSL || "")
        }
        setFileType(flag)
    }

    async function submitCode() {
        let stylesheetLatest = getStyleSheetText()
        if(boundary !== {}) {
            let parsedStylesheet = JSON.parse(stylesheetLatest || "{}")
            parsedStylesheet.positions = computeManimCoordinates(boundary)
            stylesheetLatest = JSON.stringify(parsedStylesheet)
        }
        let response = await apiService.compileCode(getManiMDSLText() || "", stylesheetLatest || "{}", "myAnim", false)
        if (!response.success) {
            setAlertMessage(response.message)
        }
    }

    async function getBoundaries() {
        let response = await apiService.getBoundaries(getManiMDSLText() || "", getStyleSheetText() || "{}")
        setBoundary(response.data)
        setPageNumber(1);
    }

    function getStyleSheetText() {
        if (currentFileType === FileType.STYLESHEET) {
            setStylesheet(editor?.getValue())
            return editor?.getValue()
        } else {
            return stylesheet
        }
    }

    function getManiMDSLText() {
        if (currentFileType === FileType.MANIMDSLCODE) {
            setManimDSL(editor?.getValue())
            return editor?.getValue()
        } else {
            return manimDSL
        }
    }

    function computeManimCoordinates(position: any) {
        let currPosition : {[key: string]: Coordinate} = {}
        Object.keys(position).forEach(shapeName => {
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
            currPosition[shapeName] =  coordinates
        })
        return currPosition
    }


    function getRectangleBoundary(position: any): { [key: string]: Coordinate } {

        let positionNew: { [key: string]: Coordinate } = {};
        Object.keys(position).forEach(shapePosition => {
            let shape = position[shapePosition]
            let coordinate = {width: 0, height: 0, x: 0, y: 0}
            coordinate.width  = (shape.width / manimWidth) * width
            coordinate.height  = (height / manimHeight) * shape.height
            coordinate.x = shape.x + (manimWidth / 2)
            coordinate.x = coordinate.x * (width / manimWidth)
            coordinate.y = ((-shape.y) + 4)
            coordinate.y = coordinate.y * (height/ manimHeight)
            coordinate.y -= coordinate.height
            positionNew[shapePosition] = coordinate
        })
        return positionNew
    }

    return (
        <Container fluid>`
            <Row md={12}>
                <h1 style={{textAlign: "center", margin: "0 auto", padding: "20px"}}>ManimDSL Online Editor</h1>
            </Row>
            <Row>
                <Col md={1}>

                </Col>
                <Col md={2}>
                    <Card>
                        <Card.Header>
                            File Explorer
                        </Card.Header>
                        <Card.Body>
                            <FileSelector name={"Import Directory"} onChange={filePickerChange} directory={true}/>
                            <FileSelector name={"Import File"} onChange={filePickerChange} directory={false}/>

                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    {pageNumber === 0 &&
                        <>
                            <ManimEditor language="manimDSL" currentFileType={currentFileType} manimDSLName={manimFileName}
                                         styleSheetName={stylesheetFileName}
                                         setParentEditor={(e) => setEditor(e)} setFileType={switchFileType}/>

                            {alertMessage !== "" &&
                            <Alert style={{margin: "10px"}} variant={'danger'} onClose={() => setAlertMessage("")}
                                   dismissible>
                                <Alert.Heading>Oops, something went wrong!</Alert.Heading>
                                {alertMessage.split("\n").map(line => <p>{line}</p>)}
                            </Alert>}

                        </>
                    }
                    {pageNumber === 1 &&
                        <div style={{width: "100%", margin: "0 auto"}}>
                            <PlacementManger width={700} height={400} initialState={getRectangleBoundary(boundary)} setBoundary={setBoundary}/>
                        </div>
                    }
                    <ButtonGroup style={{float: "right", marginTop: "10px"}}>
                        <DropdownButton as={ButtonGroup} title="Submit" id="bg-nested-dropdown">
                            <Dropdown.Item onClick={submitCode} eventKey="1">Compile!</Dropdown.Item>
                            <Dropdown.Item onClick={getBoundaries} eventKey="2">Compile with Advanced
                                Options</Dropdown.Item>
                        </DropdownButton>
                    </ButtonGroup>
                </Col>
            </Row>
        </Container>
    )
};

export default Home;
