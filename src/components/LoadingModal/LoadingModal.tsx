import React, {useEffect, useState} from "react";
import {Modal, Spinner} from "react-bootstrap";
import {apiService} from "../../index";
import {VideoInfo} from "../VideoModal/VideoModal";
import ReactInterval from 'react-interval';

interface ModalProps {
    showModal: boolean;
    uid: string
    onHide: () => void;
    setVideoData: (videoInfo: VideoInfo) => void;
}

const LoadingModal: React.FC<ModalProps> = ({showModal, onHide, uid, setVideoData}) => {

    const [logs, setLogs] = useState<string[]>([])
    const [isLoop, setIsLoop] = useState<boolean>(true);

    function getStatus() {
        apiService.getStatus(uid).then((res) => {
            if (res.file) {
                if(res.data.extension !== "zip") {
                    setIsLoop(false)
                    setVideoData(res.data)
                }
                onHide()
            } else {
                setLogs(res.data)
            }
        })
    }

    useEffect(() => {
        if (showModal) {
                getStatus();
        }
        // eslint-disable-next-line
    }, [showModal])

    return (
        <Modal show={showModal} onHide={() => {
            setIsLoop(false)
            onHide()
        }} size={"lg"}>
            <ReactInterval timeout={2000} enabled={isLoop} callback={() => getStatus()}/>

            <Modal.Header closeButton>
                <Modal.Title>This might take a while...</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p style={{textAlign: "center"}}>Your video is being generated...</p>
                <div>
                    {logs.map(log => {
                        return <p>{log}</p>
                    })}

                </div>
                <p style={{textAlign: "center"}}>Generating...<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"
                                                          style={{textAlign: "center", margin: "0 auto"}}/></p>
            </Modal.Body>
        </Modal>
    )
};

export default LoadingModal;
