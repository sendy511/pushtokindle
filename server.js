var http = require('http');
var port = 18080;
http.createServer(function(req, res) {
    console.log(new Date() + req.url);
    res.writeHead(200, {'Content-Type': 'text/html'});
    var regex = /echostr=([^\&]*)/.exec(req.url);
    if(regex != null){
    	res.write(regex[1]);
	}
    res.end();

}).listen(port);
