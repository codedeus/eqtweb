(function (){
    'use strict';

    angular
        .module('app.navigation')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($scope,AuthenticationService,$state)
    {
        var vm = this;
        var originatorEv;
        // Data
        vm.bodyEl = angular.element('body');
        vm.folded = false;
        vm.msScrollOptions = {
            suppressScrollX: true
        };

        vm.openMenu = function($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

      // if ((typeof process !== 'undefined') && (process.release.name.search(/node|io.js/) !== -1)) {

      //   const ipcRenderer = require('electron').ipcRenderer;
      //   ipcRenderer.on('message', function(event, text) {
      //     var container = document.getElementById('messages');
      //     var message = document.createElement('div');
      //     message.innerHTML = text;
      //     container.appendChild(message);
      //   });
      // }
        // Methods
        vm.toggleMsNavigationFolded = toggleMsNavigationFolded;

        //////////

        /**
         * Toggle folded status
         */
        function toggleMsNavigationFolded()
        {
            vm.folded = !vm.folded;
        }

        vm.signOut = function(){
            AuthenticationService.ClearCredentials();
            $state.go('app.login');
        }

        // Close the mobile menu on $stateChangeSuccess
        $scope.$on('$stateChangeSuccess', function ()
        {
            vm.bodyEl.removeClass('ms-navigation-horizontal-mobile-menu-active');
        });
    }

})();
