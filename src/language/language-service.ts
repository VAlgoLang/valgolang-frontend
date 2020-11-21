import {ManimParser, ProgramContext} from "../antlr/ManimParser";
import {ANTLRInputStream, CommonTokenStream} from "antlr4ts";
import {ManimLexer} from "../antlr/ManimLexer";
import ManimErrorListener, {ManimDSLError} from "./errorListener";

export default class ManimLanguageService {
    validate(code: string): ManimDSLError[] {
        return this.parseAndGetSyntaxErrors(code);
    }

    parse(code: string): {ast:ProgramContext, errors: ManimDSLError[]} {
        const inputStream = new ANTLRInputStream(code);
        const lexer = new ManimLexer(inputStream);
        lexer.removeErrorListeners()
        const todoLangErrorsListner = new ManimErrorListener();
        lexer.addErrorListener(todoLangErrorsListner);
        const tokenStream = new CommonTokenStream(lexer);
        const parser = new ManimParser(tokenStream);
        parser.removeErrorListeners();
        parser.addErrorListener(todoLangErrorsListner);
        const ast =  parser.program();
        const errors: ManimDSLError[]  = todoLangErrorsListner.getErrors();
        return {ast, errors};
    }

    parseAndGetASTRoot(code: string): ProgramContext {
        const {ast} = this.parse(code);
        return ast;
    }

    parseAndGetSyntaxErrors(code: string): ManimDSLError[] {
        const {errors} = this.parse(code);
        return errors;
    }


}
