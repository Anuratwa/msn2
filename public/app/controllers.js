var controllers = angular.module('msn.controllers',['ngResource']);

controllers.controller('LoginCtrl', function($scope, $http, $location, $window) {
    $scope.user = {email: '', password: ''};
    $scope.showErrorMsg = false;
    $scope.user.email = $window.localStorage.email || '';

    $scope.setRememberEmail = function() {
        if($window.localStorage.rememberEmail == "true") {
            $window.localStorage.rememberEmail = false;
            delete $window.localStorage.email;
        } else {
            $window.localStorage.rememberEmail = true;
        }
    };

    $scope.isSelected = function() {
        return ($window.localStorage.rememberEmail == "true");
    };

    $scope.loginUser = function(user) {
        if(user.email == '' || user.password == '') {
            $('#errorMsg').html("Error: All fields are required.");
            $scope.showErrorMsg = true;
        } else {
            $scope.showErrorMsg = false;
            $http.post('/authenticate', user)
                .success(function(data) {
                    $window.sessionStorage.token = data.token;
                    $window.sessionStorage.user_id = data.user._id;
                    if($window.localStorage.rememberEmail == "true") {
                        $window.localStorage.email = user.email;
                    }
                    $window.location = '/portal';
                }).error(function(err,status) {
                    delete $window.sessionStorage.token;
                    if(status == 400) {
                        $('#errorMsg').html("Error: Username and/or Password are incorrect.");
                        $scope.showErrorMsg = true;
                    } else {
                        $('#errorMsg').html("Error: System error. Please try again later.");
                        $scope.showErrorMsg = true;
                    }
                });
        }
    };
});

controllers.controller('RegisterCtrl', function($scope, $http, $window) {
    $scope.user = {first:'',last:'',mcgill_id:'',phone:'',email:'',password:'',league:'',sports:[],divisions:[],teams:[],captain_for:[]};

    $scope.mgEmail = false;
    $scope.mgId = false;

    $scope.removeId = function() {
        $scope.user.mcgill_id = '';
    };

    $scope.registerUser = function(user, rpw) {
        if(user.first == '' || user.last == '' || user.phone == '' || user.email == '' || (user.mcgill_id == '' && !$scope.mgId) || (user.password != rpw) || (user.mcgill_id.length != 9 && !$scope.mgId) || !($scope.validateEmail(user.email))) {
            if(user.password != rpw && user.password != '') {
                $('#errorMsg').html("Error: Passwords do not match.");
                $scope.showErrorMsg = true;
            } else if(user.mcgill_id.length != 9 && !$scope.mgId) {
                $('#errorMsg').html("Error: McGill Id must be 9 digits.");
                $scope.showErrorMsg = true;
            } else if(!$scope.validateEmail(user.email)) {
                $('#errorMsg').html("Error: Not a valid email.");
                $scope.showErrorMsg = true;
            } else {
                $('#errorMsg').html("Error: All fields are required.");
                $scope.showErrorMsg = true;
            }
        } else {
            $scope.showErrorMsg = false;
            $http.post('/register', {user:user})
                .success(function(data) {
                    if(data.status == 400) {
                        $('#errorMsg').html("Error: Email already in use.");
                        $scope.showErrorMsg = true;
                    } else {
                        $window.localStorage.email = user.email;
                        $window.location = '/';
                    }
                }).error(function(err,status) {
                    console.log(err);
                });
        }
    };

    $scope.validateEmail = function(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
});

controllers.controller('NavCtrl', function($scope, $http, $window, $location, UserService) {
    var user_id = $window.sessionStorage.user_id;
    $http.get('/api/user/' + user_id)
        .success(function (user) {
            $scope.user = user;
            $scope.user.navItems = [];
            $http.get('/api/league/' + $scope.user.league, {populate: true})
                .success(function (league) {
                    $scope.league = league;
                    $scope.user.navItems = [
                        {name:'Profile',link:'/profile?id=' + $scope.user._id},
                        {name:'League',link:'/league?id=' + $scope.league._id}
                    ];
                    if($scope.user.captain_for.length > 0) {
                        $scope.user.navItems.push({name:'Manage',link:'/manage?id=' + $scope.user._id});
                    }
                    if($scope.user.role == 'admin' || $scope.user.role == 'super') {
                        $scope.user.navItems.push({name:'Administrate',link:'/admin?id=' + $scope.user._id});
                    }
                    UserService.setUser($scope.user);
                }).error(function (err, status) {
                    console.log(err);
                });
        }).error(function (err, status) {
            console.log(err);
        });

    $scope.currentView = {};
    $scope.currentViewChange = function() {
        for(var i = 0; i < $scope.user.navItems.length; i++) {
            if($scope.user.navItems[i] == $scope.currentView) {
                $window.location = $scope.user.navItems[i].link;
            }
        }
    };

    $scope.signOut = function() {
        delete $window.sessionStorage.token;
        delete $window.sessionStorage.user_id;
        $window.location = '/';
    };
});

controllers.controller('PortalCtrl', function($scope, $http, $window, $timeout, $rootScope, UserService) {
    $scope.callTeams = function() {
        if($scope.user.teams.length > 0) {
            $http.get('/api/team?teams=' + $scope.user.teams.toString())
                .success(function(teams) {
                    $scope.teams = teams;
                })
                .error(function(err,status) {
                    console.log(err);
                });
        }
    };

    $scope.signOut = function() {
        delete $window.sessionStorage.token;
        delete $window.sessionStorage.user_id;
        $window.location = '/';
    };

    if(UserService.getUser() != false) {
        $scope.user = UserService.getUser();
        $scope.callTeams();
    }

    $scope.$on('userSet', function () {
        $scope.user = UserService.getUser();
        $scope.callTeams();
    });
});

controllers.controller('LeagueCtrl', function($scope, $http, $rootScope, $routeParams, UserService) {
    $scope.showLeague = false;

    $scope.callLeague = function() {
        $http.get('/api/league/' + $routeParams.id + '?populate=true')
            .success(function(league) {
                $scope.league = league;
                $scope.organizeData();
                $scope.showLeague = true;
            })
            .error(function(err,status) {
                console.log(err);
            });
    };

    $scope.organizeData = function() {
        for(var i = 0; i < $scope.league.divisions.length; i++) {
            $scope.league.teams.forEach(function(team) {
                for(var j = 0; j < $scope.league.divisions[i].teams.length; j++) {
                    if(team._id == $scope.league.divisions[i].teams[j]){
                        $scope.league.divisions[i].teams[j] = team;
                    }
                }
            });
        }

        for(var i = 0; i < $scope.league.divisions.length; i++) {
            $scope.league.divisions[i].teams.sort(function(a,b) {
                if(a.wins > b.wins) {
                    return -1;
                } else if(a.wins < b.wins) {
                    return 1
                } else if(a.draws > b.draws) {
                    return -1;
                } else if(a.draws < b.draws) {
                    return 1;
                } else if($scope.numGamesPlayed(a) < $scope.numGamesPlayed(b)) {
                    return -1;
                } else if($scope.numGamesPlayed(a) > $scope.numGamesPlayed(b)) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }

        for(var i = 0; i < $scope.league.sports.length; i++) {
            $scope.league.divisions.forEach(function(division) {
                for(var j = 0; j < $scope.league.sports[i].divisions.length; j++) {
                    if(division._id == $scope.league.sports[i].divisions[j]){
                        $scope.league.sports[i].divisions[j] = division;
                    }
                }
            });
        }
    };

    $scope.numGamesPlayed = function(team) {
        return team.wins + team.losses + team.draws;
    };

    if(UserService.getUser() != false) {
        $scope.user = UserService.getUser();
        $scope.callLeague();
    }

    $scope.$on('userSet', function() {
        $scope.user = UserService.getUser();
        $scope.callLeague();
    });
});

controllers.controller('ManageCtrl', function($scope, $http, UserService) {
    $scope.userSearch = '';
    $scope.errorMsg = '';

    $scope.callTeams = function() {
        $http.get('/api/team?teams=' + $scope.user.captain_for.toString())
            .success(function(teams) {
                $scope.teams = teams;
            })
            .error(function(err,status) {
                console.log(err);
            });
    };

    $scope.addUser = function() {
        $scope.errorMsg = '';

        if(!$scope.team) {
            $scope.errorMsg = 'Error: Please choose a team to add the user to.';
            return;
        }

        $http.get('/api/user?email=' + $scope.userSearch)
            .success(function(user) {
                $scope.user = user;
                $scope.team.users.forEach(function(a) {
                    if(a._id == $scope.user._id) {
                        $scope.errorMsg = 'Error: User already exists on team';
                        return;
                    }
                });
                $scope.user.teams.push($scope.team._id);
                if($scope.user.divisions.indexOf($scope.team.division._id) == -1) {
                    $scope.user.divisions.push($scope.team.division._id);
                }
                if($scope.user.sports.indexOf($scope.team.sport._id) == -1) {
                    $scope.user.sports.push($scope.team.sport._id);
                }
                $http.put('/api/user/' + $scope.user._id, {user: $scope.user})
                    .success(function(user) {
                        $scope.user = user;
                        $http.get('/api/team/' + $scope.team._id)
                            .success(function(team) {
                                $scope.team2 = team;
                                $scope.team2.users.push($scope.user._id);
                                $http.put('/api/team/' + $scope.team2._id, {team: $scope.team2})
                                    .success(function(team) {
                                        $scope.team2 = team;
                                        $scope.team.users.push($scope.user);
                                    })
                                    .error(function(err,status) {
                                        console.log(err);
                                    });
                            })
                            .error(function(err,status) {
                               console.log(err);
                            });
                    })
                    .error(function(err,status) {
                        console.log(err);
                    });
            })
            .error(function(err,status) {
                $scope.errorMsg = 'Error: User with email' + $scope.userSearch + 'does not exist';
                return;
            });
    };

    if(UserService.getUser() != false) {
        $scope.user = UserService.getUser();
        $scope.callTeams();
    }

    $scope.$on('userSet', function() {
        $scope.user = UserService.getUser();
        $scope.callTeams();
    });
});

controllers.controller('AdminCtrl', function($scope, $http, $rootScope, $timeout, $route, $window, UserService) {
    $scope.league = {};
    $scope.sport = {};
    $scope.sports = [];
    $scope.division = {};
    $scope.divisions = [];
    $scope.team = {};
    $scope.teams = [];

    $scope.newSport = '';
    $scope.newDivision = '';
    $scope.dStartYear = '';
    $scope.dStartMonth = '';
    $scope.dEndYear = '';
    $scope.dEndMonth = '';
    $scope.newTeam = '';
    $scope.tStartYear = '';
    $scope.tStartMonth = '';
    $scope.tEndYear = '';
    $scope.tEndMonth = '';
    $scope.captainSearch = '';

    $scope.captainSearchError = false;

    $scope.showLeagueManager = true;
    $scope.showGameManager = false;

    $scope.$watch('sport', function(newVal, oldVal){
        if(newVal._id != oldVal._id && $scope.showLeagueManager) {
            $rootScope.$broadcast('sportChange');
        }
    }, true);

    $scope.$watch('division', function(newVal, oldVal){
        if(newVal._id != oldVal._id && $scope.showLeagueManager) {
            $rootScope.$broadcast('divisionChange');
        }
    }, true);

    $scope.$watch('team', function(newVal,oldVal) {
        if(newVal._id != oldVal._id && $scope.showLeagueManager) {
            $rootScope.$broadcast('teamChange');
        }
    }, true);

    $scope.callLeague = function() {
        $http.get('/api/league/' + $scope.user.league)
            .success(function(league) {
                $scope.league = league;
                $http.get('/api/sport?league=' + $scope.league._id)
                    .success(function(sports) {
                        $scope.sports = sports;
                        $scope.gSports = sports;
                    })
                    .error(function(err,status) {
                        console.log(err);
                    });
            })
            .error(function(err,status) {
                console.log(err);
            });
    };

    $scope.createSport = function () {
        if($scope.newSport == ''){
            $scope.errorMsg = 'New sport name required';
            return;
        }

        $scope.errorMsg = '';

        var newSport = {
            name: $scope.newSport,
            league: $scope.league._id,
            divisions: []
        };

        $http.post('/api/sport',{sport:newSport})
            .success(function(sport) {
                $scope.sport = sport;
                $scope.league.sports.push(sport._id);
                $scope.sports.push(sport);
                $http.put('/api/league/' + $scope.league._id, {league:$scope.league})
                    .success(function(league) {
                        $scope.league = league;
                    })
                    .error(function(err,status) {
                        console.log(err);
                    });
            })
            .error(function(err,status) {
                console.log(err);
            });
    };

    $scope.$on('sportChange', function() {
        if($scope.sport.name) {
            $http.get('/api/division?sport=' + $scope.sport._id)
                .success(function(divisions) {
                    $scope.divisions = divisions;
                    $scope.showDivisions = true;
                    $scope.showTeams = false;
                    $scope.showCaptain = false;
                    $scope.errorMsg = '';
                    delete $scope.captain;
                })
                .error(function(err,status) {
                    console.log(err);
                });
        }

    });

    $scope.ensureMonth = function(m) {
        return (m > 0 && m < 13);
    };

    $scope.ensureYear = function(m) {
        return (m.toString().length == 4 && !isNaN(m));
    };

    $scope.createDivision = function () {
        if($scope.newDivision == ''
            || !$scope.ensureMonth($scope.dStartMonth)
            || !$scope.ensureYear($scope.dStartYear)
            || !$scope.ensureMonth($scope.dEndMonth)
            || !$scope.ensureYear($scope.dEndYear)
        ) {
            $scope.errorMsg = 'Error: Please ensure your division data is shaped appropriately.';
            return;
        }

        $scope.errorMsg = '';

        var newDivision = {
            name: $scope.newDivision,
            start_month: $scope.dStartMonth,
            start_year: $scope.dStartYear,
            end_month: $scope.dEndMonth,
            end_year: $scope.dEndYear,
            sport: $scope.sport._id,
            sport_desc: $scope.sport.name,
            league: $scope.league._id,
            teams: [],
            games: []
        };

        $http.post('/api/division',{division:newDivision})
            .success(function(division) {
                $scope.division = division;
                $scope.sport.divisions.push(division._id);
                $scope.league.divisions.push(division._id);
                $scope.divisions.push(division);
                $http.put('/api/league/' + $scope.league._id, {league:$scope.league})
                    .success(function(league) {
                        $scope.league = league;
                        $http.put('/api/sport/' + $scope.sport._id, {sport:$scope.sport})
                            .success(function(sport) {
                                $scope.sport = sport;
                            })
                            .error(function(err,status) {
                                console.log(err);
                            });
                    })
                    .error(function(err,status) {
                        console.log(err);
                    });
            })
            .error(function(err,status) {
                console.log(err);
            });
    };

    $scope.$on('divisionChange', function() {
        if($scope.division.name) {
            $http.get('/api/team?division=' + $scope.division._id)
                .success(function(teams) {
                    $scope.teams = teams;
                    $scope.showTeams = true;
                    $scope.showCaptain = false;
                    $scope.errorMsg = '';
                    delete $scope.captain;
                })
                .error(function(err,status) {
                    console.log(err);
                });
        }

    });

    $scope.createTeam = function() {
        if($scope.newTeam == ''
            || !$scope.ensureMonth($scope.tStartMonth)
            || !$scope.ensureYear($scope.tStartYear)
            || !$scope.ensureMonth($scope.tEndMonth)
            || !$scope.ensureYear($scope.tEndYear)
        ) {
            $scope.errorMsg = 'Error: Please ensure your team data is shaped appropriately.';
            return;
        }

        $scope.errorMsg = '';

        var newTeam = {
            name: $scope.newTeam,
            start_month: $scope.tStartMonth,
            start_year: $scope.tStartYear,
            end_month: $scope.tEndMonth,
            end_year: $scope.tEndYear,
            wins: 0,
            losses: 0,
            draws: 0,
            captain: null,
            league: $scope.league._id,
            sport: $scope.sport._id,
            division: $scope.division._id,
            users: [],
            games: []
        };

        $http.post('/api/team', {team:newTeam})
            .success(function(team) {
                $scope.team = team;
                $scope.division.teams.push(team._id);
                $scope.league.teams.push(team._id);
                $scope.teams.push(team);
                $http.put('/api/league/' + $scope.league._id, {league:$scope.league})
                    .success(function(league) {
                        $scope.league = league;
                        $http.put('/api/division/' + $scope.division._id, {division:$scope.division})
                            .success(function(division) {
                                $scope.division = division;
                            })
                            .error(function(err,status) {
                                console.log(err);
                            });
                    })
                    .error(function(err,status) {
                        console.log(err);
                    });
            })
            .error(function(err,status) {
                console.log(err);
            });
    };

    $scope.$on('teamChange', function() {
        delete $scope.captain;
        if($scope.team['captain'] != null && $scope.showTeams) {
            $http.get('/api/user/' + $scope.team.captain)
                .success(function(captain) {
                    $scope.captain = captain;
                    $scope.showCaptain = true;
                    $scope.errorMsg = '';
                })
                .error(function(err,status) {
                    console.log(err);
                });
        } else if($scope.showTeams) {
            $scope.showCaptain = true;
        }

    });

    $scope.setCaptain = function() {
        $http.get('/api/user?email=' + $scope.captainSearch)
            .success(function(captain) {
                $scope.captain = captain;
                $scope.team['captain'] = $scope.captain._id;
                $scope.team.users.push($scope.captain._id);
                $scope.captain.captain_for.push($scope.team._id);
                $scope.captain.teams.push($scope.team._id);
                $scope.captain.divisions.push($scope.division._id);
                $scope.captain.sports.push($scope.sport._id);
                $http.put('/api/team/' + $scope.team._id, {team:$scope.team})
                    .success(function(team) {
                        $scope.team = team;
                        $http.put('/api/user/' + $scope.captain._id, {user:$scope.captain})
                            .success(function(captain) {
                                $scope.captain = captain;
                            })
                            .error(function(err,status) {
                                console.log(err);
                            });
                    })
                    .error(function(err,status){
                        console.log(err);
                    });
            })
            .error(function(err,status) {
                $scope.captainSearchError = true;
            });
    };

    $scope.gSport = {};
    $scope.gDivision = {};
    $scope.gDivisions = [];
    $scope.homeTeams = [];
    $scope.homeTeam = {};
    $scope.awayTeams = [];
    $scope.awayTeam = {};
    $scope.gTeams = [];

    $scope.gTime = {};
    $scope.gLocation = '';
    $scope.game = {location:'',date:'',time:''};
    $scope.games = [];

    $scope.showGDivisions = false;
    $scope.showHomeTeams = false;
    $scope.showAwayTeams = false;
    $scope.showReportScore = false;
    $scope.showGames = false;
    $scope.showScore = false;

    $scope.homescore = 0;
    $scope.awayscore = 0;

    $scope.$watch('gSport', function(newVal, oldVal){
        if(newVal._id != oldVal._id && $scope.showGameManager) {
            $rootScope.$broadcast('gSportChange');
        }
    }, true);

    $scope.$watch('gDivision', function(newVal, oldVal){
        if(newVal._id != oldVal._id && $scope.showGameManager) {
            $rootScope.$broadcast('gDivisionChange');
        }
    }, true);

    $scope.$watch('homeTeam', function(newVal,oldVal) {
        if(newVal._id != oldVal._id && $scope.showGameManager) {
            $rootScope.$broadcast('homeTeamChange');
        }
    }, true);

    $scope.$watch('awayTeam', function(newVal,oldVal) {
        if(newVal._id != oldVal._id && $scope.showGameManager) {
            $rootScope.$broadcast('awayTeamChange');
        }
    }, true);

    $scope.$watch('game', function(newVal,oldVal) {
        if(newVal._id != oldVal._id && $scope.showGameManager) {
            $rootScope.$broadcast('gameChange');
        }
    }, true);

    $scope.$on('gSportChange', function() {
        $scope.showAwayTeams = false;
        $scope.showHomeTeams = false;
        $scope.showReportScore = false;
        $scope.showGames = false;
        $scope.showScore = false;
        $scope.game = {location:'',date:'',time:''};
        $http.get('/api/division?sport=' + $scope.gSport._id)
            .success(function(divisions) {
                $scope.gDivisions = divisions;
                $scope.showGDivisions = true;
            })
            .error(function(err,status) {
                console.log(err);
            });
    });

    $scope.$on('gDivisionChange', function() {
        $scope.showAwayTeams = false;
        $scope.showReportScore = false;
        $scope.showGames = false;
        $scope.showScore = false;
        $scope.game = {location:'',date:'',time:''};
        $http.get('/api/team?division=' + $scope.gDivision._id)
            .success(function(teams) {
                $scope.homeTeams = teams;
                $scope.awayTeams = teams;
                $scope.showHomeTeams = true;
            })
            .error(function(err,status) {
                console.log(err);
            });
    });

    $scope.$on('homeTeamChange', function() {
        $scope.showReportScore = false;
        $scope.showGames = false;
        $scope.game = {location:'',date:'',time:''};
        $scope.showAwayTeams = true;
        $scope.showScore = false;
    });

    $scope.$on('awayTeamChange', function() {
        $scope.showReportScore = false;
        $scope.showScore = false;
        $scope.game = {location:'',date:'',time:''};
        $http.get('/api/game?home=' + $scope.homeTeam._id + '&away=' + $scope.awayTeam._id)
            .success(function(games) {
                $scope.showGames = true;
                $scope.games = games;
            })
            .error(function(err,status) {
                console.log(err);
            });
    });

    $scope.createGame = function() {
        $scope.game.home = $scope.homeTeam._id;
        $scope.game.away = $scope.awayTeam._id;
        $scope.game.home_name = $scope.homeTeam.name;
        $scope.game.away_name = $scope.awayTeam.name;
        $scope.game.home_score = 0;
        $scope.game.away_score = 0;
        $scope.game.complete = false;
        $http.post('/api/game',{game:$scope.game})
            .success(function(game) {
                $scope.game = game;
                $scope.games.push(game);
                $scope.homeTeam.games.push(game._id);
                $scope.awayTeam.games.push(game._id);
                $http.put('/api/team/' + $scope.homeTeam._id, {team:$scope.homeTeam})
                    .success(function(hometeam) {
                        $scope.homeTeam = hometeam;
                    })
                    .error(function(err,status) {
                        console.log(err);
                    });
                $http.put('/api/team/' + $scope.awayTeam._id, {team:$scope.awayTeam})
                    .success(function(awayteam) {
                        $scope.awayTeam = awayteam;
                    })
                    .error(function(err,status) {
                        console.log(err);
                    });
            })
            .error(function(err,status) {
                console.log(err);
            });
    };

    $scope.$on('gameChange', function() {
        if(!$scope.game.complete) {
            $scope.showReportScore = true;
        } else {
            $scope.showScore = true;
        }
    });

    $scope.reportScore = function(homescore, awayscore) {
        if(homescore > awayscore) {
            $scope.homeTeam.wins ++;
            $scope.awayTeam.losses ++;
        } else if(homescore < awayscore) {
            $scope.homeTeam.losses ++;
            $scope.awayTeam.wins ++;
        } else {
            $scope.homeTeam.draws ++;
            $scope.awayTeam.draws ++;
        }

        $scope.game.complete = true;

        $http.put('/api/game/' + $scope.game._id,{complete:$scope.game.complete,home_score:$scope.homescore,away_score:$scope.awayscore})
            .success(function(game) {
                $scope.game = game;
                $http.put('/api/team/' + $scope.homeTeam._id, {team:$scope.homeTeam})
                    .success(function(hometeam) {
                        $scope.homeTeam = hometeam;
                    })
                    .error(function(err,status) {
                        console.log(err);
                    });
                $http.put('/api/team/' + $scope.awayTeam._id, {team:$scope.awayTeam})
                    .success(function(awayteam) {
                        $scope.awayTeam = awayteam;
                    })
                    .error(function(err,status) {
                        console.log(err);
                    });
                $scope.showReportScore = false;
                $scope.showScore = true;
            })
            .error(function(err,status) {
                console.log(err);
            });

    };

    if(UserService.getUser() != false) {
        $scope.user = UserService.getUser();
        if($scope.user.role != 'super') {
            $window.location = '/';
        }
        $scope.callLeague();
    }

    $scope.$on('userSet', function() {
        $scope.user = UserService.getUser();
        if($scope.user.role != 'super') {
            $window.location = '/';
        }
        $scope.callLeague();
    });
});