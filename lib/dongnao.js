var http = require('http')
var url = require('url')
var fs = require('fs')
var querystring = require('querystring')
var ejs = require('ejs')


function dongnao() {
    this.routes = []
    if(this.constructor !=dongnao){
        return new dongnao()
    }
}
dongnao.prototype.get = function (url,cb) {
    this.routes.push({
        url:url,
        cb:cb,
        method:'GET',
        isMid:false
    })
}

dongnao.prototype.post = function (url,cb) {
    this.routes.push({
        url:url,
        cb:cb,
        method:'POST',
        isMid:false
    })
}
dongnao.prototype.use = function () {
    var url,cb
    if(arguments.length == 1){
        url = '*'
        cb =arguments[0]
    }else {
        url =arguments[0]
        cb = arguments[1]
    }
    this.routes.push({
        url:url,
        cb:cb,
        method:'GET',
        isMid:true
    })
}

dongnao.prototype.run = function (req,res) {
    var that = this

    var nextIndex =-1


    var pathname = url.parse(req.url).pathname
    var query = url.parse(req.url).query
    req.query = querystring.parse(query)
    var next = function(){
  
        if(that.routes[nextIndex].isMid){
            handleRequest(nextIndex+1)
        }
    }

    var handleRequest = function(index){
        if(index == that.routes.length){
            res.send('404 not found')
            return 
        }
        var matchUrl = that.routes[index].url == pathname || that.routes[index].url == '*'
        var matchMethod = req.method == that.routes[index].method
 
        if(matchUrl && matchMethod){
             nextIndex = index
            that.routes[index].cb(req,res,next)
        }else{
            handleRequest(index+1)
        }
    }
    handleRequest(0)

    // var route = that.routes.find(function (obj) {
    //     return obj.url == req.url && obj.method == req.method
    // })

    // var next = function () {

    // }





    // if(route){
    //     res.writeHead(200, {'Content-Type': 'text/html'});
    //     route.cb(req,res)
    // }else {
    //     res.writeHead(404, {'Content-Type': 'text/html'});
    //     res.end('404 not found')
    // }
}
dongnao.prototype.listen = function (port) {
    var that = this
    this.server = http.createServer(function (req,res) {



        res.send = function (text) {
            res.end(text)
        }
        res.render = function (file,data) {
            res.writeHead(200, {'Content-Type': 'text/html'});

            var text = fs.readFileSync('./views/'+file,'utf-8')
            var a = ejs.render(
                    text,
                    data
                )

            res.send(a)
        }

        res.redirect = function (url) {
            res.writeHead(302, {
                'Location': url
                //add other headers here...
            });
            res.end();
        }

        if(req.method == 'GET'){
            that.run(req,res)
        }
        if(req.method == 'POST'){
            var body = ''
            req.on('data',function (chunk) {
                body += chunk
            })
            req.on('end',function () {
                req.body = querystring.parse(body)
                that.run(req,res)
            })
        }
    }).listen(port)
}

module.exports = dongnao