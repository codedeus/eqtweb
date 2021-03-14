
(function (){
    'use strict';
  
    angular
        .module('fuse')
        .filter('mathPow', function () {
            return function (base, exponent) {
                return Math.pow(base, exponent);
            }
        });
})();