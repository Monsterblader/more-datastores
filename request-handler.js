var fs = require('fs');
var url = require('url');
var mongodb = require("mongodb");

var retMessage = function(res, responseCode, returnMessage) {
  res.writeHead(responseCode);
  res.end(returnMessage);
}

exports.handleRequest = function (req, res, outputOverride) {
  var parsedURL = url.parse(req.url, true);
  var startPage = '<html> \
  <head> \
  <link rel="stylesheet" type="text/css" href="styles.css" /> \
  <script src="http://code.jquery.com/jquery-1.8.3.min.js" /></script> \
  </head> \
  <body> \
  <form action="http://127.0.0.1:8080/" method="POST"> \
    <input type="input" name="url" id="urlInput" placeholder="Pick a website.  Any website."></input> \
    <input type="submit" value="Submit"></input> \
  </form> \
  </body> \
  </html>';

  var requestedSite = function (){
    // If keep this, change fs to mondo db operations.
    console.log("Moo.");
    if(fs.readFileSync('.\/data\/sites.txt', 'utf-8').search(parsedURL.pathname.slice(1)) !== -1) {
      var exists = fs.existsSync('.\/data\/sites' + parsedURL.pathname);
      return exists ? fs.readFileSync('./data/sites' + parsedURL.pathname, 'utf-8') : "Give us a minute to load your file.";
    } else {
      return "That site has not been archived, yet.";
    }
  }

  if(req.method === "GET"){
    retMessage(res, 200, parsedURL.pathname !== "/" ? requestedSite() : startPage);
  } else {
    req.on('data', function(data) {
      // The following line only seems to be useful for testing.
      outputOverride && outputOverride.write(data.toString().slice(4) + "\n");

      // Loaded site will now be stored in mondo database.
      // Schema - site name, site data, date created is automatic.
      fs.appendFile('./data/sites.txt', data.toString().slice(4) + "\n", function(err) {
        err ? retMessage(res, 404, err) : retMessage(res, 201, "success");
      });
    });
  }
};



var client = new mongodb.Db('test', server);


// Open the client's connection to the server:
client.open(function(err, p_client) {
  console.log("Connected to MongoDB!");

  // Create a collection, if it doesn't exist already:
  client.createCollection("demo-collection", function(err, collection) {
    console.log("Created collection");

    // Here's the document we want to insert:
    var document = {name: "Jean Valjean",
                    password: "24601"};

    // Insert it to the collection:
    collection.insert(document, function(err, docs) {
      console.log("Inserted a document.");

      // Count just gives us the number of items in collection:
      collection.count(function(err, count) {
        console.log("This collection contains " + count + " documents.");
      });

      // Find() returns a "cursor" which can be converted to an array of
      // documents:
      collection.find().toArray(function(err, results) {
        // Results is an array of all the documents in the collection
        for (var i = 0; i < results.length; i++) {
          console.log("Found a document with name = " + results[i].name);
        }

        // Close the db connection when we're done with it:
        client.close();
        console.log("Closed the collection");
      });
    });
  });
});