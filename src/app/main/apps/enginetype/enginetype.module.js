(function(){
    'use strict';

    angular.module('app.enginetype',[])
        .config(config);

    function config($stateProvider){
        $stateProvider.state('app.enginetype',{
            url:'/enginetype',
            data:{
                role:'enginetype',
                name:'Engine Type'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/enginetype/enginetype.html',
                    controller:'EngineTypeController as vm'
                }
            },
            bodyClass:'enginetype'
        });
    }
})();