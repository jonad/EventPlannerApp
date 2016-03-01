// module for the home page.

(function(angular) {

var app = angular.module('eventApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ui.router', 'google.places', 'toaster']);

app.controller('HomeCtrl',  ['$rootScope', '$scope','fbutil', 'currentAuth', 'Auth',  '$firebaseObject', 'FBURL', '$state', 'eventSrv', function ($rootScope, $scope,  fbutil, currentAuth, Auth, $firebaseObject, FBURL, $state, eventSrv) {

    var unbind;

    $rootScope.currentAuth = currentAuth;
    $scope.FBURL = FBURL;
    $scope.events =  eventSrv.eventList;

    $scope.logout = function() {
          var profile = $firebaseObject(fbutil.ref('users', $rootScope.currentAuth.uid));
     profile.$bindTo($scope, 'profile').then(function(ub) { unbind = ub; });
        if( unbind ) { unbind(); }
        profile.$destroy();
        Auth.$unauth();
        $state.go('home');
      };
  }
]);

app.controller('CreateEventCtrl', ['$scope', '$state', 'eventSrv' , 'toaster', function($scope, $state,  eventSrv, toaster) {

    $scope.Event = {};
    $scope.events = eventSrv;
    $scope.eglist = "";
    $scope.Event.eglists = [];

    $scope.add = function (eglist){

        $scope.Event.eglists.push(eglist);

      };

      $scope.createEvent = function() {
      var event = {

                'name'      :       $scope.Event.name,
                'type'        :        $scope.Event.type,
                'host'        :        $scope.Event.host,
                'stime'      :        $scope.Event.stime.getTime(),
                'edate'     :         $scope.Event.edate.getTime(),
                'etime'     :         $scope.Event.etime.getTime(),
                'location' :          JSON.parse(JSON.stringify($scope.Event.elocation)),
                'glist'        :          $scope.Event.eglists
      };

      $scope.events.addEvent(event).then(function() {
          toaster.pop('success', 'Event   ' +  $scope.Event.name + ' created');
        $state.go("home");
      });
  };

      $scope.cancel = function(){

            $state.go('home');
        }
    }
]);

app.controller( 'EventDetailCtrl', ['$scope', '$stateParams', '$state', 'eventSrv', function($scope, $stateParams,
  $state, eventSrv){

  $scope.selectedEvent = eventSrv.getEvent($stateParams.id);
  $scope.back = function() {
    $state.go("home");
  }
}
]);


app.directive('ccEvent', function () {

    return {
        'restrict':'AE',
        'templateUrl':'templates/events/event.card.html',
        'scope':{
            'event':'='
        }
    }
});

app.service('eventSrv', ['$firebaseArray', 'fbutil', '$q','Firebase',
      function($firebaseArray, fbutil, $q, Firebase) {

       var eventRef = fbutil.ref('events');
       var eventList = $firebaseArray(eventRef);

       var  self = {

          'eventList': eventList,

          'isCreating': false,

          'getEvent' : function(id){
            return self.eventList.$getRecord(id);
          },

          'addEvent' : function(event) {

              var timeStamp = Firebase.ServerValue.TIMESTAMP;
              var d = $q.defer();
              self.isCreating = true;
              event.createdAt = timeStamp;
              self.eventList.$add(event)
                                              .then(function(ref) {
                                              self.isCreating=false;
                                              d.resolve();
                                });
        return d.promise;
      },

      'compare' : function(a, b){
        return (-1)*a.createdAt.toString().localeCompare(b.createdAt.toString());
      }

}

      self.eventList.$watch( function() {

        self.eventList.sort(self.compare);

      });

        return self;
  }
]);

app.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('home', {
        'url' : '/',
          views: {
            'main': {
            templateUrl: 'templates/home/home.html',
            controller: 'HomeCtrl',
            resolve: {
              currentAuth: ['Auth', function (Auth) {
            return Auth.$waitForAuth();
        }]
      }
    }
  }
})
      .state('create', {
          'url': '/create',
          views: {
                'main': {
                    templateUrl:'templates/events/event.create.html',
                    controller: 'CreateEventCtrl',
                    authenticate:true
                }
            }
        })
      .state('detail', {
      'url': "/edetail/:id",
      views: {
        'main': {
          templateUrl: 'templates/events/event.detail.html',
          controller: 'EventDetailCtrl'
        }
      }
    });
}
]);

}) (angular);

