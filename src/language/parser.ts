import {ManimParser, ProgramContext} from "../antlr/ManimParser";
import { ManimLexer } from "../antlr/ManimLexer";
import { ANTLRInputStream, CommonTokenStream } from "antlr4ts";
import TodoLangErrorListener, {ManimDSLError} from "./errorListener";

function parse(code: string): {ast:ProgramContext, errors: ManimDSLError[]} {
    const inputStream = new ANTLRInputStream(code);
    const lexer = new ManimLexer(inputStream);
    lexer.removeErrorListeners()
    const todoLangErrorsListner = new TodoLangErrorListener();
    lexer.addErrorListener(todoLangErrorsListner);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new ManimParser(tokenStream);
    parser.removeErrorListeners();
    parser.addErrorListener(todoLangErrorsListner);
    const ast =  parser.program();
    const errors: ManimDSLError[]  = todoLangErrorsListner.getErrors();
    return {ast, errors};
}
export function parseAndGetASTRoot(code: string): ProgramContext {
    const {ast} = parse(code);
    return ast;
}
export function parseAndGetSyntaxErrors(code: string): ManimDSLError[] {
    const {errors} = parse(code);
    return errors;
}
