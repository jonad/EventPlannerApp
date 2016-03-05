// module for the home page.

(function(angular) {

var app = angular.module('eventApp.home', ['firebase.auth', 'firebase', 'firebase.utils', 'ui.router', 'google.places', 'toaster', 'ngSanitize', 'jcs-autoValidate']);

app.run([ 'defaultErrorMessageResolver', function(defaultErrorMessageResolver) {


              defaultErrorMessageResolver.getErrorMessages().then(function(errorMessages) {
               errorMessages['enameRequired'] = '<i class="fa fa-frown-o"></i> Please enter an event name,  this field is required.';
               errorMessages['etypeRequired'] = '<i class="fa fa-frown-o"></i> Please enter an event type, this field is required.';
               errorMessages['ehostRequired'] = '<i class="fa fa-frown-o"></i> Please enter an event host, this field is required.';
              errorMessages['edateRequired'] = '<i class="fa fa-frown-o"></i> Please enter an event date, this field is required.';
                errorMessages['edateType'] = '<i class="fa fa-frown-o"></i> Please enter a valid event date.';
                 errorMessages['estimeType'] = '<i class="fa fa-frown-o"></i> Please enter a valid start time.';
                  errorMessages['estimeRequired'] = '<i class="fa fa-frown-o"></i> Please enter a valid start time, this field is required.';

                  errorMessages['elocationRequired'] = '<i class="fa fa-frown-o"></i> Please enter an event location, this field is required.';
                  errorMessages['edateTypeE'] = "";
                  errorMessages['validEndtime'] = "";
                  errorMessages['edateTypeS'] = '<i class="fa fa-frown-o"></i> Please enter a valid event start time.';
                  errorMessages['validateGlist'] = '<i class="fa fa-frown-o"></i> You must have at least one guest attending the event';

    });
    }]);

app.directive("validateGlist", [ function() {

  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      validateGlist: '=validateGlist'
    },

    link : function(scope, element, attributes, ngModel){
      ngModel.$validators.validateGlist = function(modelValue){
          console.log("model view", modelValue);
          console.log("list", scope.validateGlist);
        return modelValue || (scope.validateGlist  && scope.validateGlist.length > 0);
      };
      scope.$watch('validateGlist', function() {
        ngModel.$validate();
      });
    }
  };
}]);



app.directive("validEndtime",  [ function() {

  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      validEndtime: '=validEndtime'
    },

    link : function(scope, element, attributes, ngModel){
      ngModel.$validators.validEndtime = function(modelValue){

        return modelValue > scope.validEndtime;

      };
      scope.$watch('validEndtime', function() {
        ngModel.$validate();
      });
    }
  };
}]);


app.controller('HomeCtrl',  ['$rootScope', '$scope','fbutil', 'currentAuth', 'Auth',  '$firebaseObject', 'FBURL', '$state', 'eventSrv', function ($rootScope, $scope,  fbutil, currentAuth, Auth, $firebaseObject, FBURL, $state, eventSrv) {

    var unbind;

    $rootScope.currentAuth = currentAuth;
    $scope.FBURL = FBURL;
    $scope.events =  eventSrv.eventList;
    $scope.more = true;

    $scope.showMore = function() {
      console.log(more)
      $scope.more = true;
    };

  $scope.showLess = function() {
      $scope.more = false;
  };

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
        if(eglist) {
          $scope.Event.eglists.push(eglist);
        }
        $scope.eglist="";

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
                'optionalMessage': $scope.Event.optMess != null ? $scope.Event.optMess: "",
                'glist'        :          $scope.Event.eglists.length  > 0 ? $scope.Event.eglists : $scope.Event.eglist
      };

      $scope.events.addEvent(event).then(function() {
        console.log(event);
          toaster.pop('success', 'Event   ' +  $scope.Event.name + ' created');
        $scope.Event = {};
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
  console.log($scope.selectedEvent);
  $scope.back = function() {
    $state.go("home");
  }
}
]);

app.filter('isArray', function() {
  return function (input) {
    return angular.isArray(input);
  };
});

app.filter('isString', function() {
  return function (input) {
    return angular.isString(input);
  };
});

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

