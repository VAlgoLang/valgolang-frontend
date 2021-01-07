import axios, {AxiosRequestConfig, Method} from 'axios';
import FormData from "form-data";

/* API URL from environment variable defined in the .env files */
const apiURL = process.env.REACT_APP_API_URL;

export interface APIResponse {
    success: boolean;
    message: string;
    data?: any;
    file: boolean;
}



const failedAPIResponse = (message: string) => {
    return {
        message: message,
        success: false
    } as APIResponse
};

export class APIService {

    buildRequest(method: Method, path: string, data: { [key: string]: any } | FormData = {}, fileName?: string): Promise<APIResponse> {
        let config: AxiosRequestConfig = {
            url: apiURL + path,
            method: method,
            data: data,
            responseType: "blob"
        }
        return axios.request(config).then(async res => {
            if((res.headers["content-type"] as string).includes("application/json")) {
                let blob = res.data as Blob
                let text = await blob.text()
                return JSON.parse(text) as APIResponse
            } else {
                let extension = res.headers["content-type"].split("/")[1]
                if((res.headers["content-type"] as string).includes("application/zip")) {
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(new Blob([res.data]));
                    link.setAttribute('download', (fileName || 'out') + "." + extension);
                    document.body.appendChild(link);
                    link.click();
                    return {success: true, file: false, data: {data: res.data, extension: extension, fileName: fileName}} as APIResponse
                }
                return {success: true, file: true, data: {data: res.data, extension: extension, fileName: fileName}} as APIResponse
            }
        }).catch(err => {
            return failedAPIResponse("Request failed")
        })
    }

    compileCode(code: string, stylesheet: string, outputFilename: string, producePython: boolean, quality: string) {
        let data = new FormData()
        data.append("file", new Blob([code]));
        data.append("stylesheet", new Blob([stylesheet]));
        data.append('pythonFile', producePython);
        data.append('outputName', outputFilename);
        data.append('quality', quality);
        return this.buildRequest("POST", "/compile", data, outputFilename)
    }

    getBoundaries(code: string, stylesheet: string) {
        let data = new FormData()
        data.append("file", new Blob([code]));
        data.append("stylesheet", new Blob([stylesheet]));
        return this.buildRequest("POST", "/compile/boundaries", data)
    }

    getStatus(uid: string){
        return this.buildRequest("GET", "/compile/status?uid=" + uid);
    }

    getExamples(){
        return this.buildRequest("GET", "/examples/list");
    }

    getExample(folderName: string){
        return this.buildRequest("GET", "/examples/example?file=" + folderName)
    }
}



