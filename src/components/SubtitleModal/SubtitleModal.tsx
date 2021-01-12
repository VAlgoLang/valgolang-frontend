import React, {useEffect, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";

interface SubtitleModalProps {
    showModal: boolean;
    setModal: (flag: boolean) => void;
    setSubtitleParent: (subtitle: {condition: string | undefined, subtitle: string, duration: string | undefined, type: SubtitleType}) => void
}

export enum SubtitleType {
    ONCE, ALWAYS
}

const SubtitleModal: React.FC<SubtitleModalProps> = ({showModal, setSubtitleParent, setModal}) => {

    const [condition, setCondition] = useState<string | undefined>(undefined)
    const [subtitle, setSubtitle] = useState<string>("")
    const [duration, setDuration] = useState<string | undefined>(undefined)
    const [subtitleType, setSubtitleType] = useState<SubtitleType>(SubtitleType.ALWAYS)

    useEffect(() => {
        setCondition(undefined)
        setDuration(undefined)
        setSubtitleType(SubtitleType.ALWAYS)
        setSubtitle("")
    }, [showModal])

    function submitCode() {
        let submittedCondition = (condition) ? (condition.length === 0? undefined : condition) : undefined
        if(subtitle.length === 0) {
            alert("Add subtitle text")
        }
        setSubtitleParent({subtitle: subtitle, condition: submittedCondition, duration: duration, type: subtitleType})
    }

    // TODO: REDO
    function setSubtitleOnceOrAlways(value: string) {
        if(value.startsWith("Always")) {
            setSubtitleType(SubtitleType.ALWAYS)
        } else {
            setSubtitleType(SubtitleType.ONCE)
        }
    }

    return (
        <Modal id="subtitle-modal" show={showModal} onHide={() => setModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Add Subtitle</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Add your subtitle here</p>
                Subtitle Message:
                <Form.Control onChange={(e) => setSubtitle(e.target.value!)}/>
                Condition (optional):
                <Form.Control onChange={(e) => setCondition(e.target.value!)}/>
                Duration (default: 5 seconds):
                <Form.Control onChange={(e) => setDuration(e.target.value!)}/>
                Subtitle Type:
                <Form.Control as="select" onChange={(e) => setSubtitleOnceOrAlways(e.target.value!)}>
                    <option>Always (default) always show subtitle when this line executes</option>
                    <option>Once: only show this subtitle the first time this line is executed</option>
                </Form.Control>

            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={submitCode}>Save</Button>
            </Modal.Footer>
        </Modal>
    )
};

export default SubtitleModal;
