(function(){
    'use strict';

    angular.module('app.assetgroup',[])
    .config(config);

    function config($stateProvider){
        $stateProvider.state('app.assetgroup',{
            url:'/assetgroup',
            data:{
                role:'assetgroup',
                name:'Asset Group'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/assetgroup/assetgroup.html',
                    controller:'AssetGroupController as vm'
                }
            },
            bodyClass:'assetgroup'
        });
    }
})();