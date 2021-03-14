(function (){
    'use strict';
  
    angular
        .module('fuse')
        .directive('confirmPwd', function($interpolate, $parse) {
          return {
              require: 'ngModel',
              link: function(scope, elem, attr, ngModelCtrl) {
  
                  var pwdToMatch = $parse(attr.confirmPwd);
                  var pwdFn = $interpolate(attr.confirmPwd)(scope);
  
                  scope.$watch(pwdFn, function(newVal) {
                      ngModelCtrl.$setValidity('password', ngModelCtrl.$viewValue == newVal);
                  });
  
                  ngModelCtrl.$validators.password = function(modelValue, viewValue) {
                      var value = modelValue || viewValue;
                      return value == pwdToMatch(scope);
                  };
              }
          }
      })
        .directive('draggable', function() {
            return {
                // A = attribute, E = Element, C = Class and M = HTML Comment
                restrict: 'A',
                //The link function is responsible for registering DOM listeners as well as updating the DOM.
                link: function(scope, element, attrs) {
                    element.draggable({
                        stop: function(event, ui) {
                        
                            event.stopPropagation();
                        }
                    });
                }
            };
        }).directive('importFromExcel', importFromExcel)
        .directive('uppercased',function(){
          return{
            require:'ngModel',
            link:function(scope,element,attrs,modelCtrl){
              modelCtrl.$parsers.push(function(input){
                return input?input.toUpperCase():"";
              });
              element.css("text-transform","uppercase");
            }
          }
        }).directive('twoDecimal', function () {
          return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
  
              ngModel.$formatters.push(function(value) {
                return Math.round(value * 100) / 100;
              });
  
            }
          }
        }).directive('ngFileModel', ['$parse', function ($parse) {
          return {
              restrict: 'A',
              link: function (scope, element, attrs) {
          
                  var model = $parse(attrs.ngFileModel);
                  var isMultiple = attrs.multiple;
                  var modelSetter = model.assign;
                  element.bind('change', function () {
                      var values = [];
                      
                      angular.forEach(element[0].files, function (item) {
                          var value = item;
                          values.push(value);
                      });
                      scope.$apply(function () {
  
                          if (isMultiple) {
                              modelSetter(scope, values);
                          } else {
                              modelSetter(scope, values[0]);
                          }
                      });
                  });
              }
          };
      }])
      .directive('currencyInput', function($filter, $browser) {
          return {
              require: 'ngModel',
              link: function($scope, $element, $attrs, ngModelCtrl) {
                  var listener = function() {
                      var value = $element.val().replace(/,/g, '')
                      $element.val($filter('number')(value, false))
                  }
                  
                  // This runs when we update the text field
                  ngModelCtrl.$parsers.push(function(viewValue) {
                      return viewValue.replace(/,/g, '');
                  })
                  
                  // This runs when the model gets updated on the scope directly and keeps our view in sync
                  ngModelCtrl.$render = function() {
                      $element.val($filter('number')(ngModelCtrl.$viewValue, false))
                  }
                  
                  $element.bind('change', listener)
                  $element.bind('keydown', function(event) {
                      var key = event.keyCode
                      // If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
                      // This lets us support copy and paste too
                      if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) 
                          return 
                      $browser.defer(listener) // Have to do this or changes don't get picked up properly
                  })
                  
                  $element.bind('paste cut', function() {
                      $browser.defer(listener)  
                  })
              }
              
          }
      })
      .directive('reachedTop', function($rootScope) {
          return {
           link: function(scope, element, attr){
               element.on("scroll", function(event){
                  var inboxContainer = event.target
                   if(inboxContainer.scrollTop === 0){
                       $rootScope.$broadcast("newMessage", {lastScrollHeight: inboxContainer.scrollHeight});
                       scope.$apply()
                   }
               })                 
           }
          };
        });
        function importFromExcel(UtilityService) {
            var directive = {
                restrict: 'A',
                link: linkFunc
            };
            return directive;
  
            function linkFunc(scope, element) {
                var oldChar = '\\';
                element.change(function (event) {
  
                    var filePath = event.originalEvent.srcElement.files[0].path;
                    var funcName = event.originalEvent.srcElement.name;
                    UtilityService.importFromExcel(event.originalEvent,filePath,funcName);
                });
            }
        }
  })();
  