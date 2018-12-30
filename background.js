var currenturl;
var rooturl;
var status;
var Ext;
var filename;
var paths = new Array();
var dicts = new Array(
    ".git/config", ".gitignore", ".svn/wc.db", ".svn/entries", ".npmrc",
    "Package.json", ".htaccess", "config.json", "config.yml", "config.xml",
    ".idea", "nbproject/project.xml", ".bowerrc", ".eslintrc",
    ".jshintrc", ".DS_Store", ".gitlab-ci.yml", "database.yml",
    "phpMyadmin", ".bash_history"
    );


chrome.tabs.onUpdated.addListener(function ( tabId, changeInfo, tab) {
    if(status == "false"){
        return;
    }
    if(changeInfo.status == "loading"){
        // 判断是否打开空白页
        if(tab.url == "chrome://newtab/"){
            //alert("Open a blank tab");
            return;
        }
        // 判断是否为http开头的url
        if(tab.url.indexOf("http") < 0){
            //alert("URL is not http(s)");
            return;
        }

        // 判断是否为刷新页面
        if(currenturl){
            oldurl = currenturl;
            currenturl = tab.url;
            if(oldurl != currenturl){
                Main();
            }else{
                //alert('Refresh page, dont detect');
                return;
            }
        }else {
            currenturl = tab.url;
            Main();
        }
    }
    return;
});

chrome.contextMenus.create({
    title: "Stop Sensinfor",
    id: "Sensinfor",
    onclick: function(){
        if (status == 'true') {
            chrome.contextMenus.update('Sensinfor', {title: 'Start Sensinfor'} , function(){});
            status = false;
        }else{
            chrome.contextMenus.update('Sensinfor', {title: 'Stop Sensinfor'} , function(){});
            status = true;
        }
    }
});

function msg(content) {

}


function parseUrl(url) {
    // 使用location对象解析Url
    var a = document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        port: a.port,
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1]
    };
}

function getAllpath(url) {
    // 获取当前url下的每个路径
    var parseURL = parseUrl(url);
    var protocol = parseURL.protocol;
    var host = parseURL.host;
    var port = parseURL.port;
    var path = parseURL.path;
    var file = parseURL.file;


    // 设置根路径
    if(port){
        rooturl = protocol + "://" + host + ":" + port;
    }else {
        rooturl = protocol + "://" + host
    }
    //alert("rootUrl is: " + rooturl);
    // 设置文件名
    filename = file;
    //alert("filename is: "+ file);



    var path = path.split("/");
    // 对扩展名的判断
    if(file.indexOf(".") > 0){
        // 有扩展名
        var length = path.length-1;
        Ext = file.split(".")[1];
    }else {
        var length = path.length;
        Ext = 0;
    }

    for(i=1; i<length; i++)
    {
        if(path[i] != '') {
            paths.push("/"+ path[i]);
        }
    }
    //  扫描根路径
    if(paths == '' || paths.indexOf("/")<0){
        paths.push('/');
    }


    //alert("All dict is: " + paths);

}




function parseRobots() {
    // 自动解析robots

}

function autoDetectbak() {
    // 动态探测备份文件, 兼容伪静态, swp, swo, zip, tar.gz, 7z, rar, bak, www.zip, back.zip,
    var file = filename;


}
function sendExp(url, method, mode) {
    $.ajax({
        type: method,
        url: url,
        complete: function (xmlhttp) {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status != 404 && xmlhttp.status != 500) {
                    response =  {
                        url: url,
                        statusCode: xmlhttp.status,
                        res: xmlhttp.responseText,
                        ct: xmlhttp.responseHeaders,
                        field: xmlhttp.responseFields
                    };
                    // Callback
                    if(mode == "phpinfoDetect"){
                        phpinfoDetect(response);
                    }else if(mode == "leakSourceDetect"){
                        leakSourceDetect(response);
                    }

                }
            }
        }
    });
}

function phpinfoDetect(res) {
    // 异步传输，参数回调问题..
    if(res){
        if(res.statusCode == 200){
            alert("[+] 200: " + res.url);
        }
        return;
    }
    var res;
    var targets = new Array("phpinfo", "test", "info","1", "php");
    for(i=0; i<targets.length; i++){
        for(j=0; j<paths.length; j++){
            // 对扩展名兼容不是太好
            if(!Ext){
                if(paths[j] == '/'){ // 如果是根目录
                    url = rooturl + '/' + targets[i] + ".php";
                }else {
                    url = rooturl +paths[j] + '/' + targets[i];
                }
            }else {
                if(paths[j] == '/'){
                    url = rooturl + '/' + targets[i] + '.' + Ext;
                }else {
                    url = rooturl + paths[j] + '/' + targets[i] + '.' + Ext;
                }

            }
            sendExp(url, "Get", "phpinfoDetect");
        }
    }

}

function  internalNetworkDetect() {
    // 内网探测模式, 针对安全人员
    var targets = new Array("dvwa", "dvwa-master", "phpmyadmin", "ctf", "awd", "flag", "upload", "include");



}


function leakSourceDetect(res) {
    // deal Callback data
    if(res){
        alert("[+] " + res.statusCode + ": " + res.url);
    }

    for(i=0; i<paths.length;i++){
        //alert("path "+i+ "is:" + paths[i]);
        for(j=0; j<dicts.length; j++){
            if(paths[i] == "/"){
                url = rooturl + "/" + dicts[j];
            }else {
                url = rooturl + paths[i] + "/" + dicts[j];
            }
            sendExp(url, "GET", "leakSourceDetect");
        }
    }

    autoDetectbak();
    phpinfoDetect();
}




function Main() {
    // 解析URL，获取当前url的每个目录
    getAllpath(currenturl);
    if(paths != ''){
        // Start!
        leakSourceDetect();

    }


    // 清空全局变量
    paths = [];


}
