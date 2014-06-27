// 表单提交
function submitForm(ele) {
	$("#sign-form :text, #sign-form :password").css("background-color", "#fff");
	
	var nameVal = $("#name").val();
	var passwdVal = $("#passwd").val();
	var passwdConfVal = $("#passwdConf").val();

	if (nameVal == '' || nameVal == "用户名") {
		$("#name").css("background-color", "#F4C186").focus();
		return;
	}
	if (passwdVal == '') {
		$("#passwd").css("background-color", "#F4C186").focus();
		return;
	}
	if (passwdConfVal == '') {
		$("#passwdConf").css("background-color", "#F4C186").focus();
		return;
	}
	if (passwdVal != passwdConfVal) {
		$("#passwd, #passwdConf").css("background-color", "#F4C186").filter(":eq(0)").focus();
		return;
	}
	
	// 防止重复提交
	$(ele).attr("disabled", true);
	
	var app = window.top.app;
	$.ajax({
		url: app.server + "signServer.php",
		type: "GET",
		cache: false,
		dataType: "jsonp",
		jsonp: 'jsonpCallback',
		data: {
			username: nameVal,
			password: passwdVal
		},
		success: function(response) {
			app.showServerMessage("serverMsg", response.msg, 3000);
			if (response.status == "success") { 
				setTimeout(function() {
					$(ele).attr("disabled", false);
					window.location.href = "login.html?uname=" + nameVal;
				}, 1000);
			} else {
				$(ele).attr("disabled", false);
			}
		},
		error: function(XMLHrq, msg) {
			app.showServerMessage("serverMsg", "注册失败！" + msg, 3000);
			$(ele).attr("disabled", false);
		}
	});
}

// phonegap事件
phonegap(["backbutton-twice-exit"]);
