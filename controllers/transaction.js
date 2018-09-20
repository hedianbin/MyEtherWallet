//导入success,fail
let {success, fail} = require("../utils/myUtils");
let web3 = require('../utils/myUtils').getweb3()
module.exports = {
    //显示转帐页面
    transactionHtml: async (ctx, next) => {
        //展示给前端转帐页面
        await ctx.render('transaction.html')
    },
    //显示查询交易详情页面
    checkTransactionHtml: async (ctx, next) => {
        //显示页面给前端
        await ctx.render('checktransaction.html')
    },
    //查询交易详情
    checkTransaction:async(ctx,next)=>{
        //拿到前端post过来的hash值
        let hash = ctx.request.body.hash
        console.log(hash)
        //用交易hash去私链里取交易详情数据
        let data = await web3.eth.getTransaction(hash)
        //给前端返回数据
        ctx.body=success(data)
    },
    //发送交易
    sendTransaction: async (ctx) => {
        //一次性将从ctx.request.body里把字段都取出来。变量名要和body里字段名一样才可以这样取
        let {fromaddress, toaddress, number, privatekey, gaslimit} = ctx.request.body
        var Tx = require('ethereumjs-tx');
        //然后还要设置转帐人私钥，把转帐人的私钥传进来
        var privateKey = new Buffer(privatekey.slice(2), 'hex')
        //获取nonce值
        let nonce = await web3.eth.getTransactionCount(fromaddress)
        //获取gasPrice的值
        let gasPrice = await web3.eth.getGasPrice()
        //将number转换成Wei
        let balance = web3.utils.toWei(number)
        var rawTx = {
            //nonce:可以通过web3提供方法获取。相应的api,web3.eth.getTransactionCount,获取交易个数，这个交易个数就是nonce,以太坊和比特币nonce一样，以太坊的nonce值是增加一笔交易才+1，而比特币是为了pow的有效算有效hash的时候nonce无限+1.
            nonce: nonce,
            //gasPrice:交易价格，也可以通过web3的方法获取web3.eth.getGasPrice
            gasPrice: gasPrice,
            //gasLimit:交易限制，这个值必须小于21000，等于21000都会报错，一般设置成20000就行，真坑
            gasLimit: gaslimit,
            //to: 给谁转，需要前端传过来
            to: toaddress,
            //value:转帐数额，需要前端传过来
            value: balance,
            //data:转token的时候需要设置，如果转以太币就不需要，传空就行了。
            data: '0x00'
        }

        //预估本次交易所要花费的gas
        let gas = await web3.eth.estimateGas(rawTx)
        //将预估好的gas值设置到rawTx中
        rawTx.gas = gas
        //创建交易对象
        var tx = new Tx(rawTx);
        //签名
        tx.sign(privateKey);
        //将交易进行序列化
        var serializedTx = tx.serialize();

        //存储返回给前端的数据
        let responseData;
        //将交易转成16进制字符串后发送交易。是异步的，需要加await
        await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, data) {
            console.log(err)
            console.log(data)
            if (err) {//判断，如果err不为空，就说明交易发送失败
                responseData = fail(err)//把错误信息返回给前端
            }
        })
            .then(function (data) {
                console.log(data)
                if (data) {//如果data有值，说明有交易数据生成
                    //返回给前端2个字段
                    responseData = success({
                        "blockHash": data.blockHash,//区块hash
                        "transactionHash": data.transactionHash//交易hash
                    })
                } else {
                    responseData = fail("交易失败，没拿到交易数据")
                }
            })

        ctx.body = responseData;
    }
};