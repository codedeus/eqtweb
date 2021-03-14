(function(){
    'use strict';

    angular.module('app.subsidiarysetup',[])
    .config(config);

    function config($stateProvider){
        $stateProvider.state('app.subsidiarysetup',{
            url:'/subsidiarysetup',
            data:{
                role:'subsidiarysetup',
                name:'Subsidiary Setup'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/subsidiarysetup/subsidiarysetup.html',
                    controller:'SubsidiarySetupController as vm'
                }
            },
            bodyClass:'subsidiarysetup'
        });
    }
})();