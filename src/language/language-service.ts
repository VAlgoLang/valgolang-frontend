import {AnimationSpeedUpAnnotationContext, ManimParser, ProgramContext} from "../antlr/ManimParser";
import {ANTLRInputStream, CommonTokenStream} from "antlr4ts";
import {ManimLexer} from "../antlr/ManimLexer";
import ManimErrorListener, {ManimDSLError} from "./errorListener";
import {ManimParserVisitor} from "../antlr/ManimParserVisitor";
import {AbstractParseTreeVisitor} from "antlr4ts/tree";

export default class ManimLanguageService {
    validate(code: string): ManimDSLError[] {
        return this.parseAndGetSyntaxErrors(code);
    }

    parse(code: string): { ast: ProgramContext, errors: ManimDSLError[] } {
        const inputStream = new ANTLRInputStream(code);
        const lexer = new ManimLexer(inputStream);
        lexer.removeErrorListeners()
        const manimErrorListener = new ManimErrorListener();
        lexer.addErrorListener(manimErrorListener);
        const tokenStream = new CommonTokenStream(lexer);
        const parser = new ManimParser(tokenStream);
        parser.removeErrorListeners();
        parser.addErrorListener(manimErrorListener);
        const ast = parser.program();
        const errors: ManimDSLError[] = manimErrorListener.getErrors();
        return {ast, errors};
    }

    walkAST(ast: ProgramContext) {
        let visitor = new ManimDSLVisitor()
        visitor.visit(ast)
        return visitor.getAnnotations()
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
export enum AnnotationType {
    SUBTITLE="@subtitle",
    STEPINTO="@stepInto",
    STEPOVER="@stepOver",
    SPEED="@speed"
}

interface Annotations {
    startLine: number;
    endLine: number;
    type: AnnotationType
}

class ManimDSLVisitor extends AbstractParseTreeVisitor<any> implements ManimParserVisitor<any>{

    private annotations: Annotations[] = []

    protected defaultResult(): any {
        return 0;
    }

    visitAnimationSpeedUp(ctx: AnimationSpeedUpAnnotationContext): any {
        this.annotations.push({startLine: ctx.start.line, endLine: ctx.stop?.line!!, type: AnnotationType.SPEED})
    }

    getAnnotations() {
        return this.annotations
    }

}
