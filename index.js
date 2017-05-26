/**
 * Created by Administrator on 2017/5/20.
 */

var dongnao = require('./lib/dongnao')


var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : '101.200.129.112',
    user     : 'root',
    password : 'surui123',
    database : 'dongnao'
});
connection.connect();
var app = dongnao()
app.use(function(req,res,next){
    console.log(new Date(),req.method,req.url)
    next()
})


app.get('/',function (req, res) {
    res.redirect('index')
})
app.get('/index',function (req,res) {
    var query = connection.query('select * from app1_blog',function (err, results,fileds) {

        res.render('lesson.ejs',{
            app1_blog:results,
        })
    })
})



app.get('/teacher',function (req, res) {
    var author_id = req.query.author_id
    var query = connection.query('select * from app1_user where id = ?',[author_id],function (err,users) {

        var name = users[0].name

        var query2 = connection.query('select * from app1_blog where author_id = ? ',[author_id],function (err,les) {
            res.render('teacher.ejs',{
                name:name,
                lessons:les
            })
        })
    })
})
app.get('/login',function (req, res) {
    res.render('login.html')
})
app.post('/login',function (req, res) {
    var body =req.body
    var query = connection.query('select * from app1_user where name = ? and password = ?',[body.name,body.password],function (err,users) {
        if(users.length){

            res.writeHead(200,{
                'Set-Cookie': 'me_id='+users[0].id+';Max-Age=3600',
                'Content-Type': 'text/plain',
            })
            res.render('login-success.html')
        }else {
            res.send('no user found')
        }
    })
})

app.get('/me',function (req, res) {
    res.render('me.ejs')
})

app.listen(4040)






















