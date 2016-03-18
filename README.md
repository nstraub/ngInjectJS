In AngularJS, all dependencies (services) are singletons (only one instance of the type exists at any given time during the page's lifecycle). This is normally fine, but there are occasions when we need to have a type instantiated every time it's injected (transient), or a type that is a singleton until our SPA changes its state, i.e. when a user navigates to a different part of the site without reloading our webpage (state). We also might want to have a dependency instantiated for an object and all its dependencies, or have a dependency shared between all dependencies of a controller (or directive).

> The last two are called parent and root respectively, and are not yet implemented. I expect to have them out soon.

# Installation

### Using NPM

    npm install ng-inject-js
    
### Manual

Download ng.inject.js from this repository, also [https://raw.githubusercontent.com/nstraub/injectjs/master/dist/inject.min.js](inject.min.js) from [https://github.com/nstraub/injectjs](injectjs). Make sure you have lodash referenced in your web page. add inject.js and then ng.inject.js, both below your reference to AngularJS.

# Usage

As a third parameter to your service, add a string that represents the lifetime (currently `transient` or `state`) desired. For example:

    angular.module('myApp').service('myService1', [function () {}], 'transient');
    angular.module('myApp').service('myService2', ['myService1', function (myService1) { this.s1 = myService1 }], 'state');
    angular.module('myApp').service('myService3', ['myService1', 'myService1', 'myService2', 'myService2', function (s1, s11, s2, s22) {
        console.log(s1 === s11); // false
        console.log(s1 === s2.s1); // false
        console.log(s11 === s2.s1); // false
        console.log(s2.s1 === s22.s1); // true
        
        this.s2 = s2;
        
    }], 'transient');
    
    angular.module('myApp').service('myService4', ['myService3', 'myService3', function (s3, s33) {
        console.log(s3 === s33); //false
        console.log(s3.s2 === s33.s2) // true, because service2 has the state lifetime
    }]); // no third parameter means singleton handled by angular's injector.
