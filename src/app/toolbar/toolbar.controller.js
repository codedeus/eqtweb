(function () {
  "use strict";

  angular
    .module("app.toolbar")
    .controller("ToolbarController", ToolbarController);

  /** @ngInject */
  function ToolbarController(
    $rootScope,
    $mdSidenav,
    $location,
    UtilityService,
    $translate,
    StoreService,
    $scope,
    AuthenticationService,
    $state,
    $cookies,
    $mdDialog,
    chatservice
  ) {
    var vm = this;

    //data
    vm.pageTitle = "PAGETITLE." + $rootScope.pageTitle;

    // $scope.page = {
    //   title:'PAGETITLES.'+ vm.pageTitle
    // }

    vm.showShiftMenu =
      $rootScope.showShiftMenu && $rootScope.shiftNumber != null;
    vm.shiftNumber = $rootScope.shiftNumber;
    $rootScope.globals = $rootScope.globals || $cookies.get("globals") || {};
    $rootScope.globals.currentUser = $rootScope.globals.currentUser || {};

    vm.loggedInStaff = $rootScope.globals.currentUser.Name;

    $rootScope.connection = chatservice.SignalRConnection();

    $rootScope.dialoguserid = -1;
    $rootScope.unseenMessagesObj = {};
    $scope.userNativeId = chatservice.senderNativeId();
    $scope.offlineUsers = [];
    $scope.recentLoginId = -1;

    
      $rootScope.unseenMessagesObj = {};

      $scope.userUnseenMessagesLen = 0;
    
    $rootScope.$on("unseenMessagesObj", function (ev, args) {
      $rootScope.unseenMessagesObj = args;
      $scope.$applyAsync(
        ($scope.userUnseenMessagesLen = Object.keys(
          $rootScope.unseenMessagesObj
        ).length)
      );
    });

    $rootScope.pageTitle = null;
    $rootScope.showShiftMenu = null;
    $rootScope.shiftNumber = null;
    vm.allowLocationChange =
      $rootScope.globals.currentUser.Role != null
        ? $rootScope.globals.currentUser.Role.Name.toLowerCase() == "doctor" ||
          $rootScope.globals.currentUser.Role.Name.toLowerCase() == "nurse"
        : false;

    var location = localStorage.getItem("location");
    if (location !== "undefined" && location != null) {
      location = angular.fromJson(location);
      if (location) {
        vm.location = location.Name;
      }
    }

    //data change broadcast handler
    $scope.$on("handleBroadcast", function (event, args) {
      if (args) {
        vm.pageTitle = "PAGETITLE." + args.pageTitle;
        vm.showShiftMenu = args.showShiftMenu && args.shiftNumber != null;
        vm.shiftNumber = args.shiftNumber;
        vm.allowLocationChange = args.allowLocationChange;

        var location = localStorage.getItem("location");
        if (location !== "undefined" && location != null) {
          location = angular.fromJson(location);
          if (location) {
            vm.location = location.Name;
          }
        }
      }
    });

    $rootScope.global = {
      search: "",
    };

    vm.bodyEl = angular.element("body");
    // vm.userStatusOptions = [
    //     {
    //         'title': 'Online',
    //         'icon' : 'icon-checkbox-marked-circle',
    //         'color': '#4CAF50'
    //     },
    //     {
    //         'title': 'Away',
    //         'icon' : 'icon-clock',
    //         'color': '#FFC107'
    //     },
    //     {
    //         'title': 'Do not Disturb',
    //         'icon' : 'icon-minus-circle',
    //         'color': '#F44336'
    //     },
    //     {
    //         'title': 'Invisible',
    //         'icon' : 'icon-checkbox-blank-circle-outline',
    //         'color': '#BDBDBD'
    //     },
    //     {
    //         'title': 'Offline',
    //         'icon' : 'icon-checkbox-blank-circle-outline',
    //         'color': '#616161'
    //     }
    // ];
    vm.languages = {
      en: {
        title: "English",
        translation: "TOOLBAR.ENGLISH",
        code: "en",
        flag: "us",
      },
      es: {
        title: "Spanish",
        translation: "TOOLBAR.SPANISH",
        code: "es",
        flag: "es",
      },
      tr: {
        title: "Turkish",
        translation: "TOOLBAR.TURKISH",
        code: "tr",
        flag: "tr",
      },
    };

    // Methods
    vm.toggleSidenav = toggleSidenav;
    vm.logout = logout;
    vm.changeLanguage = changeLanguage;
    vm.setUserStatus = setUserStatus;
    vm.toggleHorizontalMobileMenu = toggleHorizontalMobileMenu;
    vm.changePassword = changePassword;
    vm.closeShift = closeShift;
    vm.changeLocation = changeLocation;
    //////////

    init();

    /**
     * Initialize
     */
    function init() {
      // Select the first status as a default
      //vm.userStatus = vm.userStatusOptions[0];

      // Get the selected language directly from angular-translate module setting
      vm.selectedLanguage = vm.languages[$translate.preferredLanguage()];
    }

    /**
     * close current workshift
     *
     */

    function closeShift() {
      StoreService.UpdateWorkShift(
        { Id: $rootScope.globals.currentUser.PosWorkShiftId },
        $rootScope.globals.currentUser.Username,
        "To Close"
      ).then(function (result) {
        $rootScope.processingRequest = false;
        vm.showShiftMenu = false;
        vm.shiftNumber = null;
        UtilityService.showAlert("success", "shift closed successfully");
      });
    }

    function changeLocation(ev) {
      UtilityService.showDialog(
        ev,
        "locationchange.html",
        null,
        "LocationSettingsController"
      );
    }

    /**
     * Toggle sidenav
     *
     * @param sidenavId
     */
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }
    $scope.$watch(
      function() { return $mdSidenav('quick-panel').isOpen(); },
      function(newValue, oldValue) {
        
          $rootScope.openDia = newValue;
             
      
     
      }
  );

  $mdSidenav('quick-panel',true).then(function(instance) {
    // On close callback to handle close, backdrop click, or escape key pressed.
    // Callback happens BEFORE the close action occurs.
    instance.onClose(function() {
      $rootScope.closeChatBox();
      $rootScope.searchInput = null
      $rootScope.showStaffMemberSearchResult = false
    });
  });
    /**
     * Sets User Status
     * @param status
     */
    function setUserStatus(status) {
      vm.userStatus = status;
    }

    /**
     * Logout Function
     */
    function logout() {
      // Do logout here..
      AuthenticationService.ClearCredentials();
      $state.go("app.login");
      $location.path("/login");
    }

    function changePassword() {
      $state.go("app.passwordchange");
      $location.path("/passwordchange");
    }

    /**
     * Change Language
     */
    function changeLanguage(lang) {
      vm.selectedLanguage = lang;

      /**
       * Show temporary message if user selects a language other than English
       *
       * angular-translate module will try to load language specific json files
       * as soon as you change the language. And because we don't have them, there
       * will be a lot of errors in the page potentially breaking couple functions
       * of the template.
       *
       * To prevent that from happening, we added a simple "return;" statement at the
       * end of this if block. If you have all the translation files, remove this if
       * block and the translations should work without any problems.
       */
      // if ( lang.code !== 'en' )
      // {
      //     var message = 'Fuse supports translations through angular-translate module, but currently we do not have any translations other than English language. If you want to help us, send us a message through ThemeForest profile page.';

      //     $mdToast.show({
      //         template : '<md-toast id="language-message" layout="column" layout-align="center start"><div class="md-toast-content">' + message + '</div></md-toast>',
      //         hideDelay: 7000,
      //         position : 'top right',
      //         parent   : '#content'
      //     });

      //     return;
      // }

      // Change the language
      $translate.use(lang.code);
    }

    /**
     * Toggle horizontal mobile menu
     */
    function toggleHorizontalMobileMenu() {
      vm.bodyEl.toggleClass("ms-navigation-horizontal-mobile-menu-active");
    }
  }
})();
