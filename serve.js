var http = require("http");
var url = require("url");
var mysql = require("mysql");

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
      response.write('The solutions is ' + rows[0].XML_URL);
      response.end();
    });
    
    //response.write(creds.hostname);

    //parseURL(request.url);
  }).listen(8888);
}

exports.start = start;
