
var express = require('express')
  , tracker = require('pixel-tracker')
  //, mysql = require('mysql')
  , app = express();

var mongo = require('mongodb');

var mongohost = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'yourown.mongolab.com';
var mongoport = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : '31477'; //Connection.DEFAULT_PORT;
var mongodbname = 'yourdatabase';
var mongousr = 'user';
var mongopwd = 'password';

/*
// mysql driver
var connection = mysql.createConnection({
  host     : 'localhost',
  port	   : '8889',
  user     : 'root',
  password : 'password',
});
*/


app.configure(function () {
  app.use(express.cookieParser())
})




var objToBeTracked;

// MongoDB - begin
/*
= 	  var dbserver = new mongo.Server(mongohost, mongoport, {w: 1});
=
=     w: (value of > -1 or the string 'majority'), where < 1 means                     =
=        no write acknowlegement                                                       =
=     journal: true/false, wait for flush to journal before acknowlegement             =
=     fsync: true/false, wait for flush to file system before acknowlegement           =   

=  For backward compatibility safe is still supported and                              =
=   allows values of [true | false | {j:true} | {w:n, wtimeout:n} | {fsync:true}]      =
=   the default value is false which means the driver receives does not                =
=   return the information of the success/error of the insert/update/remove            =
=                                                                                      =
=   ex: new Db(new Server('localhost', 27017), {safe:false})          
*/
var db = new mongo.Db(mongodbname, new mongo.Server(mongohost, mongoport, {}), {w: 1});
db.open(function(err, client){
	// actually authenticating; often left out of examples
	client.authenticate(mongousr, mongopwd, function(err, p_client) {
		// good practice to create the collection if it doesn't exist 	
	    client.createCollection("pixeltracking", function(err, col) {
	         client.collection("pixeltracking", function(err, col) {

	         	// leverage the awesome pixel-tracker module
	         	tracker
				  .use(function (error, result) {
				    //objToBeTracked = JSON.stringify(result, null, 2);
				    objToBeTracked = result;

				    // verify whats being captured
				    console.log(objToBeTracked);
				 	
				 	/*
				 	// mysql example should you wish to use it
				 	connection.connect();
					connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
					  if (err) throw err;

					  console.log('The solution is: ', rows[0].solution);
					});
					connection.end();
					*/

					if (objToBeTracked != undefined) {
						col.insert(objToBeTracked, function() {});
					}
					//db.close();
				  })
				  .configure({ disable_cookies : true }) // disabled 


	             // if you wish to avoid inserting the above you can add three useless documents to test
	             // for (var i = 0; i < 3; i++) {
	             //    col.insert({c:i}, function() {});
	             // }

	         });
	    });
	});
});
// MongoDB - end


app.all('/pixel', tracker.middleware) // handles route for the pixel

app.listen(process.argv[2] || 3000) // change to your desired port
