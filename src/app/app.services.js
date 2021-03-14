(function(){
  'use strict';

  angular.module('fuse')
  .factory('AuthInterceptor', function ($window, $q, $injector,$rootScope,$location) {

  return {
      request: function (config) {
          config.headers = config.headers || {};
          if ($window.localStorage&&$window.localStorage.authToken) {
              config.headers.authorization = 'Bearer ' + angular.fromJson($window.localStorage.authToken);
          }
          return config;
      },
      responseError: function (response) {
          if(response !== null && response.status === 401){
              var $state = $injector.get('$state');
              delete $window.localStorage.authToken;
              
              $location.path('/login');
              $state.go('app.login');
          }
          $rootScope.processingRequest = false;
          return $q.reject(response);
      },
      response: function (config) {
          return config;
      }
  };
});
})();
