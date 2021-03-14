(function(){
    'use strict';

    angular.module('app.assetmodel',[])
        .config(config);

    function config($stateProvider){
        $stateProvider.state('app.assetmodel',{
            url:'/assetmodel',
            data:{
                role:'assetmodel',
                name:'Asset Model'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/assetmodel/assetmodel.html',
                    controller:'AssetModelController as vm'
                }
            },
            bodyClass:'assetmodel'
        });
    }
})();