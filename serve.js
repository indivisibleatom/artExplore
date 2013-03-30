var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var dynamicHandler = require("./dynamicHandler");

function start(route)
{
  function loadStaticPage(request, response)
  {
    var uri = url.parse(request.url).pathname;
    var filename = path.join(process.cwd(), "multiImage/"+uri);

    path.exists(filename, function(exists) {
      console.log("Fetching" + filename);
      if(!exists) {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
        return;
      }

      if (fs.statSync(filename).isDirectory()) 
      {
        filename += 'basic1.html';
      }

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
    })
  }
   
  http.createServer(function(request, response)
  {
    if (!dynamicHandler.tryHandle(request, response))
    {
      loadStaticPage(request, response);
    }
  }).listen(8888);
}

exports.start = start;
