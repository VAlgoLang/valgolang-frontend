import React from "react";
import {Button, Modal} from "react-bootstrap";

export interface VideoInfo {
    data: any,
    fileName: string,
    extension: string
}

interface VideoModalProps {
    videoInfo?: VideoInfo;
    isOpen: boolean;
    closeModal: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({isOpen, closeModal, videoInfo}) => {

    function downloadVideo() {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([videoInfo?.data]));
        link.setAttribute('download', (videoInfo!.fileName || 'out') + "." + videoInfo!.extension);
        document.body.appendChild(link);
        link.click();
    }

    return (
        <Modal show={isOpen} onHide={closeModal} size={"lg"}>
            <Modal.Header closeButton>
                <Modal.Title>Video Rendering Complete</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{textAlign: "center"}}>
                <video src={window.URL.createObjectURL(new Blob([videoInfo?.data]))} controls style={{width: "100%"}}/>
                <Button onClick={downloadVideo} variant={"success"}>Download</Button>
            </Modal.Body>
        </Modal>
    )
};

export default VideoModal;
