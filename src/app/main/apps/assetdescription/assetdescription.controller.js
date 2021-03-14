(function(){
    'use strict';

    angular.module('app.assetdescription').
      controller('AssetDescriptionController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.selectedAssets = [];
        vm.newAsset = {};

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

        const GetAssets = () =>{
            StoreService.GetAssets((($scope.query.page - 1) * $scope.query.limit),$scope.query.limit).then(res=>vm.asset = res);
        }

        GetAssets();
        vm.GetAssets = GetAssets;

        vm.submitForm = ()=>{
          StoreService.SaveNewAsset(vm.newAsset).then(res=>{
            //vm.subsidiaries.push(res);
            GetAssets();
            vm.newAsset = {};
            UtilityService.showAlert('success','saved successfully');
          });
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedAssets.length>0){
            StoreService.DeleteAssets(vm.selectedAssets).then(()=>{
              vm.selectedAssets = [];
              UtilityService.showAlert('success','deleted successfully');
              GetAssets();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
            UtilityService.editPropertyWithCb(event,row,col,function(input){
                row[col] = (input.$modelValue);
                StoreService.UpdateAsset(row).then(()=>{
                    UtilityService.showAlert('success','saved successfully');
                })
            });
        }
    })
})();
