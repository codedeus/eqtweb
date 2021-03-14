(function (){
    'use strict';

    angular
        .module('app.settings.login', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider){
        // State
        $stateProvider.state('app.login', {
            url: '/login',
            data:{
                name:'Login'
            },
            views: {
                'main@': {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.login': {
                    templateUrl: 'app/main/apps/settings/login/login.html',
                    controller : 'LoginController as vm'
                }
            },
            bodyClass: 'login'
        });
        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/settings/login');
    }
})();
