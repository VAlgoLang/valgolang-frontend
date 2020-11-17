import React, {useEffect, useState} from "react";
import "./Home.css";
import {
    Alert,
    Button,
    ButtonGroup,
    Card,
    Col,
    Container,
    Dropdown,
    DropdownButton,
    Form,
    InputGroup,
    Row,
    Spinner
} from "react-bootstrap";
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
    const [stylesheetFileName, setStylesheetFileName] = useState<string>("stylesheet.json");
    const [alertMessage, setAlertMessage] = useState("");
    const [generatePython, setGeneratePython] = useState(false)
    const [hideCode, setHideCode] = useState(false)
    const [quality, setQuality] = useState("low")
    const [loadingSubmission, setLoadingSubmission] = useState(false)
    const [outputFilename, setOutputFilename] = useState("animation")
    const [computedBoundary, setComputedBoundary] = useState<Boundaries>({})
    const [stage, setStage] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false)
    const boundaryManager = new BoundaryManager(700, 400)

    useEffect(() => {
        if (showSuccess) {
            setTimeout(() => {
                setShowSuccess(false)
            }, 5000)
        }
    }, [showSuccess])

    useEffect(() => {
        if (alertMessage !== "") {
            setTimeout(() => {
                setAlertMessage("")
            }, 10000)
        }
    }, [alertMessage])

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

    async function submitCode(boundary: Boundaries) {
        setStage(0)
        setLoadingSubmission(true)
        let stylesheetLatest = getStyleSheetText()
        if (boundary !== {} && stage === 1) {
            let parsedStylesheet = JSON.parse(stylesheetLatest || "{}")
            parsedStylesheet.positions = boundaryManager.computeManimCoordinates(boundary)
            stylesheetLatest = JSON.stringify(parsedStylesheet)
        }
        let response = await apiService.compileCode(getManiMDSLText() || "", stylesheetLatest || "{}", outputFilename, generatePython, quality)
        if (!response.success) {
            setAlertMessage(response.message)
        }
        setLoadingSubmission(false)
    }

    async function getBoundaries() {
        setLoadingSubmission(true)
        let response = await apiService.getBoundaries(getManiMDSLText() || "", getStyleSheetText() || "{}")
        if(response.success) {
            setComputedBoundary(response.data)
            setStage(1);
        } else {
            setAlertMessage(response.message)
        }
        setLoadingSubmission(false)
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

    function updateHideCode(hideCode: boolean) {
        setHideCode(hideCode)
        let parsedJSON = JSON.parse(getStyleSheetText() || "{}")
        parsedJSON.hideCode = hideCode
        setStylesheet(JSON.stringify(parsedJSON, null, 4))
        if (currentFileType === FileType.STYLESHEET) {
            editor?.setValue(JSON.stringify(parsedJSON, null, 4))
        }
    }

    function renderSubmitButton() {
        if (loadingSubmission) {
            return (
                <ButtonGroup style={{float: "right", marginTop: "10px"}}>
                    <Button disabled>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            style={{marginRight: "5px"}}
                        />
                        Compiling
                    </Button>
                </ButtonGroup>
            )
        } else {
            return (
                <ButtonGroup style={{float: "right", marginTop: "10px"}}>
                    <DropdownButton as={ButtonGroup} title="Submit" id="bg-nested-dropdown">
                        <Dropdown.Item onClick={() => submitCode({})} eventKey="1">Compile!</Dropdown.Item>
                        <Dropdown.Item onClick={getBoundaries} eventKey="2">Compile with Advanced
                            Options</Dropdown.Item>
                    </DropdownButton>
                </ButtonGroup>
            )
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

    function saveBoundaries(boundary: Boundaries, save: boolean) {
        if (save) {
            let stylesheetLatest = getStyleSheetText()
            if (boundary !== {} && stage === 1) {
                let parsedStylesheet = JSON.parse(stylesheetLatest || "{}")
                parsedStylesheet.positions = boundaryManager.computeManimCoordinates(boundary)
                let newStylesheet = JSON.stringify(parsedStylesheet, null, 4);
                setStylesheet(newStylesheet)
                if (currentFileType === FileType.STYLESHEET) editor?.setValue(newStylesheet)
            }
        }

        setStage(0)
    }

    return (
        <Container fluid>
            {loadingSubmission ?
                <div id="loadingOverlay">
                    <Spinner
                        as="span"
                        animation="border"
                        role="status"
                        aria-hidden="true"
                        variant="primary"
                    />
                </div> : <></>
            }
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
                    <div>
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
                        {renderSubmitButton()}
                        <Button style={{float: "right", margin: "10px"}} variant="success"
                                onClick={validateCode}>Validate</Button>
                    </div>
                    <div style={{width: "100%", margin: "0 auto"}}>
                        {stage === 1 &&
                        <PlacementManger width={700} height={400} showModal={stage === 1} hideModal={saveBoundaries} submitCode={submitCode}
                                         initialState={boundaryManager.getRectangleBoundary(computedBoundary)}/>}
                    </div>
                </Col>
                <Col md={2}>
                    <Card>
                        <Card.Header>
                            Compiling Options
                        </Card.Header>
                        <Card.Body>
                            <Form.Check name={"Generate Python"} onChange={() => setGeneratePython(!generatePython)}
                                        label={"Generate Python file"}/>
                            <Form.Check name={"Generate Python"} onChange={() => updateHideCode(!hideCode)}
                                        label={"Hide code in animation"}/>
                            <hr/>
                            Video Quality:
                            <Form.Check
                                type="radio"
                                label="Low quality"
                                name="qualityRadios"
                                value="low"
                                checked={quality === "low"}
                                onChange={() => setQuality("low")}
                            />
                            <Form.Check
                                type="radio"
                                label="Medium quality"
                                name="qualityRadios"
                                value="medium"
                                checked={quality === "medium"}
                                onChange={() => setQuality("medium")}
                            />
                            <Form.Check
                                type="radio"
                                label="High quality"
                                name="qualityRadios"
                                value="high"
                                checked={quality === "high"}
                                onChange={() => setQuality("high")}
                            />
                            <hr/>
                            Output File Name:
                            <InputGroup size="sm">
                                <Form.Control
                                    placeholder="animation"
                                    onChange={e => setOutputFilename(e.target.value || "animation")}/>
                                <InputGroup.Append>
                                    <InputGroup.Text>.mp4</InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
};

export default Home;
