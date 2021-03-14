(function(){
    'use strict';

    angular.module('app.subsidiarysetup').
      controller('SubsidiarySetupController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.subsidiary = {};
        vm.selectedSubsidiaries = [];
        vm.newSubsidiary = {};

        const GetAllSubsidiaries=()=>{
          StoreService.GetAllSubsidiaries().then((res)=>vm.subsidiaries = res);
        }

        GetAllSubsidiaries();

        vm.addNewSubsidiary = ()=>{
          StoreService.AddNewSubsidiary(vm.newSubsidiary).then(res=>{
            //vm.subsidiaries.push(res);
            GetAllSubsidiaries();
            vm.newSubsidiary = {};
            UtilityService.showAlert('success','saved successfully');
          });
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedSubsidiaries.length>0){
            StoreService.DeleteSubsidiaries(vm.selectedSubsidiaries).then(()=>{
              vm.selectedSubsidiaries = [];
              UtilityService.showAlert('success','deleted successfully');
              GetAllSubsidiaries();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
          UtilityService.editPropertyWithCb(event,row,col,function(input){
            row[col] = (input.$modelValue);
              StoreService.UpdateSubsidiary(row).then(()=>{
                UtilityService.showAlert('success','saved successfully');
              })
          });
        }
    })
})();
