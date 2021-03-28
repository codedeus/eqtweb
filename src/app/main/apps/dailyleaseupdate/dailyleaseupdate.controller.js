(function(){
    'use strict';

    angular.module('app.dailyleaseupdate').
      controller('DailyLeaseUpdateController',function($scope, StoreService, UtilityService){
        var vm = this;
        vm.updateType = 'current';
        $scope.limitOptions = [10, 15,25,50,100];

        const UpdateStatuses = [
          "Operational", 
          "Broken Down", 
          "Sunk",
        ]

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

        vm.SearchForLeaseNumber = function (searchText) {
          if (searchText != undefined) {
            return StoreService.SearchForLeaseNumber(searchText).then(
              function (items) {
                return items;
              });
          }
        };

        vm.selectedLeaseNumberChange =(lease)=>{
          if(lease){
            StoreService.GetLeaseUpdates(lease.Id).then((res)=>vm.assetLease = res);
          }
        }

        vm.openDetailsForm = (ev,leaseUpdateId)=>{
          if(leaseUpdateId){
            StoreService.GetLeaseUpdateDetails(leaseUpdateId).then((res)=>{
              if(res){
                res.Project = vm.assetLease.Project;
                res.Location = vm.assetLease.Location;
                const itemData = {
                  Details:res,
                  UpdateStatuses
                }
                UtilityService.showDialog(ev, 'leaseupdateform.html',itemData,'LeaseUpdateEditController').then((res)=>{
                  UtilityService.showAlert('success','updated successfully')
                });
              }
            })
          }
        }
//
        vm.openUpdateForm = (ev)=>{
          if(vm.selectedLease){

            StoreService.GetLeaseEntriesForUpdate(vm.selectedLease.Id).then((res)=>{
              if(res){
                const itemData = {
                  Details: res,
                  UpdateStatuses
                }
                UtilityService.showDialog(ev, 'newleaseupdate.html',itemData,'AssetStatusUpdateDialogController').then((res)=>{
                  UtilityService.showAlert('success','updated successfully');
                });
              }
            })
          }
        }
    })
    .controller('LeaseUpdateEditController',function(dialogData, $mdDialog, UtilityService, StoreService){
      var vm = this;
      vm.leaseUpdate = dialogData.Details;
      vm.updateStatuses = dialogData.UpdateStatuses;

      vm.closeDialog = function () {
        $mdDialog.cancel();
      };

      vm.cancel = function () {
          $mdDialog.cancel();
      };

      vm.saveUpdate = () =>{
        if(vm.leaseUpdate && vm.leaseUpdate.Entries){
          StoreService.UpdateLeaseUpdateStatus(vm.leaseUpdate.Id, vm.leaseUpdate.Entries).then((res)=>{
            if(res){
              $mdDialog.hide(vm.assetToLease);
            }
            else{
              UtilityService.showAlert('error','something went wrong');
            }
          });
        }
      }
    }).controller('AssetStatusUpdateDialogController',function(dialogData, $scope, $mdDialog, UtilityService, StoreService){
      var vm = this;
      vm.updateMethod = 'batch';
      vm.leaseUpdate = dialogData.Details;
      vm.updateStatuses = dialogData.UpdateStatuses;

      vm.cancel = function () {
        $mdDialog.cancel();
      };

      const excelCols = [{
        AssetGroup: '',
        AssetSubGroup: '',
        Description: '',
        AssetCode: '',          
        AssetType: '',
        AssetBrand: '',
        AssetModel:'',
        AssetCapacity:'',
        AssetSerialNumber:'',
        EngineModel:'',
        EngineSerialNumber:'',
        FunctionalStatus:''
      }];

      vm.downloadTemlate = function(){
        UtilityService.exportToExcel('DailyEquipmentReport_template', excelCols);
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

      vm.submitUpdate = ()=>{
        if(vm.leaseUpdate.Entries && vm.leaseUpdate.Entries.length>0 && vm.leaseUpdate.UpdateDate){
          let errorList = [];

          vm.leaseUpdate.Entries.forEach(item => {
            if(item.FunctionalStatus == null){
                errorList.push(`Functional Status for ${item.Description} - ${item.AssetCode} is required.`);
            }
          });

          
          if(errorList.length>0){
            var parentEl = angular.element(document.querySelector('document.body'));

            var Newmsgalert = $mdDialog.alert({
               //parent: parentEl,
               //  targetEvent: $event,
               template:
               '<md-dialog aria-label="Sample Dialog">' +
               '  <md-content>' +
               '    <md-list>' +
               '      <md-item ng-repeat="item in vm.items track by $index">' +
               '       <p style="font-size:20px;">{{$index+1}} {{item}}</p>' +
               '      </md-item>' +
               '    </md-list>' +
               '  </md-content>' +
               '  <div class="md-actions">' +
               '    <md-button class="md-raised md-accent" ng-click="vm.closeDialog()">' +
               '      Ok Got it.' +
               '    </md-button>' +
               '  </div>' +
               '</md-dialog>',
               locals: {
                 items: errorList
               },
               controllerAs: 'vm',
               multiple:true,
               controller: 'EmptyDialogController'
            }).title("Incomplete/Incorrect Entry");
            $mdDialog
                .show(Newmsgalert)
                
                .finally(function () {
                  Newmsgalert = undefined;
                });
            return;
          }

          StoreService.CreateLeaseUpdate(vm.leaseUpdate).then((res)=>{
            if(res){
              vm.leaseUpdate = {};
              $mdDialog.hide();
            }
            else{
              UtilityService.showAlert('error','something went wrong');
            }
          });
        }
      }
    });
})();
