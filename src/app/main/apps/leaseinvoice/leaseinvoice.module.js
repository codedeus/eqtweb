(function(){
    'use strict';

    angular.module('app.leaseInvoice',[])
        .config(config);

    function config($stateProvider){
        $stateProvider.state('app.leaseInvoice',{
            url:'/leaseInvoice',
            data:{
                role:'leaseInvoice',
                name:'Lease Invoice'
            },
            views:{
                'content@app':{
                    templateUrl:'app/main/apps/leaseinvoice/leaseinvoice.html',
                    controller:'LeaseInvoiceController as vm'
                }
            },
            bodyClass:'leaseInvoice'
        });
    }
})();