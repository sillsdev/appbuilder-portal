import { ESLintUtils } from '@typescript-eslint/utils';
// Walk the AST to find a node that matches the callback, up to maxDepth levels deep
// This is a depth-first search and could be improved
function walkFind(node, callback, maxDepth = 10) {
    if (maxDepth <= 0)
        return null;
    if (callback(node))
        return node;
    for (const key in node) {
        if (key === 'parent')
            continue;
        const val = node[key];
        if (Array.isArray(val)) {
            for (const child of val) {
                const result = walkFind(child, callback, maxDepth - 1);
                if (result)
                    return result;
            }
        }
        else {
            const result = walkFind(val, callback, maxDepth - 1);
            if (result)
                return result;
        }
    }
}
function blockStatementIncludesSecurityCall(block) {
    const nodeIsSecurityCall = (node) => {
        // Valid check if the node is a CallExpression of the form:
        // *.locals.security.require*()
        // or locals.security.require*()
        if (node?.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
            const obj = node.callee.object;
            const prop = node.callee.property;
            if (obj.type === 'MemberExpression' &&
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
            missingSecurityCheck: 'Missing call to requireAuthenticated() or similar security check. This must be of the form locals.security.require*()',
            unexpectedFunction: 'Unexpected export function type {{type}}. Expected ArrowFunctionExpression, FunctionExpression, TSSatisfiesExpression or ObjectExpression.',
            suggestAuthCall: 'Require authentication by adding "event.locals.security.requireAuthenticated();" to the start of the function body.',
            suggestNoAuthCall: 'Mark this function as not requiring any auth by adding "event.locals.security.requireNothing();" to the start of the function body.'
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
                // Only check .server.ts and +server.ts files
                if (!context.filename.endsWith('.server.ts') && !context.filename.endsWith('+server.ts'))
                    return;
                // Find the function we are interested in
                let functionExport;
                // load or actions in .server.ts files
                if (context.filename.endsWith('.server.ts') && node.declaration) {
                    if (node.declaration.type === 'FunctionDeclaration') {
                        if (node.declaration.id?.name === 'load') {
                            functionExport = node.declaration;
                        }
                    }
                    else {
                        functionExport = node.declaration.declarations?.find((decl) => {
                            return (decl.id.type === 'Identifier' &&
                                (decl.id.name === 'load' || decl.id.name === 'actions'));
                        });
                    }
                    // endpoint functions in +server.ts files
                }
                else if (context.filename.endsWith('+server.ts') && node.declaration) {
                    if (node.declaration.type === 'FunctionDeclaration') {
                        // export function POST/GET/PUT/etc. ...
                        if (node.declaration.id &&
                            ['POST', 'GET', 'PUT', 'DELETE', 'PATCH'].includes(node.declaration.id.name)) {
                            functionExport = node.declaration;
                        }
                    }
                    else {
                        functionExport = node.declaration.declarations?.find((decl) => {
                            return (decl.id.type === 'Identifier' &&
                                ['POST', 'GET', 'PUT', 'DELETE', 'PATCH'].includes(decl.id.name));
                        });
                    }
                }
                // This export is not a load, actions, or endpoint function
                if (!functionExport)
                    return;
                const blockStatements = [];
                if (functionExport.id.name === 'actions') {
                    // This is the actions object, so find all the functions in its properties
                    const objectExpression = functionExport.type === 'VariableDeclarator'
                        ? walkFind(functionExport.init, (n) => n.type === 'ObjectExpression', 4)
                        : null;
                    if (functionExport.type !== 'VariableDeclarator' || !objectExpression) {
                        context.report({
                            node: node.declaration,
                            data: { type: functionExport.type },
                            messageId: 'unexpectedFunction'
                        });
                        return;
                    }
                    const properties = objectExpression.properties.filter((p) => p.type === 'Property');
                    for (const prop of properties) {
                        if (prop.value.type === 'ArrowFunctionExpression' ||
                            prop.value.type === 'FunctionExpression') {
                            // There should be a block statement (function body) within a couple levels
                            const block = walkFind(prop.value, (n) => n.type === 'BlockStatement', 4);
                            if (block)
                                blockStatements.push(block);
                        }
                        else {
                            context.report({
                                node: prop,
                                data: { type: prop.value.type },
                                messageId: 'unexpectedFunction'
                            });
                        }
                    }
                }
                else if ((!functionExport?.init ||
                    !['ArrowFunctionExpression', 'FunctionExpression', 'TSSatisfiesExpression'].includes(functionExport.init.type)) &&
                    node.declaration.type !== 'FunctionDeclaration') {
                    // Unexpected type of export
                    context.report({
                        node: node.declaration,
                        data: { type: functionExport.init?.type },
                        messageId: 'unexpectedFunction'
                    });
                    return;
                }
                else {
                    // This is a single function (load or endpoint), so find its body
                    // There should be a block statement (function body) within a couple levels
                    blockStatements.push(walkFind(functionExport.init ||
                        functionExport, (n) => n.type === 'BlockStatement', 4));
                }
                blockStatements.forEach((bs) => {
                    if (!blockStatementIncludesSecurityCall(bs)) {
                        // No security check found in this function's block statement
                        // Flag an error on the parent node of the block statement (the whole function)
                        context.report({
                            node: bs.parent,
                            messageId: 'missingSecurityCheck',
                            suggest: [
                                {
                                    messageId: 'suggestAuthCall',
                                    fix: (fixer) => fixer.insertTextBefore(bs.body[0] || bs, 'event.locals.security.requireAuthenticated();\n' +
                                        (functionExport.id.name === 'actions'
                                            ? '    '
                                            : '  '))
                                },
                                {
                                    messageId: 'suggestNoAuthCall',
                                    fix: (fixer) => fixer.insertTextBefore(bs.body[0] || bs, 'event.locals.security.requireNothing();\n' +
                                        (functionExport.id.name === 'actions'
                                            ? '    '
                                            : '  '))
                                }
                            ]
                        });
                    }
                });
            }
        };
    }
});
