//隐藏下载keystore，显示保存私钥
function saveKeystoreNext() {
    $("#save-keystore").hide()
    $("#save-privatekey").show()
}

//配置帐户信息
function configAccountInfo(data) {
    //显示帐户地址
    $("#account-address").text(data.address)
    //显示帐户余额
    $("#account-balance").text(data.balance)
    //隐藏帐户解锁页
    $("#transaction-first").hide()
    //显示转帐页
    $("#transaction-second").show()
    //给input name=fromaddress赋值
    $("input[name=fromaddress]").val(data.address)
    //给input name=privatekey赋值
    $("input[name=privatekey]").val(data.privatekey)
    //显示代币余额
    $("#account-token-balance").text(data.tokenBalance)
    //显示代币简称
    $("#account-token-symbol").text(data.symbol)
    //添加代币类型
    $("#send-transaction-token-symbol").text(data.symbol)
}

//私钥解锁方法
function unlockAccountWithPrivatekey(){
    //拿到前端传过来的私钥的值
    let privatekey = $("#input-privatekey").val()
    console.log(privatekey)
    //将私钥用post发送到后端
    $.post('/privateunlock',`privatekey=${privatekey}`,function (res,status) {
        //判断后端返回是否为成功0，如果成功就执行代码块
        if (res.code==0){
            console.log(status + JSON.stringify(res))
            //将服务端返回的帐户信息显示到页面
            configAccountInfo(res.data)
        }
    })
}

//keystore解锁功能
function unlockAccountWithKeystore(){
    //获取上传的文件的值
    var filedata = $("#unlock-account-file").val()
    //如果文件长度小于等于0，没有拿到文件，就提示
    if (filedata.length <= 0) {
        alert("请选择文件!")
        return
    }
    //文件上传通过Formdata去储存文件的数据，通过FormData去提交
    var data = new FormData()
    //将文件数据添加到data里，第一个参数是从type="file"的文件选择框获取数据
    data.append("file", $("#unlock-account-file")[0].files[0])
    //将密码数据添加到data里，第一个参数是从type="password"的密码输入框获取数据
    data.append("password", $("#unlock-account-password").val())
    alert(data)
    //设置上传路径,需要在router.js添加
    var urlStr = "/keystoreunlock"
    //将data通过ajax上传
    $.ajax({
        url: urlStr,//上传路径
        type: "post", //上传方式post
        dataType: "json",//数据类型json
        contentType: false,//内容类型
        data: data,//要上传的数据
        processData: false,//不用分析数据
        //如果上传成功。将数据返回给前端
        success: function (res, status) {
            alert(JSON.stringify(res)+status)
            //判断后端返回是否为成功0，如果成功就执行代码块
            if (res.code==0){
                //将服务端返回的帐户信息显示到页面
                configAccountInfo(res.data)
            }
        },
        //上传失败，前端弹出错误信息和错误状态码
        error: function (res, status) {
            alert(JSON.stringify(res)+status)
        }
    })
}

//查询交易提交
function checkTransaction() {
    //拿到前端传过来的交易hash值
    let hash = $("#transaction-info-hash").val()
    if (hash==""){
        alert("请输入交易hash")
        return
    }
    //将hash发送到后台，需要添加回调函数，获取传回来的数据
    $.post('/checktransaction',"hash="+hash,function (res,status) {
        console.log(status+JSON.stringify(res))
        if (res.code==0){//判断如果返回0说明交易查询到了
            //将交易hash显示在前端pre里面，因为返回来的res.data是对象，所以我们需要转换成json字符串
            //但是转换后，显示的是一行，所以我们需要将json字符串进行格式化。null是替换字符，4是第一行前面空几个空格。
            $("#transaction-info").text(JSON.stringify(res.data,null,4))
            $("#check-tx-table").hide()//将查询hash表单隐藏
            $("#checked-tx").show()//显示查询结果table
        }
    })
}

//等待页面加载完成后再触发里面的方法
$(document).ready(function () {
    //取页面所有的input标签，name值=unlocktype的，当标签状态被改变的时候，就执行function里面的方法。
    $("input[name=unlocktype]").change(function () {
        if (this.value==1){ //keystore
            $("#unlock-account-keystore").show() //显示keystore
            $("#unlock-account-privatekey").hide() //隐藏privatekey
        }else{//privatekey
            $("#unlock-account-keystore").hide() //隐藏keystore
            $("#unlock-account-privatekey").show() //显示privatekey
        }
    })
    //转账验证表单
    //验证的表单是send-transaction-form
    $("#send-transaction-form").validate({//转帐表单验证
        rules:{//验证的字段
            toaddress:{//验证给谁转,要和表单里的name一样
                required: true,//必须输入
            },
            number:{//验证转多少，要和表单里的name一样
                required:true,
            },
        },
        messages:{//没输入提示信息
            toaddress:{//要和表单里的name一样
                required:`<br>请输入对方地址`,
            },
            number:{//要和表单里的name一样
                required:`<br>请输入转账数额`
            },
        },
        submitHandler: function(form)//转帐post提交数据
        {
            //获取下拉列表框里的代币类型
            var urlStr
            let tokenType = $("#send-transaction-token-type").val()
            if (tokenType==1){//以太币
                //提交到以太币接口
                urlStr = "/sendtransaction"
            }else{//提交到代币接口
                urlStr = "/sendtoken"
            }

            alert("urlStr:"+urlStr)
            $(form).ajaxSubmit({
                url:urlStr,//提交网址
                type:"post",//提交方式
                dataType:"json",//提交数据类型
                success:function (res, status) {
                    console.log(status + JSON.stringify(res))
                    if (res.code==0){//说明交易发送成功
                        //将交易hash显示到页面上
                        $("#transaction-complate-hash").text(res.data.transactionHash)
                        //将区块hash显示到页面上
                        $("#transaction-complate-blockhash").text(res.data.blockHash)
                        //将table显示出来
                        $("#transaction-complate").show()
                    }
                },
                error:function (res, status) {
                    console.log(status + JSON.stringify(res))
                }
            });
        }
    })
});