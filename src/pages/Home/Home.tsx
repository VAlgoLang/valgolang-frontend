import React from "react";
import "./Home.css";
import PlacementManger from "../../components/PlacementManager/PlacementManager";
import {Container} from "react-bootstrap";
import ManimEditor from "../../components/Editor/Editor";

const Home: React.FC = () => {

    return (
        <Container>
            <h1 style={{textAlign: "center", padding: "20px"}}>ManimDSL Online Editor</h1>
            <ManimEditor/>
            <div style={{width: "100%", margin: "0 auto"}}>
                <PlacementManger width={700} height={400}/>
            </div>
        </Container>
    )
};

export default Home;
