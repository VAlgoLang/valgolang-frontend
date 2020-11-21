npm run antlr4ts

echo '/* eslint-disable */' | cat - src/antlr/ManimLexer.ts > temp && mv temp src/antlr/ManimLexer.ts
echo '// @ts-nocheck' | cat - src/antlr/ManimLexer.ts > temp && mv temp src/antlr/ManimLexer.ts
echo '/* eslint-disable */' | cat - src/antlr/ManimParser.ts > temp && mv temp src/antlr/ManimParser.ts
echo '// @ts-nocheck' | cat - src/antlr/ManimParser.ts > temp && mv temp src/antlr/ManimParser.ts

