var http = require('http');
var port = 18080;
http.createServer(function(req, res) {
    console.log(new Date() + req.url);

    res.writeHead(200, {'Content-Type': 'text/html'});

    if(req.method == 'POST'){
    	var body = '';

    	req.on('data', function(data){
    		body += data;
    	});

    	req.on('end', function(){
    		console.log("Get POST request with content: " + body);
    	});
    }
    
    responseEchostr(req, res);

    res.end();

}).listen(port);

function responseEchostr(req, res){
	var regex = /echostr=([^\&]*)/.exec(req.url);
    if(regex != null){
    	var echostr = regex[1];
    	console.log(echostr);
    	res.write(echostr);
	}
}
