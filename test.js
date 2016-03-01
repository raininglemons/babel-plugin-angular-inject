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


class complicatedControllerFunction {
    constructor (injecto) {
        this.injecto = injecto;
    }

    somethingelse () {
        return true;
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
    // Function
    //
    .directive("nameOfDirective", directiveFunction)
    // Directive already with $inject
    //
    .controller("ignoredDirective", ignoredDirective)
    // es6 class
    //
    .controller("nameOfController", controllerFunction)
    // es6 complicated class
    //
    .controller("complicatedController", complicatedControllerFunction)
    // Controller with $inject already defined
    //
    .controller("ignoredController", ignoredController)
    // Anonymous function
    //
    .directive("thirdDirective", function (injectme) {})
    // Named function
    //
    .directive("fourthDirective", function named (injectme) {})
    // Arrow function
    //
    .directive("boomaloom", (injected) => "thing");

// Not angular
//

notangular
    .directive("boom", directiveFunction)
    .directive("boomaloom", (injected) => "thing");

// Pull from a module saved to a variable
//

var randomModule = angular.module("random");

randomModule
    .directive("secondNameOfDirective", directiveFunction);


// Pull from an object
//

var obj = {
    three: true,
    one: function ($injector, $scope) {
        return "boo";
    },
    four: true
};

angular
    .module("random")
    .directive("nameOfDirective", obj.one);

// Function stored to variable?
//

let fn = function asdf (injectMeh) {};
angular.module("random")
    .directive("fnDirective", fn);

// Function passed around
//

let fn2 = fn;
angular.module("random")
    .directive("fnDirective", fn2);
