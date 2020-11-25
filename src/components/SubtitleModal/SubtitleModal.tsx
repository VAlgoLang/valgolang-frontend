import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";

interface SubtitleModalProps {
    showModal: boolean;
    setModal: (flag: boolean) => void;
    setSubtitleParent: (subtitle: {condition: string | undefined, subtitle: string}) => void
}

const SubtitleModal: React.FC<SubtitleModalProps> = ({showModal, setSubtitleParent, setModal}) => {

    const [condition, setCondition] = useState<string | undefined>(undefined)
    const [subtitle, setSubtitle] = useState<string>("")

    function submitCode() {
        let submittedCondition = (condition) ? (condition.length === 0? undefined : condition) : undefined
        if(subtitle.length === 0) {
            alert("Add subtitle text")
        }
        setSubtitleParent({subtitle: subtitle, condition: submittedCondition})
    }

    return (
        <Modal show={showModal} onHide={() => setModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Add Subtitle</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Add your subtitle here</p>
                Condition (optional):
                <Form.Control onChange={(e) => setCondition(e.target.value!)}/>
                Subtitle Message:
                <Form.Control onChange={(e) => setSubtitle(e.target.value!)}/>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={submitCode}>Save</Button>
            </Modal.Footer>
        </Modal>
    )
};

export default SubtitleModal;
