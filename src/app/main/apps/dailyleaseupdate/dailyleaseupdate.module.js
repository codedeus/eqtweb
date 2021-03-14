(function(){
    'use strict';

    angular.module('app.dailyleaseupdate',[])
        .config(config);

    function config($stateProvider){
        $stateProvider.state('app.dailyleaseupdate',{
            url:'/dailyleaseupdate',
            data:{
                role:'dailyleaseupdate',
                name:'Daily Lease Update'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/dailyleaseupdate/dailyleaseupdate.html',
                    controller:'DailyLeaseUpdateController as vm'
                }
            },
            bodyClass:'dailyleaseupdate'
        });
    }
})();