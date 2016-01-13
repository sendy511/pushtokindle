var http = require('http');
var xml2js = require('xml2js');
var JSON = require('JSON');

var port = 18080;

http.createServer(function(req, res) {
    console.log(new Date() + req.url);

    res.writeHead(200, {'Content-Type': 'text/html'});

  //   if(req.method == 'POST'){
		// responseMessage(req);
  //   }
    
    createEbookParsingJob("http://www.baidu.com");

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

function responseMessage(req){
    var body = '';
    
    req.on('data', function(data){
        body += data;
    });

    req.on('end', function(){
        console.log("Get POST request with content: " + body);

        xml2js.parseString(body, function(error, result){
            console.log("JSON:" + JSON.stringify(result));
            var url = result.xml.Content;
            console.log("url:" + url);

            createEbookParsingJob(url);
        });
    });
}

function createEbookParsingJob(url){
    var api_address = "api2.online-convert.com";
    var api_key = 'f0c315563b656b7d40101ac578fc289f';
    var post_data = JSON.stringify({
        'input': [{
            'type': 'remote',
            'source': url
        }],
        'conversion': [{
            'target': 'mobi'
        }]
    });
    console.log("asdfa" + post_data);
    var post_options = {
        method: 'POST',
        host: api_address,
        path: "/jobs",
        headers:{
            'X-Oc-Api-Key': api_key,
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    }

    var response_body = '';
    var post_request = http.request(post_options, function(res){
        res.setEncoding('utf-8');
        res.on('data', function(chunk){
            response_body += chunk;
        })
        res.on('end', function(){
            console.log("Pushed command to create job for : " + url);
            console.log(response_body);
        })
    });
    post_request.write(post_data);
    post_request.end();
}
