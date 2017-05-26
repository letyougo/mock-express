/**
 * Created by Administrator on 2017/5/20.
 */

var http = require('http')
var fs = require('fs')
var ejs = require('ejs')
var url = require('url')
var querystring = require('querystring')


var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : '101.200.129.112',
    user     : 'root',
    password : 'surui123',
    database : 'dongnao'
});

var dongnao = function () {
    if(this.constructor != dongnao){

        return new dongnao()
    }
    this.routes = []
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
        id:false
    })
}
dongnao.prototype.use = function () {
    var url ,cb
    if(arguments.length == 1){
        url = '*'
        cb = arguments[0]
    }else {
        url = arguments[0]
        cb =arguments[1]
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
    var pathname = req.url
    var pathname = url.parse(req.url).pathname
    var query = url.parse(req.url).query
    req.query = querystring.parse(query)

    res.render = function (file,obj) {
        var content = fs.readFileSync('./views/'+file,'utf-8')
        var text = ejs.render(content,obj)
        res.end(text)
    }
    res.send = function (text) {
        res.end(text)
    }

    // var route = that.routes.find(function (obj) {
    //     return obj.url == pathname && obj.method == req.method
    // })

    var nextIndex = -1
    var next = function () {
        if(that.routes[nextIndex].isMid){
            handleRequest(nextIndex+1)
        }
    }
    var handleRequest = function (index) {
        if(index == that.routes.length){
            res.send('404 not found')
            return
        }

        var matchUrl = that.routes[index].url == pathname || that.routes[index].url == '*'
        var matchMethod = that.routes[index].method == req.method
        if(matchMethod && matchUrl){
            nextIndex = index
            that.routes[index].cb(req,res,next)
        }else {
            handleRequest(index+1)
        }
    }
    handleRequest(0)
    // this.routes






    // if(route){
    //     route.cb(req,res)
    // }else {
    //     res.end('404 not found')
    // }
}
dongnao.prototype.listen = function (port) {
    var that = this
     this.server = http.createServer(function (req, res) {

         if(req.method == 'GET'){
             that.run(req,res)
         }
         if(req.method == 'POST'){
             var body = ''
             req.on('data',function (chunk) {
                 body += chunk
             })
             req.on('end',function () {
                 req.body =querystring.parse(body)
                 that.run(req,res)
             })
         }

    }).listen(port)
}
var app = dongnao()

app.use(function(req,res,next){
    console.log(new Date(),req.method,req.url)
    next()
})
app.get('/ccc',function (req,res) {
    res.send('hello ccc')
})
app.get('/index',function (req, res) {
    res.render('aaa.ejs',{
        name:'ryan',
        position:'dongnaoedu'
    })
})

app.post('/login',function (req, res) {
    var body = req.body
    connection.query('select * from app1_user where name = ? and password = ?',[body.name,body.password],function (err,users) {

        if(users.length>0){
            connection.query('select * from app1_blog where author_id = ?',[users[0].id],function (err,blogs) {

                res.render('blog.ejs',{
                    blogs:blogs
                })
            })
        }else {
            res.send('no user find')
        }
    })
})

// app.post('/login',function (req, res) {
//     console.log(req.body,'+++++++++')
//     res.send('hello login')
// })

// render -> vic
// get -- > querystring
// post --> form-data
// use -->
// session - cookie render model
app.listen(5050)





