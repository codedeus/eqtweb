'use strict';

angular.module('app.settings.login')

.factory('AuthenticationService', ['$cookies','UtilityService', '$log', '$rootScope', '$mdDialog', '$window', 'StoreService', '$location', '$state',
    function($cookies,UtilityService ,$log, $rootScope, $mdDialog, $window, StoreService, $location, $state) {
        var service = {};

        service.Login = function(username, password, modules) {
      
        };

        service.ClearCredentials = function() {
            delete $rootScope.globals;
            delete $window.localStorage.authToken;
            localStorage.removeItem('currentUser');
            $window.location.reload();
        };

        return service;
    }
]);
