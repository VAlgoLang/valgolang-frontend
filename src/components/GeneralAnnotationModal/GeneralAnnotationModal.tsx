import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {AnnotationType} from "../../language/language-service";

interface SubtitleModalProps {
    showModal: boolean;
    setModal: (flag: boolean) => void;
    setAnnotation: (subtitle: { condition: string | undefined, annotationType: AnnotationType, multiplier: string | undefined }) => void
}

const optionsToDescription = [
        {type: AnnotationType.STEPINTO, description: "Step into code block"},
        {type: AnnotationType.STEPOVER, description: "Step over code block"},
        {type: AnnotationType.SPEED, description: "Change speed of animation"},
    ]

const GeneralAnnotationModal: React.FC<SubtitleModalProps> = ({showModal, setAnnotation, setModal}) => {

    const [condition, setCondition] = useState<string | undefined>(undefined)
    const [multiplier, setMultiplier] = useState<string | undefined>(undefined)
    const [annotationType, setAnnotationType] = useState<AnnotationType>(AnnotationType.STEPINTO)

    function submitModal() {
        console.log(multiplier)
        if (annotationType === AnnotationType.SPEED && (!multiplier || multiplier.length === 0)) {
            alert("Make sure you include speed multiplier")
            return;
        }

        let submittedCondition = (condition) ? (condition.length === 0 ? undefined : condition) : undefined
        setAnnotation({annotationType: annotationType, condition: submittedCondition, multiplier: multiplier})
    }

    function parseAnnotationType(e: any) {
        let textValue = e.target.value.toString()
        setAnnotationType(optionsToDescription.find(x => x.description === textValue)!.type)
    }

    return (
        <Modal show={showModal} onHide={() => setModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Add Annotation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Add your annotation here</p>
                Annotation Type:
                <Form.Control as="select" onChange={(e) => parseAnnotationType(e)}>
                    {optionsToDescription.map((option, index) => {
                        return <option key={index}>{option.description}</option>
                    })}
                </Form.Control>
                Condition (optional):
                <Form.Control onChange={(e) => setCondition(e.target.value!)}/>
                {annotationType === AnnotationType.SPEED &&
                <>
                    Speed Multiplier (required):
                    <Form.Control onChange={(e) => setMultiplier(e.target.value!)}/>
                </>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={submitModal}>Save</Button>
            </Modal.Footer>
        </Modal>
    )
};

export default GeneralAnnotationModal;
