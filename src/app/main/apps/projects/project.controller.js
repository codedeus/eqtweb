(function(){
    'use strict';

    angular.module('app.projectssetup').
      controller('ProjectSetupController',function($scope, StoreService,UtilityService){
        var vm = this;
        vm.newProject = {};
        vm.actionType = 'project';
        vm.selectedProjects = [];
        vm.selectedProjectSites = [];
        vm.projectSite = {};
        $scope.limitOptions = [10, 15, 25, 50, 100];

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

        const GetAllSubsidiaries=()=>{
            StoreService.GetAllSubsidiaries().then((res)=>vm.subsidiaries = res);
        }
  
        const GetLocations = () =>{
          StoreService.GetLocations().then(res=>vm.location = res);
        }

        const GetProjects =(subsidiaryId,locationId)=>{
          StoreService.GetProjects(subsidiaryId, locationId, (($scope.query.page - 1) * $scope.query.limit), $scope.query.limit).then((res)=>vm.project = res);
        }

        GetProjects();

        GetLocations();

        GetAllSubsidiaries();

        vm.GetLocations = GetLocations;
        vm.GetProjects = GetProjects;

        vm.selectedSubsidiaryChange = (subsidiaryId)=>{
          if(subsidiaryId){
            vm.subsidiaryProject = {};
            StoreService.GetProjects(subsidiaryId).then((res)=>vm.subsidiaryProject = res);
          }
        }

        const GetProjectSites = (projectId)=> {
          StoreService.GetProjectSites(projectId).then((res)=>vm.projectSites = res);
        }

        vm.selectedProjectChange = (projectId)=> {
          GetProjectSites(projectId);
        }

        vm.saveProject = ()=>{
            StoreService.AddProjects(vm.newProject).then((res)=>{
                vm.newProject = {};
                GetProjects();
                UtilityService.showAlert('success','saved successfully');
            })
        }

        vm.deleteRowCallback = ()=>{
          if(vm.selectedProjects.length>0){
            StoreService.DeleteProjects(vm.selectedProjects).then(()=>{
              vm.selectedProjects = [];
              UtilityService.showAlert('success','deleted successfully');
              GetProjects();
            });
          }
        }

        vm.editProperty =(event, row,col)=>{
            UtilityService.editPropertyWithCb(event,row,col,function(input){
                row[col] = (input.$modelValue);
                StoreService.UpdateLocation(row).then(()=>{
                    UtilityService.showAlert('success','saved successfully');
                })
            });
        }

        vm.openEditForm = (ev, item, itemIndex)=>{
          if(item && item.Id){
            //const itemToEdit = JSON.parse(JSON.stringify(item));
            const itemData = {
              Subsidiaries:vm.subsidiaries,
              Locations:vm.location.Locations,
              Project:JSON.parse(JSON.stringify(item))
            }
            UtilityService.showDialog(ev, 'editproject.html',itemData,'ProjectEditDialogController').then((res)=>{
              vm.project.Projects[itemIndex] = res;
              UtilityService.showAlert('success','updated successfully');
            });
          }
        }

        vm.saveProjectSite = ()=>{
          StoreService.AddProjectSite(vm.projectSite).then((res)=>{
            const projectId = vm.projectSite.ProjectId;
            GetProjectSites(projectId);
            vm.projectSite = {};
            UtilityService.showAlert('success','saved successfully');
          })
        }

        vm.deleteProjectSites=()=>{
          if(vm.selectedProjectSites.length>0){
            StoreService.DeleteProjectSites(vm.selectedProjectSites).then(()=>{
              vm.selectedProjectSites = [];
              UtilityService.showAlert('success','deleted successfully');
              GetProjectSites();
            });
          }
        }

        vm.openProjectSiteEditForm = (ev, item, itemIndex)=>{
          if(item && item.Id){
            const itemData = {
              Subsidiaries:vm.subsidiaries,
              ProjectSite:JSON.parse(JSON.stringify(item))
            }
            UtilityService.showDialog(ev, 'editprojectsite.html',itemData,'ProjectSiteEditDialogController').then((res)=>{
              vm.projectSites[itemIndex] = res;
              UtilityService.showAlert('success','updated successfully');
            });
          }
        }

      }).controller('ProjectEditDialogController',function(StoreService, $mdDialog, dialogData){
        var vm = this;

        vm.locations = dialogData.Locations;
        vm.subsidiaries = dialogData.Subsidiaries;
        vm.project = dialogData.Project

        vm.cancel = function () {
          $mdDialog.cancel();
        };

        vm.updateProject = () =>{
          if(vm.project && vm.project.Id){
            StoreService.UpdateProjects(vm.project).then((res)=>{
              $mdDialog.hide(res);
            });
          }
        }
      }).controller('ProjectSiteEditDialogController',function(StoreService, $mdDialog, dialogData, $scope){
        var vm = this;
        vm.subsidiaryProject = {};
        vm.subsidiaries = dialogData.Subsidiaries;
        vm.projectSite = dialogData.ProjectSite;

        
        const GetSubsidiaryProjects = (projectId)=>{
          StoreService.GetProjects(projectId).then((res)=>vm.subsidiaryProject = res);
        }

        GetSubsidiaryProjects(vm.projectSite.SubsidiaryId);

        vm.cancel = function () {
          $mdDialog.cancel();
        };

        vm.updateProjectSite = () =>{
          if(vm.projectSite && vm.projectSite.Id){
            StoreService.UpdateProjectSite(vm.projectSite).then((res)=>{
              $mdDialog.hide(res);
            });
          }
        }

        vm.selectedSubsidiaryChange = (subsidiaryId)=>{
          if(subsidiaryId){
            vm.subsidiaryProject = {};
            vm.projectSite.ProjectId = null;
            GetSubsidiaryProjects(subsidiaryId);
          }
        }
      })
})();
