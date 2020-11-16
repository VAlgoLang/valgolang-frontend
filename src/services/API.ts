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

    buildRequest(method: Method, path: string, data: { [key: string]: any } | FormData = {}, params: { [key: string]: any } = {}): Promise<APIResponse> {
        let config: AxiosRequestConfig = {
            url: apiURL + path,
            method: method,
            data: data,
            params: params,
            responseType: "blob"
        }
        return axios.request(config).then(async res => {
            if((res.headers["content-type"] as string).includes("application/json")) {
                let blob = res.data as Blob
                let text = await blob.text()
                return JSON.parse(text) as APIResponse
            } else {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'file.mp4');
                document.body.appendChild(link);
                link.click();
                return {success: true, file: true, data: res.data} as APIResponse
            }
        }).catch(err => {
            return failedAPIResponse("Request failed")
        })
    }

    compileCode(code: string, stylesheet: string, producePython: boolean) {
        let data = new FormData()
        data.append("file", new Blob([code]));
        data.append("stylesheet", new Blob([stylesheet]));
        data.append('pythonFile', producePython);
        data.append('outputName', 'myAnim');
        return this.buildRequest("POST", "/compile", data)
    }

}


