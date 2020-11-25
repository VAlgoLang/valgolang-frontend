parser grammar ManimParser;

options {
  tokenVocab=ManimLexer;
}

program: function* stat EOF;

function: FUN IDENT OPEN_PARENTHESIS param_list? CLOSE_PARENTHESIS (COLON type)? OPEN_CURLY_BRACKET statements=stat? CLOSE_CURLY_BRACKET;

param_list: param (COMMA param)*                                    #ParameterList;

param: IDENT COLON type                                                  #Parameter;

stat: SLEEP OPEN_PARENTHESIS expr CLOSE_PARENTHESIS SEMI                 #SleepStatement
    | COMMENT OPEN_PARENTHESIS STRING CLOSE_PARENTHESIS SEMI             #CommentStatement // when string type defined we can adjust
    | LET IDENT (COLON type)? EQUAL expr SEMI                            #DeclarationStatement
    | assignment_lhs EQUAL expr SEMI                                     #AssignmentStatement
    | IF OPEN_PARENTHESIS ifCond=expr CLOSE_PARENTHESIS
    OPEN_CURLY_BRACKET ifStat=stat? CLOSE_CURLY_BRACKET
     elseIf*
    (ELSE OPEN_CURLY_BRACKET elseStat=stat? CLOSE_CURLY_BRACKET)?        #IfStatement
    | WHILE OPEN_PARENTHESIS whileCond=expr CLOSE_PARENTHESIS
      OPEN_CURLY_BRACKET whileStat=stat? CLOSE_CURLY_BRACKET             #WhileStatement
    | FOR forHeader OPEN_CURLY_BRACKET forStat=stat? CLOSE_CURLY_BRACKET               #ForStatement
    | loop_stat                                                          #LoopStatement
    | stat1=stat stat2=stat                                              #ConsecutiveStatement
    | method_call SEMI                                                   #MethodCallStatement
    | RETURN expr? SEMI                                                  #ReturnStatement
    | annotation                                                         #AnnotationStatement
    ;

annotation: step=(STEP_INTO | STEP_OVER) (OPEN_PARENTHESIS
    condition=expr CLOSE_PARENTHESIS)? OPEN_CURLY_BRACKET
    stat CLOSE_CURLY_BRACKET                                            #CodeTrackingAnnotation
    | SPEED (OPEN_PARENTHESIS arg_list CLOSE_PARENTHESIS)?
    OPEN_CURLY_BRACKET stat CLOSE_CURLY_BRACKET                         #AnimationSpeedUpAnnotation
    | show=(SUBTITLE | SUBTITLE_ONCE) OPEN_PARENTHESIS
    subtitle_text=STRING (COMMA arg_list)? CLOSE_PARENTHESIS                              #SubtitleAnnotation
    ;

forHeader: IDENT IN RANGE OPEN_PARENTHESIS (begin=expr COMMA)? end=expr (COMMA delta=expr)? CLOSE_PARENTHESIS     #RangeHeader;

loop_stat: BREAK SEMI         #BreakStatement
         | CONTINUE SEMI      #ContinueStatement;


assignment_lhs: IDENT           #IdentifierAssignment
    | array_elem                #ArrayElemAssignment
    | node_elem                 #NodeElemAssignment;

elseIf: ELSE IF OPEN_PARENTHESIS elifCond=expr CLOSE_PARENTHESIS OPEN_CURLY_BRACKET elifStat=stat? CLOSE_CURLY_BRACKET;

arg_list: expr (COMMA expr)*                                        #ArgumentList;

expr: NUMBER                                                        #NumberLiteral
    | NULL                                                          #NullLiteral
    | bool                                                          #BooleanLiteral
    | CHAR_LITER                                                    #CharacterLiteral
    | IDENT                                                         #Identifier
    | array_elem                                                    #ArrayElemExpr
    | node_elem                                                     #NodeElemExpr
    | data_structure_type
    OPEN_PARENTHESIS arg_list? CLOSE_PARENTHESIS
    data_structure_initialiser?                                     #DataStructureConstructor
    | method_call                                                   #MethodCallExpression
    | unary_operator=(ADD | MINUS | NOT) expr                       #UnaryOperator
    | left=expr binary_operator=(ADD | MINUS | TIMES | DIVIDE) right=expr    #BinaryExpression
    | left=expr binary_operator=(GT | GE | LE | LT) right=expr      #BinaryExpression
    | left=expr binary_operator=(EQ | NEQ) right=expr               #BinaryExpression
    | left=expr binary_operator=(AND | OR) right=expr               #BinaryExpression
    | cast_method OPEN_PARENTHESIS expr CLOSE_PARENTHESIS          #CastExpression
    ;


cast_method: TO_NUMBER       #ToNumber
    | TO_CHAR                #ToCharacter
    ;

method_call: IDENT (OPEN_SQUARE_BRACKET expr CLOSE_SQUARE_BRACKET)? DOT IDENT OPEN_PARENTHESIS arg_list? CLOSE_PARENTHESIS #MethodCall
            | IDENT OPEN_PARENTHESIS arg_list? CLOSE_PARENTHESIS                                                           #FunctionCall;

type: data_structure_type                                            #DataStructureType
    | primitive_type                                                 #PrimitiveType;

node_type: TREE_NODE LT primitive_type GT;
data_structure_type: STACK LT primitive_type GT                      #StackType
    | (ARRAY LT)+ type GT+                                 #ArrayType
    | node_type                                                      #NodeType
    | TREE LT node_type GT                                           #TreeType
    ;


primitive_type: NUMBER_TYPE                                          #NumberType
    | BOOL_TYPE                                                      #BoolType
    | CHAR_TYPE                                                      #CharType
    ;

bool: TRUE | FALSE;

data_structure_initialiser: OPEN_CURLY_BRACKET (arg_list | initialiser_list) CLOSE_CURLY_BRACKET;
initialiser_list: OPEN_SQUARE_BRACKET arg_list CLOSE_SQUARE_BRACKET (COMMA OPEN_SQUARE_BRACKET arg_list CLOSE_SQUARE_BRACKET)*;

array_elem: IDENT (OPEN_SQUARE_BRACKET expr CLOSE_SQUARE_BRACKET)+;
node_elem: IDENT node_elem_access*;
node_elem_access: (DOT IDENT);
