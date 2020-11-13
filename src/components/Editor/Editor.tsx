import {Card} from "react-bootstrap";
import Editor from "@monaco-editor/react";
import React from "react";

const ManimEditor: React.FC = () => {
    return (
        <Card className="shadow" as="div" style={{padding: "20px", background: "#212529"}}>
            <Editor height="60vh" theme="dark" language="javascript"/>
        </Card>
    )
}

export default ManimEditor;
