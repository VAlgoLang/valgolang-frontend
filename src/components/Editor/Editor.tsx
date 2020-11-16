import {Button, Card} from "react-bootstrap";
import React, {useEffect, useRef} from "react";
import * as monaco from 'monaco-editor-core';

interface ManimEditorProps {
    language: string;
    setParentEditor: (s: monaco.editor.IStandaloneCodeEditor) => void;
}

const ManimEditor: React.FC<ManimEditorProps> = ({language, setParentEditor}) => {

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

    return (
        <Card className="shadow" as="div" style={{paddingTop: "20px", background: "#1e1e1e"}}>
            <div ref={assignRef} style={{height: '80vh'}}/>
        </Card>
    )
}

export default ManimEditor;
