import {Card} from "react-bootstrap";
import React, {CSSProperties, useEffect} from "react";
import {FileType} from "../../pages/Home/Home";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import Editor, {monaco} from '@monaco-editor/react';
import {languageExtensionPoint, languageID} from "../../language/config";
import {language, monarchLanguage} from "../../language/ManimDSL";

interface ManimEditorProps {
    manimDSLName: string;
    styleSheetName: string;
    setParentEditor: (s: any) => void;
    setFileType: (fileType: FileType) => void;
    downloadFile: (fileType: FileType) => void;
    currentFileType: FileType;
    downloadProject: () => void;
}

const ManimEditor: React.FC<ManimEditorProps> = ({manimDSLName, styleSheetName, setParentEditor, setFileType, currentFileType, downloadFile, downloadProject}) => {

    useEffect(() => {
        monaco
            .init()
            .then(monaco => {
                monaco.languages.register(languageExtensionPoint);
                monaco.languages.onLanguage(languageID, () => {
                    monaco.languages.setLanguageConfiguration(languageID, monarchLanguage);
                    monaco.languages.setMonarchTokensProvider(languageID, language);
                });
            })
            .catch(error => console.error('An error occurred during initialization of Monaco: ', error));
    }, [])

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
            <Editor language={"manimDSL"} theme="dark" height={"70vh"}
                    editorDidMount={(_, editor) => setParentEditor(editor)}/>

        </Card>
    )
}

export default ManimEditor;
