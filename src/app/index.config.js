(function () {
    'use strict';

    angular
        .module('fuse')
        .config(httpConfig)
        .config(exceptionConfig)
        .config(['momentPickerProvider', function (momentPickerProvider) {
          momentPickerProvider.options({
            minutesStep:	1,
            minutesFormat: 'mm',
            hoursPerLine: 6,
            // // Hour View	            // Hour View
            // minutesStep: 5,	          //  minutesStep: 5,
            // minutesStart: 0,	            minutesStart: 0,
            // minutesEnd: 59,	            minutesEnd: 59,
            minutesPerLine: 6,
            // // Minute View	            // Minute View
            // secondsFormat: 'ss',	            secondsFormat: 'ss',
            // secondsStep: 1,	            secondsStep: 1,
            // secondsStart: 0,	            secondsStart: 0,
            // secondsEnd: 59	            secondsEnd: 59,
            secondsPerLine: 6
          });
        }])
        .config(baseApiConfig);

    exceptionConfig.$inject = ['$provide'];

    function exceptionConfig($provide) {
        $provide.decorator('$exceptionHandler', extendExceptionHandler);
        //$provide.decorator('$mdDialog',$mdDialog);
    }
    extendExceptionHandler.$inject = ['$delegate','$injector'];

    function extendExceptionHandler($delegate,$injector) {

      return function(exception, cause) {
        $delegate(exception, cause);
        var errorData = {
            exception: exception,
            cause: cause
        };
        /**
         * Could add the error to a service's collection,
         * add errors to $rootScope, log errors to remote web server,
         * or log locally. Or throw hard. It is entirely up to you.
         * throw exception;
         */
        var $rootScope = $injector.get('$rootScope');
        $rootScope.processingRequest = false;
        if ((typeof process !== 'undefined') && (process.release.name.search(/node|io.js/) !== -1)) {
          const fs = require('fs');
          const path = require('path');
          const os = require('os');

          const homeDir = os.homedir();
          var homeFolder = path.join(homeDir,'Hmis');
          var logDir = path.join(homeFolder, 'logs');
          
          if (!fs.existsSync(homeFolder)) {
              fs.mkdirSync(homeFolder, { recursive: true });
          }

          if (!fs.existsSync(logDir)) {
              fs.mkdirSync(logDir, { recursive: true });
          }
          var datetime = new Date();
          var fileName = '/log-'+datetime.toDateString()+'.txt';
          logDir = path.join(logDir,fileName);

          var logger = fs.createWriteStream(logDir, {
            flags: 'a' // 'a' means appending (old data will be preserved)
          });

          logger.write(new Date() +"------- "+exception.stack+"\n \n \n \n");
          logger.end();
        }

        else{
          // toastr.options = {
          //   "closeButton": true,
          //   "positionClass": "toast-top-right",
          //   "timeOut": 0,
          //   "extendedTimeOut": 0,
          //   "tapToDismiss": false
          // }
          // toastr.error(exception.stack, 'Error Occured!');

          toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-bottom-left",
            "preventDuplicates": false,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": 0,
            "extendedTimeOut": 0,
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut",
            "tapToDismiss": false
          }
          //toastr["error"]( "<br/>"+ exception.message, "Error Occured");

        }
      };
    }

    function httpConfig($httpProvider){
      $httpProvider.interceptors.push('AuthInterceptor');
    }

    function baseApiConfig($provide, $windowProvider,HmisConstants) {
      let baseUrl = '';
      if ((typeof process !== 'undefined') && (process.release.name.search(/node|io.js/) !== -1)) {
        HmisConstants.SignalRUrl = HmisConstants.baseApiUrl;
        baseUrl = `${HmisConstants.baseApiUrl}/api/`;
      } else {
      //`baseUrl` is set according to the server that has served up the code
      var $window = $windowProvider.$get();
      let baseIp = $window.location.hostname;
      let protocol = $window.location.protocol;
        if(protocol=='https:'){
          HmisConstants.SignalRUrl = `${protocol}//api.${baseIp}${HmisConstants.port}`
          baseUrl = `${HmisConstants.SignalRUrl}/api/`;
          
        }
        else{
          HmisConstants.SignalRUrl = `${protocol}//${baseIp}${HmisConstants.port}${HmisConstants.instanceName}`
          baseUrl = `${HmisConstants.SignalRUrl}/api/`;
        }
      }
      $provide.value('baseApiUrl', baseUrl);
    }

    // // api url prefix
    // var API_URL ='http://localhost:8000/';
    // // 'https://apis.healthstation.ng/';

    // function apiInterceptor ($q) {
    //   return {
    //     request: function (config) {
    //       var url = config.url;

    //       // ignore template requests
    //       if (url.substr(url.length - 5) == '.html' || url.substr(url.length - 4) == '.svg' || url.substr(url.length - 5) == '.json') {
    //         return config || $q.when(config);
    //       }

    //       config.url = API_URL + config.url;
    //       return config || $q.when(config);
    //     }
    //   }
    // }



})();
