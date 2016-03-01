"use strict"
// register module

angular.module('eventApp.register', ['firebase.utils', 'firebase.auth', 'ui.router',   'mgcrea.ngStrap',  'jcs-autoValidate', 'angular-ladda', 'toaster'])
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

.directive('passwordValidate', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {


                scope.hasLower = (viewValue && /[a-z]/.test(viewValue)) ? 'valid' : undefined;
                scope.hasUpper= (viewValue && /[A-Z]/.test(viewValue)) ? 'valid' : undefined;
                scope.hasDigit = (viewValue && /\d/.test(viewValue)) ? 'valid' : undefined;
                 scope.hasLength = (viewValue && viewValue.length >= 8 ? 'valid' : undefined);

                if(scope.hasLower && scope.hasUpper && scope.hasDigit &&  scope.hasLength) {
                    ctrl.$setValidity('pwd', true);
                    return viewValue;
                } else {
                    ctrl.$setValidity('pwd', false);
                    return undefined;
                }

            });
        }
    };
})

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


.controller('RegisterCtrl', ['$rootScope', '$scope', 'Auth', '$state', 'fbutil' ,'toaster',   function($rootScope, $scope, Auth, $state, fbutil, toaster){
    $scope.user = {};
    $scope.isCreating = false;
    $scope.isCancelling = false;

    $scope.tooltip = {
        "title": "Password requirements: ",
        "upperCase": "At least a upperCase letter.",
        "lowerCase" : "At least a lowerCase letter.",
        "digit" : "At least a number.",
        "length" : "At least of length 8.",
        trigger: 'focus'
    };


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
