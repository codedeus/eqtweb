(function() {
  'use strict';

  angular
      .module('app.dashboard', [])
      .config(config);

  /** @ngInject */
  function config($stateProvider) {

      $stateProvider.state('app.dashboard', {
          url: '/dashboard',
          data: {
              role: 'dashboard',
              name: 'Dashboard'
          },
          views: {
              'content@app': {
                  templateUrl: 'app/main/apps/dashboard/dashboard.html',
                  controller:'DashboardController'
              }
          }

          // bodyClass: 'emr-patientregistration'
      });
  }

})();
