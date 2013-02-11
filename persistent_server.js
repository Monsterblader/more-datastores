var mysql = require('mysql');
var url = require('url');
var http = require('http');
var querystring = require('querystring');
var defaultCorsHeaders = require("./cors.js").defaultCorsHeaders;

var Sequelize = require("sequelize");
var sequelize = new Sequelize("chat", "root", "");

var Message = sequelize.define("Message", {
  messageID: Sequelize.STRING,
  username: Sequelize.STRING,
  receiveUser: Sequelize.STRING,
  message: Sequelize.TEXT,
  messageWhen: Sequelize.DATE,
  room: Sequelize.TEXT
});

Message.sync();

var requestListener = function (request, response) {
  var parsedURL = url.parse(request.url, true);
  var statusCode = 200;
  var headers = defaultCorsHeaders();
  headers['Content-Type'] = "text/plain";
  if (request.method === 'POST') {
    request.on('data', function(chunk) {
      var data = querystring.parse(chunk.toString());
      Message.create({ username: data.username, message: data.message }).success(function(message) {
      });
      response.writeHead(statusCode, headers);
      response.end("\n");
    });
  }
  if (request.method === 'GET') {
    Message.findAll().success(function(messages){
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(messages));
    });
  }
};

var port = 8080;
var ip = "127.0.0.1";
var server = http.createServer(requestListener);

console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);