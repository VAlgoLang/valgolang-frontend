import React, {useEffect, useRef, useState} from "react";
import "./Home.css";
import {Button, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, Row} from "react-bootstrap";
import ManimEditor from "../../components/Editor/Editor";
import * as monaco from 'monaco-editor-core';

export enum FileType {
    STYLESHEET,
    MANIMDSLCODE
}

const Home: React.FC = () => {

    const inputRef = useRef<any>(null);
    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()
    const [currentFileType, setFileType] = useState<FileType>(FileType.MANIMDSLCODE);
    const [manimDSL, setManimDSL] = useState<string>();
    const [stylesheet, setStylesheet] = useState<string>();

    /* Used when file upload button clicked to access invisible a tag responsible for file upload */
    function clickFileUpload() {
        inputRef.current.click()
    }

    async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        let files = e.target.files!;
        for (let i = 0; i < files.length; i++) {
            let file = files.item(i)!;
            if (file.name.endsWith(".manimdsl")) {
                let text = await file.text();
                setManimDSL(text)
                editor?.setValue(text)
            } else if (file.name.endsWith(".json")) {
                let text = await file.text();
                setStylesheet(text)
            }
        }
        setFileType(FileType.MANIMDSLCODE)
    }

    useEffect(() => {
        inputRef!.current!.directory = true;
        inputRef!.current!.webkitdirectory = true;
    }, [])

    function switchFileType(flag: FileType) {
        if(flag === currentFileType) {
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

    return (
        <Container fluid>
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
                            <Button variant="primary" size="lg" block onClick={() => switchFileType(FileType.MANIMDSLCODE)}>
                                ManimDSL Code
                            </Button>
                            <Button variant="primary" size="lg" block onClick={() => switchFileType(FileType.STYLESHEET)}>
                                Stylesheet
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={7}>
                    <Button onClick={clickFileUpload}>Import Directory</Button>
                    <input style={{display: "none"}} ref={inputRef} onChange={handleChange} type="file"
                           accept={".manimdsl"} multiple/>
                    <ManimEditor language="manimDSL" setParentEditor={(e) => setEditor(e)}/>
                    <ButtonGroup style={{float: "right", marginTop: "10px"}}>
                        <DropdownButton as={ButtonGroup} title="Submit" id="bg-nested-dropdown">
                            <Dropdown.Item onClick={() => console.log(stylesheet)} eventKey="1">Compile!</Dropdown.Item>
                            <Dropdown.Item eventKey="2">Compile with Advanced Options</Dropdown.Item>
                        </DropdownButton>
                    </ButtonGroup>
                    {/*<div style={{width: "100%", margin: "0 auto"}}>*/}
                    {/*    <PlacementManger width={700} height={400}/>*/}
                    {/*</div>*/}
                </Col>
            </Row>
        </Container>
    )
};

export default Home;
