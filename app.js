var connect = require('connect');
var http = require('http');
var app = connect();
var MobileDetect = require('mobile-detect');
var platform = require('platform');
var adb = require('adbkit');
var client = adb.createClient();
var Promise = require('bluebird');
var readline = require('readline');


// require request-ip and register it as middleware
var requestIp = require('request-ip');
app.use(requestIp.mw())

app.use(function(req, res) {
    // by default, the ip address will be set on the `clientIp` attribute
    var ip = req.clientIp;
    var ua = req.headers['user-agent'];
    var ref = req.headers['referrer'];
    var ip2 = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var md = new MobileDetect(req.headers['user-agent']);
    var info = platform.parse(ua);


    client.listDevices()
	.then(function(devices) {
		return Promise.map(devices, function(device) {
			console.log('Device %s ', device.id)
			client.shell(device.id, "dumpsys iphonesubinfo", function(err, output) {
			if (err) {
			    console.log(err);
			  }
				var readStream = output;
 
readStream
  .on('data',  function (data) { 
	console.log('Data!', data.toString());  
		var lines = data.toString().split('n').length - 1;
  		console.log(lines);
 
		
	})
  .on('error', function (err)  { console.error('Error', err); })
  .on('end',   function ()     { console.log('All done!');    });
 
			
		})
	})
.catch(function(err) {
	console.log('No device detected!')
	console.error('Something went wrong:', err.stack)
})})

    res.end("IP: " +ip + '\n' 
    	+ "IP2: " +ip2 + '\n' 
    	+ "UA: " +ua + '\n'
    	+ "REFERRER: " + ref + '\n\n'
    	+ "Additional Info(MD): " +'\n' 
    	+ "Mobile: " + md.mobile() + '\n'
    	+ "Phone: " + md.phone() + '\n'
    	+ "Tablet: " + md.tablet() + '\n'
    	+ "User Agent(md): " + md.userAgent() + '\n'
    	+ "User Agents(md): " + md.userAgents() + '\n'
    	+ "OS: " + md.os() + '\n'
    	+ "Iphone?: " + md.is('iPhone') + '\n'
    	+ "Is bot?: " + md.is('bot') + '\n'
    	+ "Webkit Version: " +md.version('Webkit') + '\n'
    	+ "Build Number: " + md.versionStr('Build') + '\n'
    	+ "PS/XBOX?: " +  md.match('playstation|xbox') + '\n\n'
    	+ "Additional Info(Platform): " +'\n' 
    	+ "Name: " + platform.name +'\n'
		+ "Verion: " + platform.version +'\n'
		+ "Product: " + platform.product +'\n'
		+ "Manufacturer: " + platform.manufacturer +'\n'
		+ "Layout: " + platform.layout +'\n'
		+ "OS: " + platform.os +'\n'
		+ "Description: " + platform.description +'\n\n'
		+ "Additional Info(Platform-UA BASED): " +'\n' 
		+ "Name: " + info.name +'\n' 
		+ "Version: " + info.version +'\n' 
		+ "Layout: " + info.layout +'\n' 
		+ "OS: " + info.os +'\n' 
		+ "Description: " + info.description +'\n' 

    	);
});

//create node.js http server and listen on port
http.createServer(app);