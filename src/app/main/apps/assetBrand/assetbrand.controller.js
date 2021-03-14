(function(){
    'use strict';

    angular.module('app.assetbrand').
      controller('AssetBrandSetupController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.selectedBrands = [];
        vm.newAssetBrand = {};

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

        const GetAssetBrands = () =>{
            StoreService.GetAssetBrands((($scope.query.page - 1) * $scope.query.limit),$scope.query.limit).then(res=>vm.assetBrand = res);
        }

        GetAssetBrands();
        vm.GetAssetBrands = GetAssetBrands;

        vm.submitForm = ()=>{
          StoreService.SaveNewAssetBrand(vm.newAssetBrand).then(res=>{
            //vm.subsidiaries.push(res);
            GetAssetBrands();
            vm.newAssetBrand = {};
            UtilityService.showAlert('success','saved successfully');
          });
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedBrands.length>0){
            StoreService.DeleteAssetBrands(vm.selectedBrands).then(()=>{
              vm.selectedBrands = [];
              UtilityService.showAlert('success','deleted successfully');
              GetAssetBrands();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
            UtilityService.editPropertyWithCb(event,row,col,function(input){
                row[col] = (input.$modelValue);
                StoreService.UpdateAssetBrand(row).then(()=>{
                    UtilityService.showAlert('success','saved successfully');
                })
            });
        }
    })
})();
