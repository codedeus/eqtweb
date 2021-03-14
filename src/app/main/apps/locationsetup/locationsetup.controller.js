(function(){
    'use strict';

    angular.module('app.locationsetup').
      controller('LocationSetupController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.subsidiary = {};
        vm.selectedLocations = [];
        vm.location = {};

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

        const GetLocations = () =>{
            StoreService.GetLocations((($scope.query.page - 1) * $scope.query.limit),$scope.query.limit).then(res=>vm.subsidiaryLocation = res);
        }

        GetLocations();
        vm.GetLocations = GetLocations;

        vm.addNewLocation = ()=>{
          StoreService.SaveNewLocation(vm.newLocation).then(res=>{
            //vm.subsidiaries.push(res);
            GetLocations();
            vm.newLocation = {};
            UtilityService.showAlert('success','saved successfully');
          });
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedLocations.length>0){
            StoreService.DeleteLocations(vm.selectedLocations).then(()=>{
              vm.selectedLocations = [];
              UtilityService.showAlert('success','deleted successfully');
              GetLocations();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
            UtilityService.editPropertyWithCb(event,row,col,function(input){
                row[col] = (input.$modelValue);
                StoreService.UpdateLocation(row).then(()=>{
                    UtilityService.showAlert('success','saved successfully');
                })
            });
        }
    })
})();
