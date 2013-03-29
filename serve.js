var http = require("http");
var url = require("url");
var mysql = require("mysql");
var path = require("path");
var fs = require("fs");

function start(route)
{
  http.createServer(function(request, response)
  {
    var a = 10;
    response.writeHead(200, {"Content-Type": "text/plain"});
    var services = process.env.VCAP_SERVICES;
    var serviceReply = JSON.parse(services);
    //var host = servicesReply[0].credentials.host;
    
    //var services = VCAP_SERVICES;
    //var serviceReply = JSON.parse(services);
    var creds = serviceReply["mysql-5.1"][0].credentials;
    var connection = mysql.createConnection({
        host     : creds.hostname,
        user     : creds.user,
        port     : creds.port,
        password : creds.password,
    });
    connection.connect();
    connection.query('SELECT * from test.MURAL_INFO', function(err, rows) {
      if (err) 
      {
        throw err;
      }
      var uri = url.parse(request.url).pathname;
      var filename = path.join(process.cwd()+"/multiImage/", uri);

      path.exists(filename, function(exists) {
        console.log("Fetching" + filename);
        if(!exists) {
          response.writeHead(404, {"Content-Type": "text/plain"});
          response.write("404 Not Found\n");
          response.end();
          return;
        }

        if (fs.statSync(filename).isDirectory()) filename += 'basic1.html';

        fs.readFile(filename, "binary", function(err, file) {
          if(err) {        
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
            return;
          }

          response.writeHead(200);
          response.write(file, "binary");
          response.end();
        });
     });
   })
    
    //response.write(creds.hostname);

    //parseURL(request.url);
  }).listen(8888);
}

exports.start = start;
