(function(){
    'use strict';

    angular.module('app.assetdescription',[])
        .config(config);

    function config($stateProvider){
        $stateProvider.state('app.assetdescription',{
            url:'/assetdescription',
            data:{
                role:'assetdescription',
                name:'Asset Description'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/assetdescription/assetdescription.html',
                    controller:'AssetDescriptionController as vm'
                }
            },
            bodyClass:'assetdescription'
        });
    }
})();