import React, {useState} from "react";
import "./Home.css";
import {Alert, Button, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, Row} from "react-bootstrap";
import ManimEditor from "../../components/Editor/Editor";
import FileSelector from "../../components/FileSelector/FileSelector";
import * as monaco from 'monaco-editor-core';
import {apiService} from "../../index";
import PlacementManger from "../../components/PlacementManager/PlacementManager";
import BoundaryManager, {Boundaries} from "../../utils/BoundaryManager";
import {downloadFile, downloadZip} from "../../utils/FileDownloader";

export enum FileType {
    STYLESHEET,
    MANIMDSLCODE
}


const Home: React.FC = () => {

    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()
    const [currentFileType, setFileType] = useState<FileType>(FileType.MANIMDSLCODE);
    const [manimDSL, setManimDSL] = useState<string>();
    const [stylesheet, setStylesheet] = useState<string>();
    const [manimFileName, setManimFileName] = useState<string>("code.manimdsl");
    const [stylesheetFileName, setStylesheetFileName] = useState<string>("test.json");
    const [alertMessage, setAlertMessage] = useState("");
    const [boundary, setBoundary] = useState<Boundaries>({})
    const [pageNumber, setPageNumber] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false)
    const boundaryManager = new BoundaryManager(700, 400)

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
        if (boundary !== {}) {
            let parsedStylesheet = JSON.parse(stylesheetLatest || "{}")
            parsedStylesheet.positions = boundaryManager.computeManimCoordinates(boundary)
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

    async function validateCode() {
        let response = await apiService.getBoundaries(getManiMDSLText() || "", getStyleSheetText() || "{}")
        setShowSuccess(response.success)
        if (!response.success) {
            setAlertMessage(response.message)
        }
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

    function downloadFileType(fileType: FileType) {
        if (fileType === FileType.STYLESHEET) {
            downloadFile(stylesheetFileName, getStyleSheetText() || "{}")
        } else {
            downloadFile(manimFileName, getManiMDSLText() || "")
        }
    }

    function downloadProject() {
        downloadZip([{filename: stylesheetFileName, text: stylesheet || "{}"}, {
            filename: manimFileName,
            text: manimDSL || ""
        }])
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
                    <div style={{display: pageNumber === 0 ? "initial" : "none"}}>
                        <ManimEditor downloadFile={downloadFileType} language="manimDSL"
                                     currentFileType={currentFileType} manimDSLName={manimFileName}
                                     styleSheetName={stylesheetFileName}
                                     setParentEditor={(e) => setEditor(e)} setFileType={switchFileType}
                                     downloadProject={downloadProject}/>

                        {alertMessage !== "" &&
                        <Alert style={{margin: "10px"}} variant={'danger'} onClose={() => setAlertMessage("")}
                               dismissible>
                            <Alert.Heading>Oops, something went wrong!</Alert.Heading>
                            {alertMessage.split("\n").map(line => <p>{line}</p>)}
                        </Alert>}
                        {showSuccess &&
                        <Alert style={{margin: "10px"}} variant={'success'} onClose={() => setShowSuccess(false)}
                               dismissible>
                            All good!
                        </Alert>}
                        <ButtonGroup style={{float: "right", marginTop: "10px"}}>
                            <DropdownButton as={ButtonGroup} title="Submit" id="bg-nested-dropdown">
                                <Dropdown.Item onClick={submitCode} eventKey="1">Compile!</Dropdown.Item>
                                <Dropdown.Item onClick={getBoundaries} eventKey="2">Compile with Advanced
                                    Options</Dropdown.Item>
                            </DropdownButton>
                        </ButtonGroup>
                        <Button style={{float: "right", margin: "10px"}} variant="success"
                                onClick={validateCode}>Validate</Button>
                    </div>
                    {pageNumber === 1 &&
                    <div style={{width: "100%", margin: "0 auto"}}>
                        <PlacementManger width={700} height={400}
                                         initialState={boundaryManager.getRectangleBoundary(boundary)}
                                         setBoundary={setBoundary}/>
                        <Button style={{float: "left"}} onClick={() => setPageNumber(0)}>Previous</Button>
                        <Button style={{float: "right"}} onClick={submitCode}>Compile!</Button>
                    </div>
                    }
                </Col>
            </Row>
        </Container>
    )
};

export default Home;
