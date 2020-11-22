import React from "react";
import {Spinner} from "react-bootstrap";

const LoadingOverlay: React.FC = () => {
    return <div id="loadingOverlay">
        <Spinner
            as="span"
            animation="border"
            role="status"
            aria-hidden="true"
            variant="primary"
        />
    </div>
}

export default LoadingOverlay;
