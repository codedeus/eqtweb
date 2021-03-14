(function(){
    'use strict';

    angular.module('app.assetregister',[])
    .config(config);

    function config($stateProvider){
        $stateProvider.state('app.assetregister',{
            url:'/assetregister',
            data:{
                role:'assetregister',
                name:'Asset Register'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/assetregister/assetregister.html',
                    controller:'AssetItemController as vm'
                }
            },
            bodyClass:'assetregister'
        });
    }
})();