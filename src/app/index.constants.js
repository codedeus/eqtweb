(function() {
    'use strict';
    angular
        .module('fuse').constant('HmisConstants', {
            //port: ':5000',
            //instanceName: '', 
            port: '',
            instanceName:'/eqtApi', 

            naira: "₦",
            monthNames: ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ],

            saltRounds: 10,
            allModules: [
            
            ]
        });
})();
