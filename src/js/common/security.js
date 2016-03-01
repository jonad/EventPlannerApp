"use strict"

//module that handke user authentication.

angular.module('eventApp.security', ['ui.router', 'firebase.auth'])

.run(['$rootScope', '$state', 'Auth',  function($rootScope, $state, Auth){

    Auth.$onAuth(check);

    $rootScope.$on("$stateChangeError", function( event, toState, toParams, fromState, fromParams, error){

        if(errorr == "AUTH_REQUIRED"){
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


