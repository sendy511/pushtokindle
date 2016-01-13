var http = require('http');
var xml2js = require('xml2js');

var port = 18080;

http.createServer(function(req, res) {
    console.log(new Date() + req.url);

    res.writeHead(200, {'Content-Type': 'text/html'});

	var body = '';
    
    if(req.method == 'POST'){
    	req.on('data', function(data){
    		body += data;
    	});

    	req.on('end', function(){
    		console.log("Get POST request with content: " + body);
    	});
    }
    
    responseEchostr(req, res);

    xml2js.parseString(body, function(error, result){
        console.log("JSON:" + JSON.stringify(result));
        var url = result.xml.Content;
        console.log("url:" + url);

        var content;
        http.get("http://www.baidu.com", function(res){
            res.on('data', function(chunk){
                content += chunk;
            }).on('end', function(){
                // console.log(content);
            });
        })
    });

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
