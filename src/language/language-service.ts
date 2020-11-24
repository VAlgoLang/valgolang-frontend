import {
    AnimationSpeedUpAnnotationContext,
    CodeTrackingAnnotationContext,
    ManimParser,
    ProgramContext,
    SubtitleAnnotationContext
} from "../antlr/ManimParser";

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

enum AnnotationType {
    SUBTITLE,
    SPEED,
    STEPINTO,
    STEPOVER
}

export const annotationStrings: Map<AnnotationType, string> = new Map([
    [AnnotationType.SUBTITLE, "Subtitle"],
    [AnnotationType.SPEED, "Speed"],
    [AnnotationType.STEPINTO, "Step Into"],
    [AnnotationType.STEPOVER, "Step Over"],
])

export interface Annotations {
    startLine: number;
    endLine: number;
    type: AnnotationType;
    arguments: String;
}

class ManimDSLVisitor extends AbstractParseTreeVisitor<any> implements ManimParserVisitor<any> {

    private annotations: Annotations[] = []

    protected defaultResult(): any {
        return 0;
    }

    visitAnimationSpeedUpAnnotation(ctx: AnimationSpeedUpAnnotationContext): any {
        let args = "";
        if (ctx.arg_list()) {
            args = ctx.arg_list()!!.text
        }
        this.annotations.push({
            startLine: ctx.start.line,
            endLine: ctx.stop?.line!!,
            type: AnnotationType.SPEED,
            arguments: args
        })
    }

    visitCodeTrackingAnnotation(ctx: CodeTrackingAnnotationContext): any {
        let args = "";
        if (ctx._condition) {
            args = ctx._condition!!.text
        }

        let type = ctx._step.text === "@stepInto" ? AnnotationType.STEPINTO : AnnotationType.STEPOVER

        this.annotations.push({
            startLine: ctx.start.line,
            endLine: ctx.stop?.line!!,
            type: type,
            arguments: args
        })
    }

    visitSubtitleAnnotation(ctx: SubtitleAnnotationContext) {
        let args = ctx._show.text === "@subtitleOnce" ? "show once, " : "";

        if (ctx.arg_list()) {
            args += ctx.arg_list()!!.text
        }

        if (ctx._subtitle_text && ctx._subtitle_text.text !== "<missing STRING>") {
            let text = ctx._subtitle_text.text!!.length > 30
                ? ctx._subtitle_text.text!!.substring(0, 30) + "...\""
                : ctx._subtitle_text.text
            args += " " + text;
        }

        this.annotations.push({
            startLine: ctx.start.line,
            endLine: ctx.stop?.line!!,
            type: AnnotationType.SUBTITLE,
            arguments: args
        })
    }

    getAnnotations() {
        return this.annotations
    }

}
