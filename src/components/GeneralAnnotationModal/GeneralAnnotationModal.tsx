import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {AnnotationType} from "../../language/language-service";

interface SubtitleModalProps {
    showModal: boolean;
    setModal: (flag: boolean) => void;
    setAnnotation: (subtitle: {condition: string | undefined, annotationType: AnnotationType, multiplier: string | undefined}) => void
}

const GeneralAnnotationModal: React.FC<SubtitleModalProps> = ({showModal, setAnnotation, setModal}) => {

    const [condition, setCondition] = useState<string | undefined>(undefined)
    const [multiplier, setMultiplier] = useState<string | undefined>(undefined)
    const [annotationType, setAnnotationType] = useState<AnnotationType>(AnnotationType.STEPINTO)

    function submitModal() {
        if (annotationType === AnnotationType.SPEED && (!multiplier || multiplier.length !== 0)) {
            alert("Make sure you include speed multiplier")
            return;
        }

        let submittedCondition = (condition) ? (condition.length === 0? undefined : condition) : undefined
        setAnnotation({annotationType: annotationType, condition: submittedCondition, multiplier: multiplier})
    }

    function getOptions() {
        let options:string[] = []
        for(const type in AnnotationType) {
            if(type.toString() !== "SUBTITLE") {
                options.push("@" + type.toString().toLowerCase());
            }
        }
        return options;
    }

    function parseAnnotationType(e: any) {
        // @ts-ignore
        return AnnotationType[e.target.value.toString().substring(1).toUpperCase()]
    }

    return (
        <Modal show={showModal} onHide={() => setModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Add Annotation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Add your annotation here</p>
                Annotation Type:
                <Form.Control as="select" onChange={(e) => setAnnotationType(parseAnnotationType(e))}>
                    {getOptions().map((option, index) => {
                        return <option key={index}>{option}</option>
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
