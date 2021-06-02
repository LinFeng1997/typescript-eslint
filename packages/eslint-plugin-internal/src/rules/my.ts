import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { SyntaxKind } from 'typescript';
import { createRule } from '../util';

/*
We have `allowSyntheticDefaultImports` turned on in this project, so there are two problems that arise:
- TypeScript's auto import will suggest `import ts = require('typescript');` if you type `ts`
- VSCode's suggestion feature will suggest changing `import * as ts from 'typescript'` to `import ts from 'typescript'`

In order to keep compatibility with a wide range of consumers, some of whom don't use `allowSyntheticDefaultImports`, we should
always use either:
- `import * as ts from 'typescript';`
- `import { SyntaxKind } from 'typescript';`
*/

export default createRule({
  name: 'my',
  meta: {
    type: 'problem',
    docs: {
      description: '',
      category: 'Possible Errors',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noTSDefaultImport: ['Do not use', 'This causes errors'].join('\n'),
    },
  },
  defaultOptions: [],
  create(context) {
    const { program, esTreeNodeToTSNodeMap } =
      ESLintUtils.getParserServices(context);
    const checker = program.getTypeChecker();

    return {
      [AST_NODE_TYPES.CallExpression](node: TSESTree.CallExpression): void {
        debugger;
        const tsObjectNode = esTreeNodeToTSNodeMap.get(node.callee);
        const objectType = checker.getTypeAtLocation(tsObjectNode);
        const objectSymbol = objectType.getSymbol();
        console.log('tsObjectNode', tsObjectNode);
        console.log('objectType', objectType);
        console.log('objectSymbol', objectSymbol);

        if (tsObjectNode.kind === SyntaxKind.ImportKeyword) {
          console.info('dynamic import', node);
        }
      },
      'ImportDeclaration > ImportDefaultSpecifier'(
        node: TSESTree.ImportDefaultSpecifier,
      ): void {
        const importStatement = node.parent as TSESTree.ImportDeclaration;
        if (importStatement.source.value === 'typescript') {
          context.report({
            node,
            messageId: 'noTSDefaultImport',
            fix(fixer) {
              if (importStatement.specifiers.length === 1) {
                return fixer.replaceText(node, '* as ts');
              }

              return null;
            },
          });
        }
      },
    };
  },
});
