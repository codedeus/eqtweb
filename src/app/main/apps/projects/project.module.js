(function(){
    'use strict';

    angular.module('app.projectssetup',[])
    .config(config);

    function config($stateProvider){
        $stateProvider.state('app.projectssetup',{
            url:'/projectssetup',
            data:{
                role:'projectssetup',
                name:'Project Setup'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/projects/project.html',
                    controller:'ProjectSetupController as vm'
                }
            },
            bodyClass:'projectssetup'
        });
    }
})();