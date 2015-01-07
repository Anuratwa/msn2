//Rendering of all Templates to be handled by Node
exports.login = function(req, res){
    res.render('login', { title: 'Welcome to MSN' });
};

exports.portal = function(req, res){
    res.render('portal', { title: 'MSN Portal' })
};

exports.partials = function(req, res) {
  res.render(req.url.substr(1));
};