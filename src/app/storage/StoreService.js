(function() {
    'use strict';
    angular.module('fuse')
        .factory('StoreService', StoreService);
 
    StoreService.$inject = ['$http', '$q', 'HmisConstants', '$rootScope', '$mdDialog', '$state', '$window', 'baseApiUrl'];

    function StoreService($http, $q, HmisConstants, $rootScope, $mdDialog, $state, $window, baseApiUrl) {

        if (window.JSON && !window.JSON.dateParser) {
            var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
            var reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;
            var reISOUpdated = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:Z|(\+|-)([\d|:]*))?$/;
            JSON.dateParser = function(key, value) {
                if (typeof value === 'string') {
                    var a = reISO.exec(value);
                    if (a) {
                        return new Date(value);
                    }

                    a = reISOUpdated.exec(value);
                    if (a) {
                        return new Date(value);
                    }

                    a = reMsAjax.exec(value);
                    if (a) {
                        var b = a[1].split(/[-+,.]/);
                        return new Date(b[0] ? +b[0] : 0 - +b[1]);
                    }
                }
                return value;
            };
        } 

        HmisConstants.baseApiUrl = baseApiUrl;

        function networkError(message) {
            $rootScope.processingRequest = false;
            var errorMsg = "";

            switch (message.status) {
                case 400:
                    errorMsg = message.data;
                    break;
                case 401:
                    errorMsg = "Unauthorized User. Please kindly login to proceed";
                    delete localStorage.authToken;
                    $state.go('app.login');
                    break;
                case 500:
                    errorMsg = "oops. something has gone wrong. please contact admin"
                    break;
                default:
                    errorMsg = 'Server not reachable. Check your internet settings or contact your network admin';
                    break;
            }

            $mdDialog.show(
                $mdDialog.alert()
                .title('error!')
                .multiple(true)
                .textContent(errorMsg)
                .ariaLabel('Alert Dialog')
                .ok('Got It!'));
        }

        function createGuid() {
            var d = new Date().getTime();
            if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
                d += performance.now(); //use high-precision timer if available
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }

        const GetAllAssets =(skip, limit,assetGroupId,
            assetSubGroupId,
            assetBrandId,
            assetTypeId,
            assetModelId,
            assetCapacityId,
            assetDimensionId,
            engineTypeId,
            engineModelId,
            assetDescriptionId)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}AssetItem`,{params:{skip, limit,assetGroupId,
                assetSubGroupId,
                assetBrandId,
                assetTypeId,
                assetModelId,
                assetCapacityId,
                assetDimensionId,
                engineTypeId,
                engineModelId,
                assetDescriptionId}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateAssets =(assetItem)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetItem/${assetItem.Id}/update`, assetItem).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const AddNewAssetItem = (assetItem)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetItem`, assetItem).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const VerifyUser=(username, password)=> {
            var deferred = $q.defer();
            var payload = {
                Email: username,
                Password: password
            }
            $rootScope.processingRequest = true;
            $http.post(HmisConstants.baseApiUrl + 'auth/login', payload).then(function(items) {
                items = JSON.parse(JSON.stringify(items.data), JSON.dateParser);
                $rootScope.processingRequest = false;
                deferred.resolve(items);
            }, networkError);
            return deferred.promise;
        }

        const DeleteAssetItems =(itemIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetItem/delete`, itemIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SearchForAssetItems =(searchText)=>{
            const deferred = $q.defer();
            //$rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}AssetItem/search`, {params:{searchText}}).then(res=>{
                //$rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetAllSubsidiaries = () =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}Subsidiary`).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const AddNewSubsidiary = (assetItem)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}Subsidiary`, assetItem).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteSubsidiaries =(itemIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}Subsidiary/delete`, itemIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateSubsidiary =(subsidiaryItem)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}Subsidiary/${subsidiaryItem.Id}/update`, subsidiaryItem).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetLocations = (skip, limit)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}locations`,{params:{skip, limit}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SaveNewLocation = ( newLocation)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}locations`, newLocation).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateLocation = (location) =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}locations/${location.Id}/update`, location).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteLocations =(locationIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}locations/delete`, locationIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const AddProjects =(project)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}projects`, project).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetProjects = (subsidiaryId, locationId, skip, limit)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}projects`,{params:{subsidiaryId, locationId, skip, limit }}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteProjects =(projectIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}projects/delete`, projectIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateProjects = (project) =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}projects/${project.Id}/update`, project).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetAssetGroups = (skip, limit)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}AssetGroup`,{params:{skip, limit}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetAssetSubGroups=(skip, limit, groupId)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}AssetGroup/${groupId}/subgroups`,{params:{skip, limit}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SaveNewAssetGroup = ( newgroup)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetGroup`, newgroup).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateAssetGroup = (assetgroup) =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetGroup/${assetgroup.Id}/update`, assetgroup).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteAssetGroups =(groupIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetGroup/delete`, groupIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const BatchUploadAssetItems=(payload)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetItem/batch`, payload).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetAssetBrands = (skip, limit)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}AssetBrand`,{params:{skip, limit}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SaveNewAssetBrand = ( newLocation)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetBrand`, newLocation).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateAssetBrand = (location) =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetBrand/${location.Id}/update`, location).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteAssetBrands =(locationIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetBrand/delete`, locationIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetAssetTypes = (skip, limit)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}AssetType`,{params:{skip, limit}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SaveNewAssetType = ( newLocation)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetType`, newLocation).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateAssetType = (location) =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetType/${location.Id}/update`, location).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteAssetTypes =(locationIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetType/delete`, locationIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetAssets = (skip, limit)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}Asset`,{params:{skip, limit}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SaveNewAsset = ( asset)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}Asset`, asset).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateAsset = (asset) =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}asset/${asset.Id}/update`, asset).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteAssets =(assetIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}Asset/assetIds`, locationIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetAssetCapacities = (skip, limit)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}AssetCapacity`,{params:{skip, limit}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SaveNewAssetCapacity = ( newLocation)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetCapacity`, newLocation).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateAssetCapacity = (location) =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetCapacity/${location.Id}/update`, location).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteAssetCapacities =(locationIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetCapacity/delete`, locationIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetAssetDimensions = (skip, limit)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}AssetDimension`,{params:{skip, limit}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SaveNewAssetDimension = ( newLocation)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetDimension`, newLocation).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateAssetDimension = (location) =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetDimension/${location.Id}/update`, location).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteAssetDimensions =(locationIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetDimension/delete`, locationIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetAssetModels = (skip, limit)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}AssetModel`,{params:{skip, limit}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SaveNewAssetModel = ( newLocation)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetModel`, newLocation).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateAssetModel = (location) =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetModel/${location.Id}/update`, location).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteAssetModels =(locationIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetModel/delete`, locationIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetEngineModels = (skip, limit)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}EngineModel`,{params:{skip, limit}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SaveNewEngineModel = ( newLocation)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}EngineModel`, newLocation).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateEngineModel = (location) =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}EngineModel/${location.Id}/update`, location).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteEngineModels =(locationIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}EngineModel/delete`, locationIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetEngineTypes = (skip, limit)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}EngineType`,{params:{skip, limit}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SaveNewEngineType = ( newLocation)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}EngineType`, newLocation).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateEngineType = (location) =>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}EngineType/${location.Id}/update`, location).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteEngineTypes =(locationIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}EngineType/delete`, locationIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const AddProjectSite =(projectsite)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}projects/${projectsite.ProjectId}/projectsites`, projectsite).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetProjectSites =(projectId)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}projects/${projectId}/projectsites`).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const DeleteProjectSites =(siteIds)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}projects/projectsites/delete`, siteIds).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateProjectSite =(projectSite)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}projects/projectsites/${projectSite.Id}/update`, projectSite).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }
        
        const SearchForAssets =(searchText)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}Asset/search`, {params:{searchText}}).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SubmitNewLeaseDetails =(payload)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetLease/new`, payload).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const UpdateLeaseDetails =(payload)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}AssetLease/update`, payload).then(res=>{
                $rootScope.processingRequest = false;
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const SearchForLeaseNumber =(searchText)=>{
            const deferred = $q.defer();
            $http.get(`${HmisConstants.baseApiUrl}AssetLease/search`, {params:{searchText}}).then(res=>{
                deferred.resolve(res.data);
            });
            return deferred.promise;
        }

        const GetLeaseDetailsForEdit =(leaseId)=>{
            const deferred = $q.defer();
            $http.get(`${HmisConstants.baseApiUrl}AssetLease/${leaseId}/edit`).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                deferred.resolve(res);
            });
            return deferred.promise;
        }

        const GetLeaseUpdates =(leaseId)=>{
            const deferred = $q.defer();
            $http.get(`${HmisConstants.baseApiUrl}LeaseUpdate/leases/${leaseId}/updates`).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                deferred.resolve(res);
            });
            return deferred.promise;
        }

        const GetLeaseEntriesForUpdate =(leaseId)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}LeaseUpdate/leases/${leaseId}`).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                $rootScope.processingRequest = false;
                deferred.resolve(res);
            });
            return deferred.promise;
        }
        

        const GetLeaseUpdateDetails =(leaseUpdateId)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}LeaseUpdate/${leaseUpdateId}`).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                $rootScope.processingRequest = false;
                deferred.resolve(res);
            });
            return deferred.promise;
        }
        
        const UpdateLeaseUpdateStatus =(leaseUpdateId, payload)=>{
            const deferred = $q.defer();
            $http.post(`${HmisConstants.baseApiUrl}LeaseUpdate/${leaseUpdateId}/update`,payload).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                deferred.resolve(res);
            });
            return deferred.promise;
        }

        const CreateLeaseUpdate =(leaseUpdateId, payload)=>{
            const deferred = $q.defer();
            $http.post(`${HmisConstants.baseApiUrl}LeaseUpdate/leases/${leaseUpdateId}/updates`,payload).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                deferred.resolve(res);
            });
            return deferred.promise;
        }

        const AssetLeaseExcelUpdate =(leaseUpdateId, payload)=>{
            const deferred = $q.defer();
            $http.post(`${HmisConstants.baseApiUrl}LeaseUpdate/leases/${leaseUpdateId}/excel-updates`,payload).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                deferred.resolve(res);
            });
            return deferred.promise;
        }

        const GetLeaseInvoices =(leaseId)=>{
            const deferred = $q.defer();
            $http.get(`${HmisConstants.baseApiUrl}invoice/leases/${leaseId}/invoices`).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                deferred.resolve(res);
            });
            return deferred.promise;
        }

        const GetLeaseDetailsForInvoicing =(leaseId, startDate, endDate)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}invoice/leases/${leaseId}`,{params:{startDate, endDate}}).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                $rootScope.processingRequest = false;
                deferred.resolve(res);
            });
            return deferred.promise;
        }

        const SearchForInvoices =(searchText)=>{
            const deferred = $q.defer();
            $http.get(`${HmisConstants.baseApiUrl}invoice/search`,{params:{searchText}}).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                deferred.resolve(res);
            });
            return deferred.promise;
        }

        const GetInvoiceDetail =(invoiceId)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.get(`${HmisConstants.baseApiUrl}invoice/${invoiceId}`).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                $rootScope.processingRequest = false;
                deferred.resolve(res);
            });
            return deferred.promise;
        }

        const CreateInvoice =(payload)=>{
            const deferred = $q.defer();
            $rootScope.processingRequest = true;
            $http.post(`${HmisConstants.baseApiUrl}invoice`,payload).then(res=>{
                res = JSON.parse(JSON.stringify(res.data), JSON.dateParser);
                $rootScope.processingRequest = false;
                deferred.resolve(res);
            });
            return deferred.promise;
        }

        var service = {
            GetAllAssets,
            UpdateAssets,
            AddNewAssetItem,
            VerifyUser,
            DeleteAssetItems,
            SearchForAssetItems,
            GetAllSubsidiaries,
            AddNewSubsidiary,
            DeleteSubsidiaries,
            UpdateSubsidiary,
            GetLocations,
            SaveNewLocation,
            UpdateLocation,
            DeleteLocations,
            AddProjects,
            GetProjects,
            DeleteProjects,
            UpdateProjects,
            UpdateAssetGroup,
            SaveNewAssetGroup,
            DeleteAssetGroups,
            GetAssetGroups,
            SubmitNewLeaseDetails,
            BatchUploadAssetItems,
            GetAssetSubGroups,
            GetAssetBrands,
            UpdateAssetBrand,
            DeleteAssetBrands,
            SaveNewAssetBrand,
            GetAssetTypes,
            UpdateAssetType,
            DeleteAssetTypes,
            SaveNewAssetType,
            GetAssets,
            UpdateAsset,
            DeleteAssets,
            SaveNewAsset,
            GetAssetCapacities,
            UpdateAssetCapacity,
            DeleteAssetCapacities,
            SaveNewAssetCapacity,
            SaveNewAssetDimension,
            DeleteAssetDimensions,
            GetAssetDimensions,
            UpdateAssetDimension,
            SaveNewAssetModel,
            DeleteAssetModels,
            GetAssetModels,
            UpdateAssetModel,
            SaveNewEngineModel,
            DeleteEngineModels,
            GetEngineModels,
            UpdateEngineModel,
            SaveNewEngineType,
            DeleteEngineTypes,
            GetEngineTypes,
            UpdateEngineType,
            AddProjectSite,
            GetProjectSites,
            DeleteProjectSites,
            UpdateProjectSite,
            SearchForAssets,
            SearchForLeaseNumber,
            GetLeaseDetailsForEdit,
            UpdateLeaseDetails,
            GetLeaseUpdates,
            GetLeaseUpdateDetails,
            UpdateLeaseUpdateStatus,
            GetLeaseEntriesForUpdate,
            AssetLeaseExcelUpdate,
            CreateLeaseUpdate,
            CreateInvoice,
            GetInvoiceDetail,
            SearchForInvoices,
            GetLeaseInvoices,
            GetLeaseDetailsForInvoicing
        };
        return service;
    }
})();
