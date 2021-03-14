(function(){
    'use strict';

    angular.module('app.enginetype').
      controller('EngineTypeController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.selectedTypes = [];
        vm.newEngineType = {};

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

        const GetEngineTypes = () =>{
            StoreService.GetEngineTypes((($scope.query.page - 1) * $scope.query.limit),$scope.query.limit).then(res=>vm.engineData = res);
        }

        GetEngineTypes();
        vm.GetEngineTypes = GetEngineTypes;

        vm.submitForm = ()=>{
          StoreService.SaveNewEngineType(vm.newEngineType).then(res=>{
            //vm.subsidiaries.push(res);
            GetEngineTypes();
            vm.newEngineType = {};
            UtilityService.showAlert('success','saved successfully');
          });
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedTypes.length>0){
            StoreService.DeleteEngineTypes(vm.selectedTypes).then(()=>{
              vm.selectedTypes = [];
              UtilityService.showAlert('success','deleted successfully');
              GetEngineTypes();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
            UtilityService.editPropertyWithCb(event,row,col,function(input){
                row[col] = (input.$typeValue);
                StoreService.UpdateEngineType(row).then(()=>{
                    UtilityService.showAlert('success','saved successfully');
                })
            });
        }
    })
})();
