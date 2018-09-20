//引用utils,并调用getweb3拿到web3对象
let web3 = require('../utils/myUtils').getweb3()
//引入fs
let fs = require('fs')
//引入path
let path = require('path')
let moment = require('moment')

module.exports = {
    //获取创建账号的页面
    newAccountHtml: async (ctx) => {
        await ctx.render("newaccount.html")
    },
    //表单提交被触发的方法
    newAccount: async (ctx) => {
        //console.log("newAccount")
        console.log(ctx.request.body.password)
        //创建钱包帐号
        let account = web3.eth.accounts.create(ctx.request.body.password);
        //console.log(account)
        //创建keystore
        let keystore = account.encrypt(ctx.request.body.password)
        console.log(keystore)
        //将keystore转换成json字符串
        let keystoreString = JSON.stringify(keystore)
        //命名keystore
        //格式化时间
        let t1 = moment(new Date).format('YYYY-MM-DDTHH-mm-ss').toString()
        //获取时间戳，并取整
        var t2 = parseInt(process.uptime() * 100)
        //后面的slice(2)字符串截取，2是从第2位开始截取，因为前两个是0x,eth的keystore没有0x
        let fileName = 'UTC--' + t1 + '.' + t2 + 'Z--' + account.address.slice(2)
        console.log(fileName)
        //生成文件保存路径
        let filePath = path.join(__dirname, "../static/keystore", fileName)
        console.log(filePath)
        //将keystore保存到文件，传文件路径和keystore字符串
        fs.writeFileSync(filePath, keystoreString)

        await ctx.render('downloadKeystore.html',{
            "downloadurl":"keystore/"+fileName,
            'privatekey':account.privateKey
        })
        //ctx.body = '我已收到'
    }
}