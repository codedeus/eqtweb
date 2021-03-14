(function(){
    'use strict';

    angular.module('app.assetcapacity').
      controller('AssetCapacityController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.selectedCapacities = [];
        vm.newAssetCapacity = {};

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

        const GetAssetCapacities = () =>{
            StoreService.GetAssetCapacities((($scope.query.page - 1) * $scope.query.limit),$scope.query.limit).then(res=>vm.assetData = res);
        }

        GetAssetCapacities();
        vm.GetAssetCapacities = GetAssetCapacities;

        vm.submitForm = ()=>{
          StoreService.SaveNewAssetCapacity(vm.newAssetCapacity).then(res=>{
            //vm.subsidiaries.push(res);
            GetAssetCapacities();
            vm.newAssetCapacity = {};
            UtilityService.showAlert('success','saved successfully');
          });
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedCapacities.length>0){
            StoreService.DeleteAssetCapacities(vm.selectedCapacities).then(()=>{
              vm.selectedCapacities = [];
              UtilityService.showAlert('success','deleted successfully');
              GetAssetCapacities();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
            UtilityService.editPropertyWithCb(event,row,col,function(input){
                row[col] = (input.$modelValue);
                StoreService.UpdateAssetCapacity(row).then(()=>{
                    UtilityService.showAlert('success','saved successfully');
                })
            });
        }
    })
})();
