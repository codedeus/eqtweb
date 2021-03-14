(function(){
    'use strict';

    angular.module('app.newlease',[])
    .config(config);

    function config($stateProvider){
        $stateProvider.state('app.newlease',{
            url:'/newlease',
            data:{
                role:'newlease',
                name:'New Lease'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/newlease/newlease.html',
                    controller:'NewLeaseController as vm'
                }
            },
            bodyClass:'newlease'
        });
    }
})();