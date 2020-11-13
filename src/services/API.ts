import axios, {AxiosRequestConfig, Method} from 'axios';
import FormData from "form-data";

/* API URL from environment variable defined in the .env files */
const apiURL = process.env.REACT_APP_API_URL;

export interface APIResponse {
    success: boolean;
    message: string;
    data?: any;
}

const failedAPIResponse = (message: string) => {
    return {
        message: message,
        success: false
    } as APIResponse
};

export class APIService {


}


