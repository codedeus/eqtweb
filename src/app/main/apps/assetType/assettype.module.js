(function(){
    'use strict';

    angular.module('app.assettype',[])
        .config(config);

    function config($stateProvider){
        $stateProvider.state('app.assettype',{
            url:'/assettype',
            data:{
                role:'assettype',
                name:'Asset Type'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/assetType/assettype.html',
                    controller:'AssetTypeSetupController as vm'
                }
            },
            bodyClass:'assettype'
        });
    }
})();