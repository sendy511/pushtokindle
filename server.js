var http = require('http');
var xml2js = require('xml2js');

var port = 18080;

http.createServer(function(req, res) {
    console.log(new Date() + req.url);
    console.log(new Date() + req.body);
    res.writeHead(200, {'Content-Type': 'text/html'});
    
    responseEchostr(req, res);

    var body = '<xml><Content><![CDATA[http://mp.weixin.qq.com/s?__biz=MjM5MjY3OTgwMA==&mid=402584363&idx=1&sn=fcbe3c37f2e9f88fb1d5fce8f2355e95&scene=2&srcid=01123VGABSm4rQnGz0iazZX5&from=timeline&isappinstalled=0#wechat_redirect]]></Content></xml>';
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
