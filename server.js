
// =================================================
//
//    Name : Main.js
//    Author : Brandon Bluemner
//    Description : Create the website & handlers
//
// =================================================
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var io = require('socket.io')(http);
var fs = require('fs');
// =================================================

var HTTPS_PORT = 4443;
var HTTP_PORT = 8080;
var SERVER_NAME = '';
var SERVER_MESSAGE = '';
var SERVER_CODE = 0;

// -------------------------------------------------
// OPTION FOR SSL 
// -------------------------------------------------
var options = {
  //ca: fs.readFileSync(''),
 // key: fs.readFileSync(''),
  //cert: fs.readFileSync('')
};

// =================================================

// -------------------------------------------------
//  Server
// -------------------------------------------------
var getServerStatus = function () {
  return [{
    websitename: SERVER_NAME,
    code: SERVER_CODE,
    message: SERVER_MESSAGE
  },
    {
      websitename: "abs",
      code: 0,
      message: "test"
    }];
}

// -------------------------------------------------
//  Creates online json
// -------------------------------------------------
var onlineToJSON = function ( websitename, code, message )
{
  var s = '{\n' +
    '\t"websitename" : "' + websitename + '"' + ',\n' +
    '\t"code" : ' + code + ' ,\n' +
    '\t"message" : "' + message + '"\n' +
    '}\n';
  return s;
}

// -------------------------------------------------
//  websites : 
// -------------------------------------------------
var websitesToJSON = function ( websites ) 
{
  var s = '{\n' +
    '"websites":[\n';
  websites.forEach(function (website, index, array) {
    s += onlineToJSON(website.websitename, website.code, website.message);
    s += ',';
  })
  s = s.substring(0, s.length - 1);
  s += ']\n}\n'
  return s;
}

// -------------------------------------------------
//    APPEND HTML TO FILE NAMES
// -------------------------------------------------
app.use(function ( req, res, next ) 
{
  if (req.path.indexOf('.') === -1) {
    var file = __dirname + '/www' + req.path + '.html';
    fs.exists(file, function (exists) {
      if (exists)
        req.url += '.html';
      next();
    });
  }
  else
    next();
});

// -------------------------------------------------
// SET FAVICON LOCATION
// -------------------------------------------------
app.get('/favicon.ico', function (request, responce) {
  responce.sendFile(__dirname + '/www/img/favicon.ico');
});

// -------------------------------------------------
//  SET ROOT WWW LOCATION
// -------------------------------------------------
app.use('/', express.static(__dirname + '/www'));

// -------------------------------------------------
//   
// -------------------------------------------------
app.get('/Status', function (request, responce) {
  responce.send(websitesToJSON(getServerStatus()));
});

// -------------------------------------------------
//  
// -------------------------------------------------
app.get('/online', function (request, responce) {
  responce.send(onlineToJSON('betacore.org', 0, "Server is Online"));
});

// -------------------------------------------------
//  Set The index file location
// -------------------------------------------------
app.get('/', function (request, responce) {
  responce.sendFile(__dirname + '/www/index.html');
});

// -------------------------------------------------
//   Handling wrong urls
// -------------------------------------------------
app.get("/*", function (req, res) {
  res.sendFile(__dirname + '/www/index.html');
  console.log("bad Url:" + req.url);
});

// -------------------------------------------------
//   Create Server NON-SSL
// -------------------------------------------------
http.createServer(app.handle.bind(app)).listen(HTTP_PORT, function () {
  console.log("Express server listening on port " + HTTP_PORT);
});

// -------------------------------------------------
//   Create Server SSL
// -------------------------------------------------
//https.createServer(options, app.handle.bind(app)).listen(HTTPS_PORT, function () {
//  console.log("Express server listening on port " + HTTPS_PORT);
//});
