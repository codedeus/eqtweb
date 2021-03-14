(function(){
    'use strict';

    angular.module('app.assettype').
      controller('AssetTypeSetupController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.selectedTypes = [];
        vm.newAssetType = {};

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

        const GetAssetTypes = () =>{
            StoreService.GetAssetTypes((($scope.query.page - 1) * $scope.query.limit),$scope.query.limit).then(res=>vm.assetType = res);
        }

        GetAssetTypes();
        vm.GetAssetTypes = GetAssetTypes;

        vm.submitForm = ()=>{
          StoreService.SaveNewAssetType(vm.newAssetType).then(res=>{
            //vm.subsidiaries.push(res);
            GetAssetTypes();
            vm.newAssetType = {};
            UtilityService.showAlert('success','saved successfully');
          });
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedTypes.length>0){
            StoreService.DeleteAssetTypes(vm.selectedTypes).then(()=>{
              vm.selectedTypes = [];
              UtilityService.showAlert('success','deleted successfully');
              GetAssetTypes();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
            UtilityService.editPropertyWithCb(event,row,col,function(input){
                row[col] = (input.$modelValue);
                StoreService.UpdateAssetType(row).then(()=>{
                    UtilityService.showAlert('success','saved successfully');
                })
            });
        }
    })
})();
