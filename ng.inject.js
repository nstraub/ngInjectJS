/* global angular*/
angular.module('ngInjectJS', ['injectJS'], ['$provide', '$injectorProvider', '$injectJSProvider', function ($provide, $injectorProvider) {

    var originalServiceProvider = $provide.service,
        $injectJS;

    var $injector = $injectorProvider.$get();
    $injectJS = $injector.get('$injectJS');

    $provide.service = function (name, fn, lifetime) {
        if (lifetime) {
            if (lifetime === 'state') {
                originalServiceProvider.apply(this, arguments);
                $provide.decorator(name, [
                    '$delegate', function($delegate) {
                        var proxy = {},
                            prop;
                        for (var key in $delegate) {
                            if ($delegate.hasOwnProperty(key)) {
                                (function(key) {
                                    if (typeof prop === 'function') {
                                        proxy[key] = function() {
                                            var actual = $injectJS.get(name);
                                            return actual[key].apply(actual, arguments);
                                        };
                                    } else {
                                        Object.defineProperty(proxy, key, {
                                            get: function() {
                                                return $injectJS.get(name)[key];
                                            },
                                            set: function(value) {
                                                $injectJS.get(name)[key] = value;
                                            }
                                        });
                                    }
                                }(key));
                            }
                        }
                        return proxy;
                    }
                ]);
            }
            return $injectJS.registerType(name, fn, lifetime);
        }
        return originalServiceProvider.apply(this, arguments);
    };

    var originalInvoke = $injector.invoke;
    $injectJS.get = function(name, serviceName) {
        var descriptor = this.fakes[name] || this.types[name] || this.providers[name];
        if (!descriptor) {
            throw 'There is no dependency named "' + name + '" registered.';
        }
        var adhoc = {};
        for (var i = 0; i < descriptor.dependencies.length; i++) {
            var current = descriptor.dependencies[i];
            if ($injector.has(current)) {
                adhoc[current] = $injector.get(current);
            }
        }

        return this._inject(name, serviceName)(adhoc);
    };

    $injector.invoke = function (fn, self, locals, serviceName) {
        if (typeof locals === 'string') {
            serviceName = locals;
            locals = null;
        }

        return originalInvoke.call($injector, fn, self, getInjectJsDependencies(locals, fn, serviceName), serviceName);
    };

    var originalInstantiate = $injector.instantiate;
    $injector.instantiate = function(fn, locals, serviceName) {
        return originalInstantiate.call($injector, fn, getInjectJsDependencies(locals, fn, serviceName), serviceName);
    };

    function getInjectJsDependencies(locals, fn, serviceName) {
        var $inject = $injector.annotate(fn),
            args = locals || {},
            skip = ['$scope', '$element', '$attrs'];
        for (var i = 0; i < $inject.length; i++) {
            var current = $inject[i];
            if (!(~skip.indexOf(current) || $injector.has(current) || args[current])) {
                args[current] = $injectJS.get(current, serviceName);
            }
        }
        return args;
    }
}]);
