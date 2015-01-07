var msn = angular.module ('msn', ['ngRoute','msn.services','msn.controllers']);

var requireAuth = function($window, $q) {
    var deferred = $q.defer();
    if(! $window.sessionStorage.token) {
        deferred.reject();
        $window.location = '/';
    } else {
        deferred.resolve();
    }
    return deferred.promise;
};

var redirectAuth = function($window, $q) {
    var deferred = $q.defer();
    if ($window.sessionStorage.token) {
        deferred.reject();
        $window.location = '/portal';
    } else {
        deferred.resolve();
    }
    return deferred.promise;
};

msn.config(function($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
        .when('/', {templateUrl: 'partials/login/login', controller: 'LoginCtrl', resolve: {redirectAuth: redirectAuth}})
        .when('/register', {templateUrl: 'partials/login/register', controller: 'RegisterCtrl'})
        .when('/portal', {templateUrl: 'partials/portal/index', controller: 'PortalCtrl', resolve: {requireAuth: requireAuth}})
        .when('/profile', {templateUrl: 'partials/portal/index', controller: 'PortalCtrl', resolve: {requireAuth: requireAuth}})
        .when('/league', {templateUrl: 'partials/portal/league', controller: 'LeagueCtrl', resolve: {requireAuth: requireAuth}})
        .when('/manage', {templateUrl: 'partials/portal/manage', controller: 'ManageCtrl', resolve: {requireAuth: requireAuth}})
        .when('/admin', {templateUrl: 'partials/portal/admin', controller: 'AdminCtrl', resolve: {requireAuth: requireAuth}})
        .otherwise({redirectTo: '/'});

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authProvider');
});