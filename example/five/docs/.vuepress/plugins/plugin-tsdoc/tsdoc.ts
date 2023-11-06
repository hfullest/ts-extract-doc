import { TSDocParser, ParserContext } from "@microsoft/tsdoc";
import path, { resolve } from "path";
import ts from "typescript";
import tsdoc from "@microsoft/tsdoc";
import colors from "colors";
import * as os from "os";

import {
  Extractor,
  ExtractorConfig,
  ExtractorResult,
} from "@microsoft/api-extractor";

import * as reactDocgen from "react-docgen";
import { ASTNode } from "ast-types";
import { NodePath } from "ast-types/lib/node-path";
import { createDisplayNameHandler } from "react-docgen-displayname-handler";
import annotationResolver from "./react-docgen-annotation-resolver";
import { readFileSync, writeFileSync } from "fs";

import { parse } from "react-docgen-typescript";
import {
  markdownRender,
  componentDocsMdastBuilder,
  renderers,
} from "react-docgen-typescript-markdown-render";
import { u } from "unist-builder";

import { toMarkdown } from "mdast-util-to-markdown";

export function parseTs() {
  function isDeclarationKind(kind: ts.SyntaxKind): boolean {
    return (
      kind === ts.SyntaxKind.ArrowFunction ||
      kind === ts.SyntaxKind.BindingElement ||
      kind === ts.SyntaxKind.ClassDeclaration ||
      kind === ts.SyntaxKind.ClassExpression ||
      kind === ts.SyntaxKind.Constructor ||
      kind === ts.SyntaxKind.EnumDeclaration ||
      kind === ts.SyntaxKind.EnumMember ||
      kind === ts.SyntaxKind.ExportSpecifier ||
      kind === ts.SyntaxKind.FunctionDeclaration ||
      kind === ts.SyntaxKind.FunctionExpression ||
      kind === ts.SyntaxKind.GetAccessor ||
      kind === ts.SyntaxKind.ImportClause ||
      kind === ts.SyntaxKind.ImportEqualsDeclaration ||
      kind === ts.SyntaxKind.ImportSpecifier ||
      kind === ts.SyntaxKind.InterfaceDeclaration ||
      kind === ts.SyntaxKind.JsxAttribute ||
      kind === ts.SyntaxKind.MethodDeclaration ||
      kind === ts.SyntaxKind.MethodSignature ||
      kind === ts.SyntaxKind.ModuleDeclaration ||
      kind === ts.SyntaxKind.NamespaceExportDeclaration ||
      kind === ts.SyntaxKind.NamespaceImport ||
      kind === ts.SyntaxKind.Parameter ||
      kind === ts.SyntaxKind.PropertyAssignment ||
      kind === ts.SyntaxKind.PropertyDeclaration ||
      kind === ts.SyntaxKind.PropertySignature ||
      kind === ts.SyntaxKind.SetAccessor ||
      kind === ts.SyntaxKind.ShorthandPropertyAssignment ||
      kind === ts.SyntaxKind.TypeAliasDeclaration ||
      kind === ts.SyntaxKind.TypeParameter ||
      kind === ts.SyntaxKind.VariableDeclaration ||
      kind === ts.SyntaxKind.JSDocTypedefTag ||
      kind === ts.SyntaxKind.JSDocCallbackTag ||
      kind === ts.SyntaxKind.JSDocPropertyTag
    );
  }

  interface IFoundComment {
    compilerNode: ts.Node;
    textRange: tsdoc.TextRange;
  }

  function getJSDocCommentRanges(
    node: ts.Node,
    text: string
  ): ts.CommentRange[] {
    const commentRanges: ts.CommentRange[] = [];

    switch (node.kind) {
      case ts.SyntaxKind.Parameter:
      case ts.SyntaxKind.TypeParameter:
      case ts.SyntaxKind.FunctionExpression:
      case ts.SyntaxKind.ArrowFunction:
      case ts.SyntaxKind.ParenthesizedExpression:
        commentRanges.push(
          ...(ts.getTrailingCommentRanges(text, node.pos) || [])
        );
        break;
    }
    commentRanges.push(...(ts.getLeadingCommentRanges(text, node.pos) || []));

    // True if the comment starts with '/**' but not if it is '/**/'
    return commentRanges.filter(
      (comment) =>
        text.charCodeAt(comment.pos + 1) ===
          0x2a /* ts.CharacterCodes.asterisk */ &&
        text.charCodeAt(comment.pos + 2) ===
          0x2a /* ts.CharacterCodes.asterisk */ &&
        text.charCodeAt(comment.pos + 3) !== 0x2f /* ts.CharacterCodes.slash */
    );
  }

  function walkCompilerAstAndFindComments(
    node: ts.Node,
    indent: string,
    foundComments: IFoundComment[]
  ): void {
    // The TypeScript AST doesn't store code comments directly.  If you want to find *every* comment,
    // you would need to rescan the SourceFile tokens similar to how tsutils.forEachComment() works:
    // https://github.com/ajafff/tsutils/blob/v3.0.0/util/util.ts#L453
    //
    // However, for this demo we are modeling a tool that discovers declarations and then analyzes their doc comments,
    // so we only care about TSDoc that would conventionally be associated with an interesting AST node.

    let foundCommentsSuffix: string = "";
    const buffer: string = node.getSourceFile().getFullText(); // don't use getText() here!

    // Only consider nodes that are part of a declaration form.  Without this, we could discover
    // the same comment twice (e.g. for a MethodDeclaration and its PublicKeyword).
    if (isDeclarationKind(node.kind)) {
      // Find "/** */" style comments associated with this node.
      // Note that this reinvokes the compiler's scanner -- the result is not cached.
      const comments: ts.CommentRange[] = getJSDocCommentRanges(node, buffer);

      if (comments.length > 0) {
        if (comments.length === 1) {
          foundCommentsSuffix = colors.cyan(`  (FOUND 1 COMMENT)`);
        } else {
          foundCommentsSuffix = colors.cyan(
            `  (FOUND ${comments.length} COMMENTS)`
          );
        }

        for (const comment of comments) {
          foundComments.push({
            compilerNode: node,
            textRange: tsdoc.TextRange.fromStringRange(
              buffer,
              comment.pos,
              comment.end
            ),
          });
        }
      }
    }

    console.log(`${indent}- ${ts.SyntaxKind[node.kind]}${foundCommentsSuffix}`);

    return node.forEachChild((child) =>
      walkCompilerAstAndFindComments(child, indent + "  ", foundComments)
    );
  }

  function parseTSDoc(foundComment: IFoundComment): void {
    console.log(os.EOL + colors.green("Comment to be parsed:") + os.EOL);
    console.log(colors.gray("<<<<<<"));
    console.log(foundComment.textRange.toString());
    console.log(colors.gray(">>>>>>"));

    const customConfiguration: tsdoc.TSDocConfiguration =
      new tsdoc.TSDocConfiguration();

    const customInlineDefinition: tsdoc.TSDocTagDefinition =
      new tsdoc.TSDocTagDefinition({
        tagName: "@customInline",
        syntaxKind: tsdoc.TSDocTagSyntaxKind.InlineTag,
        allowMultiple: true,
      });

    // NOTE: Defining this causes a new DocBlock to be created under docComment.customBlocks.
    // Otherwise, a simple DocBlockTag would appear inline in the @remarks section.
    const customBlockDefinition: tsdoc.TSDocTagDefinition =
      new tsdoc.TSDocTagDefinition({
        tagName: "@customBlock",
        syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag,
      });

    // NOTE: Defining this causes @customModifier to be removed from its section,
    // and added to the docComment.modifierTagSet
    const customModifierDefinition: tsdoc.TSDocTagDefinition =
      new tsdoc.TSDocTagDefinition({
        tagName: "@customModifier",
        syntaxKind: tsdoc.TSDocTagSyntaxKind.ModifierTag,
      });

    customConfiguration.addTagDefinitions([
      customInlineDefinition,
      customBlockDefinition,
      customModifierDefinition,
    ]);

    console.log(
      os.EOL + "Invoking TSDocParser with custom configuration..." + os.EOL
    );
    const tsdocParser: tsdoc.TSDocParser = new tsdoc.TSDocParser(
      customConfiguration
    );
    const parserContext: tsdoc.ParserContext = tsdocParser.parseRange(
      foundComment.textRange
    );
    const docComment: tsdoc.DocComment = parserContext.docComment;

    console.log(os.EOL + colors.green("Parser Log Messages:") + os.EOL);

    if (parserContext.log.messages.length === 0) {
      console.log("No errors or warnings.");
    } else {
      const sourceFile: ts.SourceFile =
        foundComment.compilerNode.getSourceFile();
      for (const message of parserContext.log.messages) {
        // Since we have the compiler's analysis, use it to calculate the line/column information,
        // since this is currently faster than TSDoc's TextRange.getLocation() lookup.
        const location: ts.LineAndCharacter =
          sourceFile.getLineAndCharacterOfPosition(message.textRange.pos);
        const formattedMessage: string = `${sourceFile.fileName}(${
          location.line + 1
        },${location.character + 1}): [TSDoc] ${message}`;
        console.log(formattedMessage);
      }
    }

    if (
      parserContext.docComment.modifierTagSet.hasTag(customModifierDefinition)
    ) {
      console.log(
        os.EOL +
          colors.cyan(
            `The ${customModifierDefinition.tagName} modifier was FOUND.`
          )
      );
    } else {
      console.log(
        os.EOL +
          colors.cyan(
            `The ${customModifierDefinition.tagName} modifier was NOT FOUND.`
          )
      );
    }

    console.log(
      os.EOL + colors.green("Visiting TSDoc's DocNode tree") + os.EOL
    );
    dumpTSDocTree(docComment, "");
  }

  function dumpTSDocTree(docNode: tsdoc.DocNode, indent: string): void {
    let dumpText: string = "";
    if (docNode instanceof tsdoc.DocExcerpt) {
      const content: string = docNode.content.toString();
      dumpText +=
        colors.gray(`${indent}* ${docNode.excerptKind}=`) +
        colors.cyan(JSON.stringify(content));
    } else {
      dumpText += `${indent}- ${docNode.kind}`;
    }
    console.log(dumpText);

    for (const child of docNode.getChildNodes()) {
      dumpTSDocTree(child, indent + "  ");
    }
  }

  const inputFilename: string = path.resolve(
    path.join(__dirname, "advanced-input.ts")
  );
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES5,
  };
  const program: ts.Program = ts.createProgram(
    [inputFilename],
    compilerOptions
  );
  // Report any compiler errors
  const compilerDiagnostics: ReadonlyArray<ts.Diagnostic> =
    program.getSemanticDiagnostics();
  if (compilerDiagnostics.length > 0) {
    for (const diagnostic of compilerDiagnostics) {
      const message: string = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        os.EOL
      );
      if (diagnostic.file) {
        const location: ts.LineAndCharacter =
          diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        const formattedMessage: string =
          `${diagnostic.file.fileName}(${location.line + 1},${
            location.character + 1
          }):` + ` [TypeScript] ${message}`;
        console.log(formattedMessage);
      } else {
        console.log(message);
      }
    }
  } else {
    console.log("No compiler errors or warnings.");
  }

  const sourceFile: ts.SourceFile | undefined =
    program.getSourceFile(inputFilename);
  if (!sourceFile) {
    throw new Error("Error retrieving source file");
  }

  const foundComments: IFoundComment[] = [];

  walkCompilerAstAndFindComments(sourceFile, "", foundComments);

  if (foundComments.length === 0) {
    console.log(
      colors.red("Error: No code comments were found in the input file")
    );
  } else {
    // For the purposes of this demo, only analyze the first comment that we found
    parseTSDoc(foundComments[0]);
  }
}

function isApiInternal(docComment: string): boolean {
  const tsdocParser: TSDocParser = new TSDocParser();

  // Analyze the input doc comment
  const parserContext: ParserContext = tsdocParser.parseString(docComment);

  // Check for any syntax errors
  if (parserContext.log.messages.length > 0) {
    throw new Error("Syntax error: " + parserContext.log.messages[0].text);
  }

  // Since "@internal" is a standardized tag and a "modifier", it is automatically
  // added to the modifierTagSet:
  return parserContext.docComment.modifierTagSet.isInternal();
}

export function testTsDoc() {
  const input: string = [
    "/**",
    " * @Returns `true` if a comment string contains the",
    " * {@link http://tsdoc.org/pages/tags/internal | @internal tag}.",
    " *",
    " * @example",
    " * ```ts",
    ' * // Prints "true" if comment contains "@internal"',
    " * console.log(isApiInternal(input));",
    " * ```",
    " */",
  ].join("\n");

  // Prints "false" because the two "@internal" usages in our example are embedded
  // in other constructs, and thus should not be interpreted as tags.
  console.log(isApiInternal(input));

  process.exit();
}

export function apiExtrator() {
  // Load and parse the api-extractor.json file
  // const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare();

  // Invoke API Extractor
  const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
    // Equivalent to the "--local" command-line parameter
    localBuild: true,

    // Equivalent to the "--verbose" command-line parameter
    showVerboseMessages: true,
  });

  if (extractorResult.succeeded) {
    console.log(`API Extractor completed successfully`);
    process.exitCode = 0;
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
    );
    process.exitCode = 1;
  }
}

export function reactDoc() {
  //   const code = `
  // /** My first component */
  // export default ({ name }: { name: string }) => <div>{{name}}</div>;
  // `;
  const code = readFileSync(resolve(__dirname, "./example/test.tsx"), "utf-8");

  const documentation = reactDocgen.parse(code, ((
    ast: ASTNode,
    recast: {
      visit: (
        node: NodePath,
        handlers: { [handlerName: string]: () => boolean | undefined }
      ) => void;
    }
  ) => {
    const findAllExportedComponentDefinitions = (reactDocgen as any).resolver
      .findAllExportedComponentDefinitions;
    const annotatedComponents = annotationResolver(ast);
    const exportedComponents = findAllExportedComponentDefinitions(ast, recast);
    return annotatedComponents.concat(exportedComponents);
  }) as any);

  console.log(JSON.stringify(documentation));
}

export function reactDocTs() {
  const code = readFileSync(resolve(__dirname, "./example/test.tsx"), "utf-8");
  const componentDocs = parse(resolve(__dirname, "../../../../src/components/UiButton/index.tsx"), {
    savePropValueAsString: true,
  });

  const mdDoc = markdownRender(componentDocs, {
    renderer: renderers.aliMaterialRenderer,
    language: "zh_CN",
  });

  console.log(JSON.stringify(componentDocs));
  writeFileSync(
    resolve(__dirname, "./output2.json"),
    JSON.stringify(componentDocs, null, 2),
    {
      encoding: "utf-8",
      flag: "w",
    }
  );
  writeFileSync(resolve(__dirname, "./output.md"), mdDoc, {
    encoding: "utf-8",
    flag: "w",
  });
}
