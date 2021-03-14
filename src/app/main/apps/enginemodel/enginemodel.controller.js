(function(){
    'use strict';

    angular.module('app.enginemodel').
      controller('EngineModelController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.selectedModels = [];
        vm.newEngineModel = {};

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

        const GetEngineModels = () =>{
            StoreService.GetEngineModels((($scope.query.page - 1) * $scope.query.limit),$scope.query.limit).then(res=>vm.engineData = res);
        }

        GetEngineModels();
        vm.GetEngineModels = GetEngineModels;

        vm.submitForm = ()=>{
          StoreService.SaveNewEngineModel(vm.newEngineModel).then(res=>{
            //vm.subsidiaries.push(res);
            GetEngineModels();
            vm.newEngineModel = {};
            UtilityService.showAlert('success','saved successfully');
          });
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedModels.length>0){
            StoreService.DeleteEngineModels(vm.selectedModels).then(()=>{
              vm.selectedModels = [];
              UtilityService.showAlert('success','deleted successfully');
              GetEngineModels();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
            UtilityService.editPropertyWithCb(event,row,col,function(input){
                row[col] = (input.$modelValue);
                StoreService.UpdateEngineModel(row).then(()=>{
                    UtilityService.showAlert('success','saved successfully');
                })
            });
        }
    })
})();
