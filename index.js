/**
 * CURRENTLY ONLY SUPPORTS ES5 SYNTAX, RUN ES6 TRANSPILER FIRST!
 *
 * Super useful:
 *  http://astexplorer.net/
 */
"use strict";

/**
 * List of functions we should intercept
 * @type {string[]}
 */
const injectables = ["controller", "directive"],
    /**
     * Returns the callee function name
     * @param node
     * @returns {String}
     */
    calleeName = (node) => node.callee.type === "MemberExpression" ? node.callee.property.name : null,
    /**
     * Map of CallExpression's to ignore
     * @type {WeakMap}
     */
    ignoreMap = new WeakMap();

/**
 * Check whether a callee is a child of a module function
 * @param callee
 * @returns {boolean}
 */
function childOfModule (object, bindings) {
    // Map stored variables onto their declared values
    //
    if (object.type === "Identifier" && bindings[object.name])
        object = bindings[object.name].path.node.init;

    if (object.callee && object.callee.type === "MemberExpression" && object.callee.property.name === "module")
        return true;
    else if (object.callee && object.callee.object && object.callee.object)
        return childOfModule(object.callee.object, bindings);
    else
        return false;
}

module.exports = function angularInject (babel) {
    let t = babel.types;
    return {
        visitor: {
            /**
             * Build a list of user defined $inject arrays and ignore them later
             * @param path
             * @returns {boolean}
             * @constructor
             */
            MemberExpression (path) {
                if (path.node.property.name !== "$inject")
                    return false;

                // Store reference to identifier
                //
                ignoreMap.set(path.scope.bindings[path.parent.left.object.name], true);
            },
            /**
             * CallExpression processor
             * @param path
             * @returns {boolean}
             * @constructor
             */
            CallExpression (path) {
                if (// Secondly, check arguments list contains at least two
                    path.node.arguments.length < 2 ||
                    // Thirdly, check callee exists in allowed injectables list
                    injectables.indexOf(calleeName(path.node)) === -1 ||
                    // finally, check expressions stems from a module() invocation
                    !childOfModule(path.node, path.scope.bindings))
                    return false;

                let fn = path.node.arguments[1];

                // Follow variable to source if not a direct function
                //
                let fnNode = fn.type === "FunctionExpression" || fn.type === "ArrowFunctionExpression" ? fn : path.scope.bindings[fn.name].path.node;

                // Check if we've not mapped straight to a function
                //
                if (fnNode.type === "VariableDeclaration")
                    fnNode = fnNode.declarations[0].init;

                // Build array of angular references
                //
                let references = (fnNode.params || []).map((param) => t.stringLiteral(param.name));

                // Check if $inject is defined, if so, ignore
                //
                if (ignoreMap.has(path.scope.bindings[fn.name]))
                    return false;

                references.push(fn);

                path.node.arguments[1] = t.arrayExpression(references);
            }
        }
    };
};