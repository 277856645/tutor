// 通用js文件
document.write('<script type="text/javascript" src="cordova.js"></script>');
document.write('<script type="text/javascript" src="js/lib/jquery-1.8.3.min.js"></script>');

// 通用js工具类
window.top.app = {
	//server: "http://10.0.2.2/tutorserver/",
	//server: "http://localhost/tutorserver/",
	server: "http://dream-gears.com/zhangwei/tutorserver/",
	
	// 在页面顶部显示服务端返回的提示信息
	showServerMessage: function(domId, msg, fadeOutMillSecs, callback) {
		var $ele = $("#" + domId);
		$ele.find(".server-content").html(msg).end().show();
		if (fadeOutMillSecs && fadeOutMillSecs > 0) {
			setTimeout(function() {
				$ele.hide();
				if (callback && typeof callback == "function") {
					callback();
				}
			}, fadeOutMillSecs);
		}
	},
	
	// 隐藏页面顶部提示信息
	hideServerMessage: function(domId, immediate) {
		if (immediate) {
			$("#" + domId).find(".server-content").html('').end().hide();
		} else {
			setTimeout(function() {
				$("#" + domId).find(".server-content").html('').end().hide();
			}, 1000);
		}
	},
	
	// 获取url参数
	getUrlParam: function(paramName) { 
		var sUrl = window.location.href;
		if (sUrl.indexOf(paramName) > 0) {
			var sReg = "(?:\\?|&){1}" + paramName + "=([^&]*)";
			var re=new RegExp(sReg,"gi"); 
			re.exec(sUrl); 
			return RegExp.$1; 
		} 
		return null;
	},
	
	// 跳转简写
	linkTo: function(url) {
		window.location.href = url;
	}
};

// phonegap事件处理
(function() {
	var backButtonCount = 0;
	
	window.top.phonegap = function(eventArr) {  
		document.addEventListener("deviceready", function() {  
			if (eventArr && eventArr instanceof Array) {  
				for (var i = 0; i < eventArr.length; i++) {
					// 按返回键返回上一个页面
					if (eventArr[i] === "backbutton-goBack") {
						document.addEventListener("backbutton", function() {
							history.back();
						}, false);
					}
					
					// 按两次返回键退出程序	
					if (eventArr[i] === "backbutton-twice-exit") {
						document.addEventListener("backbutton", function() {
							backButtonCount++;
							if (backButtonCount == 2) {
								navigator.app.exitApp();
							} else {
								app.showServerMessage("serverMsg", "再按一次返回键退出程序！", 2000, function() { 
									backButtonCount = 0; 
								});			
							}
						}, false);
					}
				}
			}
		}, false);
	};
})();

