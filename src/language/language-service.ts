import {parseAndGetSyntaxErrors} from "./parser";
import {ManimDSLError} from "./errorListener";

export default class ManimLanguageService {
    validate(code: string): ManimDSLError[] {
        return parseAndGetSyntaxErrors(code);
    }

}
