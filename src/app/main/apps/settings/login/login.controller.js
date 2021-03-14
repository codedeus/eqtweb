(function() {
    'use strict';

    angular.module("app.settings.login").controller('LoginController', LoginController);
        function LoginController(AuthenticationService,$rootScope,$window,$cookies,StoreService,$location,$state){
        
        var vm = this;
        vm.form = {};
        vm.clear = function() {
            localStorage.clear();
        };

        vm.login = function() {

            delete $rootScope.globals;
            delete $window.localStorage.authToken;
            localStorage.removeItem('globals');
            $cookies.remove('globals');

            $rootScope.processingRequest = true;
            $rootScope.globals = $rootScope.globals || {};
              
            StoreService.VerifyUser(vm.form.email, vm.form.password).then(function(res) {
                var data = res.data;
                if(res && res.AccessToken && res.AccessToken.AuthToken){

                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                    
                    localStorage.setItem('authToken',angular.toJson(res.AccessToken.AuthToken));
                    localStorage.setItem('currentUser',angular.toJson(res));
                    
                    $location.path('/dashboard');
                    $state.go('app.dashboard');
                }
            });
        };

        vm.logout = function() {
            AuthenticationService.ClearCredentials(vm.modules);
        };
    }
})();
