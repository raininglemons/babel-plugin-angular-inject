/**
 * Supports es6 with the es2015 preset :D
 *
 * Super useful:
 *  http://astexplorer.net/
 */
"use strict";

/**
 * List of functions we should intercept
 * @type {string[]}
 */
const injectables = ["controller", "directive", "factory", "filter", "config", "run"],
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
 * @param object
 * @param bindings
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

/**
 * Function to trace an argument back to the original referenced function
 * @param object
 * @param scope
 * @returns {*}
 */
function followTheYellowBrickRoad (object, scope) {
    try {
        switch (object.type) {
            case "Identifier":
                return followTheYellowBrickRoad(scope.bindings[object.name].path.node, scope.bindings[object.name].scope);

            case "FunctionExpression":
            case "FunctionDeclaration":
            case "ArrowFunctionExpression":
                return object;

            case "VariableDeclaration":
                return followTheYellowBrickRoad(object.declarations[0].init, scope);

            case "VariableDeclarator":
                return followTheYellowBrickRoad(object.init, scope);

            case "MemberExpression":
                let mappedValue = scope.bindings[object.object.name].path.node.init.properties
                    .filter(prop => prop.key.name === object.property.name)
                    .map(prop => prop.value);
                if (mappedValue.length > 0)
                    return followTheYellowBrickRoad(mappedValue[0], scope.bindings[object.object.name].path.scope);

            default:
                return null;
        }
    } catch (e) {
        console.error(e);
        return null;
    }
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
                    path.node["arguments"].length < 2 ||
                    // Thirdly, check callee exists in allowed injectables list
                    injectables.indexOf(calleeName(path.node)) === -1 ||
                    // finally, check expressions stems from a module() invocation
                    !childOfModule(path.node, path.scope.bindings))
                    return false;

                let fn = path.node["arguments"][1],
                    fnNode = followTheYellowBrickRoad(fn, path.scope);

                if (fnNode === null)
                    return false;


                // Build array of angular references
                //
                let references = (fnNode.params || []).map((param) => t.stringLiteral(param.name));

                // Check if $inject is defined, if so, ignore
                //
                if (ignoreMap.has(path.scope.bindings[fn.name]))
                    return false;

                references.push(fn);

                path.node["arguments"][1] = t.arrayExpression(references);
            }
        }
    };
};