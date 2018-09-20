let router = require("koa-router")()
//导入创建钱包帐户页面的路由
let newAccountController=require('../controllers/newAccount')
//导入transaction.js模块
let transactionController = require('../controllers/transaction')
//导入account.js模块,解锁帐户
let accountController = require("../controllers/account")
//导入contract.js模块，获取合约实例
let tokenController = require("../controllers/token")


//获取创建钱包帐户的页面
router.get('/newaccount',newAccountController.newAccountHtml)
//根据表单提交的密码生成钱包keystore
router.post('/newaccount',newAccountController.newAccount)
//获取转帐的页面
router.get('/transaction',transactionController.transactionHtml)
//发送交易
router.post('/sendtransaction',transactionController.sendTransaction)
//获取查询交易页面
router.get('/checktransaction',transactionController.checkTransactionHtml)
//查看交易详情
router.post('/checktransaction',transactionController.checkTransaction)

//token转帐
router.post("/sendtoken",tokenController.sendToken)


//后端拿到私钥后解锁帐户
router.post('/privateunlock',accountController.unlockAccountWithPrivate)
//通过keystore解锁帐户
router.post('/keystoreunlock',accountController.unlockAccountWithKeystore)

module.exports = router
