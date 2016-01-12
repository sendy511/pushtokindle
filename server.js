var http = require('http');
var port = 18080;
http.createServer(function(req, res) {
    console.log(new Date() + ": request comes");
    console.log(req.url);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<h1>Node.js</h1>');
    res.end('<p>Hello World -11111</p>');

}).listen(port);
