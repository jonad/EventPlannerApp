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
.run(['$rootScope', 'Auth', 'bootstrap3ElementModifier', 'defaultErrorMessageResolver', function($rootScope, Auth, bootstrap3ElementModifier, defaultErrorMessageResolver) {
    bootstrap3ElementModifier.enableValidationStateIcons(true);

     defaultErrorMessageResolver.getErrorMessages().then(function(errorMessages) {
                errorMessages['confirmPassword'] = '<i class="fa fa-frown-o"></i> Please ensure the password match. ';
               errorMessages['validEmail'] = '<i class="fa fa-frown-o"></i> Please enter a valid email address';
               errorMessages['firstNameRequired'] = '<i class="fa fa-frown-o"></i> Please enter your first name, this field is required';
               errorMessages['lastNameRequired'] = '<i class="fa fa-frown-o"></i> Please enter your last name, this field is required';
    });


    Auth.$onAuth(function(user) {
        $rootScope.loggedIn = !!user;
        $rootScope.more = false;

    });
}]);


