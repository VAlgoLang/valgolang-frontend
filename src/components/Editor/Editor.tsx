import {Card} from "react-bootstrap";
import React, {CSSProperties, useEffect, useState} from "react";
import {FileType} from "../../pages/Home/Home";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import Editor, {Monaco, monaco} from '@monaco-editor/react';
import {languageExtensionPoint, languageID} from "../../language/config";
import {language, monarchLanguage} from "../../language/ManimDSL";
import ManimLanguageService from "../../language/language-service";
import {editor, Range} from "monaco-editor";
import "./Editor.css"
import {Menu, Item, contextMenu} from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';
import SubtitleModal from "../SubtitleModal/SubtitleModal";

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

    let [monacoEditor, setMonacoEditor] = useState<editor.IStandaloneCodeEditor>();
    let [showSubtitleModal, setShowSubtitleModal] = useState(false);
    let [subtitleLineNumber, setSubtitleLineNumber] = useState(-1);

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

    let ids:any[] = [];

    function onEditorMount(editorInstance: editor.IStandaloneCodeEditor) {
        setMonacoEditor(editorInstance)
        editorInstance.onContextMenu(function (e) {
            setSubtitleLineNumber(e.target.position?.lineNumber!)
        });
        editorInstance.onDidChangeModelContent((e) => {
            // TODO: Find better way than session storage for currentFileType
            let isManimTab = (sessionStorage.getItem("currentFileType") || "1" )=== "1"
            if (isManimTab) {
                let code = editorInstance.getValue()

                let languageService = new ManimLanguageService();
                let {ast, errors} = languageService.parse(code);
                let annotations = languageService.walkAST(ast)
                let x = annotations.map(annotation => {
                    return {
                        range: new Range(annotation.startLine, 1, annotation.endLine, 1),
                        options: {isWholeLine: true, linesDecorationsClassName: 'myLineDecoration'}
                    }
                })
                ids = editorInstance.deltaDecorations(ids, x);
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
        setParentEditor(editorInstance)
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

    const handleEvent = (e: any) => {
        e.preventDefault();
        e.stopPropagation()
        contextMenu.show({
            id: "menu_id",
            event: e,
            props: {}
        });
    };

    function addSubtitle(newSubtitle: {condition: string | undefined, subtitle: string}) {
        let currentValue = monacoEditor?.getValue() || ""
        let lines = currentValue.split("\n");
        let annotation = "@subtitle";
        let condition = newSubtitle.condition ? `${newSubtitle.condition})` : ""
        let subtitle = `${annotation}("${newSubtitle.subtitle}", ${condition})`
        lines.splice(subtitleLineNumber - 1, 0, subtitle);
        monacoEditor?.setValue(lines.join("\n"))
        setSubtitleLineNumber(-1);
        setShowSubtitleModal(false)
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
            <div onContextMenu={handleEvent}>
                <Editor language={"manimDSL"} height={"70vh"} theme={"dark"} options={{fontSize: 16}}
                    editorDidMount={(_, editor) => onEditorMount(editor)}/>
            </div>
            <Menu id='menu_id'>
                <Item onClick={() => setShowSubtitleModal(true)}>Add Subtitle</Item>
            </Menu>
            <SubtitleModal showModal={showSubtitleModal} setSubtitleParent={addSubtitle} setModal={() => setShowSubtitleModal(false)}/>
        </Card>
    )
}

export default ManimEditor;
