var url = require("url");
var mysql = require("mysql");
var path = require("path");
var fs = require("fs");

function tryHandle(request, response)
{
  function handleGetComment(request, response)
  {
    var queryData = url.parse(request.url, true).query;
    console.log("Getting comments");

    //TODO msati3: move to common location for db services
    var services = process.env.VCAP_SERVICES;
    var serviceReply = JSON.parse(services);
    var creds = serviceReply["mysql-5.1"][0].credentials;
    var connection = mysql.createConnection({
        host     : creds.hostname,
        user     : creds.user,
        port     : creds.port,
        password : creds.password,
    });

    connection.connect();
    var query = "SELECT COMMENT_ID, COMMENT, LIKES from test.MURAL_COMMENTS where ID = " + queryData.ID + " and GRIDX = " + queryData.gridX + " and GRIDY = " + queryData.gridY + " and GRIDZ = " + queryData.gridZ;
    connection.query(query, function(err, rows) {
      if (err)
      {
        throw err;
      }
      if (rows.length >= 1)
      {
        var string = JSON.stringify(rows);
        console.log("Got response comment query " + query);
        response.writeHead(200, "OK", {'Content-Type': 'text/html'});
        response.write(string);
        response.end();
      }
      connection.end();
    });
  }
  
  function handleAddComment(request, response)
  {
    var queryData = url.parse(request.url, true).query;
    console.log("Adding comment");

    //TODO msati3: move to common location for db services
    var services = process.env.VCAP_SERVICES;
    var serviceReply = JSON.parse(services);
    var creds = serviceReply["mysql-5.1"][0].credentials;
    var connection = mysql.createConnection({
        host     : creds.hostname,
        user     : creds.user,
        port     : creds.port,
        password : creds.password,
    });

    connection.connect();
    var query = "INSERT INTO test.MURAL_COMMENTS (ID, X, Y, Z, GRIDX, GRIDY, GRIDZ, COMMENT) VALUES(" + queryData.muralID + "," + queryData.imgX + "," + queryData.imgY + "," + queryData.imgZ + ","
                                                                                                    + queryData.gridX + "," + queryData.gridY + "," + queryData.gridZ+ ", '" + queryData.comment + "')";
    console.log("Insert query " + query);
    connection.query(query);
    response.writeHead(200, "OK", {'Content-Type': 'text/html'});
    response.end();
    connection.end();
  }
  
  function handleGetMuralInfoByGeoLocation(request, response)
  {
    var queryData = url.parse(request.url, true).query;
    console.log("Getting mural info by geolocation");
    var epsilon = 0.001;
    var latitude = parseFloat(queryData.lat);
    var latLow = latitude - epsilon;
    var latHigh = latitude + epsilon;
    
    var longitude = parseFloat(queryData.long);
    var longLow = longitude - epsilon;
    var longHigh = longitude + epsilon;
    
    //TODO msati3: move to common location for db services
    var services = process.env.VCAP_SERVICES;
    var serviceReply = JSON.parse(services);
    var creds = serviceReply["mysql-5.1"][0].credentials;
    var connection = mysql.createConnection({
        host     : creds.hostname,
        user     : creds.user,
        port     : creds.port,
        password : creds.password,
    });

    connection.connect();
    var query = "SELECT ID, MULTI_TARGET, XML_URL, IMAGE_WIDTH, IMAGE_HEIGHT, X_SIZE, Y_SIZE from test.MURAL_INFO where LATITUDE between " + latLow + " and " + latHigh + " and LONGITUDE between " + longLow + " and " + longHigh;
    connection.query(query, function(err, rows) {
      if (err)
      {
        throw err;
      }
      if (rows.length >= 1)
      {
        console.log("Got response for mural by geolocation query " + query);
        response.writeHead(200, "OK", {'Content-Type': 'text/html'});
        response.write(JSON.stringify(rows[0]));
        response.end();
      }
      connection.end();
    });
  }
  
  function handleGetMuralInfoByID(request, response)
  {
    var queryData = url.parse(request.url, true).query;
    console.log("Getting mural info by ID");
    
    //TODO msati3: move to common location for db services
    var services = process.env.VCAP_SERVICES;
    var serviceReply = JSON.parse(services);
    var creds = serviceReply["mysql-5.1"][0].credentials;
    var connection = mysql.createConnection({
        host     : creds.hostname,
        user     : creds.user,
        port     : creds.port,
        password : creds.password,
    });

    connection.connect();
    var query = "SELECT ID, MULTI_TARGET, XML_URL, IMAGE_WIDTH, IMAGE_HEIGHT, X_SIZE, Y_SIZE from test.MURAL_INFO where ID = " + queryData.ID;
    connection.query(query, function(err, rows) {
      if (err)
      {
        throw err;
      }
      if (rows.length >= 1)
      {
        console.log("Got response for mural by id query " + query);
        response.writeHead(200, "OK", {'Content-Type': 'text/html'});
        response.write(JSON.stringify(rows[0]));
        response.end();
      }
      connection.end();
    });
  }
  
  function handleGetMuralInfo(request, response)
  {
    var queryData = url.parse(request.url, true).query;
    if (queryData.hasOwnProperty('lat'))
    {
      handleGetMuralInfoByGeoLocation(request, response);
    }
    else if (queryData.hasOwnProperty('ID'))
    {
      handleGetMuralInfoByID(request, response);
    }
  }
  
  function handleIncreaseLikeCount(request, response)
  {
    var queryData = url.parse(request.url, true).query;
    console.log("Increasing like count" + request.url);
    
    //TODO msati3: move to common location for db services
    var services = process.env.VCAP_SERVICES;
    var serviceReply = JSON.parse(services);
    var creds = serviceReply["mysql-5.1"][0].credentials;
    var connection = mysql.createConnection({
        host     : creds.hostname,
        user     : creds.user,
        port     : creds.port,
        password : creds.password,
    });

    connection.connect();
    var query = "UPDATE test.MURAL_COMMENTS set LIKES=LIKES+1 where COMMENT_ID = " + queryData.ID;
    connection.query(query, function(err, rows) {
      if (err)
      {
        throw err;
      }
      response.writeHead(200, "OK", {'Content-Type': 'text/html'});
      response.end();
      connection.end();
    });
  }
  
  function handleUploadXML(request, response)
  {
    if (request.method == 'POST') {
      console.log("[200] " + request.method + " to " + request.url);
        
      request.on('data', function(chunk) {
        console.log("Received body data:");
        console.log(chunk.toString());
        getInsertID(onGetID);
        
        function onGetID(id) {
          fs.appendFile("dataSets/"+id+".xml", chunk, function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log("The file was saved!");
            } 
          }); 
        }
      });
      
      request.on('end', function() {
        // empty 200 OK response for now
        response.writeHead(200, "OK", {'Content-Type': 'text/html'});
        response.end();
      });
      
    } else {
      console.log("[405] " + request.method + " to " + request.url);
      response.writeHead(405, "Method not supported", {'Content-Type': 'text/html'});
      response.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
    }
  }
    
  function handleUploadDAT(request, response)
  {
    if (request.method == 'POST') {
      console.log("[200] " + request.method + " to " + request.url);
        
      request.on('data', function(chunk) {
        console.log("Received body data:");
        console.log(chunk.toString());
        getInsertID(onGetID);
        
        function onGetID(id) {
          fs.appendFile("dataSets/"+id+".dat", chunk, function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log("The file was saved!");
            } 
          }); 
        }
      });
      
      request.on('end', function() {
        // empty 200 OK response for now
        response.writeHead(200, "OK", {'Content-Type': 'text/html'});
        response.end();
      });
      
    } else {
      console.log("[405] " + request.method + " to " + request.url);
      response.writeHead(405, "Method not supported", {'Content-Type': 'text/html'});
      response.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
    }
  }
  
  function getInsertID(callBack)
  {
    console.log("Got request for get insert ID");
    //TODO msati3: move to common location for db services
    var services = process.env.VCAP_SERVICES;
    var serviceReply = JSON.parse(services);
    var creds = serviceReply["mysql-5.1"][0].credentials;
    var connection = mysql.createConnection({
        host     : creds.hostname,
        user     : creds.user,
        port     : creds.port,
        password : creds.password,
    });

    connection.connect();
    var query = "SELECT MAX(ID) AS MAXID from test.MURAL_INFO";
    connection.query(query, function(err, rows) {
      if (err)
      {
        throw err;
      }
      if (rows.length >= 1)
      {
        var retID = parseInt(rows[0].MAXID) + 1;
        callBack(retID);
      }
      connection.end();
    });
  }
  
  function handleUpdateDBs(request, response)
  {
    console.log("Got request to update DBs");
    var queryData = url.parse(request.url, true).query;
    getInsertID(onGetID);
    
    function onGetID(id)
    {
      console.log("Adding new entry to DB with id" + id);
      var xmlurl = "'http://128.61.17.220:8888/../dataSets/"+id+".xml'";
      var latitude = parseFloat(queryData.LATITUDE);
      var longitude = parseFloat(queryData.LONGITUDE);
      var xsize = parseInt(queryData.X_SIZE);
      var ysize = parseInt(queryData.Y_SIZE);
      var zsize = parseInt(queryData.Z_SIZE);
      var width = parseInt(queryData.WIDTH);
      var height = parseInt(queryData.HEIGHT);
      var multiImageName = "'"+queryData.MULTI_IMAGE+"'";
      
      //TODO msati3: move to common location for db services
      var services = process.env.VCAP_SERVICES;
      var serviceReply = JSON.parse(services);
      var creds = serviceReply["mysql-5.1"][0].credentials;
      var connection = mysql.createConnection({
          host     : creds.hostname,
          user     : creds.user,
          port     : creds.port,
          password : creds.password,
      });

      connection.connect();
      var query = "INSERT into test.MURAL_INFO (XML_URL, MULTI_TARGET, LATITUDE, LONGITUDE, X_SIZE, Y_SIZE, Z_SIZE, IMAGE_WIDTH, IMAGE_HEIGHT) VALUES ("+
                                                xmlurl+","+multiImageName+","+latitude+","+longitude+","+xsize+","+ysize+","+zsize+","+width+","+height+")";
      console.log("Insert query is " + query);
      connection.query(query, function() {
            connection.end();
      });
      response.writeHead(200, "OK", {'Content-Type': 'text/html'});
      response.end();
    }
  }

  var uri = url.parse(request.url).pathname;
  if (uri == "/getComment")
  {
    handleGetComment(request, response);
  }
  else if (uri == "/getMuralInfo")
  {
    handleGetMuralInfo(request, response);
  }
  else if (uri == "/increaseLikeCount")
  {
    handleIncreaseLikeCount(request, response);
  }
  else if (uri == "/uploadXML")
  {
    handleUploadXML(request, response);
  }
  else if (uri == "/uploadDAT")
  {
    handleUploadDAT(request, response);
  }
  else if (uri == "/updateDBs")
  {
    handleUpdateDBs(request, response);
  }
  else if (uri == "/addComment")
  {
    handleAddComment(request, response);
  }
  else //Can't handle via dynamic routing
  {
    return false;
  }
  return true;
}

exports.tryHandle = tryHandle;
exports.createConnection = tryHandle.createConnection;