"use strict";
/**
 * Tests to check
 *
 * 1. decorate direct function
 * 2. decorate direct arrow function
 * 3. decorate variable stored function
 * 4. decorate variable stored arrow function
 * 5. decorate multiple referenced function
 * 6. decorate multiple referenced arrow function
 * 7. decorate declared function
 * 8. decorate declared class
 * 9. decorate object parameter stored function
 * 10. decorate object parameter arrow function
 * 11. decorate function on directive
 * 12. decorate function on controller
 * 13. don't decorate class with defined $inject array
 * 14. don't decorate function with defined $inject array
 * 15. don't decorate class nested in $inject array
 * 16. don't decorate function nested in $inject array
 * 17. don't decorate arrow function nested in $inject array
 * 18. don't inject if angular can't be traced back
 */

const inject = require("./../index.js"),
    babel = require("babel-core");

/*
    Prepare babel
 */
const presets = {
    "presets": ["es2015"],
    "plugins": [
        inject
    ]
};

/**
 * Pulls out any code being inserted as the directive
 * @param source
 * @returns {null}
 */
function pullDecorated (source, fn) {
    fn = fn || "directive";
    let matches = source.match(new RegExp(fn + "\\((['\"])[a-zA-Z0-9\\-_]+\\1,\\s*([\\s\\S]+)\\);", "m"));
    return matches ? matches[2] : null;
}

describe("decorate", function () {
    describe("direct", function () {
        it("function", function () {
            let result = babel.transform(`
                angular.module('test')
                    .directive('testDirective', function ($q) { });
            `, presets).code;
            expect(pullDecorated(result)).toBe(`['$q', function ($q) {}]`);
        });

        it("arrow function", function () {
            let result = babel.transform(`
                angular.module('test')
                    .directive('testDirective', $q => { });
            `, presets).code;
            expect(pullDecorated(result)).toBe(`['$q', function ($q) {}]`);
        });
    });

    describe("variable stored", function () {
        it("function", function () {
            let result = babel.transform(`
                let fn = function ($q) { };

                angular.module('test')
                    .directive('testDirective', fn);
            `, presets).code;
            expect(pullDecorated(result)).toBe(`['$q', fn]`);
        });

        it("arrow function", function () {
            let result = babel.transform(`
                let fn = ($q) => { };

                angular.module('test')
                    .directive('testDirective', fn);
            `, presets).code;
            expect(pullDecorated(result)).toBe(`['$q', fn]`);
        });
    });

    describe("multiple referenced", function () {
        it("function", function () {
            let result = babel.transform(`
                let fn = function ($q) { },
                    fn2 = fn;

                angular.module('test')
                    .directive('testDirective', fn2);
            `, presets).code;
            expect(pullDecorated(result)).toBe(`['$q', fn2]`);
        });

        it("arrow function", function () {
            let result = babel.transform(`
                let fn = ($q) => { },
                    fn2 = fn;

                angular.module('test')
                    .directive('testDirective', fn2);
            `, presets).code;
            expect(pullDecorated(result)).toBe(`['$q', fn2]`);
        });
    });

    describe("declared", function () {
        it("function", function () {
            let result = babel.transform(`
                function fn ($q) {

                }

                angular.module('test')
                    .directive('testDirective', fn);
            `, presets).code;
            expect(pullDecorated(result)).toBe(`['$q', fn]`);
        });

        it("class", function () {
            let result = babel.transform(`
                class fn {
                    constructor ($q) {

                    }

                    junk () {

                    }
                }

                angular.module('test')
                    .directive('testDirective', fn);
            `, presets).code;
            expect(pullDecorated(result)).toBe(`['$q', fn]`);
        });
    });

    describe("object parameter", function () {
        it("function", function () {
            let result = babel.transform(`
                let obj = {
                    fn: function ($q) { }
                };

                angular.module('test')
                    .directive('testDirective', obj.fn);
            `, presets).code;
            expect(pullDecorated(result)).toBe(`['$q', obj.fn]`);
        });

        it("arrow function", function () {
            let result = babel.transform(`
                let obj = {
                    fn: ($q) => { }
                };

                angular.module('test')
                    .directive('testDirective', obj.fn);
            `, presets).code;
            expect(pullDecorated(result)).toBe(`['$q', obj.fn]`);
        });
    });

    describe("when", function () {
        it("is a directive", function () {
            let result = babel.transform(`
                angular.module('test')
                    .directive('testDirective', function ($q) { });
            `, presets).code;
            expect(pullDecorated(result)).toBe(`['$q', function ($q) {}]`);
        });

        it("is a controller", function () {
            let result = babel.transform(`
                angular.module('test')
                    .controller('testDirective', function ($q) { });
            `, presets).code;
            expect(pullDecorated(result, "controller")).toBe(`['$q', function ($q) {}]`);
        });
    });

});

describe("don't decorate", function () {
    it("class with defined $inject array", function () {
        let result = babel.transform(`
                class fn {
                    constructor ($q) {

                    }

                    junk () {

                    }
                }

                fn.$inject = ["$q"];

                angular.module('test')
                    .directive('testDirective', fn);
            `, presets).code;
        expect(pullDecorated(result)).toBe("fn");
    });

    it("function with defined $inject array", function () {
        let result = babel.transform(`
                function fn ($q) {

                }

                fn.$inject = ["$q"];

                angular.module('test')
                    .directive('testDirective', fn);
            `, presets).code;
        expect(pullDecorated(result)).toBe("fn");
    });

    it("class nested in $inject array", function () {
        let result = babel.transform(`
                class fn {
                    constructor ($q) {

                    }

                    junk () {

                    }
                }

                angular.module('test')
                    .directive('testDirective', ["$q", fn]);
            `, presets).code;
        expect(pullDecorated(result)).toBe(`["$q", fn]`);
    });

    it("function nested in $inject array", function () {
        let result = babel.transform(`
                function fn ($q) {
                }

                angular.module('test')
                    .directive('testDirective', ["$q", fn]);
            `, presets).code;
        expect(pullDecorated(result)).toBe(`["$q", fn]`);
    });

    it("arrow function nested in $inject array", function () {
        let result = babel.transform(`
                angular.module('test')
                    .directive('testDirective', ["$q", $q => { }]);
            `, presets).code;
        expect(pullDecorated(result)).toBe(`["$q", function ($q) {}]`);
    });


    it("if angular can't be traced back", function () {
        let result = babel.transform(`
                noangular.module('test')
                    .directive('testDirective', fn);
            `, presets).code;
        expect(pullDecorated(result)).toBe(`fn`);
    });
});