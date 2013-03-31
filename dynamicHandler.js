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
        response.write(string);
        response.end();
      }
    });
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
    var query = "SELECT XML_URL, IMAGE_WIDTH, IMAGE_HEIGHT, X_SIZE, Y_SIZE from test.MURAL_INFO where LATITUDE between " + latLow + " and " + latHigh + " and LONGITUDE between " + longLow + " and " + longHigh;
    connection.query(query, function(err, rows) {
      if (err)
      {
        throw err;
      }
      if (rows.length >= 1)
      {
        console.log("Got response for geolocation query " + query);
        response.write(JSON.stringify(rows[0]));
        response.end();
      }
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
    var query = "SELECT XML_URL, IMAGE_WIDTH, IMAGE_HEIGHT, X_SIZE, Y_SIZE from test.MURAL_INFO where ID = " + queryData.ID;
    connection.query(query, function(err, rows) {
      if (err)
      {
        throw err;
      }
      if (rows.length >= 1)
      {
        console.log("Got response for geolocation query " + query);
        response.write(JSON.stringify(rows[0]));
        response.end();
      }
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
      response.end();
    });
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
  else //Can't handle via dynamic routing
  {
    return false;
  }
  return true;
}

exports.tryHandle = tryHandle;