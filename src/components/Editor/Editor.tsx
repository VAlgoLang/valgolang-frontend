import {ButtonGroup, Card, Dropdown, DropdownButton} from "react-bootstrap";
import React, {useEffect, useRef} from "react";
import * as monaco from 'monaco-editor-core';

const ManimEditor: React.FC = () => {

    const assignRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
            monaco.editor.create(assignRef.current!, {
                theme: "vs-dark",
                language: "todoLang",
                autoIndent: "full",
                fontSize: 16
            });
    }, [])

    return (
        <>
            <Card className="shadow" as="div" style={{paddingTop: "20px", background: "#1e1e1e"}}>
                <div ref={assignRef} style={{height: '80vh'}}/>
            </Card>
            <ButtonGroup style={{float: "right", marginTop: "10px"}}>
                <DropdownButton as={ButtonGroup} title="Submit" id="bg-nested-dropdown">
                    <Dropdown.Item eventKey="1">Compile!</Dropdown.Item>
                    <Dropdown.Item eventKey="2">Compile with Advanced Options</Dropdown.Item>
                </DropdownButton>
            </ButtonGroup>
        </>
    )
}

export default ManimEditor;
