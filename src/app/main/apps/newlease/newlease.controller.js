(function(){
    'use strict';

    angular.module('app.newlease')
        .controller('NewLeaseController', NewLeaseController)
        .controller('NewLeaseDialogController', NewLeaseDialogController);

        function NewLeaseController(StoreService, $mdDialog, UtilityService, $q){
            var vm = this;
            vm.actionType = 'new';
            setDefauls();

            const GetAllSubsidiaries=()=>{
                StoreService.GetAllSubsidiaries().then((res)=>vm.subsidiaries = res);
            }

            GetAllSubsidiaries();

            vm.selectedProjectChange = (projectId)=> {
                StoreService.GetProjectSites(projectId).then((res)=>vm.projectSites = res);
            }

            vm.actionTypeChanged =()=> setDefauls();

            vm.searchForAssetItems = function (searchText) {
                if (searchText != undefined) {
                  return StoreService.SearchForAssetItems(searchText).then(
                    function (items) {
                      return items;
                    });
                }
            };

            vm.SearchForLeaseNumber = function (searchText) {
                if (searchText != undefined) {
                  return StoreService.SearchForLeaseNumber(searchText).then(
                    function (items) {
                      return items;
                    });
                }
            };

            vm.selectedAssetChange = (item)=>{
                if(item){

                    if(item.CurrentStatus!="Available"){
                        UtilityService.showMessage('sorry', 'item is not currently available');
                        vm.selectedItem = null;
                        return;
                    }

                    vm.assetToLease.AssetId = item.Id;
                    vm.assetToLease.Code = item.Code;
                    // vm.assetToLease.AssetGroup = item.AssetGroup;
                    // vm.assetToLease.AssetGroupId = item.AssetGroupId;
                    vm.assetToLease.Number = item.Number;
                    vm.assetToLease.LeaseCost = item.LeaseCost;
                    vm.assetToLease.AssetName = item.AssetName;
                }
            }

            vm.addAssetToList = ()=>{
                var toAdd = true;
                if(vm.assetToLease){
                    for (var i = 0; i < vm.newLease.AssetList.length; i++) {
                        if (vm.newLease.AssetList[i].AssetId == vm.assetToLease.AssetId) {
                            toAdd = false;
                            break;
                        }
                    }
                    if (toAdd) {        
                        vm.assetToLease.ProjectSiteId = vm.selectedProjectSite.Id;
                        vm.assetToLease.ProjectSite = vm.selectedProjectSite.SiteName;
                        vm.assetToLease.ExpectedLeaseOutDate = new Date();
                        vm.newLease.AssetList.push(vm.assetToLease);
                    }
                    vm.selectedItem = null;
                    vm.assetToLease = {};
                    vm.selectedProjectSite = null;
                }
            }

            vm.removeItemsFromTable = (items) => {
                angular.forEach(items, function(item) {
                  var index = vm.newLease.AssetList.indexOf(item);
                  vm.newLease.AssetList.splice(index, 1);
                });
                vm.selectedItems = [];
            }

            vm.selectedSubsidiaryChange = (subsidiaryId)=>{
                StoreService.GetProjects(subsidiaryId).then((res)=>vm.project = res);
            }

            vm.submitData = ()=>{
                let errorList = [];

                vm.newLease.AssetList.forEach(item => {
                    if(item.ExpectedReturnDate==null || UtilityService.dateTimeParse(item.ExpectedReturnDate) == null){
                        errorList.push(`Expected Return Date for ${item.AssetName} - ${item.Code} is required/not valid`);
                    }

                    if(item.ExpectedLeaseOutDate==null || UtilityService.dateTimeParse(item.ExpectedLeaseOutDate)==null){
                        errorList.push(`Expected Lease Out Date for ${item.AssetName} - ${item.Code} is required/not valid`);
                    }
                });

                if(errorList.length>0){
                    var parentEl = angular.element(document.querySelector('md-content'));

                    var msgalert = $mdDialog.alert({
                       parent: parentEl,
                       //  targetEvent: $event,
                       template:
                       '<md-dialog aria-label="Sample Dialog">' +
                       '  <md-content>' +
                       '    <md-list>' +
                       '      <md-item ng-repeat="item in vm.items track by $index">' +
                       '       <p>{{$index+1}} {{item}}</p>' +
                       '      </md-item>' +
                       '    </md-list>' +
                       '  </md-content>' +
                       '  <div class="md-actions">' +
                       '    <md-button ng-click="vm.closeDialog()">' +
                       '      Ok Got it.' +
                       '    </md-button>' +
                       '  </div>' +
                       '</md-dialog>',
                       locals: {
                         items: errorList
                       },
                       bindToController: true,
                       controllerAs: 'vm',
                       items:errorList,
                       dialogData:errorList,
                       controller: 'EmptyDialogController'
                    }).title("Incomplete/Incorrect Entry");
                    $mdDialog
                        .show(msgalert)
                        .finally(function () {
                            msgalert = undefined;
                        });
                    return;
                }

                if(vm.actionType == 'new'){
                    StoreService.SubmitNewLeaseDetails(vm.newLease).then((leaseNumber)=>{
                        UtilityService.showMessage('success',`Submitted successfully. The Lease Number is ${leaseNumber}`);
                        setDefauls();
                    });
                }
                else{
                    StoreService.UpdateLeaseDetails(vm.newLease).then((success)=>{
                        if(success){
                            UtilityService.showMessage('success',`updated successfully`);
                            setDefauls();
                        }
                    });
                }
            }

            vm.editProperty = function(event, item, property) {
                UtilityService.editPropertyWithCb(event,item,property,function(input){
                    if (!input.$modelValue || input.$modelValue < 0 || isNaN(input.$modelValue)) {
                        input.$invalid = true;
                        return $q.reject();
                    }
                    item[property] = Number(input.$modelValue)
                });
            };

            vm.selectedLeaseNumberChange =(lease)=>{
                if(lease){
                    vm.selectedSubsidiaryChange(lease.SubsidiaryId);
                    vm.selectedProjectChange(lease.ProjectId);
                    StoreService.GetLeaseDetailsForEdit(lease.Id).then((res)=>{
                        vm.newLease = res;
                    });
                }
            }

            function setDefauls(){
                vm.project = {};
                vm.selectedItems = [];
                vm.assetToLease = {};
                vm.newLease = {};
                vm.newLease.AssetList = [];
            }

            vm.openEditForm = (ev, item, itemIndex)=>{
                if(item && item.AssetId){
                  const itemToEdit = JSON.parse(JSON.stringify(item),JSON.dateParser);
                  const projectSites = vm.projectSites;
                  const itemData = {
                    LeaseDetails: itemToEdit,
                    ProjectSites: projectSites
                  }
                  UtilityService.showDialog(ev, 'editassetlease.html', itemData, 'NewLeaseDialogController').then((res)=>{
                    vm.newLease.AssetList[itemIndex] = res;
                  });
                }
            }

            
        }

        function NewLeaseDialogController($mdDialog, dialogData){
            var vm = this;

            vm.projectSites = dialogData.ProjectSites;
            vm.assetToLease = dialogData.LeaseDetails;

            vm.selectedProjectSite = {
                SiteName:vm.assetToLease.ProjectSite,
                Id:vm.assetToLease.ProjectSiteId
            };

            vm.closeDialog = function () {
                $mdDialog.cancel();
            };

            vm.cancel = function () {
                $mdDialog.cancel();
            };

            vm.updateLeaseDetails = () =>{
                if(vm.assetToLease && vm.assetToLease.AssetId){
                    vm.assetToLease.ProjectSite = vm.selectedProjectSite.SiteName;
                    vm.assetToLease.ProjectSiteId = vm.selectedProjectSite.Id;
                    $mdDialog.hide(vm.assetToLease);
                }
            }
        }
})();