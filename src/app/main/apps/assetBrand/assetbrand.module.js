(function(){
    'use strict';

    angular.module('app.assetbrand',[])
    .config(config);

    function config($stateProvider){
        $stateProvider.state('app.assetbrand',{
            url:'/assetbrand',
            data:{
                role:'assetbrand',
                name:'Asset Brand'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/assetBrand/assetbrand.html',
                    controller:'AssetBrandSetupController as vm'
                }
            },
            bodyClass:'assetbrand'
        });
    }
})();