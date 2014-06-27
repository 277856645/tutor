// 我的名片，教育经历，发布历史 是否都加载完毕标志
var cardFinishFlag = false,
	experienceFinishFlag = false,
	publishFinishFlag = false,
	
	// 区域联动选择弹出层
	areaChoose;

// 检测用户是否已登录,未登录则跳转到主页
if (!sessionStorage.getItem("username")) {
	alert("您尚未登录或登录已过期，请重新登录！");
	app.linkTo("login.html");
}

// 加载个人信息
$.ajax({
	url: app.server + "meServer.php",
	type: "GET",
	cache: false,
	dataType: "jsonp",
	jsonp: 'jsonpCallback',
	data: {
		uid: sessionStorage.getItem("userId"),
		loadMaterial: true
	},
	success: function(response) { 
		if (response.status == "success") {
			if (response.portrait) {
				$("#portrait").find("img").attr("src", response.portrait);
			} 
			if (response.realname) {
				$("#realname").find(".card-content").text(response.realname);
			}
			if (response.age) {
				$("#age").find(".card-content").text(response.age);
			}
			if (response.sex) {
				$("#sex").find(".card-content").text(response.sex);
			}
			if (response.country) {
				$("#address").find(".card-content span:eq(0)").text(response.country);
			}
			if (response.province) {
				$("#address").find(".card-content span:eq(1)").text(response.province);
			}
			if (response.city) {
				$("#address").find(".card-content span:eq(2)").text(response.city);
			}
			if (response.college) {
				$("#college").find(".card-content").text(response.college);
			}
			if (response.education) {
				$("#education").find(".card-content").text(response.education);
			}
			if (response.contact1) {
				$("#contact").find(".card-content div:eq(0)").text(response.contact1);
			}
			if (response.contact2) {
				$("#contact").find(".card-content div:eq(1)").text(response.contact2);
			}
			if (response.email) { 
				$("#email").find(".card-content").text(response.email);
			}
			
			app.hideServerMessage("serverMsg");
			$("#card-scroller").show();
			cardFinishFlag = true;
			
			// 内容滚动
			myScroll = new IScroll("#card-scroller", {
				mouseWheel: true,
				interactiveScrollbars: true,
				shrinkScrollbars: "scale",
				fadeScrollbars: true,
				scrollbars: "custom"
			});
		} else {
			app.showServerMessage("serverMsg", response.msg, 3000);
		}
	},
	error: function(XMLHrq, msg) {
		app.showServerMessage("serverMsg", "加载失败！" + msg, 3000);
	}
});

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
	$("#card, #experience, #publish").bind("click", function() {
		var $thiz = $(this);
		if ($thiz.attr("state") == "off") {
			$thiz.attr("state", "on");
			$thiz.siblings().attr("state", "off");
		}
	});

	// 我的名片各个选项点击时变化样式及事件绑定
	$("#card-scroller .scroller > div:not(:first-child):not([nochange])").each(function() {
		var $thiz = $(this);
		var moveFlag = false;
		
		$thiz.bind({
			touchstart: function() {
				$thiz.css({
					marginLeft: "15px",
					fontStyle: "italic",
					textShadow: "2px 2px 1px #888"
				});
				moveFlag = false;
			},
			touchmove: function() {
				moveFlag = true;
			},
			touchend: function() {
				$thiz.css({
					marginLeft: "10px",
					fontStyle: "normal",
					textShadow: "0 0 0 rgba(0, 0, 0, 0)"
				});
				if (!moveFlag) {
					switch ($thiz.attr("id")) {
						case "realname":
						case "age":
						case "college":
						case "email":
							showCardInfoChange("simple-text", $thiz);
							break;
						case "education":
							showCardInfoChange("education-part", $thiz);
							break;
						case "sex":
							showCardInfoChange("sex-part", $thiz);
							break;
						case "contact":
							showCardInfoChange("contact-part", $thiz);
							break;
						case "address":
							showCardInfoChange("address-part", $thiz);
							break;
					}
				}
			},
			click: function() { 
				switch ($thiz.attr("id")) {
					case "realname":
					case "age":
					case "college":
					case "email":
						showCardInfoChange("simple-text", $thiz);
						break;
					case "education":
						showCardInfoChange("education-part", $thiz);
						break;
					case "sex":
						showCardInfoChange("sex-part", $thiz);
						break;
					case "contact":
						showCardInfoChange("contact-part", $thiz);
						break;
					case "address":
						showCardInfoChange("address-part", $thiz);
						break;
				}
			}
		});
	});
	
	// 创建区域联动选择弹出层
	areaChoose = AreaChoose({
		confirmImageSrc: "img/accept.png",
		cancelImageSrc: "",
		blockSize: 70,
		blockGap: 3,
		blockTextColor: "#ccc",
		autoAreaReset: true,
		originCountry: $("#address [fieldName='country']").text(),
		originProvince: $("#address [fieldName='province']").text(),
		originCity: $("#address [fieldName='city']").text(),
		requires: ["province", "city", "country"],
		submit: function() {
			var area = areaChoose.getCurrentArea();

		}
	});
	
	// 显示页面
	$("#content").css("visibility", "visible");
});

// 内容滚动
document.addEventListener("touchmove", function (e) { e.preventDefault(); }, false);

// phonegap事件
phonegap(["backbutton-goBack"]);

// 显示我的名片内容修改
function showCardInfoChange(itemId, $ele) {
	var $cardContainer = $("#card-info-change");
	var $changeItem = $cardContainer.find("#" + itemId);
	
	switch (itemId) {
		case "simple-text":
			$changeItem.find("div:eq(0)").text($ele.find(".card-title").text());
			$changeItem.find("div:eq(1) :text").val($ele.find(".card-content").text());
			$("#simple-text [name=fieldName]").val($ele.find(".card-content").attr("fieldName"));
			innerFn();
			break;
		case "education-part":
			$changeItem.find("div:eq(0)").text($ele.find(".card-title").text());
			$changeItem.find("div:eq(1) select").val($ele.find(".card-content").text());
			$("#education-part [name=fieldName]").val($ele.find(".card-content").attr("fieldName"));
			innerFn();
			break;
		case "sex-part":
			$changeItem.find("div:eq(0)").text($ele.find(".card-title").text());
			$changeItem.find("div:eq(1) select").val($ele.find(".card-content").text());
			$("#sex-part [name=fieldName]").val($ele.find(".card-content").attr("fieldName"));
			innerFn();
			break;
		case "contact-part":
			$changeItem.find("div:eq(0)").text($ele.find(".card-title").text());
			$changeItem.find("div:eq(1) :text:eq(0)").val($ele.find(".card-content > div:eq(0)").text());
			$changeItem.find("div:eq(1) :text:eq(1)").val($ele.find(".card-content > div:eq(1)").text());
			innerFn();
			break;
		case "address-part":
			areaChoose.show();
			break;
	}

	function innerFn() {
		$cardContainer.find(".card-change-content").show();
		$cardContainer.find(".card-change-layer").css("opacity", 0.3);
		$changeItem.show();
		$cardContainer.show();
	}
}

// 隐藏我的名片内容修改
function hideCardInfoChange() {
	$("#card-info-change .card-change-content").slideUp(300, function() {
		$(this).children().hide();
		$("#card-info-change").hide();
	});
	$("#card-info-change .card-change-layer").animate({opacity: 0}, 300);
}

// 我的名片 - 简单信息 - 修改
function simpleTextCardInfoChange() {
	hideCardInfoChange();
	var fieldName = $("#simple-text [name=fieldName]").val();
	var value = $("#simple-text :text").val();
	cardSimpleAjax(fieldName, value);
}

// 我的名片 - 学历 - 修改
function educationPartCardInfoChange() {
	hideCardInfoChange();
	var fieldName = $("#education-part [name=fieldName]").val();
	var value = $("#education-part select").val();
	cardSimpleAjax(fieldName, value);
}

// 我的名片 - 性别 - 修改
function sexPartCardInfoChange() {
	hideCardInfoChange();
	var fieldName = $("#sex-part [name=fieldName]").val();
	var value = $("#sex-part select").val();
	cardSimpleAjax(fieldName, value);
}

// 我的名片 - 联系方式 - 修改
function contactPartCardInfoChange() {
	hideCardInfoChange();
	var contact1 = $("#contact-part :text:eq(0)").val();
	var contact2 = $("#contact-part :text:eq(1)").val();
	$.ajax({
		url: app.server + "meServer.php",
		type: "GET",
		cache: false,
		dataType: "jsonp",
		jsonp: 'jsonpCallback',
		data: {
			uid: sessionStorage.getItem("userId"),
			contact1: contact1,
			contact2: contact2,
			contactSave: true
		},
		success: function(response) { 
			if (response.status == "success") {
				$("[fieldName=contact1]").text(contact1);
				$("[fieldName=contact2]").text(contact2);
			} else {
				app.showServerMessage("serverMsg", response.msg, 3000);
			}
		},
		error: function(XMLHrq, msg) {
			app.showServerMessage("serverMsg", "保存失败！" + msg, 3000);
		}
	});
}

// 我的名片信息修改 - 简单文本ajax提交
function cardSimpleAjax(fieldName, value) {
	$.ajax({
		url: app.server + "meServer.php",
		type: "GET",
		cache: false,
		dataType: "jsonp",
		jsonp: 'jsonpCallback',
		data: {
			uid: sessionStorage.getItem("userId"),
			fieldName: fieldName,
			value: value,
			simpleTextSave: true
		},
		success: function(response) { 
			if (response.status == "success") {
				$("[fieldName=" + fieldName + "]").text(value);
			} else {
				app.showServerMessage("serverMsg", response.msg, 3000);
			}
		},
		error: function(XMLHrq, msg) {
			app.showServerMessage("serverMsg", "保存失败！" + msg, 3000);
		}
	});
}
