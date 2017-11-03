// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: loopback-example-user-management
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var dsConfig = require('../datasources.local.js');
var path = require('path');

module.exports = function(app) {
  var User = app.models.user;

 //login page
  app.get('/', function(req, res) {
    var credentials = dsConfig.myEmailDataSource.transports[0].auth;
    res.render('login', {
      email: credentials.user,
      password: credentials.pass
    });
});

//verified
 	app.get('/verified', function(req, res) {
    		res.render('verified');
	});

//log a user in
	  app.post('/login', function(req, res) {
	    User.login({
	      email: req.body.email,
	      password: req.body.password
	    }, 'user', function(err, token) {
	      if (err) {
	        if(err.details && err.code === 'LOGIN_FAILED_EMAIL_NOT_VERIFIED'){
	          res.render('reponseToTriggerEmail', {
	            title: 'Login failed',
	            content: err,
	            redirectToEmail: '/api/users/'+ err.details.userId + '/verify',
	            redirectTo: '/',
	            redirectToLinkText: 'Click here',
	            userId: err.details.userId
	          });
	        } else {
	          res.render('response', {
	            title: 'Login failed. Wrong username or password',
	            content: err,
	            redirectTo: '/',
	            redirectToLinkText: 'Please login again',
	          });
	        }
	        return;
	      }
	      res.render('home', {
	        email: req.body.email,
	        accessToken: token.id,
	        redirectUrl: '/api/users/change-password?access_token=' + token.id
	      });
	    });
  	});

  //log a user out
	  app.get('/logout', function(req, res, next) {
	    if (!req.accessToken) return res.sendStatus(401);
	    User.logout(req.accessToken.id, function(err) {
	      if (err) return next(err);
	      res.redirect('/');
	    });
	});
    }