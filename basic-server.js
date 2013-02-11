var http = require("http");
var mongodb = require("mongodb");
var fs = require('fs');
var url = require('url');
var request = require("request");

var retMessage = function(res, responseCode, returnMessage) {
  res.writeHead(responseCode);
  res.end(returnMessage);
}

var handleRequest = function (req, res, outputOverride) {
  var parsedURL = url.parse(req.url, true);
  var startPage = '<html> \
  <head> \
  <link rel="stylesheet" type="text/css" href="styles.css" /> \
  <script src="http://code.jquery.com/jquery-1.8.3.min.js" /></script> \
  </head> \
  <body> \
  <form action="http://127.0.0.1:8000/" method="POST"> \
    <input type="input" name="url" id="urlInput" placeholder="Pick a website.  Any website."></input> \
    <input type="submit" value="Submit"></input> \
  </form> \
  </body> \
  </html>';

  // var requestedSite = function (){
  //   if(fs.readFileSync('.\/data\/sites.txt', 'utf-8').search(parsedURL.pathname.slice(1)) !== -1) {
  //     var exists = fs.existsSync('.\/data\/sites' + parsedURL.pathname);
  //     return exists ? fs.readFileSync('./data/sites' + parsedURL.pathname, 'utf-8') : "Give us a minute to load your file.";
  //   } else {
  //     return "That site has not been archived, yet.";
  //   }
  // }

  if(req.method === "GET"){
    console.log("aaaa");
    retMessage(res, 200, startPage);
  } else {
    req.on('data', function(data) {
      console.log(data)
      // The following line only seems to be useful for testing.
      // outputOverride && outputOverride.write(data.toString().slice(4) + "\n");
      var mongoServer = new mongodb.Server("127.0.0.1", 27017, {});
      var client = new mongodb.Db('test', mongoServer);
      client.open(function(err, p_client) {
        console.log("Connected to MongoDB!");
        client.createCollection("demo-collection", function(err, collection) {
          console.log("Created collection");
          var siteName = data.toString().slice(4);
          var archivedPage;
          request("http://" + siteName, function(err, response, body){
            archivedPage = body;
            var document = {name: siteName,
                            dateSaved: new Date(),
                            archivedPage: archivedPage
                          };
            collection.insert(document, function(err, docs) {
              console.log("Inserted a document.");
              collection.count(function(err, count) {
                console.log("This collection contains " + count + " documents.");
              });
              collection.find().toArray(function(err, results) {
                for (var i = 0; i < results.length; i++) {
                  console.log("Found a document with name = " + results[i].name + i);
                }
                client.close();
                console.log("Closed the collection");
              });
            });
          });
        });
      });
    });
  }
};

var port = 8000;
var ip = "127.0.0.1";
var server = http.createServer(handleRequest);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);
