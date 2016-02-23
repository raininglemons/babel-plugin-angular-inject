function directiveFunction (one, two) {
    return "boo" + directiveFunction(1,2);
}

function ignoredDirective (one, two) {
    return "boo" + directiveFunction(1,2);
}

ignoredDirective.$inject = ["testInject"];

class controllerFunction {
    constructor (injecto) {
        this.injecto = injecto;
    }
}

class ignoredController {
    constructor (injecto) {
        this.injecto = injecto;

        let arrow = () => "duck";
    }
}

ignoredController.$inject = ["testInject"];

angular
    .module("random")
    .directive("nameOfDirective", directiveFunction)
    .controller("ignoredDirective", ignoredDirective)
    .controller("nameOfController", controllerFunction)
    .controller("ignoredController", ignoredController)
    .directive("thirdDirective", function (injectme) {})
    .directive("fourthDirective", function named (injectme) {})
    .directive("boomaloom", (injected) => "thing");

notangular
    .directive("boom", directiveFunction)
    .directive("boomaloom", (injected) => "thing");

var randomModule = angular.module("random");

randomModule
    .directive("secondNameOfDirective", directiveFunction);