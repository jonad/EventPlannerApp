"use strict"

// module to handle log in

angular.module( 'eventApp.login', ['firebase.utils', 'firebase.auth', 'ui.router', 'angular-ladda', 'jcs-autoValidate'])
    .config(['$stateProvider', 'laddaProvider',  function($stateProvider, laddaProvider) {
        $stateProvider
            .state('login', {
            'url' : '/login',
            views: {
                'main':{
                    templateUrl:'templates/login/login.create.html',
                    controller:'LoginCtrl'
                }
            }
        });
    }
 ])

.run([ 'defaultErrorMessageResolver', function(defaultErrorMessageResolver) {


              defaultErrorMessageResolver.getErrorMessages().then(function(errorMessages) {
               errorMessages['loginPattern'] = '<i class="fa fa-frown-o"></i> Please enter a valid email address.';
               errorMessages['validPassword'] = '<i class="fa fa-frown-o"></i> Please enter a valid password.';
           }
       );
}])

.controller('LoginCtrl', ['$scope', 'Auth', 'fbutil', '$state', function($scope, Auth, fbutil, $state) {
    $scope.user = {};
    $scope.isCreating = false;
    $scope.login = function(email, pass){
        $scope.isCreating = true;
        $scope.err = null;
        Auth.$authWithPassword({email: email, password: pass}, {rememberMe:true})
            .then(function(user) {
                $state.go('home');

            }, function(err){
                $scope.err = angular.isObject(err) && err.code? err.code : err + ' ';
                $scope.isCreating = false;

            });
    };

    $scope.cancel = function() {
        $scope.isCancelling = true;
        $state.go('home');

    }
}]);
