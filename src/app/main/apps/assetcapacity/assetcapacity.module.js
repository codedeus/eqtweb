(function(){
    'use strict';

    angular.module('app.assetcapacity',[])
        .config(config);

    function config($stateProvider){
        $stateProvider.state('app.assetcapacity',{
            url:'/assetcapacity',
            data:{
                role:'assetcapacity',
                name:'Asset Capacity'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/assetcapacity/assetcapacity.html',
                    controller:'AssetCapacityController as vm'
                }
            },
            bodyClass:'assetcapacity'
        });
    }
})();