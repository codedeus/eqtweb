(function (){
    'use strict';
    angular
      .module('fuse').constant('TableConstants',{
        Query: {
            limit: 10,
            page: 1
        },
        LimitOptions : [10, 15,25,50,100],
        Options : {
          rowSelection: true,
          multiSelect: true,
          autoSelect: true,
          decapitate: false,
          largeEditDialog: false,
          boundaryLinks: false,
          limitSelect: true,
          pageSelect: true
        }
      });
  })();
  