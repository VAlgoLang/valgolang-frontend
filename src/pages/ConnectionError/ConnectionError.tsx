import React from "react";
import "./ConnectionError.css";
import {Container} from "react-bootstrap";
import connError from "../../media/connError.jpg"


const ConnectionError: React.FC = () => {

    return (
        <Container fluid>
            <div style={{width: "100%", textAlign: "center", margin: "0 auto", marginTop: "40px"}}>
                <img src={connError} alt={"Connection Error"}/>
                <h1 style={{width: "80%", margin: "0 auto"}}>Could not connect to the backend server. Please try again later</h1>
            </div>
        </Container>
    )
};

export default ConnectionError;

