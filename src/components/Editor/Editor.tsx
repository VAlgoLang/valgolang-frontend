import {Card} from "react-bootstrap";
import React, {CSSProperties, useEffect, useRef} from "react";
import * as monaco from 'monaco-editor-core';
import {FileType} from "../../pages/Home/Home";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";

interface ManimEditorProps {
    manimDSLName: string;
    styleSheetName: string;
    language: string;
    setParentEditor: (s: monaco.editor.IStandaloneCodeEditor) => void;
    setFileType: (fileType: FileType) => void;
    downloadFile: (fileType: FileType) => void;
    currentFileType: FileType;
    downloadProject: () => void;
}

const ManimEditor: React.FC<ManimEditorProps> = ({manimDSLName, styleSheetName, language, setParentEditor, setFileType, currentFileType, downloadFile, downloadProject}) => {

    const assignRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const editor = monaco.editor.create(assignRef.current!, {
            theme: "vs-dark",
            language: language,
            autoIndent: "full",
            fontSize: 16
        });
        setParentEditor(editor)
        // eslint-disable-next-line
    }, [language])

    function getStylingForTab(fileType: FileType): CSSProperties {
        if (fileType === currentFileType) {
            return {
                color: "white",
                padding: "10px",
                paddingLeft: "20px",
                paddingRight: "20px",
                backgroundColor: "#1e1e1e",
                cursor: "pointer",
                fontWeight: "bold"
            }
        }
        return {
            color: "white",
            padding: "10px",
            paddingLeft: "20px",
            paddingRight: "20px",
            backgroundColor: "#2d2d2d",
            cursor: "pointer"
        }
    }


    return (
        <Card className="shadow" as="div" style={{background: "#252526"}}>
            <div style={{marginBottom: "8px", marginTop: "8px", backgroundColor: "#252526"}}>
                <span onClick={() => setFileType(FileType.MANIMDSLCODE)}
                      style={getStylingForTab(FileType.MANIMDSLCODE)}>
                    {manimDSLName || "code.manimdsl"}
                    <FontAwesomeIcon onClick={() => downloadFile(FileType.MANIMDSLCODE)}
                                     style={{color: "white", marginLeft: "10px", padding: "2px"}} icon={faDownload}/>
                </span>
                <span onClick={() => setFileType(FileType.STYLESHEET)}
                      style={getStylingForTab(FileType.STYLESHEET)}>{styleSheetName || "style.json"}
                    <FontAwesomeIcon onClick={() => downloadFile(FileType.STYLESHEET)}
                                     style={{color: "white", marginLeft: "10px", padding: "2px"}} icon={faDownload}/>
                </span>
                <span style={{float: "right", cursor: "pointer"}}>
                    <FontAwesomeIcon onClick={downloadProject}
                         style={{color: "white", marginRight: "10px"}}
                         icon={faDownload}/>
                </span>
            </div>
            <div ref={assignRef} style={{height: '70vh'}}/>
        </Card>
    )
}

export default ManimEditor;
