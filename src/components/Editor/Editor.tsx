import {Card} from "react-bootstrap";
import React, {CSSProperties, useEffect, useRef} from "react";
import * as monaco from 'monaco-editor-core';
import {FileType} from "../../pages/Home/Home";

interface ManimEditorProps {
    manimDSLName: string;
    styleSheetName: string;
    language: string;
    setParentEditor: (s: monaco.editor.IStandaloneCodeEditor) => void;
    setFileType: (fileType: FileType) => void;
    currentFileType: FileType;
}

const ManimEditor: React.FC<ManimEditorProps> = ({manimDSLName, styleSheetName, language, setParentEditor, setFileType, currentFileType}) => {

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
                      style={getStylingForTab(FileType.MANIMDSLCODE)}>{manimDSLName || "code.manimdsl"}</span>
                <span onClick={() => setFileType(FileType.STYLESHEET)}
                      style={getStylingForTab(FileType.STYLESHEET)}>{styleSheetName || "style.json"}</span>
            </div>
            <div ref={assignRef} style={{height: '80vh'}}/>
        </Card>
    )
}

export default ManimEditor;
