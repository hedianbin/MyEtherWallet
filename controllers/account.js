//导入web3库
let web3 = require('../utils/myUtils').getweb3()
//导入myUtils库,拿到里面的某些方法，我们需要拿到success和fail方法
let {success, fail} = require('../utils/myUtils')
//导入fs库
let fs = require('fs');
//调用合约对象
let myContract = require('../models/contract').getContract()

//查询帐户余额
async function getAccountBalance(address) {
    let balance = await web3.eth.getBalance(address)
    //将Wei转换成ether
    return web3.utils.fromWei(balance, 'ether')
}

//配置返回给前端的数据，包含以太币的数据，还有ｔｏｋｎｅ的数据
//传一个account对象就行了，然后就能拿到account里面的address,privatekey
async function setResponseData(account) {
    //调用函数查询余额,显示的是Wei,10的18次方
    let balance = await getAccountBalance(account.address)
    console.log(balance)
    //获取合约余额
    let myBalance = await myContract.methods.balanceOf(account.address).call()
    //获取代币的次方数
    let decimals = await myContract.methods.decimals().call()
    //转换代币为最大单位
    myBalance = myBalance / Math.pow(10,decimals)
    //获取代币简称
    let symbol = await myContract.methods.symbol().call()

    // 拿到余额和地址后返回给前端的数据,直接调用myUtils.success，传的map字典
    data = {
        balance: balance,
        address: account.address,
        privatekey: account.privateKey, //私钥的K大写的
        tokenBalance: myBalance, //代币余额
        symbol:symbol //合约简称
    }
    //这里就不用ctx.body了，我们要在其他地方调用这个方法，我们就直接return数据就行了。调用方法就拿到此数据了
    return success(data)
}


module.exports = {
    //通过private解锁帐户功能
    unlockAccountWithPrivate: async (ctx) => {
        //拿到后端router发来的post请求中的privatekey的值
        let privatekey = ctx.request.body.privatekey
        console.log(privatekey)
        //调用web方法解锁帐户拿到帐户对象数据
        let account = web3.eth.accounts.privateKeyToAccount(privatekey);
        console.log(account)
        //将私钥解锁的帐户信返回给前端
        ctx.body = await setResponseData(account)
    },
    //通过keystore解锁帐户功能
    unlockAccountWithKeystore: async (ctx) => {
        //获取前端传过来的keystore密码
        let password = ctx.request.body.password
        console.log(password)
        //拿到上传过来的keystore文件的信息
        let keystore = ctx.request.files.file
        console.log(keystore);
        //读取上传的keystore内容数据
        let keystoreData = fs.readFileSync(keystore.path, 'utf8')
        console.log(keystoreData)
        //用keystore数据和密码解锁帐户
        let account = web3.eth.accounts.decrypt(JSON.parse(keystoreData), password);
        console.log(account)
        //调用函数查询余额,显示的是Wei,10的18次方
        let balance = await getAccountBalance(account.address)
        console.log(balance)

        //将私钥解锁的帐户信返回给前端
        ctx.body = await setResponseData(account)
    }
}