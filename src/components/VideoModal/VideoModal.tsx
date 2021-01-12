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

    function getVideo() {
        if(videoInfo?.data) {
            return <video src={window.URL.createObjectURL(videoInfo?.data)} controls style={{width: "100%"}} playsInline/>
        } else {
            return <div/>
        }
    }

    return (
        <Modal id="video-modal" show={isOpen} onHide={closeModal} size={"lg"}>
            <Modal.Header closeButton>
                <Modal.Title>Video Rendering Complete</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{textAlign: "center"}}>
                {getVideo()}
                <Button onClick={downloadVideo} variant={"success"}>Download</Button>
            </Modal.Body>
        </Modal>
    )
};

export default VideoModal;
