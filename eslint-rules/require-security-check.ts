/**
 * ESLint rule to require a security check in every server load/action or
 * endpoint function. This is a sanity check to avoid forgetting to add a
 * security check on endpoints that return data or perform actions. It
 * looks for calls to locals.security.require*() in the function body of
 * exported load and actions in +page.server.ts/+layout.server.ts files,
 * or POST/GET/PUT/etc. functions in +server.ts files.
 *
 * IT IS NOT FOOLPROOF.
 * IT IS POSSIBLE TO BYPASS THIS CHECK (but hopefully not accidentally).
 *
 * After updating this file, run `tsc` from the `eslint-rules` directory to
 * compile it to JavaScript (which is checked in).
 */
import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

// Walk the AST to find a node that matches the callback, up to maxDepth levels deep
// This is a depth-first search and could be improved
function walkFind(
  node: TSESTree.Node | undefined | null,
  callback: (node: TSESTree.Node) => boolean,
  maxDepth = 10
): TSESTree.Node | null {
  if (maxDepth <= 0) return null;
  if (node && typeof node !== 'object') return null;
  if (callback(node)) return node;
  for (const key in node) {
    if (key === 'parent') continue;
    const val = node[key];
    if (Array.isArray(val)) {
      for (const child of val) {
        const result = walkFind(child, callback, maxDepth - 1);
        if (result) return result;
      }
    } else {
      const result = walkFind(val, callback, maxDepth - 1);
      if (result) return result;
    }
  }
  return null;
}

function blockStatementIncludesSecurityCall(block: TSESTree.BlockStatement): boolean {
  const nodeIsSecurityCall = (node: TSESTree.Node) => {
    // Valid check if the node is a CallExpression of the form:
    // *.locals.security.require*()
    // or locals.security.require*()
    if (node?.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
      const obj = node.callee.object;
      const prop = node.callee.property;
      if (
        obj.type === 'MemberExpression' &&
        // object is either *.locals or just locals
        ((obj.object.type === 'MemberExpression' &&
          obj.object.property.type === 'Identifier' &&
          obj.object.property.name === 'locals') ||
          (obj.object.type === 'Identifier' && obj.object.name === 'locals')) &&
        // locals.security
        obj.property.type === 'Identifier' &&
        obj.property.name === 'security' &&
        prop.type === 'Identifier' &&
        prop.name.startsWith('require') // ex. requireAuthenticated, requireRole, etc.
      ) {
        return true;
      }
    }
    return false;
  };

  return !!block.body.find((n) => !!walkFind(n, nodeIsSecurityCall, 6));
}

export default ESLintUtils.RuleCreator(() => '')({
  name: 'require-security-check',
  meta: {
    type: 'problem',
    hasSuggestions: true,
    docs: {
      description: 'Require calling event.locals.security.* in every server load/action'
    },
    schema: [],
    messages: {
      missingSecurityCheck:
        'Missing call to requireAuthenticated() or similar security check. This must be of the form locals.security.require*()',
      unexpectedFunction:
        'Unexpected export function type {{type}}. Expected ArrowFunctionExpression, FunctionExpression, TSSatisfiesExpression or ObjectExpression.',
      suggestAuthCall:
        'Require authentication by adding "event.locals.security.requireAuthenticated();" to the start of the function body.',
      suggestNoAuthCall:
        'Mark this function as not requiring any auth by adding "event.locals.security.requireNothing();" to the start of the function body.'
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        // Application of this rule is limited to:
        // export const load = async (event) => { ... }
        // export const actions = { default: async (event) => { ... } }
        // export function load(event) { ... }
        // export POST/GET/PUT/etc. function for endpoints in +server.ts files
        // export const anything = query/command/form(async (event) => { ... }) in *.remote.ts files

        // There are two steps:
        // 1. Identify the relevant exported functions and collect an array of their block statements
        // 2. For each block statement, check if it includes a call to locals.security.require*()

        // Only check .server.ts and +server.ts files, and *.remote.ts files
        if (!/[+.](server|remote).ts$/.test(context.filename)) return;

        const blockStatements: TSESTree.BlockStatement[] = [];

        function collectBlockStatementsFromExpression(node: TSESTree.Expression) {
          if (['ArrowFunctionExpression', 'FunctionExpression'].includes(node.type)) {
            if (
              (node as TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression).body.type ===
              'BlockStatement'
            ) {
              blockStatements.push((node as TSESTree.FunctionExpression).body);
            } else {
              context.report({
                node,
                messageId: 'unexpectedFunction',
                data: { type: node.type }
              });
            }
          } else if (node.type === 'TSSatisfiesExpression') {
            collectBlockStatementsFromExpression(node.expression);
          } else {
            context.report({
              node,
              messageId: 'unexpectedFunction',
              data: { type: node.type }
            });
          }
        }

        // Step 1: three types of files to check: *.server.ts, +server.ts, and *.remote.ts
        if (context.filename.endsWith('.server.ts') && node.declaration) {
          // load or actions in .server.ts files
          if (node.declaration.type === 'FunctionDeclaration') {
            if (node.declaration.id?.name === 'load') {
              blockStatements.push(node.declaration.body);
            }
          } else if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations?.forEach((decl) => {
              if (decl.id.type === 'Identifier' && decl.id.name === 'load') {
                collectBlockStatementsFromExpression(decl.init);
              } else if (decl.id.type === 'Identifier' && decl.id.name === 'actions') {
                const objectExpression: TSESTree.ObjectExpression = walkFind(
                  decl.init,
                  (n) => n.type === 'ObjectExpression',
                  4
                ) as TSESTree.ObjectExpression | null;
                if (decl.type === 'VariableDeclarator' && objectExpression) {
                  for (const prop of objectExpression.properties.filter(
                    (p): p is TSESTree.Property => p.type === 'Property'
                  )) {
                    collectBlockStatementsFromExpression(prop.value as TSESTree.Expression);
                  }
                } else {
                  context.report({
                    node: decl,
                    messageId: 'unexpectedFunction',
                    data: { type: decl.type }
                  });
                }
              }
            });
          } else {
            context.report({
              node: node.declaration,
              messageId: 'unexpectedFunction',
              data: { type: node.declaration.type }
            });
          }
        } else if (context.filename.endsWith('+server.ts') && node.declaration) {
          const httpMethods = ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'HEAD'];
          // endpoint functions in +server.ts files
          if (node.declaration.type === 'FunctionDeclaration') {
            // export function POST/GET/PUT/etc. ...
            if (httpMethods.includes(node.declaration.id.name)) {
              blockStatements.push(node.declaration.body);
            }
          } else if (node.declaration.type === 'VariableDeclaration') {
            // export const POST/GET/PUT/etc. = ...
            node.declaration.declarations?.forEach((decl) => {
              if (decl.id.type === 'Identifier' && httpMethods.includes(decl.id.name)) {
                collectBlockStatementsFromExpression(decl.init);
              }
            });
          } else {
            context.report({
              node: node.declaration,
              messageId: 'unexpectedFunction',
              data: { type: node.declaration.type }
            });
          }
        } else if (context.filename.endsWith('.remote.ts') && node.declaration) {
          // remote functions in *.remote.ts files
          if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations.forEach((decl) => {
              const callExpr = decl.init;
              if (
                callExpr.type === 'CallExpression' &&
                callExpr.callee.type === 'Identifier' &&
                ['query', 'command', 'form'].includes(callExpr.callee.name) &&
                ['ArrowFunctionExpression', 'FunctionExpression'].includes(
                  callExpr.arguments[callExpr.arguments.length - 1].type
                )
              ) {
                const callExprAsFunc = callExpr.arguments[callExpr.arguments.length - 1] as
                  | TSESTree.ArrowFunctionExpression
                  | TSESTree.FunctionExpression;
                if (callExprAsFunc.body.type === 'BlockStatement') {
                  blockStatements.push(callExprAsFunc.body);
                } else {
                  context.report({
                    node: callExprAsFunc,
                    messageId: 'unexpectedFunction',
                    data: {
                      type: callExprAsFunc.type
                    }
                  });
                }
              }
            });
          } else {
            context.report({
              node: node.declaration,
              messageId: 'unexpectedFunction',
              data: { type: node.declaration.type }
            });
          }
        }

        // Step 2: Check each collected block statement for a security check
        blockStatements.forEach((bs) => {
          if (!blockStatementIncludesSecurityCall(bs)) {
            // No security check found in this function's block statement
            // Flag an error on the parent node of the block statement (the whole function)
            const indentLevel = bs.body[0]?.loc.start.column || 2;
            const spaceStr = ' '.repeat(indentLevel);
            context.report({
              node: bs.parent,
              messageId: 'missingSecurityCheck',
              suggest: [
                {
                  messageId: 'suggestAuthCall',
                  fix: (fixer) =>
                    fixer.insertTextBefore(
                      bs.body[0] || bs,
                      'event.locals.security.requireAuthenticated();\n' + spaceStr
                    )
                },
                {
                  messageId: 'suggestNoAuthCall',
                  fix: (fixer) =>
                    fixer.insertTextBefore(
                      bs.body[0] || bs,
                      'event.locals.security.requireNothing();\n' + spaceStr
                    )
                }
              ]
            });
          }
        });
      }
    };
  }
});
