module.exports = {
    getweb3: () => {
        //导入web3库
        let Web3 = require("web3")
        //连接私链
        var web3 = new Web3(Web3.givenProvider || 'http://192.168.159.15:8545');
        // var web3 = new Web3(Web3.givenProvider || 'https://kovan.infura.io/v3/428486a36f2c4994b65a86f5b604611c');
        //返回web3对象
        return web3
    },
    //成功返回信息
    success:(data)=>{
        responseData = {
            code:0,
            status:"success",
            data:data
        }
        return responseData
    },
    //失败返回信息
    fail:(msg)=>{
        responseData = {
            code:1,
            status:"fail",
            msg:msg
        }
        return responseData
    }
}