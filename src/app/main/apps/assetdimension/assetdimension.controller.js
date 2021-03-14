(function(){
    'use strict';

    angular.module('app.assetdimension').
      controller('AssetDimensionController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.selectedDimensions = [];
        vm.newAssetDimension = {};

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

        const GetAssetDimensions = () =>{
            StoreService.GetAssetDimensions((($scope.query.page - 1) * $scope.query.limit),$scope.query.limit).then(res=>vm.assetData = res);
        }

        GetAssetDimensions();
        vm.GetAssetDimensions = GetAssetDimensions;

        vm.submitForm = ()=>{
          StoreService.SaveNewAssetDimension(vm.newAssetDimension).then(res=>{
            //vm.subsidiaries.push(res);
            GetAssetDimensions();
            vm.newAssetDimension = {};
            UtilityService.showAlert('success','saved successfully');
          });
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedDimensions.length>0){
            StoreService.DeleteAssetDimensions(vm.selectedDimensions).then(()=>{
              vm.selectedDimensions = [];
              UtilityService.showAlert('success','deleted successfully');
              GetAssetDimensions();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
            UtilityService.editPropertyWithCb(event,row,col,function(input){
                row[col] = (input.$modelValue);
                StoreService.UpdateAssetDimension(row).then(()=>{
                    UtilityService.showAlert('success','saved successfully');
                })
            });
        }
    })
})();
