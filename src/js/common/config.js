'use strict'
// declare some constant.

angular.module('eventApp.config', [])
.constant('version', '1.0.0')
.constant('FBURL', 'https://eventplanner01.firebaseio.com')

.run(['FBURL' , '$timeout' , function(FBURL, $timeout) {

    if(FBURL.match('//INSTANCE.firebaseio.com')) {
        angular.element(document.body).html('<h1>Please configure app/config.js before running!</h1>');
        $timeout(function() {
            angular.element(document.body).removeClass('hide');
    }, 250);
}

}]);
