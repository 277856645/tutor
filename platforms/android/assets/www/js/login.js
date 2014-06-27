// 初始化
$(document).ready(function() {
	// 重本地获取用户保存的用户名及密码信息并填入表单（如果有的话）
	var username = localStorage.getItem("username");
	var password = localStorage.getItem("password");
	if (username && password) {
		$("#name").val(username); 
		$("#passwd").val(simpleDecoder(password));
		$("#remCkbox").attr("checked", true);
	} else {
		// 若页面是重注册页面跳转过来的，将注册成功的用户名填入相应表单
		var uname = window.top.app.getUrlParam("uname");
		if (uname) {
			$("#name").val(uname);
			$("#passwd").trigger("focus");
		}
	}
});

// 记住密码checkbox值变事件
// localStorage存储
function remLoginInfo(ele) {
	if (ele.checked) {
		var nameVal = $("#name").val();
		var passwdVal = $("#passwd").val(); 
		if (nameVal && passwdVal) {
			localStorage.setItem("username", nameVal);
			localStorage.setItem("password", simpleEncoder(passwdVal));
		}
	} else {
		localStorage.removeItem("username");
		localStorage.removeItem("password");
	}
}

// 表单提交
function submitForm(ele) {
	$("#login-form :text, #login-form :password").css("background-color", "#fff"); 
	
	var nameVal = $("#name").val();
	var passwdVal = $("#passwd").val();

	if (nameVal == '' || nameVal == "用户名") {
		$("#name").css("background-color", "#F4C186").focus();
		return;
	}
	if (passwdVal == '') {
		$("#passwd").css("background-color", "#F4C186").focus();
		return;
	}
	
	remLoginInfo(document.getElementById("remCkbox"));
	
	// 防止重复提交
	$(ele).attr("disabled", true);
	
	var app = window.top.app;
	$.ajax({
		url: app.server + "loginServer.php",
		type: "GET",
		cache: false,
		dataType: "jsonp",
		jsonp: 'jsonpCallback',
		data: {
			username: nameVal,
			password: passwdVal
		},
		success: function(response) {
			if (response.status == "success") {
				// 登录名记录入session 
				sessionStorage.setItem("username", nameVal);
				sessionStorage.setItem("userId", response.id);

				$(ele).attr("disabled", false);
				window.location.href = "main.html";
			} else {
				app.showServerMessage("serverMsg", response.msg, 3000);
				$(ele).attr("disabled", false);
			}
		},
		error: function(XMLHrq, msg) {
			app.showServerMessage("serverMsg", "登录失败！" + msg, 3000);
			$(ele).attr("disabled", false);
		}
	});
}

// phonegap事件
phonegap(["backbutton-twice-exit"]);


