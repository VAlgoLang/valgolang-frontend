import { ANTLRErrorListener, RecognitionException, Recognizer } from "antlr4ts";


export interface ManimDSLError {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    message: string;
    code: string;
}

export default class ManimErrorListener implements ANTLRErrorListener<any>{
    private errors: ManimDSLError[] = []
    syntaxError(recognizer: Recognizer<any, any>, offendingSymbol: any, line: number, charPositionInLine: number, message: string, e: RecognitionException | undefined): void {

        this.errors.push(
            {
                startLineNumber:line,
                endLineNumber: line,
                startColumn: charPositionInLine,
                endColumn: (offendingSymbol ? (offendingSymbol?.endIndex || charPositionInLine + 1) : charPositionInLine + 1),
                message,
                code: "1"
            }
        )
    }

    getErrors(): ManimDSLError[] {
        return this.errors;
    }
}
