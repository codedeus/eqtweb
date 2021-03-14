(function(){
    'use strict';

    angular.module('app.enginemodel',[])
        .config(config);

    function config($stateProvider){
        $stateProvider.state('app.enginemodel',{
            url:'/enginemodel',
            data:{
                role:'enginemodel',
                name:'Engine Model'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/enginemodel/enginemodel.html',
                    controller:'EngineModelController as vm'
                }
            },
            bodyClass:'enginemodel'
        });
    }
})();