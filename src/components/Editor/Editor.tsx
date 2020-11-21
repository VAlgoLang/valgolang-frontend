import {Card} from "react-bootstrap";
import React, {CSSProperties, useEffect} from "react";
import {FileType} from "../../pages/Home/Home";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import Editor, {Monaco, monaco} from '@monaco-editor/react';
import {languageExtensionPoint, languageID} from "../../language/config";
import {language, monarchLanguage} from "../../language/ManimDSL";
import ManimLanguageService from "../../language/language-service";
import {editor, Range} from "monaco-editor";
import "./Editor.css"

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
    let monacoInstance: Monaco

    useEffect(() => {
        monaco
            .init()
            .then(monacoI => {
                monacoI.languages.register(languageExtensionPoint);
                monacoI.languages.onLanguage(languageID, () => {
                    monacoI.languages.setLanguageConfiguration(languageID, monarchLanguage);
                    monacoI.languages.setMonarchTokensProvider(languageID, language);
                });

                // eslint-disable-next-line
                monacoInstance = monacoI
            })
            .catch(error => console.error('An error occurred during initialization of Monaco: ', error));
    }, [])

    function onEditorMount(monacoEditor: editor.IStandaloneCodeEditor) {
        monacoEditor.onDidChangeModelContent((e) => {
            // TODO: Find better way than session storage for currentFileType
            let isManimTab = (sessionStorage.getItem("currentFileType") || "1" )=== "1"
            if (isManimTab) {
                let code = monacoEditor.getValue()

                let languageService = new ManimLanguageService();
                let {ast, errors} = languageService.parse(code);
                let annotations = languageService.walkAST(ast)
                let x = annotations.map(annotation => {
                    return {
                        range: new Range(annotation.startLine, 1, annotation.endLine, 1),
                        options: {isWholeLine: true, linesDecorationsClassName: 'myLineDecoration'}
                    }
                })

                monacoEditor.deltaDecorations([], x);
                let monacoErrors = [];
                for (let e of errors) {
                    monacoErrors.push({
                        startLineNumber: e.startLineNumber,
                        startColumn: e.startColumn,
                        endLineNumber: e.endLineNumber,
                        endColumn: e.endColumn,
                        message: e.message,
                        severity: monacoInstance!!.MarkerSeverity.Error
                    });
                }
                let model = monacoInstance?.editor.getModels()[0];
                if (model) {
                    monacoInstance?.editor.setModelMarkers(model, "owner", monacoErrors);
                }
            } else {
                let model = monacoInstance?.editor.getModels()[0];
                if (model) {
                    monacoInstance?.editor.setModelMarkers(model, "owner", []);
                }
            }

        })
        setParentEditor(monacoEditor)
    }

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
            <Editor language={"manimDSL"} height={"70vh"} theme={"dark"} options={{fontSize: 16}}
                    editorDidMount={(_, editor) => onEditorMount(editor)}/>

        </Card>
    )
}

export default ManimEditor;
