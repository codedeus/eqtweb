(function(){
    'use strict';

    angular.module('app.locationsetup',[])
    .config(config);

    function config($stateProvider){
        $stateProvider.state('app.locationsetup',{
            url:'/locationsetup',
            data:{
                role:'locationsetup',
                name:'Location Setup'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/locationsetup/locationsetup.html',
                    controller:'LocationSetupController as vm'
                }
            },
            bodyClass:'locationsetup'
        });
    }
})();