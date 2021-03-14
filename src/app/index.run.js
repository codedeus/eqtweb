(function() {
  'use strict';

  angular
      .module('fuse')

  /** @ngInject */

  .run(['$rootScope', '$window', '$cookies', '$state', '$location','UtilityService','HmisConstants',
      function($rootScope, $window, $cookies, $state, $location,UtilityService,HmisConstants) {
     
      let onChangeStartCall = $rootScope.$on('$stateChangeStart', function(event, toState) {
        $rootScope.pageTitle = toState.data.name || "";
        const currentUser = angular.fromJson($window.localStorage.currentUser);
        if ((currentUser == null || currentUser.Role == null) && $location.path() !== '/login') {
            delete $window.localStorage.authToken;
            $location.path('/login');
            $state.go('app.login');
        } 
      });

      let onChangeSuccessCall = $rootScope.$on('$stateChangeSuccess',function(){
        $rootScope.$broadcast('handleBroadcast', { pageTitle: $rootScope.pageTitle,showShiftMenu: $rootScope.showShiftMenu,shiftNumber:$rootScope.shiftNumber,allowLocationChange:$rootScope.allowLocationChange});
      });
  }]);
})();
