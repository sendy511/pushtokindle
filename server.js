 http = require('http');
var xml2js = require('xml2js');
var JSON = require('JSON');
var fs = require('fs');
var url = require('url');
var request = require('request');
var nodemailer = require('nodemailer');
var tf = require('timeformatter')('en');

var port = 18080;

var api_address = "api2.online-convert.com";
var api_key = 'f0c315563b656b7d40101ac578fc289f';

var convert_file_format = "pdf";
var saved_file_name = tf.format("yyyyLLdd-HHmm") + "." + convert_file_format;

http.createServer(function(req, res) {
    console.log(new Date() + req.url);

    res.writeHead(200, {'Content-Type': 'text/html'});

    if(req.method == 'POST'){
		responseMessage(req);
    }
    
    //whetherJobFinished("6d9b67ab-ba05-11e5-a6e2-002590d8633c");
    //createEbookParsingJob("http://www.baidu.com");
    //sendEmail("tmp");

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
            var url = result.xml.Content[0];
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
            'target': convert_file_format
        }]
    });
    console.log("Create job http body: " + post_data);
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
            var createdJob = JSON.parse(response_body);
            if (createdJob){
                var job_id = createdJob.id;
                console.log("Get job id : " + job_id);
                whetherJobFinished(job_id);
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
                console.log("Job " + job_id + " not finished yet, will try 10 seconds later");
                setTimeout(whetherJobFinished(job_id), 10000);
            }
        });
    });
}

function downloadFile(file_address){
    request(file_address).pipe(fs.createWriteStream(saved_file_name));
    console.log("File download to local disk");
    sendEmail(saved_file_name);
}

function sendEmail(file){
    console.log("will send email");

    var transporter = nodemailer.createTransport('smtps://douyanseng%40163.com:1984224123@smtp.163.com');

    var mailOptions = {
        from: 'Yansen<douyanseng@163.com>',
        to: 'douyanseng_53@iduokan.com', // list of receivers
        subject: 'Hello', // Subject line
        text: 'Hello world', // plaintext body
        html: '<b>Hello world</b>', // html body
        attachments:[{path:file}]
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}