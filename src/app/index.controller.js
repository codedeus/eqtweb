(function () {
    'use strict';

    //var isDlgOpen;

    angular
        .module('fuse')
        .controller('IndexController', IndexController)
        .controller('EmptyDialogController', EmptyDialogController);

    /** @ngInject */
    function IndexController(fuseTheming, $interval, $scope,$cookies,$location,$state,$window) {
        var vm = this;

        vm.themes = fuseTheming.themes;

        var promise;

        $window.addEventListener('storage', (event) => {
            if (event.key=='authToken' && event.oldValue!=null && event.oldValue!=event.newValue) {
                $location.path('/login');
                $state.go('app.login');
            }
          }, false);

        // starts the interval
        $scope.start = function () {
            // // stops any running interval to avoid two intervals running at the same time
            // $scope.stop();
            // // store the interval promise
            // promise = $interval(pingServer, 3000);
        };

        // stops the interval
        $scope.stop = function () {
            $interval.cancel(promise);
            promise = undefined;
        };

        // starting the interval by default

        $scope.start();

    }

    function EmptyDialogController($scope, $mdDialog) {
        'use strict';
      
        var vm = this;
      
        vm.closeDialog = function () {
          $mdDialog.hide();
        };
      }

})();
