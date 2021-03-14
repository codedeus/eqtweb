(function(){
    'use strict';

    angular.module('app.assetdimension',[])
        .config(config);

    function config($stateProvider){
        $stateProvider.state('app.assetdimension',{
            url:'/assetdimension',
            data:{
                role:'assetdimension',
                name:'Asset Dimension'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/assetdimension/assetdimension.html',
                    controller:'AssetDimensionController as vm'
                }
            },
            bodyClass:'assetdimension'
        });
    }
})();