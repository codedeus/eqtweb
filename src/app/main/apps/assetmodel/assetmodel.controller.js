(function(){
    'use strict';

    angular.module('app.assetmodel').
      controller('AssetModelController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.selectedModels = [];
        vm.newAssetModel = {};

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

        const GetAssetModels = () =>{
            StoreService.GetAssetModels((($scope.query.page - 1) * $scope.query.limit),$scope.query.limit).then(res=>vm.assetData = res);
        }

        GetAssetModels();
        vm.GetAssetModels = GetAssetModels;

        vm.submitForm = ()=>{
          StoreService.SaveNewAssetModel(vm.newAssetModel).then(res=>{
            //vm.subsidiaries.push(res);
            GetAssetModels();
            vm.newAssetModel = {};
            UtilityService.showAlert('success','saved successfully');
          });
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedModels.length>0){
            StoreService.DeleteAssetModels(vm.selectedModels).then(()=>{
              vm.selectedModels = [];
              UtilityService.showAlert('success','deleted successfully');
              GetAssetModels();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
            UtilityService.editPropertyWithCb(event,row,col,function(input){
                row[col] = (input.$modelValue);
                StoreService.UpdateAssetModel(row).then(()=>{
                    UtilityService.showAlert('success','saved successfully');
                })
            });
        }
    })
})();
