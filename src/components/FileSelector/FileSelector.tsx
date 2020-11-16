import React, {useEffect, useRef} from "react";
import {Button} from "react-bootstrap";

interface FileSelectorProps {
    onChange: (e: any) => void;
    name: string;
    directory: boolean;
}

const FileSelector: React.FC<FileSelectorProps> = ({onChange, name, directory}) => {
    const inputRef = useRef<any>(null);

    useEffect(() => {
        if(directory) {
            inputRef!.current!.directory = true;
            inputRef!.current!.webkitdirectory = true;
        }
    }, [directory])

    /* Used when file upload button clicked to access invisible a tag responsible for file upload */
    function clickFileUpload() {
        inputRef.current.click()
    }

    return <div style={{marginBottom: "10px"}}>
        <Button  size="lg" block onClick={clickFileUpload}>{name}</Button>
        <input style={{display: "none"}} ref={inputRef} onChange={onChange} type="file" multiple/>
    </div>;
}

export default FileSelector;
