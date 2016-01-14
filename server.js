var http = require('http');
var xml2js = require('xml2js');
var JSON = require('JSON');
var fs = require('fs');
var url = require('url');

var port = 18080;

var api_address = "api2.online-convert.com";
var api_key = 'f0c315563b656b7d40101ac578fc289f';

http.createServer(function(req, res) {
    console.log(new Date() + req.url);

    res.writeHead(200, {'Content-Type': 'text/html'});

  //   if(req.method == 'POST'){
		// responseMessage(req);
  //   }
    
    //createEbookParsingJob("http://www.baidu.com");
    whetherJobFinished("6d9b67ab-ba05-11e5-a6e2-002590d8633c");

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

function createEbookParsingJob(content_url){
    
    var post_data = JSON.stringify({
        'input': [{
            'type': 'remote',
            'source': content_url
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
            console.log("Pushed command to create job for : " + content_url);
            console.log(response_body);
            if (response_body.contains("queued")){
                var job_id = response_body.id;

            }
            
        })
    });
    post_request.write(post_data);
    post_request.end();
}

function whetherJobFinished(job_id){
    var get_options = {
        host: api_address,
        path: "/jobs/" + job_id,
        headers:{
            'X-Oc-Api-Key': api_key,
            'Content-Type': 'application/json',
        }
    };

    http.get(get_options, function(res){
        var job_status_body = '';
        res.on('data', function(chunk){
            job_status_body += chunk;
        }).on('end', function(){
            console.log("Get job status:" + job_status_body);
            var job_status = JSON.parse(job_status_body);
            if(job_status.status.code === 'completed'){
                console.log("job finished : " + job_id);
                var download_address = job_status.output[0].uri;
                console.log("Get download uri: " + download_address);
                downloadFile(download_address);
            }
            else{
                console.log("Job " + job_id + " not finished yet, will try 3 seconds later");
                setTimeout(whetherJobFinished(job_id), 3000);
            }
        });
    });
}

function downloadFile(file_address){
    var tmp_file = fs.createWriteStream("tmpfile");
    http.get(file_address, function(res){
        res.pipe(tmp_file);
        tmp_file.on('finish', function(){
            console.log("Write file into " + tmp_file);
            tmp_file.close(sendEmail(tmp_file));
        })
    });
}

function sendEmail(file){
    console.log("will send email");
}