var   http = require('http'),
	protobuf = require('protobufjs'),
	path = require('path'),
	async= require('async'),
	util= require('util'),
	request= require('request'),
	Q=  require('q'),
	fs = require('fs'),
	_ =  require('lodash'),
	util = require('util'),
	openDB = require('json-file-db');
var bidRequestBuilder = protobuf.loadProtoFile(path.join(__dirname, 'openrtb.proto')).build('BidRequest');
var bidResponseBuilder = protobuf.loadProtoFile(path.join(__dirname, 'openrtb.proto')).build('BidResponse');
var logs = openDB(path.join(__dirname,  './log.json')),
	sizejson = openDB(path.join(__dirname, './size.json'));

var  start = Date.now();
/*var argv= process.argv.slice(2).toString();
try{
	var ip = argv.split('//')[1].split('/')[0].split(':')[0];
}catch(er){
	process.stdout.write('error:missing the url param!');
}
try{
	var port = argv.split('//')[1].split('/')[0].split(':')[1];
}catch(err){
	process.stdout.write('error:missing the port param!');
}
var subst = process.argv.slice(2).toString().split('//')[1].split('/')[1];
var path = argv.substr(argv.indexOf(subst)-1).split(',')[0];
var times = argv.substr(argv.indexOf(subst)-1).split(',')[1];
if(!times){
	process.stdout.write('\033[36m error:missing the times param! \033[39m')
}*/


var testRequest = {
	"id": "80ce30c53c16e6ede735f123ef6e32361bfc7b22",
	"at": 1,
	"tmax": 200,
	// 'test': 0
	"imp": [],
	"site": {
		"id": "102855",
		"domain": "www.foobar.com",
		"cat": ["80206"],
		"page": "http://www.foobar.com/1234.html",
		"publisher": {
			"id": "8953",
			"name": "foobar.com",
			"cat": ["80207"],
			"domain": "foobar.com"
		}
	},
	"device": {
		"h": 1280,
		"w": 800,
		"devicetype": 1,
		"ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13(KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
		"ip": "123.145.167.10"
	},
	"user": {
		"id": "5538d86c5630b40000c09c61"
	}
};


var options = {
	host: '14.17.105.78',
	port: 80,
	headers: {
		'Content-Type': 'application/x-protobuf',
	},
	method: 'POST',
	path:'/adpro'
}

var errtimes = 0;
var requestObj;

function sizefun(){
	var deferred = Q.defer();
	var impArray = testRequest['imp'];

	sizejson.get(function(err,data){
		for(var i in data){
			var sizeObj = data[i];
			var impObj={};
			impObj['id'] = (parseInt(i)+1).toString();
			impObj['bidfloor'] = 0.03;
			impObj['banner'] ={};
			impObj['banner']['id'] =(parseInt(i)+1).toString();
			impObj['banner']['h'] = parseInt(sizeObj.h);
			impObj['banner']['w'] = parseInt(sizeObj.w);
			impObj['banner']['btype'] = [1,2,3,4];
			impObj['banner']['battr'] = "71112";
			impObj['banner']['keywords'] = ["ab"];
			impObj['banner']['bwords'] = ["cd"];
			impArray.push(impObj);
		}
		deferred.resolve(5);
	});
	return deferred.promise;
}


function asyrequest(cb){
	var request = http.request(options);
	request.setNoDelay(true);
	var obj={
		request: testRequest,
		requesttimes: 5,
		status: statusarr
	};
	request.on('error', function(error) {
		errtimes ++;
		options.headers['Content-Length'] = requestObj.length;
		request.useChunkedEncodingByDefault = false;
		request.chunkedEncoding = false;
		asyrequest(cb);
		if(errtimes == parseInt(5-0+1)){
			cb({error:error}).then(function(result){
				var analysislog= require('./logAnaysis.js');
				analysislog.analyse();
			}).catch(function(err){
				console.err(err);
			}).done();
		}
	});

	request.on('response', function(client) {
		var buffers = [];
		statusarr.push(client.statusCode);
		//write into the log.json

		client.on('data', function(chunk) {
			buffers.push(chunk);
		});
		client.on('end', function(callback) {
			var result = Buffer.concat(buffers);
			try{
				result = bidResponseBuilder.decode(result);
				if(result.id !== testRequest.id || !result.id){
					result.id = result.id||"";
					responseidarr.push(result.id);
				}
			}
			catch(err){
				decodeerr ++;
			}
			obj.errids= responseidarr;
			obj.decodeerr = decodeerr;
			obj.response = result;
			logarr.push(obj);
			if(logarr.length==5){
				//写进log.josn后，执行logAnaysis.js中analyse方法（分析log.json，把结果写进result.test,并读出）
				cb(logarr).then(function(result){

					var analysislog= require('./logAnaysis.js');
					analysislog.analyse;
					var end = Date.now();
					var elapsed = (end - start) / 1000;
					console.log('all time'+elapsed);
				}).catch(function(err){
					console.err(err);
				}).done();
			}
		});
	});
	request.write(requestObj);
	request.end();

}
var logarr= [],statusarr=[],responseidarr=[], decodeerr = 0;

var execfun =function(){
	async.times(5,function(n){
		asyrequest(function(obj){//增加写进log.json的回调函数
			var deferred = Q.defer();
			var objstr;
			try{
				objstr = JSON.stringify(obj);
			}catch(err){
				objstr = JSON.stringify({error:'返回内容错误'});
			}
			fs.writeFile('./log.json',objstr,function(err){
				if(err){
					console.log('写进lon.json文件错误',err);
					deferred.reject(err);
				}else{
					deferred.resolve('ok');
				}
			});
			return deferred.promise;
		});
	})
}

sizefun().then(function(data){
	requestObj = new bidRequestBuilder(testRequest).toBuffer();
	return 'ok';
}).then(function(data){
	execfun();
}).catch(function(err){
	console.log('err---'+err);
}).done();

process.on('uncaughtException', function(err) {
	console.error('Caught exception: ' + err);
});
