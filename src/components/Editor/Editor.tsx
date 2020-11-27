import {Card} from "react-bootstrap";
import React, {CSSProperties, useEffect, useState} from "react";
import {FileType} from "../../pages/Home/Home";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import Editor, {Monaco, monaco} from '@monaco-editor/react';
import {languageExtensionPoint, languageID} from "../../language/config";
import {language, monarchLanguage} from "../../language/ManimDSL";
import ManimLanguageService, {AnnotationType} from "../../language/language-service";
import {editor, Range} from "monaco-editor";
import "./Editor.css"
import {contextMenu, Item, Menu} from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';
import SubtitleModal, {SubtitleType} from "../SubtitleModal/SubtitleModal";
import GeneralAnnotationModal from "../GeneralAnnotationModal/GeneralAnnotationModal";

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
    let [showAnnotationModal, setShowAnnotationModal] = useState(false);
    let [subtitleLineNumber, setSubtitleLineNumber] = useState(-1);
    const [contextMenuSelection, setContextMenuSelection] = useState<{ start: number, end: number } | undefined>(undefined)

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

    let ids: any[] = [];


    let  conditionSelection: any;
    function onEditorMount(editorInstance: editor.IStandaloneCodeEditor) {
        setMonacoEditor(editorInstance)
        conditionSelection = editorInstance.createContextKey('conditionSelection', false);
        const contextmenu = editorInstance.getContribution('editor.contrib.contextmenu')
        // @ts-ignore
        const realMethod = contextmenu._onContextMenu;
        // @ts-ignore
        contextmenu._onContextMenu = function(e) {
            let selection = editorInstance.getSelection();
            if (selection) {
                conditionSelection.set(true)
                setContextMenuSelection({start: selection.startLineNumber, end: selection.endLineNumber})
            } else {
                conditionSelection.set(false);
                setContextMenuSelection(undefined)
            }
            if (e.target.toString().startsWith("GUTTER_LINE_NUMBERS")) {
                handleEvent(e.event.browserEvent)
                setSubtitleLineNumber(e.target.position?.lineNumber!)
            }
            realMethod.apply(contextmenu, arguments);
        };
        editorInstance.addAction({
            id: 'add-subtitle',
            label: 'Add Subtitle',

            keybindings: [
                monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.F9,
            ],

            run: function (ed) {
                setShowSubtitleModal(true)
                return undefined;
            }
        });
        editorInstance.addAction({
            id: 'add-annotation',
            label: 'Add Annotation',

            keybindings: [
                monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.F10,
            ],

            // A rule to evaluate on top of the precondition in order to dispatch the keybindings.

            contextMenuGroupId: 'navigation',

            contextMenuOrder: 1.5,

            run: function (ed) {
                setShowAnnotationModal(true)
                return undefined;
            }
        });
        editorInstance.onDidChangeModelContent((e) => {
            // TODO: Find better way than session storage for currentFileType
            let isManimTab = (sessionStorage.getItem("currentFileType") || "1") === "1"
            if (isManimTab) {
                let code = editorInstance.getValue()
                let languageService = new ManimLanguageService();
                let {ast, errors} = languageService.parse(code);
                let annotations = languageService.walkAST(ast)
                let x = annotations.map(annotation => {
                    return {
                        range: new Range(annotation.startLine, 1, annotation.endLine, 1),
                        options: {isWholeLine: true, linesDecorationsClassName: annotation.className}
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
        contextMenu.show({
            id: "menu_id",
            event: e,
            props: {}
        });
    };

    function addSubtitle(newSubtitle: { condition: string | undefined, subtitle: string, duration: string | undefined, type: SubtitleType}) {
        let currentValue = monacoEditor?.getValue() || ""
        let lines = currentValue.split("\n");
        let topLine = lines[subtitleLineNumber - 1];
        let indexNonWhitespace = topLine.search(/\S/)
        let annotation = new Array(indexNonWhitespace + 1).join(' ') + "@subtitle";
        if (newSubtitle.type === SubtitleType.ONCE) annotation += "Once"
        let condition = newSubtitle.condition ? `,${newSubtitle.condition}` : ""
        if (newSubtitle.duration) condition += `, ${newSubtitle.duration}`
        let subtitle = `${annotation}("${newSubtitle.subtitle}"${condition})`

        lines.splice(subtitleLineNumber - 1, 0, subtitle);
        monacoEditor?.setValue(lines.join("\n"))
        setSubtitleLineNumber(-1);
        setShowSubtitleModal(false)
    }

    function addAnnotation(annotation: { condition: string | undefined, annotationType: AnnotationType, multiplier: string | undefined }) {
        let currentValue = monacoEditor?.getValue() || ""
        let lines = currentValue.split("\n");
        let multiplier = annotation.multiplier ? annotation.multiplier + ", " : ""
        let brackets = annotation.condition ? `(${multiplier}${annotation.condition})` : ""
        if(annotation.multiplier && brackets.length === 0) {
            brackets = "(" + annotation.multiplier + ")"
        }
        let topLine = lines[contextMenuSelection?.start!! - 1];
        let indexNonWhitespace = topLine.search(/\S/)
        let annotationString = new Array(indexNonWhitespace + 1).join(' ') + `${annotation.annotationType}${brackets} {`
        lines.splice((contextMenuSelection?.start || 0) - 1, 0, annotationString);
        lines.splice((contextMenuSelection?.end || 0) + 1, 0,  new Array(indexNonWhitespace + 1).join(' ') + "}");
        monacoEditor?.setValue(lines.join("\n"))
        setContextMenuSelection(undefined)
        setShowAnnotationModal(false)
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
            <div>
                <Editor language={"manimDSL"} height={"70vh"} theme={"dark"} options={{fontSize: 16}}
                        editorDidMount={(_, editor) => onEditorMount(editor)}/>
            </div>
            <Menu id='menu_id'>
                {/*{contextMenuSelection && <Item onClick={() => setShowAnnotationModal(true)}>Add Annotation</Item>}*/}
                <Item onClick={() => setShowSubtitleModal(true)}>Add Subtitle</Item>
            </Menu>
            <SubtitleModal showModal={showSubtitleModal} setSubtitleParent={addSubtitle}
                           setModal={() => setShowSubtitleModal(false)}/>
            <GeneralAnnotationModal showModal={showAnnotationModal} setAnnotation={addAnnotation}
                                    setModal={() => setShowAnnotationModal(false)}/>
        </Card>
    )
}

export default ManimEditor;
