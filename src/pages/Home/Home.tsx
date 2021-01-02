import React, {useEffect, useState} from "react";
import "./Home.css";
import {Alert, Button, Card, Col, Container, Form, InputGroup, Row, Spinner} from "react-bootstrap";
import ManimEditor from "../../components/Editor/Editor";
import FileSelector from "../../components/FileSelector/FileSelector";
import {apiService} from "../../index";
import PlacementManger from "../../components/PlacementManager/PlacementManager";
import BoundaryManager, {Boundaries} from "../../utils/BoundaryManager";
import {downloadFile, downloadZip} from "../../utils/FileDownloader";
import JSZip from "jszip";
import {editor as monacoEditor} from "monaco-editor";
import GameModal from "../../components/GameModal/GameModal";
import LoadingOverlay from "../../components/LoadingOverlay/LoadingOverlay";
import VideoModal, {VideoInfo} from "../../components/VideoModal/VideoModal";
import {faFolder} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export enum FileType {
    STYLESHEET,
    MANIMDSLCODE
}


const Home: React.FC = () => {

    const [editor, setEditor] = useState<monacoEditor.IStandaloneCodeEditor>()
    const [currentFileType, setFileType] = useState<FileType>(FileType.MANIMDSLCODE);
    const [manimDSL, setManimDSL] = useState<string>();
    const [stylesheet, setStylesheet] = useState<string>();
    const [manimFileName, setManimFileName] = useState<string>("code.manimdsl");
    const [stylesheetFileName, setStylesheetFileName] = useState<string>("stylesheet.json");
    const [alertMessage, setAlertMessage] = useState("");
    const [generatePython, setGeneratePython] = useState(false)
    const [hideCode, setHideCode] = useState(false)
    const [variableBlock, setVariableBlock] = useState(false)
    const [quality, setQuality] = useState("low")
    const [loadingSubmission, setLoadingSubmission] = useState(false)
    const [loadingCalculation, setLoadingCalculation] = useState(false)
    const [outputFilename, setOutputFilename] = useState("animation")
    const [computedBoundary, setComputedBoundary] = useState<Boundaries>({})
    const [autoBoundary, setAutoBoundary] = useState<Boundaries>({})
    const [stage, setStage] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false)
    const boundaryManager = new BoundaryManager(700, 400)
    const [videoInfo, setVideoInfo] = useState<VideoInfo>()
    const [videoModal, setVideoModal] = useState(false)

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

    async function handleZipUpload(file: File) {
        const jsZip = new JSZip();
        let text = await file.arrayBuffer();
        jsZip.loadAsync(text).then(zip => {
            Object.keys(zip.files).forEach(function (filename) {
                zip.files[filename].async('string').then(function (fileData) {
                    if (filename.endsWith(".manimdsl")) {
                        setManimDSL(fileData)
                        setManimFileName(filename)
                        editor?.setValue(fileData)
                        setFileType(FileType.MANIMDSLCODE)
                    } else if (filename.endsWith(".json")) {
                        setStylesheet(fileData)
                        setStylesheetFileName(filename)
                        editor?.setValue(fileData)
                        setFileType(FileType.STYLESHEET)
                    }
                })
            })
        });
    }

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
            } else if (file.name.endsWith(".zip")) {
                await handleZipUpload(file);
            }
        }
    }

    async function selectExampleFolder(folderName : string) {
        let files = JSON.parse(JSON.stringify(await apiService.getExample(folderName)));
        setStylesheet(files["stylesheetFile"])
        setStylesheetFileName(folderName.toLowerCase().replace(/\s/g, "") + ".json")
        setManimDSL(files["manimFile"])
        setManimFileName(folderName.toLowerCase().replace(/\s/g, "") + ".manimdsl")
        editor?.setValue(files["manimFile"])
        setFileType(FileType.MANIMDSLCODE)
    }

    function switchFileType(flag: FileType) {
        // TODO: Find better way than session storage
        sessionStorage.setItem("currentFileType", flag.toString())
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
        if(response.file) {
            setVideoModal(true)
            setVideoInfo(response.data)
        }
        if (!response.success) {
            setAlertMessage(response.message)
        }
        setLoadingSubmission(false)
    }

    async function getBoundaries() {
        setLoadingCalculation(true)
        let response = await apiService.getBoundaries(getManiMDSLText() || "", getStyleSheetText() || "{}")
        if (response.success) {
            setAutoBoundary(boundaryManager.getRectangleBoundary(response.data.auto))
            let initial = Object.keys(response.data.stylesheet).length === 0 ? response.data.auto : response.data.stylesheet
            setComputedBoundary(boundaryManager.getRectangleBoundary(initial))
            setStage(1);
        } else {
            setAlertMessage(response.message)
        }
        setLoadingCalculation(false)
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

    function updateHideVariableBlock(variableShow: boolean) {
        setVariableBlock(variableShow)
        let parsedJSON = JSON.parse(getStyleSheetText() || "{}")
        parsedJSON.hideVariables = variableShow
        setStylesheet(JSON.stringify(parsedJSON, null, 4))
        if (currentFileType === FileType.STYLESHEET) {
            editor?.setValue(JSON.stringify(parsedJSON, null, 4))
        }
    }

    function renderCompileButton() {
        if (loadingSubmission) {
            return (
                <Button style={{float: "right", marginTop: "10px"}} disabled>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"
                             style={{marginRight: "5px"}}/>
                    Compiling...
                </Button>
            )
        } else {
            return (
                <Button style={{float: "right", marginTop: "10px"}}
                        onClick={() => submitCode({})}>Compile!</Button>
            )
        }
    }

    function renderPlaceButton() {
        if (loadingCalculation) {
            return (
                <Button style={{float: "right", marginTop: "10px"}} variant="info" disabled>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"
                             style={{marginRight: "5px"}}/>
                    Calculating...
                </Button>
            )
        } else {
            return (
                <Button style={{float: "right", marginTop: "10px"}} variant="info"
                        onClick={() => getBoundaries()}>Place variables</Button>
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
            {loadingCalculation && <LoadingOverlay/>}
            {loadingSubmission && <GameModal/>}
            <VideoModal videoInfo={videoInfo} isOpen={videoModal} closeModal={() => setVideoModal(false)}/>
            <Row md={12}>
                <h1 style={{textAlign: "center", margin: "0 auto", padding: "20px"}}>ManimDSL Online Editor</h1>
            </Row>
            <Row md={12} style={{marginBottom: "20px"}}>
                <a style={{margin: "0 auto"}} href={"https://manimdsl.github.io"} target={"_new"}>Documentation</a>
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

                    <Card style={{marginTop: "15px"}}>
                        <Card.Header>
                            Examples Explorer
                        </Card.Header>
                        <Card.Body>
                            <ul style={{listStyleType: "none", padding: 0, margin: 0}}>
                            {examples?.map(txt => <li><span style={{cursor: "pointer"}} onClick={() => selectExampleFolder(txt)}><FontAwesomeIcon icon={faFolder}/> {txt}</span></li>)}
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <div>
                        <ManimEditor downloadFile={downloadFileType}
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
                        {renderCompileButton()}
                        <Button style={{float: "right", margin: "10px"}} variant="success"
                                onClick={validateCode}>Validate</Button>
                        {renderPlaceButton()}
                    </div>
                    <div style={{width: "100%", margin: "0 auto"}}>
                        {stage === 1 &&
                        <PlacementManger width={700} height={400} showModal={stage === 1} hideModal={saveBoundaries}
                                         submitCode={submitCode}
                                         initialState={computedBoundary} autoState={autoBoundary}/>}
                    </div>
                </Col>
                <Col md={2}>
                    <Card>
                        <Card.Header>
                            Compiling Options
                        </Card.Header>
                        <Card.Body>
                            {/*TODO: Extract into component*/}
                            <Form.Check name={"Generate Python"} onChange={() => setGeneratePython(!generatePython)}
                                        label={"Generate Python file"}/>
                            <Form.Check name={"Hide Variable Block"} onChange={() => updateHideVariableBlock(!variableBlock)}
                                        label={"Hide variable block only"}/>
                            <Form.Check name={"Generate Python"} onChange={() => updateHideCode(!hideCode)}
                                        label={"Hide code and variable block"}/>
                            <hr/>
                            Video Quality:
                            <Form.Check type="radio" label="Low quality" name="qualityRadios" value="low"
                                        checked={quality === "low"} onChange={() => setQuality("low")}/>
                            <Form.Check type="radio" label="Medium quality" name="qualityRadios" value="medium"
                                        checked={quality === "medium"} onChange={() => setQuality("medium")}/>
                            <Form.Check type="radio" label="High quality" name="qualityRadios" value="high"
                                        checked={quality === "high"} onChange={() => setQuality("high")}/>
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

