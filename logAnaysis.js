var  fs = require('fs'),
     iconv = require('iconv-lite'),// 加载编码转换模块
     openDB = require('json-file-db'),
     path = require('path'),
     _= require('lodash'),
     validate = require('validate-url'),
     util = require('util'),
     async  = require('async');

var file = path.join(__dirname,'./result.text');
var logs = openDB(path.join(__dirname,  './log.json'));
exports.analyse= writeFile(file,function(){
    readFile(file);
});


//必需是整数
function isInt(str){
var reg = /^\d+$/ ;
return reg.test(str);
}
function checkProperty(property,subpro,type){
    var flag=true;
    if(!property){
            return "\r\n没有返回"+subpro;
    }else{
        if(type == "string"){
            if(!_.isString(property)){
                flag =false;
            }
        }else if(type =="float"){
            if(!_.isNumber(property)){
                flag = false;
            }
        }
    }
    if(!flag){
        return '\r\n'+subpro+'格式不正确';
    }else{
        return ;
    }
}
function checkoption(property,sub,type){
        var flag =true;
       if(!_.isArray(property)){
            return "\r\n"+sub+"格式不正确"
        }else{
            for(var i in property){
                var catobj = property[i];
                if(type == "string"){
                        if(_.isString(catobj)){
                        flag = false;
                    }
                }else if(type == "integer"){
                   if(!isInt(catobj)){
                        flag = false;
                   }
                }
            }
        }
        if(!flag){
            return '\r\n'+sub+'值格式不正确'
        }else{
            return ;
        }
}
function checkurl(property,subpro){
    var flag = true;
    if(!property){
        return "\r\n没有返回"+subpro;
    }else{
        if(!validate(property)){
           flag = false;
        }
    }
    if(!flag){
        return "\r\n"+subpro+"无效";
    }else{
        return ;
    }
}
function writeFile(file,cb){
    //analyse the loig.josn and write the concolusion
    logs.get(function(err,data){
        if(err){
            console.error('读取log.json文件失败',err);
        }else{
              if(data.error){
                var str = "返回"+JSON.stringify(data.error);
              }else{
                      var falsenum= _.countBy(data[data.length-1].status,function(n){return  n == 200})['false'],
                          falselist=_.intersection(_.filter(data[data.length-1].status, function(n){
                              return n !=200}));
                      var impnum = data[data.length-1].request['imp'].length;
                      var str = "共请求"+"\033[31m"+data.length+"\033[39m"+"次，成功响应"+"\033[31m"+(data.length -(falsenum ? falsenum:0))+"\033[39m"+"次";
                      if(falselist.length){
                          str += "\r\n返回状态"+"\033[31m"+falselist+"\033[39m";
                      }

                      if(data[data.length-1].errids.length !=0){
                          str +="\r\n"+data[data.length-1].errids.length+"次响应与请求id不同";
                      }
                      if(data[data.length-1].decodeerr !=0){
                          str += "\r\n解析失败的次数:"+"\033[31m"+data[data.length-1].decodeerr+"\033[39m";
                      }
                      var seatpar= 0,bididf=0,bididtype= 0,nbrexi="", nbrtype="",
                          bidObjid="",bidObjimpid="",bidObjprice="",bridObadomain = "",bidObjw ="",seatObj="",
                          bidObjh ="",bidObjtype ="",bidObjbundle = true,bidObjadid = true,bidObjcid =true,bidObjcrid = true,bidObadm = "",
                          bidObiurl="",bidObnurl =true,bidObcurl="",bidObjextiurl = true,bidObjcat = "",bidObjattr="",seatbidparm=true,seatbidnum =true;
                      for(var m in data){
                          var dataobj = data[m];
                          if(dataobj.response['seatbid']){
                              var setabidArr = dataobj.response['seatbid'];
                              if(!(setabidArr instanceof  Array)){
                                  seatpar++;
                              }else{
                                  if(setabidArr.length > 0){
                                      var seatbidnum = setabidArr.length;
                                      if(seatbidnum < impnum){
                                          seatbidnum = false;
                                      }


                                      for(var i in setabidArr){

                                          var setabidObj = setabidArr[i];
                                          var bidArr = setabidObj.bid;
                                          var seat =setabidObj.seat;
                                          if(checkProperty(seat,'seat','string')){
                                              seatObj = checkProperty(seat,'seat','string');
                                          }
                                          for(var i in bidArr){
                                              var bidObj = bidArr[i];
                                              if(checkProperty(bidObj.id,'bid值中id','string')){
                                                  bidObjid = checkProperty(bidObj.id,'bid值中id','string');
                                              }
                                              if(checkProperty(bidObj.impid,'impid','string')){
                                                  bidObjimpid = checkProperty(bidObj.impid,'impid','string');
                                              }
                                              if(checkProperty(bidObj.price,'price','float')){
                                                  bidObjprice = checkProperty(bidObj.price,'price','float');
                                              }
                                              if(checkProperty(bidObj.adomain,'adomain','string')){
                                                  bridObadomain = checkProperty(bidObj.adomain,'adomain','string');
                                              }
                                              if(checkProperty(bidObj.w,'w','float')){
                                                  bidObjw = checkPrcheckProperty(bidObj.w,'w','float');
                                              }
                                              if(checkProperty(bidObj.h,'h','float')){
                                                  bidObjh = checkPrcheckProperty(bidObj.h,'h','float');
                                              }
                                              if(checkProperty(bidObj.type,'type','float')){
                                                  bidObjtype = checkPrcheckProperty(bidObj.type,'type','float');
                                              }
                                              if(bidObj.bundle){
                                                  if(!_.isString(bidObj.bundle)){
                                                      bidObjbundle =false;
                                                  }

                                              }
                                              if(bidObj.adid){
                                                  if(!_.isString(bidObj.adid)){
                                                      bidObjadid =false;
                                                  }
                                              }
                                              if(bidObj.cid){
                                                  if(!_.isString(bidObj.cid)){
                                                      bidObjcid =false;
                                                  }
                                              }
                                              if(bidObj.crid){
                                                  if(!_.isString(bidObj.crid)){
                                                      bidObjcrid =false;
                                                  }
                                              }
                                              if(bidObj.adm){
                                                  try{
                                                      var bidobjjson= JSON.parse(bidObj.adm);
                                                  }catch(e){
                                                      bidObadm = '\r\nadm格式不正确';
                                                  }
                                              }else{
                                                  bidObadm ='\r\nadm没有返回';
                                              }

                                              if(checkurl(bidObj.iurl,'iurl')){
                                                  bidObiurl= checkurl(bidObj.iurl,'iurl');
                                              }
                                              if(bidObj.nurl){
                                                  if(!validate(bidObj.nurl)){
                                                      bidObnurl =false;
                                                  }
                                              }
                                              if(checkurl(bidObj.curl,'curl')){
                                                  bidObcurl= checkurl(bidObj.curl,'curl');
                                              }
                                              if(bidObj.extiurl){
                                                  for(var j in bidObj.extiurl){
                                                      var extiurlObj = bidObj.extiurl[j];
                                                      if(!validate(extiurlObj)){
                                                          bidObjextiurl = false;
                                                      }
                                                  }
                                              }
                                              if(bidObj.cat){//cat attr枚举类型校验复杂，这里只校验是否整数
                                                  bidObjcat = checkoption(bidObj.cat,'cat','integer');
                                              }
                                              if(bidObj.attr){
                                                  bidObjattr = checkoption(bidObj.attr,'attr','integer');
                                              }
                                          }
                                      }
                                  }else{
                                      seatbidparm = false;
                                  }
                              }
                          }
                          if(!dataobj.response.bidid){
                              bididf ++;
                          }else{
                              if(!_.isString(dataobj.response.bidid)){
                                  bididtype ++;
                              }
                          }

                          if(dataobj.response.nbr){
                              if(Array.isArray(dataobj.response.nbr)){
                                  for(var i in dataobj.response.nbr){
                                      if(["0","1","2"].indexOf(dataobj.response.nbr[i]) === -1){
                                          str += "\r\nnbr值有误"
                                      }
                                  }
                              }else if(typeof dataobj.response.nbr === 'string'){
                                  if(["0","1","2"].indexOf(dataobj.response.nbr) === -1){
                                      str += "\r\nnbr值有误"
                                  }
                              }
                          }
                      }


                      if(seatObj){
                          str += seatObj;
                      }
                      if(seatpar){
                          str +="\r\n"+"\033[31m"+seatpar+"\033[39m"+"次seatbid值格式不正确";
                      }
                      if(!seatbidparm){
                          str += "\r\n\033[31m warning:seatbid数组为空! \033[39m"
                      }
                      if(!seatbidnum){
                          str += "\r\n\033[31m warning:seatbid中有对应的imp没有返回! \033[39m"
                      }

                      if(bididf){
                          str +="\r\n"+"\033[31m"+bididf+"\033[39m"+"次bidid没有返回"
                      }
                      if(bididtype){
                          str +="\r\n"+bididtype+"次bidid值格式不正确"
                      }
                      if(bidObjid){
                          str += bidObjid;
                      }
                      if(bidObjimpid){
                          str += bidObjimpid;
                      }
                      if(bidObjprice){
                          str += bidObjprice;
                      }
                      if(bridObadomain){
                          str += bridObadomain;
                      }
                      if(bidObjw){
                          str += bidObjw;
                      }
                      if(bidObjh){
                          str += bidObjh;
                      }
                      if(bidObjtype){
                          str += bidObjtype;
                      }
                      if(!bidObjbundle){
                          str += "\r\n" + 'bundle格式不正确'
                      }
                      if(!bidObjadid){
                          str += "\r\n" + 'adid格式不正确'
                      }
                      if(!bidObjcid){
                          str += "\r\n" + 'cid格式不正确'
                      }
                      if(!bidObjcrid){
                          str += "\r\n" + 'crid格式不正确'
                      }
                      if(bidObadm){
                          str  += '\r\n'+bidObadm;
                      }
                      if(bidObiurl){
                          str += bidObiurl;
                      }
                      if(!bidObnurl){
                          str +="\r\n"+'nurl无效'
                      }
                      if(bidObcurl){
                          str += bidObcurl
                      }
                      if(!bidObjextiurl){
                          str +="\r\n extiurl无效"
                      }
                      if(bidObjcat){
                          str += bidObjcat;
                      }
                      if(bidObjattr){
                          str += bidObjattr;
                      }

                  }
                if(str.indexOf('\r\n')  === -1){
                    str +="\r\n 字段格式无误"
                }
                var arr =iconv.encode(str,'utf8');
                fs.writeFile(file, arr,function(err){
                    if(err){
                        console.error('从log.json写进result.text失败',err);
                    }else{
                        cb();
                    }
                });
              }
        })
}

function readFile(file){  
    fs.readFile(file, function(err, data){  
        if(err)  
            console.log("读取文件fail " + err);  
        else{  
            // 读取成功时  
            // 输出字节数组  
            // 把数组转换为gbk中文
            var str = iconv.decode(data, 'utf8');
            console.log(str);
        }  
    });  
}  



