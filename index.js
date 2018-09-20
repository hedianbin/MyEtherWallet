let Koa = require('koa');
//通过koa创建一个应用程序
let app = new Koa();
//导入router/router包，那么变量router拿到的数据就是router/router.js导出的数据
let router=require('./router/router');
//导入静态资源包
let static = require('koa-static');
//导入路径path包
let path = require('path');
//导入模板引擎包
let views = require('koa-views');
//导入koa-body包
let koaBody = require('koa-body');
let fs = require('fs')

//拦截前端所有访问请求数据
app.use(async (ctx,next)=>{
    console.log(`${ctx.method} ${ctx.url} ............`)
    //必须要调next
    await next();
})

//静态路径注册到中间件
app.use(static(path.join(__dirname,'static')))
//模板引擎路径和类型配置
app.use(views(path.join(__dirname,'views'),{
    map:{html:'ejs'
    }}))
//将koa-body注册中间件
app.use(koaBody({
    multipart:true
}))

//中间件注册router
app.use(router.routes())

console.log("正在监听3000端口")
//监听3000端口
app.listen(3000)