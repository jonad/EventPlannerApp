"use strict"

angular.module('eventapp', [
    'ngResource',
    'jcs-autoValidate',
    'angular-ladda',
    'mgcrea.ngStrap',
    'toaster',
    'ui.router',
    'ngAnimate',
    'firebase.auth',
    'firebase.utils',
    'eventApp.config',
    'eventApp.login',
    'eventApp.register',
    'eventApp.security',
    'eventApp.home'
    ])
.config(['$urlRouterProvider' , 'laddaProvider', function($urlRouterProvider, laddaProvider) {

     laddaProvider.setOption({
        style: 'expand-right',
        spinnerSize: 35,
        spinnerColor: '#ffffff'
    });

    $urlRouterProvider.otherwise('/');
}])
.run(['$rootScope', 'Auth', 'bootstrap3ElementModifier', function($rootScope, Auth, bootstrap3ElementModifier) {
    bootstrap3ElementModifier.enableValidationStateIcons(true);

    Auth.$onAuth(function(user) {
        $rootScope.loggedIn = !!user;
        $rootScope.more = false;

    });
}]);


