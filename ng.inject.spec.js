describe('ng-injectJS', function() {
    var _provide = null;
    beforeEach(module('ngInjectJS'));
    beforeEach(module(function($provide) {
        _provide = $provide;
    }));
    describe('lifetimes', function() {
        describe('singleton', function() {
            it('should defer to angularjs injector when no lifetime argument is passed', inject(function($injector) {
                _provide.service('test_service', function() {});
                expect($injector.has('test_service')).toBeTruthy();
            }));
            return it('should defer to angularjs injector when singleton lifetime is passed', inject(function($injector) {
                _provide.service('test_service', function() {}, 'singleton');
                expect($injector.has('test_service')).toBeTruthy();
            }));
        });
        describe('transient', function() {
            it('should create one instance per dependency request', inject(function($injector) {
                var transient1, transient2;
                _provide.service('transient_service', function() {}, 'transient');
                transient1 = $injector.get('transient_service');
                transient2 = $injector.get('transient_service');
                expect(transient1).not.toBe(transient2);
            }));
        });
        describe('state', function() {
            init = function () {
                _provide.service('state_service', function(transient_service) { this.transient_service = transient_service; }, 'state');
                _provide.service('transient_service', function() {}, 'transient');
            };

            it('should create one instance for the entire application until state is cleared', inject(function($injector, $injectJS) {
                init();
                var state1, state2;
                state1 = $injector.get('state_service');
                state2 = $injector.get('state_service');

                var transient1 = state1.transient_service;
                expect(state2.transient_service).toBe(transient1);

                $injectJS.clearState();
                state1 = $injector.get('state_service');
                state2 = $injector.get('state_service');

                expect(state1.transient_service).toBe(state2.transient_service);
                expect(state1.transient_service).not.toBe(transient1);
            }));
            it('should always point all dependants to the latest instance of the object', inject(function($injector, $injectJS) {
                init();
                _provide.service('transient_service_2', function (state_service) {this.state_service = state_service}, 'transient');

                var transient1 = $injector.get('transient_service_2');
                var transient2 = $injector.get('transient_service_2');

                expect(transient1).not.toBe(transient2);
                expect(transient1.state_service).toBe(transient2.state_service);
                expect(transient1.state_service.transient_service).toBe(transient2.state_service.transient_service);

                $injectJS.clearState();

                var transient3 = $injector.get('transient_service_2');

                expect(transient1.state_service).toBe(transient3.state_service);
                expect(transient1.state_service.transient_service).toBe(transient3.state_service.transient_service);
            }));
        });
    });
});
