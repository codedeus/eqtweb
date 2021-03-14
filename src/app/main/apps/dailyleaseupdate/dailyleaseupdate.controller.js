(function(){
    'use strict';

    angular.module('app.dailyleaseupdate').
      controller('DailyLeaseUpdateController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.updateType = 'current';
        $scope.limitOptions = [10, 15,25,50,100];

        $scope.options = {
          rowSelection: true,
          multiSelect: true,
          autoSelect: true,
          decapitate: false,
          largeEditDialog: false,
          boundaryLinks: false, 
          limitSelect: true,
          pageSelect: true
        };

        $scope.query = {
          limit: 10,
          page: 1
        };
    })
})();
