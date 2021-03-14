(function(){
    'use strict';

    angular.module('app.assetgroup').
      controller('AssetGroupController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.newGroup = {};
        vm.selectedAssetGroups = [];
        vm.location = {};
        vm.groupType = 'parent';

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

        const GetAssetGroups = () =>{
          StoreService.GetAssetGroups((($scope.query.page - 1) * $scope.query.limit),$scope.query.limit).then(res=>vm.assetGroup = res);
        }

        vm.groupTypeChanged = ()=>{
          if(vm.groupType=='subgroup'){

          }
          else{
            GetAssetGroups();
          }
        }

        const GetAssetSubGroups=(groupId)=>{
          StoreService.GetAssetSubGroups((($scope.query.page - 1) * $scope.query.limit),$scope.query.limit, groupId).then(res=>vm.assetSubGroup = res);
        }

        vm.assetGroupChanged = (groupId)=>{
          GetAssetSubGroups(groupId);
        }

        GetAssetGroups();
        vm.GetAssetGroups = GetAssetGroups;

        vm.addNewAssetGroup = ()=>{
          vm.newGroup.IsSubGroup = vm.groupType=='subgroup';

          StoreService.SaveNewAssetGroup(vm.newGroup).then(res=>{
            const parentId = vm.newGroup.ParentId;
            vm.newGroup = {};
            if(vm.groupType=='subgroup'){
              GetAssetSubGroups(parentId);
              vm.newGroup.ParentId = parentId;
            }
            else{
              GetAssetGroups();
            }
            
            UtilityService.showAlert('success','saved successfully');
          });
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedAssetGroups.length>0){
            StoreService.DeleteAssetGroups(vm.selectedAssetGroups).then(()=>{
              vm.selectedAssetGroups = [];
              UtilityService.showAlert('success','deleted successfully');
              GetAssetGroups();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
            UtilityService.editPropertyWithCb(event,row,col,function(input){
                row[col] = (input.$modelValue);
                StoreService.UpdateAssetGroup(row).then(()=>{
                    UtilityService.showAlert('success','saved successfully');
                });
            });
        }

        vm.openEditForm = (ev, item, itemIndex)=>{
          if(item && item.Id){
            const itemToEdit = JSON.parse(JSON.stringify(item));
            const itemData = {
              AssetSubGroup: itemToEdit,
              AssetGroups:vm.assetGroup.AssetGroups
            }
            UtilityService.showDialog(ev, 'editassetgroup.html', itemData, 'AssetGroupDialogController').then((res)=>{
              vm.assetSubGroup.AssetGroups[itemIndex] = res;
              UtilityService.showAlert('success','updated successfully');
            });
          }
        }
    }).controller('AssetGroupDialogController', function($mdDialog, dialogData, StoreService) {
    
      var vm = this;
      vm.subGroup = dialogData.AssetSubGroup;
      vm.AssetGroups = dialogData.AssetGroups;
      
      vm.submit = () =>{
        if(vm.subGroup && vm.subGroup.Id){
          StoreService.UpdateAssetGroup(vm.subGroup).then((res)=>{
            $mdDialog.hide(vm.subGroup);
          });
        }
      }

      vm.cancel = function () {
        $mdDialog.cancel();
      };
    })
})();
