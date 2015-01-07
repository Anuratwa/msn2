var services = angular.module('msn.services',['ngResource']);

services.factory('UserResource', function($resource) {
    return $resource('/api/user/:userId', { userId: '@userId' }, {
        'get' : {method:'GET'},
        'save' : {method:'POST'},
        'query' : {method:'GET', isArray:true},
        'remove' : {method:'DELETE'},
        'update' : {method:'PUT'}
    });
});

services.factory('LeagueResource', function($resource) {
    return $resource('/api/league/:leagueId', { userId: '@leagueId' }, {
        'get' : {method:'GET'},
        'save' : {method:'POST'},
        'query' : {method:'GET', isArray:true},
        'remove' : {method:'DELETE'},
        'update' : {method:'PUT'}
    });
});

services.factory('authProvider', function ($rootScope, $q, $window, $location) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },
        response: function (response) {
            if (response.status === 401) {
                $location.path('/');
            }
            return response || $q.when(response);
        }
    };
});

services.factory('UserService', function($rootScope){
    var user = false;
    return {
        getUser: function() {
            return user;
        },
        setUser: function(newUser) {
            user = newUser;
            $rootScope.$broadcast("userSet");
        }
    }
});