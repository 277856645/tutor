// 检测用户是否已登录,未登录则跳转到主页
if (!sessionStorage.getItem("username")) {
	alert("您尚未登录或登录已过期，请重新登录！");
	app.linkTo("login.html");
}

// 初始化
$(document).ready(function() {
	/* 页面样式初始化 */
	var $body = $(document.body);
	var clientWidth = $body.width();
	var clientHeight = $body.height();

	// 底部菜单布局处理
	var mainMenuImgWidth = 198;
	var mainMenuImgHeight = 115;
	var mImgWidth = parseInt(clientWidth * 0.3) > mainMenuImgWidth ? mainMenuImgWidth : parseInt(clientWidth * 0.3);
	var mImgHeight = mImgWidth *  mainMenuImgHeight / mainMenuImgWidth;
	var mImgMargTop = (mImgHeight + 5) * -1;
	$(".foot-table td")
			.eq(2)
			.width(mImgWidth) 
			.find("img")
			.css("margin-top", mImgMargTop + "px")
			.end()
			.end()
			.filter(":not(:eq(2))")
			.width((clientWidth - mImgWidth) / 4);
	
	// 顶部菜单点击样式切换
	$("#student, #teacher").bind("click", function() {
		var $thiz = $(this);
		if ($thiz.attr("state") == "off") {
			$thiz.attr("state", "on");
			$thiz.siblings().attr("state", "off");
		}
	});
	
	// 内容快布局处理，防止最后一个数据被遮挡
	$("#scroller").css("padding-bottom", mImgHeight - $("#foot").height() + "px");

	// 显示页面
	$("#content").css("visibility", "visible");
});

// 内容滚动
var myScroll;
function loaded () {
	myScroll = new IScroll("#main", {
		scrollbars: true,
		mouseWheel: true,
		interactiveScrollbars: true,
		shrinkScrollbars: "scale",
		fadeScrollbars: true,
		scrollbars: "custom"
	});
}
document.addEventListener("DOMContentLoaded", loaded, false);
document.addEventListener("touchmove", function (e) { e.preventDefault(); }, false);

// phonegap事件
phonegap(["backbutton-goBack"]);


