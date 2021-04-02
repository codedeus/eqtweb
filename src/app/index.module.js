(function() {
    'use strict';
    /**
     * Main module of the Fuse
     */
    angular
        .module('fuse', [
            // Core
            'app.core',
            // Navigation
            'app.navigation',
            // Toolbar
            'app.toolbar',
            // Quick panel
            'app.quick-panel',
            // Apps
           // 'app.patients',
           'app.dashboard',
           'app.settings',
           'app.assetregister',
           'app.subsidiarysetup',
           'app.locationsetup',
           'app.projectssetup',
           'app.assetgroup',
           'app.newlease',
           'app.assetbrand',
           'app.assettype',
           'app.assetdescription',
           'app.assetcapacity',
           'app.assetdimension',
           'app.assetmodel',
           'app.enginemodel',
           'app.enginetype',
           'app.dailyleaseupdate',
           'app.leaseInvoice',
            // Components
            //'app.components'
            //Third-party libraries
            'mdDataTable',
            'md.data.table',
            'moment-picker'
        ]).config(config);

        /** @ngInject */
        function config(msNavigationServiceProvider){
            msNavigationServiceProvider.saveItem('apps', {
                // title : 'MODULES',
                group: true,
                weight: 1
            });

            msNavigationServiceProvider.saveItem('apps.assetdescription',{
                title:'Asset Description',
                state:'app.assetdescription',
                icon:'icon-file'
            });  

            msNavigationServiceProvider.saveItem('apps.assetbrand',{
                title:'Asset Brand',
                state:'app.assetbrand',
                icon:'icon-file'
            });  

            msNavigationServiceProvider.saveItem('apps.assettype',{
                title:'Asset Type',
                state:'app.assettype',
                icon:'icon-file'
            });  

            msNavigationServiceProvider.saveItem('apps.assetcapacity',{
                title:'Asset Capacity',
                state:'app.assetcapacity',
                icon:'icon-file'
            });  

            msNavigationServiceProvider.saveItem('apps.assetdimension',{
                title:'Asset Dimension',
                state:'app.assetdimension',
                icon:'icon-file'
            });  

            msNavigationServiceProvider.saveItem('apps.assetmodel',{
                title:'Asset Model',
                state:'app.assetmodel',
                icon:'icon-file'
            });  

            msNavigationServiceProvider.saveItem('apps.enginemodel',{
                title:'Engine Model',
                state:'app.enginemodel',
                icon:'icon-file'
            });  

            msNavigationServiceProvider.saveItem('apps.enginetype',{
                title:'Engine Type',
                state:'app.enginetype',
                icon:'icon-file'
            });  
    
            msNavigationServiceProvider.saveItem('apps.assetgroup',{
                title:'Asset Group',
                state:'app.assetgroup',
                icon:'icon-file'
            });  

            msNavigationServiceProvider.saveItem('apps.assetregister',{
                title:'Asset Register',
                state:'app.assetregister',
                icon:'icon-pharmacy'
            });

            msNavigationServiceProvider.saveItem('apps.subsidiarysetup',{
                title:'Subsidiary Setup',
                state:'app.subsidiarysetup',
                icon:'icon-pharmacy'
            });

            msNavigationServiceProvider.saveItem('apps.locationsetup',{
                title:'Location Setup',
                state:'app.locationsetup',
                icon:'icon-pharmacy'
            });

            msNavigationServiceProvider.saveItem('apps.projectssetup',{
                title:'Project Setup',
                state:'app.projectssetup',
                icon:'icon-file'
            });   

            msNavigationServiceProvider.saveItem('apps.newlease',{
                title:'New Lease',
                state:'app.newlease',
                icon:'icon-file'
            });   

            msNavigationServiceProvider.saveItem('apps.dailyleaseupdate',{
                title:'Daily Lease Update',
                state:'app.dailyleaseupdate',
                icon:'icon-file'
            });  

            msNavigationServiceProvider.saveItem('apps.leaseInvoice',{
                title:'Lease Invoice',
                state:'app.leaseInvoice',
                icon:'icon-file'
            }); 
        }  
})();
