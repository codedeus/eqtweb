(function(){
    'use strict';

    angular.module('app.assetregister').
      controller('AssetItemController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.newAssetItem = {};
        vm.selectedItems = [];
        vm.assetItem = {};
        vm.assetGroup = {};
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

        const GetAllAssets=()=>{
          const{ AssetBrandId, AssetGroupId, AssetModelId, AssetSubGroupId, AssetTypeId, CapacityId, DimensionId, EngineModelId, EngineTypeId  } = vm.newAssetItem;

          let assetDescriptionId = vm.selectedAsset == null ? null:vm.selectedAsset.Id;

          StoreService.GetAllAssets((($scope.query.page - 1) * $scope.query.limit), $scope.query.limit, AssetGroupId, AssetSubGroupId, AssetBrandId, AssetTypeId, AssetModelId, CapacityId, DimensionId, EngineTypeId, EngineModelId, assetDescriptionId).then((res)=>vm.assetItem = res);
        }

        const GetAssetGroups = () =>{
          StoreService.GetAssetGroups().then(res=>vm.assetGroup = res);
        }
  
        const GetAssetBrands = () =>{
          StoreService.GetAssetBrands().then(res=>vm.assetBrand = res);
        }
  
        const GetAssetCapacities = () =>{
          StoreService.GetAssetCapacities().then(res=>vm.assetCapacity = res);
        }
        
        const GetAssetDimensions = () =>{
          StoreService.GetAssetDimensions().then(res=>vm.assetDimension = res);
        }
  
        const GetAssetModels = () =>{
          StoreService.GetAssetModels().then(res=>vm.assetModel = res);
        }
  
        const GetAssetTypes = () =>{
            StoreService.GetAssetTypes().then(res=>vm.assetType = res);
        }
  
        const GetEngineModels = () =>{
          StoreService.GetEngineModels().then(res=>vm.engineModel = res);
        }
  
        const GetEngineTypes = () =>{
          StoreService.GetEngineTypes().then(res=>vm.engineType = res);
        }

        const GetAssetSubGroups=(groupId)=>{
          StoreService.GetAssetSubGroups(null,null,groupId).then(res=>vm.assetSubGroup = res);
        }
  
        vm.assetGroupChanged = (groupId)=>{
          GetAssetSubGroups(groupId);
        }
  
        GetEngineTypes();
  
        GetEngineModels();
  
        GetAssetTypes();
  
        GetAssetModels();
  
        GetAssetDimensions();
  
        GetAssetCapacities();
  
        GetAssetBrands();
  
        GetAssetGroups();

        GetAllAssets();
        vm.GetAllAssets = GetAllAssets;

        vm.openEditForm = (ev, item, itemIndex)=>{
          if(item && item.Id){
            const itemToEdit = JSON.parse(JSON.stringify(item));
            const itemData = {
              AssetItem: itemToEdit,
              AssetGroup:vm.assetGroup,
              AssetBrand:vm.assetBrand,
              AssetCapacity:vm.assetCapacity,
              AssetDimension:vm.assetDimension,
              AssetModel:vm.assetModel,
              AssetType:vm.assetType,
              EngineModel:vm.engineModel,
              EngineType:vm.engineType
            }
            UtilityService.showDialog(ev, 'assetitem.html', itemData, 'UpdateAssetItemDialogController').then((res)=>{
              vm.assetItem.Items[itemIndex] = res;
              UtilityService.showAlert('success','item updated successfully');
            });
          }
        }

        const excelCols = [{
          Group: '',
          SubGroup: '',
          Description: '',
          AssetCode: '',          
          RegistrationNumber: '',
          LeaseCost: 0,
          AssetType:'',
          AssetBrand:'',
          AssetCapacity:'',
          AssetModel:'',
          AssetDimension:'',
          SerialNumber:'',
          EngineType:'',
          EngineModel:'',
          EngineNumber:'',
          ManufactorYear:0,
          AcquisitionYear:0,
          LeaseCost:0
        }];

        vm.deleteRowCallback = ()=>{
          if(vm.selectedItems.length>0){
            console.log(vm.selectedItems);
            StoreService.DeleteAssetItems(vm.selectedItems).then(()=>{
              vm.selectedItems = [];
              UtilityService.showAlert('success','items deleted successfully');
              GetAllAssets();
            });
          }
        }

        vm.searchForAssetItems = function (searchText) {
          if (searchText != undefined) {
            return StoreService.SearchForAssetItems(searchText).then(
              function (items) {
                return items;
              });
          }
        };

        vm.searchForAssets = function (searchText) {
          if (searchText != undefined) {
            return StoreService.SearchForAssets(searchText).then(
              function (items) {
                return items;
              });
          }
        };

        vm.selectedItemChange = function(item){
          if(item){
              vm.assetItem.Items = [item];
          }
          else {
              GetAllAssets()
          }
        }

        vm.downloadTemlate = function(){
          UtilityService.exportToExcel('Asset_batch_upload_template', excelCols);
        }

        vm.handleFile = function () {  
          var file = vm.selectedFile;  
          if (file) {  
              var reader = new FileReader();  
              reader.onload = function (e) {  
                  var data = e.target.result;  
                  var workbook = XLSX.read(data, { type: 'binary' });  
                  var first_sheet_name = workbook.SheetNames[0];  
                  var dataObjects = XLSX.utils.sheet_to_json(workbook.Sheets[first_sheet_name]);  
  
                  if (dataObjects.length > 0) { 
                    uploadFile(dataObjects);  
                  } else {  
                  }  
              }  
              reader.onerror = function (ex) {  
    
              }  
              reader.readAsBinaryString(file);  
          }  
        }  

        function uploadFile(data){
          StoreService.BatchUploadAssetItems(data).then(function(res){
            if(res.ErrorList.length>0){
              UtilityService.exportToExcel('asset_upload_error_list',res.ErrorList);
              UtilityService.showMessage('....','Some data could not be validated.');
            }
            else{
              UtilityService.showAlert('success','File Uploaded Successfully');
            }
            GetAllAssets();
            vm.selectedFile = null;
            angular.element("input[type='file']").val(null);
          });
        }

        vm.openNewAssetForm = (ev)=>{
          const itemData = {
            AssetGroup:vm.assetGroup,
            AssetBrand:vm.assetBrand,
            AssetCapacity:vm.assetCapacity,
            AssetDimension:vm.assetDimension,
            AssetModel:vm.assetModel,
            AssetType:vm.assetType,
            EngineModel:vm.engineModel,
            EngineType:vm.engineType
          }
          UtilityService.showDialog(ev, 'assetitem.html',itemData,'NewAssetItemDialogController').then((res)=>{
            GetAllAssets();
          });
        }
    })
    .controller('UpdateAssetItemDialogController', function($scope,UtilityService, $mdDialog, dialogData, StoreService) {
    
      var vm = this;
      vm.newAssetItem = dialogData.AssetItem;
      vm.selectedAsset = {
        Name:vm.newAssetItem.Asset,
        Id:vm.newAssetItem.AssetId
      }

      vm.assetGroup = dialogData.AssetGroup;
      vm.assetBrand = dialogData.AssetBrand;
      vm.assetCapacity = dialogData.AssetCapacity;
      vm.assetDimension = dialogData.AssetDimension;
      vm.assetModel = dialogData.AssetModel;
      vm.assetType = dialogData.AssetType;
      vm.engineModel = dialogData.EngineModel;
      vm.engineType = dialogData.EngineType;

      const GetAssetSubGroups=(groupId)=>{
        StoreService.GetAssetSubGroups(null,null,groupId).then(res=>vm.assetSubGroup = res);
      }

      GetAssetSubGroups(vm.newAssetItem.AssetGroupId);

      vm.assetGroupChanged = (groupId)=>{
        GetAssetSubGroups(groupId);
      }
      
      vm.submitForm = () =>{
        if(vm.newAssetItem && vm.newAssetItem.Id && vm.selectedAsset){
          vm.newAssetItem.AssetId = vm.selectedAsset.Id;
          StoreService.UpdateAssets(vm.newAssetItem).then((res)=>{
            $mdDialog.hide(vm.newAssetItem);
          });
        }
      }

      vm.cancel = function () {
        $mdDialog.cancel();
      };

      vm.searchForAssets = function (searchText) {
        if (searchText != undefined) {
          return StoreService.SearchForAssets(searchText).then(
            function (items) {
              return items;
            });
        }
      };

    }).controller('NewAssetItemDialogController', function($scope,UtilityService, $mdDialog, dialogData, StoreService) {
    
      var vm = this;
      vm.assetGroup = dialogData.AssetGroup;
      vm.assetBrand = dialogData.AssetBrand;
      vm.assetCapacity = dialogData.AssetCapacity;
      vm.assetDimension = dialogData.AssetDimension;
      vm.assetModel = dialogData.AssetModel;
      vm.assetType = dialogData.AssetType;
      vm.engineModel = dialogData.EngineModel;
      vm.engineType = dialogData.EngineType;

      const GetAssetSubGroups=(groupId)=>{
        StoreService.GetAssetSubGroups(null,null,groupId).then(res=>vm.assetSubGroup = res);
      }

      vm.assetGroupChanged = (groupId)=>{
        GetAssetSubGroups(groupId);
      }
      
      vm.submitForm = ()=>{
        if(vm.selectedAsset){
          vm.newAssetItem.AssetId = vm.selectedAsset.Id;
          StoreService.AddNewAssetItem(vm.newAssetItem).then(res=>{
            vm.newAssetItem = {};
            UtilityService.showAlert('success','item saved successfully');
          });
        }
      }

      vm.searchForAssets = function (searchText) {
        if (searchText != undefined) {
          return StoreService.SearchForAssets(searchText).then(
            function (items) {
              return items;
            });
        }
      };

      vm.cancel = function () {
        $mdDialog.hide();
      };
    })
})();
