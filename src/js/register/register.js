"use strict"
// register module

// Route configuration

angular.module('eventApp.register', ['firebase.utils', 'firebase.auth', 'ui.router',   'mgcrea.ngStrap',  'jcs-autoValidate', 'angular-ladda', 'toaster', 'ngSanitize'])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('register', {
            'url': '/register',
            views: {
                'main':{
                    templateUrl:'templates/register/register.create.html',
                    controller:'RegisterCtrl'
                }
            }
        });
    }
])

// default error messages
.run([ 'defaultErrorMessageResolver', function(defaultErrorMessageResolver) {
                defaultErrorMessageResolver.getErrorMessages().then(function(errorMessages) {
                errorMessages['confirmPassword'] = '<i class="fa fa-frown-o"></i> Please ensure the password match. ';
                errorMessages['pwd'] = ' <i class="fa fa-frown-o"></i> Please make sure you entered a valid password';
               errorMessages['validEmail'] = '<i class="fa fa-frown-o"></i> Please enter a valid email address';
               errorMessages['firstNameRequired'] = '<i class="fa fa-frown-o"></i> Please enter your first name, this field is required';
               errorMessages['lastNameRequired'] = '<i class="fa fa-frown-o"></i> Please enter your last name, this field is required';
               errorMessages['confirmPasswordRequired'] = '<i class="fa fa-frown-o"></i> Please confirm your password, this field is required';
              errorMessages['passwordRequired'] = '<i class="fa fa-frown-o"></i> Please enter your password, this field is required';
               errorMessages['emailRequired'] = '<i class="fa fa-frown-o"></i> Please enter your email, this field is required';
    });
}])


.directive('passwordValidate', [ '$tooltip', '$compile', '$timeout', '$templateCache',  function($tooltip, $compile, $timeout, $templateCache) {
    return {
        require: 'ngModel',

        link: function(scope, elm, attrs, ctrl) {

                var mytooltip =    $tooltip(elm, {
                        title: scope.tooltip.title,
                       contentTemplate: 'tooltip.html',
                        html: true,
                        trigger: 'manual',
                        scope: scope,
                        placement: 'top'
                    });

            elm.bind('focus', function() {
                scope.showTooltip();
            });

            elm.bind('blur' , function() {
                scope.hideTooltip();
            });

            scope.showTooltip = function() {
                 if(!scope.hasLower ||  !scope.hasUpper || !scope.hasDigit ||  !scope.hasLength){
                            mytooltip.show();
                        } else {
                             mytooltip.hide();
                        }
                };

                scope.hideTooltip = function(){
                        mytooltip.hide();
                };

                scope.valid = function() {
                        $timeout(function() {
                            scope.validParam = false
                        }, 1000);
                };

                ctrl.$parsers.unshift(function(viewValue) {
                scope.hasLower = (viewValue && /[a-z]/.test(viewValue)) ? 'valid' : undefined;
                scope.hasUpper= (viewValue && /[A-Z]/.test(viewValue)) ? 'valid' : undefined;
                scope.hasDigit = (viewValue && /\d/.test(viewValue)) ? 'valid' : undefined;
                 scope.hasLength = (viewValue && viewValue.length >= 8 ? 'valid' : undefined);

                if(scope.hasLower && scope.hasUpper && scope.hasDigit &&  scope.hasLength) {
                    ctrl.$setValidity('pwd', true);
                        scope.validParam = true;
                        scope.valid();
                        scope.hideTooltip();
                    return viewValue;
                      } else {
                         ctrl.$setValidity('pwd', false);
                        scope.showTooltip();
                        scope.validParam = false;
                    return "undefined";
                }
            });

            }
    };
}])

.directive("confirmPassword", [  function() {


    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            confirmPassword : '=confirmPassword'
        },

        link : function(scope, element, attributes, ngModel){
            ngModel.$validators.confirmPassword = function(modelValue) {
                return modelValue === scope.confirmPassword;
            };

            scope.$watch('confirmPassword', function() {
                ngModel.$validate();
            });
        }
    };
}])


.controller('RegisterCtrl', ['$rootScope', '$scope', 'Auth', '$state', 'fbutil' ,'toaster',  '$timeout' , function($rootScope, $scope, Auth, $state, fbutil, toaster, $timeout){
    $scope.user = {};
    $scope.isCreating = false;
    $scope.isCancelling = false;



    $scope.tooltip = {
        "title": "Password requirements: ",
        "upperCase": "At least a upperCase letter.",
        "lowerCase" : "At least a lowerCase letter.",
        "digit" : "At least a number.",
        "length" : "At least of length 8."

};

$scope.validParam = false;


    $scope.register = function(){
    var email = $scope.user.email;
    var pass= $scope.user.pass;
    var firstName = $scope.user.firstName;
    var lastName = $scope.user.lastName;
    var jobTitle = $scope.user.jobTitle !== undefined ? $scope.user.jobTitle : "";
    var employer = $scope.user.employer !== undefined ? $scope.user.employer : "";
    var pass = $scope.user.pass ;
    var bio = $scope.user.bio  !== undefined ? $scope.user.bio : "";
        $scope.isCreating = true;
        $scope.err = null;
        if(assertValidAccountProps()){
            Auth.$createUser({
                email: email,
                password:pass
            })
            .then(function(user) {
                var ref = fbutil.ref('users', user.uid);
                return fbutil.handler(function(cb) {
                    ref.set({
                        email: email,
                        firstName: firstName,
                        lastName:lastName,
                        jobTitle: jobTitle,
                        employer:employer,
                        bio: bio }, cb);
                });
            })
            .then(function() {
                 Auth.$authWithPassword({email: email, password: pass}, {rememberMe:true})
                 .then(function(authData) {
                     $rootScope.currentAuth  = authData
                      $scope.isCreating = false;
                toaster.pop('success', 'Created  user  ' + email);

                $state.go('home');
                 });

            }, function(err) {
                     $scope.isCreating = false;
                $scope.err = angular.isObject(err) && err.code? err.code : err + '';
            });


        }
    };

    $scope.cancel = function() {
        $scope.isCancelling = true;
        $state.go('home');
        $scope.isCancelling = false;
    }

     function assertValidAccountProps() {
      if( !$scope.user.email ) {
        $scope.err = 'Please enter an email address';
      }
      else if( !$scope.user.pass || !$scope.user.confirm ) {
        $scope.err = 'Please enter a password';
      }
      return !$scope.err;
    }

}]);
