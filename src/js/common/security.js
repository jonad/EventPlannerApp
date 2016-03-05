"use strict"

//module that handle user authentication.

angular.module('eventApp.security', ['ui.router', 'firebase.auth'])

.run(['$rootScope', '$state', 'Auth',  function($rootScope, $state, Auth){

    Auth.$onAuth(check);

    $rootScope.$on("$stateChangeError", function( event, toState, toParams, fromState, fromParams, error){

        if( error === "AUTH_REQUIRED"){
             event.preventDefault();
            $state.go("login");
        }
    });
    function check(user) {
        if(!user){
            $state.go("home");
        }
    }

}
]);


