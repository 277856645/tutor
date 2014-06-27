/**
 * 地区联动选择
 *  需在文档加载完毕后使用
 * 
 * 依赖：jQuery, iscroll5
 */
(function(window, $) {
	// 默认配置
	var settings = {
			// 需显示的条目
			requires: ["country", "province", "city"],
			
			// 地区数据
			areaData: {},
			
			// 顶部标题，不设置则没有顶部区域
			title: "选择地区",
			
			// 弹出层的zIndex
			zIndex: 100000,	
			
			// 可选的‘对钩’和‘叉号’图片，未提供则使用‘√’和‘X’	
			confirmImageSrc: null,
			cancelImageSrc: null,
			
			// 滚动块大样式
			blockSize: 60,
			blockGap: 2,
			blockColor: "#54FF9F",
			blockTextColor: "#ccc",
			
			// 初始区域
			originCountry: "中国",
			originProvince: null,
			originCity: null,
			
			// 是否每次关闭后恢复滚动条到初始位置
			autoAreaReset: true,
			
			// '国家'滚动条事件回调
			countryScrollStart: $.noop,
			countryScrollEnd: $.noop,
			
			// '省份'滚动条事件回调
			provinceScrollStart: $.noop,
			provinceScrollEnd: $.noop,
			
			// '城市'滚动条事件回调
			cityScrollStart: $.noop,
			cityScrollEnd: $.noop,
			
			// 确定按钮（底部‘对钩’）点击的回调
			submit: $.noop
		},
		
		// 滚动条配置
		scrollConfigs = {
			scrollbars: false,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: "scale",
			fadeScrollbars: true
		},
		
		// css样式
		styles = {},
		
		// 国家
		country,
		
		// 省份
		province,
		
		// 城市
		city,
		
		// 可滚动的‘国家’对象
		$country,
		
		// 可滚动的‘省份’对象
		$province,
		
		// 可滚动的‘城市’对象
		$city,
		
		// 最终生成的对象
		$target,
		
		// ‘国家’滚动条
		countryScroll,
		
		// ‘省份’滚动条
		provinceScroll,
		
		// ‘城市’滚动条
		cityScroll,
		
		// 当前使用的‘国家’数组
		countryData,
		
		// 当前使用的‘省份’数组
		provinceData,
		
		// 当前使用的‘城市’数组
		cityData;
	
	// 构造函数
	function AreaChoose(opts) {
		$.extend(true, settings, opts);
		country = settings.originCountry;
		province = settings.originProvince;
		city = settings.originCity;
	}
	
	// 原型
	AreaChoose.prototype = {
		constructor: AreaChoose,
		
		// 初始化
		_init: function() {
			// ‘国家’未提供时使用国家数组第一个元素，并且设置到配置中去
			country = country || settings.areaData.country[0];
			if (!country) {
				$.error("country is not provided!");
				return;
			}
			
			// 初始化样式对象
			initCss();

			// 创建全屏容器
			$target = $("<div></div>").css(styles.containerCss);
			
			// 加入body
			$(window.document.body).append($target);
			
			// 创建顶部说明标题（可选）
			if (settings.title) {
				var $title = $("<div></div>").text(settings.title).css(styles.titleCss);
				var $top = $("<div></div>").css(styles.topCss);
				$top.append($title).appendTo($target);
			}
			
			// 创建底部操作区域
			var $confirm = $("<div></div>").css(styles.footOptionCss).bind("click", function() {
				settings.submit();
				AreaChoose.prototype.hide();
			});
			if (settings.confirmImageSrc) {
				var $confImg = $("<img src='" + settings.confirmImageSrc + "' />").css(styles.footOptionImageCss);
				$confirm.append($confImg);
			} else {
				$confirm.text("√");
			}
			
			var $cancel = $("<div></div>").css(styles.footOptionCss).bind("click", this.hide);
			if (settings.cancelImageSrc) {
				var $cancelImg = $("<img src='" + settings.cancelImageSrc + "' />").css(styles.footOptionImageCss);
				$cancel.append($cancelImg);
			} else {
				$cancel.text("X");
			}
			
			var $foot = $("<div></div>").css(styles.footCss);
			$foot.append($confirm).append($cancel).appendTo($target);
			
			// 创建内容区域
			var $content = $("<div role='content'></div>").css(styles.contentCss).appendTo($target);
			if (!settings.title) { $content.css("background-color", "rgba(0,0,0,0)"); }
			
			// 创建项目
			this._createCountry();
			this._createProvince();
			this._createCity();
			
			// 根据配置，控制哪些项目显示
			if (!settings.requires.contains("country")) {
				$country.css(styles.inavailableItemCss);
			}
			if (!settings.requires.contains("province")) {
				$province.css(styles.inavailableItemCss);
			}
			if (!settings.requires.contains("city")) {
				$city.css(styles.inavailableItemCss);
			}	
		},
		
		// 重新设置初始地区
		setOriginArea: function(area) {
			if (!area || !$.isPlainObject(area)) { return; }
			if (area.country) {
				settings.originCountry = area.country;
			}
			if (area.province) {
				settings.originProvince = area.province;
			}
			if (area.city) {
				settings.originCity = area.city;
			}
			
			return this;
		},
		
		// 滚动到初始地区
		scrollToOriginArea: function() {
			this.scrollToArea({
				country: settings.originCountry,
				province: settings.originProvince,
				city: settings.originCity
			});
			
			return this;
		},
		
		// 滚动到指定地区 
		// 必须提供完整的‘国家’，‘省份’，‘城市’信息
		scrollToArea: function(area) { 
			if (!area || !$.isPlainObject(area)) { return; }
			if (!area.country || !area.province || !area.city) { return; }

			// 保存旧的地区对象
			var oldArea = this.getCurrentArea();
			
			// 先滚动到指定‘国家’
			this.scrollToCountry(area.country);
			countryScroll.on("scrollEnd", ctyEndFn);
			
			// 若国家未改变，‘scrollEnd’事件不会自动触发
			if (area.country == oldArea.country) {
				countryScroll._execEvent("scrollEnd");
			}
			
			// ‘国家’滚动条停止
			// 此时‘省份’和‘城市’已重建，但‘城市’数据不对
			function ctyEndFn() {
				countryScroll.off("scrollEnd", ctyEndFn);
				
				// 再滚动到指定‘省份’
				AreaChoose.prototype.scrollToProvince(area.province);
				provinceScroll.on("scrollEnd", proEndFn);
				
				// 1)‘国家’改变：若‘省份’正好是第一个则不会发生滚动，‘scrollEnd’事件不会自动触发
				// 2)‘国家’未变：‘省份’也未变，‘scrollEnd’事件不会自动触发
				if ((area.country != oldArea.country && provinceData.indexOf(area.province) == 0)
						|| (area.country == oldArea.country && area.province == oldArea.province)) {
					provinceScroll._execEvent("scrollEnd");
				}
			}
			
			// ‘国家’滚动条停止
			// ‘省份’滚动条停止
			function proEndFn() {
				provinceScroll.off("scrollEnd", proEndFn);
				
				// 再滚动到指定‘城市’
				AreaChoose.prototype.scrollToCity(area.city);
			}
			
			return this;
 		},
		
		// 获取当前滚动条停止的地区
		getCurrentArea: function() {
			return {
				country: country, 
				province: province, 
				city: city
			};
		},
		
		// 联动事件
		// 单独列出便于启用或关闭该事件
		_linkageEvent: function() { 
			if (this === countryScroll) { 
				// 滚动停止后将最接近中间位置的块完全调整到中间位置
				var cty = AreaChoose.prototype._getCenterBlockText("country");
				AreaChoose.prototype.scrollToCountry(cty);
	
				// 若‘国家’改变，联动改变‘省份’和‘城市’
				if (cty != country) { 
					country = cty;
					$target.find("[role='province']").replaceWith(AreaChoose.prototype._createProvince());
					$target.find("[role='city']").replaceWith(AreaChoose.prototype._createCity());
				}
			} else if (this === provinceScroll) {
				var pro = AreaChoose.prototype._getCenterBlockText("province"); 
				AreaChoose.prototype.scrollToProvince(pro);
		
				// ‘省份’改变，联动改变‘城市’
				if (pro != province) {
					province = pro;
					$target.find("[role='city']").replaceWith(AreaChoose.prototype._createCity());
				}
			} else if (this === cityScroll) {
				var cy = AreaChoose.prototype._getCenterBlockText("city");
				AreaChoose.prototype.scrollToCity(cy);
				
				// 更新‘城市’
				if (cy != city) { city = cy; }
			}
		},
		
		// 创建国家对象
		_createCountry: function() {
			// 保存快捷引用
			countryData = settings.areaData.country;
			
			// 创建滚动条dom结构
			var $scroll = $("<div role='scroll'></div>").css(styles.scrollCss);
			for (var i = 0; i < countryData.length; i++) {
				var $blockText = $("<div role='text'></div>").text(countryData[i]).css(styles.blockTextCss);
				var $block = $("<div></div>").css(styles.blockCss);
				$block.append($blockText).appendTo($scroll);
			}
			
			// 创建滚动条包围层
			var $wrapper = $("<div></div>").css(styles.wrapperCss);
			$wrapper.append($scroll);
			
			// 创建‘国家’层
			$country = $("<div role='country'></div>").css(styles.itemCss);	
			$country.append($wrapper).appendTo($target.find("[role='content']"));
			
			//  创建滚动条并绑定事件
			countryScroll = new IScroll($wrapper[0], scrollConfigs);	
			this.scrollToCountry(country);
			countryScroll.on("scrollStart", settings.countryScrollStart);
			countryScroll.on("scrollEnd", this._linkageEvent);
			countryScroll.on("scrollEnd", settings.countryScrollEnd);
			
			// 创建中间背景层
			var $centerBlock = $("<div></div>").css(styles.centerBlockCss);
			$centerBlock.appendTo($country);
			
			return $country;
		},
		
		// 创建省份对象
		_createProvince: function() {
			// 保存快捷引用
			provinceData = this.getProvinces(country);
	
			// ‘省份’未设置时使用当前国家第一个省份，并保存到配置中
			if (!provinceData.contains(province)) {
				province = provinceData[0];
			}

			// 创建滚动条dom结构
			var $scroll = $("<div role='scroll'></div>").css(styles.scrollCss);
			for (var i = 0; i < provinceData.length; i++) {
				var $blockText = $("<div role='text'></div>").text(provinceData[i]).css(styles.blockTextCss);
				var $block = $("<div></div>").css(styles.blockCss);
				$block.append($blockText).appendTo($scroll);
			}	
			
			// 创建滚动条包围层
			var $wrapper = $("<div></div>").css(styles.wrapperCss);
			$wrapper.append($scroll);
			
			// 创建‘省份’层
			$province = $("<div role='province'></div>").css(styles.itemCss);	
			$province.append($wrapper).appendTo($target.find("[role='content']"));
			
			//  创建滚动条并绑定事件
			provinceScroll = new IScroll($wrapper[0], scrollConfigs);
			this.scrollToProvince(province);	
			provinceScroll.on("scrollStart", settings.provinceScrollStart);
			provinceScroll.on("scrollEnd", this._linkageEvent);
			provinceScroll.on("scrollEnd", settings.provinceScrollEnd);
			
			// 创建中间背景层
			var $centerBlock = $("<div></div>").css(styles.centerBlockCss);
			$centerBlock.appendTo($province);
			
			return $province;
		},
		
		// 创建城市对象
		_createCity: function() {
			// 保存快捷引用
			cityData = this.getCitys(country, province);
			
			// ‘城市’未设置时使用当前省份第一个城市，并保存到配置中
			if (!cityData.contains(city)) {
				city = cityData[0];
			}
			
			// 创建滚动条dom结构
			var $scroll = $("<div role='scroll'></div>").css(styles.scrollCss);
			for (var i = 0; i < cityData.length; i++) {
				var $blockText = $("<div role='text'></div>").text(cityData[i]).css(styles.blockTextCss);
				var $block = $("<div></div>").css(styles.blockCss);
				$block.append($blockText).appendTo($scroll);
			}
			
			// 创建滚动条包围层
			var $wrapper = $("<div></div>").css(styles.wrapperCss);
			$wrapper.append($scroll);
			
			// 创建‘城市’层
			$city = $("<div role='city'></div>").css(styles.itemCss);	
			$city.append($wrapper).appendTo($target.find("[role='content']"));
			
			//  创建滚动条并绑定事件
			cityScroll = new IScroll($wrapper[0], scrollConfigs);
			this.scrollToCity(city);
			cityScroll.on("scrollStart", settings.cityScrollStart);
			cityScroll.on("scrollEnd", this._linkageEvent);
			cityScroll.on("scrollEnd", settings.cityScrollEnd);
			
			// 创建中间背景层
			var $centerBlock = $("<div></div>").css(styles.centerBlockCss);
			$centerBlock.appendTo($city);
			
			return $city;
		},
		
		// 显示
		// 监测所有滚动条状态，全部停止后才显示
		show: function(area) { 	
			this.scrollToArea(area);
					
			if (!innerFn()) {
				var flag = setInterval(function() {
					if (innerFn()) {
						clearInterval(flag);
					} 
				}, 200);
			}
			
			function innerFn() {
				if (!countryScroll.isAnimating 
						&& !provinceScroll.isAnimating 
						&& !cityScroll.isAnimating) {
					$target.css("visibility", "visible");	
					return true;
				}
				return false;
			}
			
			return this;
		},
		
		// 隐藏
		hide: function() {			 
			$target.css("visibility", "hidden");	
			if (settings.autoAreaReset) {
				AreaChoose.prototype.scrollToOriginArea();
			}
			
			return this;
		},
		
		// 通过‘国家’获取省份
		getProvinces: function(country) {
			var countryData = settings.areaData.country;
			var provinceData = settings.areaData.province;
			
			var countryIndex = countryData.indexOf(country);
			countryIndex = countryIndex == -1 ? 0 : countryIndex;
			
			return provinceData[countryIndex] ? provinceData[countryIndex] : [];
		},
		
		// 通过‘省份’获取城市
		getCitys: function(country, province) {
			var countryData = settings.areaData.country;
			var provinceData = settings.areaData.province;
			var cityData = settings.areaData.city;
			
			var countryIndex = countryData.indexOf(country);
			countryIndex = countryIndex == -1 ? 0 : countryIndex;			
			
			if (provinceData[countryIndex]) {
				var provinceIndex = provinceData[countryIndex].indexOf(province);
				provinceIndex = provinceIndex == -1 ? 0 : provinceIndex;
			} else {
				return [];
			}
					
			return cityData[countryIndex][provinceIndex] ? cityData[countryIndex][provinceIndex] : [];
		},
		
		// 滚动到国家
		// 若此前滚动未停止，先等待
		scrollToCountry: function(country) {
			if (!country) { return; }
			
			if (!innerFn()) {
				var flag = setInterval(function() {
					if (innerFn()) {
						clearInterval(flag);
					}
				}, 100);
			} 
			
			function innerFn() {
				if (!countryScroll.isAnimating) {
					$country.find("[role='scroll'] [role='text']").each(function() {
						if (this.innerHTML === country) {
							countryScroll.scrollToElement(this.parentNode, null, null, true);
							return false;
						}
					});
					return true;
				}
				return false;
			}
			
			return this;
		},
		
		// 滚动到省份
		// 若此前滚动未停止，先等待
		scrollToProvince: function(province) {
			if (!province) { return; }
			
			if (!innerFn()) {
				var flag = setInterval(function() {
					if (innerFn()) {
						clearInterval(flag);
					}
				}, 100);
			} 
			
			function innerFn() {
				if (!provinceScroll.isAnimating) {
					$province.find("[role='scroll'] [role='text']").each(function() {
						if (this.innerHTML === province) {
							provinceScroll.scrollToElement(this.parentNode, null, null, true);
							return false;
						}
					});
					return true;
				}
				return false;
			}
			
			return this;
		},
		
		// 滚动到城市
		// 若此前滚动未停止，先等待
		scrollToCity: function(city) {
			if (!city) { return; }
			
			if (!innerFn()) {
				var flag = setInterval(function() {
					if (innerFn()) {
						clearInterval(flag);
					}
				}, 100);
			} 
			
			function innerFn() { 
				if (!cityScroll.isAnimating) {
					$city.find("[role='scroll'] [role='text']").each(function() {
						if (this.innerHTML === city) {
							cityScroll.scrollToElement(this.parentNode, null, null, true);
							return false;
						}
					});
					return true;
				}
				return false;
			}
			
			return this;
		},
		
		// 获取滚动条滚动停止后哪一块在中间位置
		_getCenterBlockText: function(item) {
			var $ele = eval("$" + item);
			var scroll = eval(item + "Scroll");
			var data = eval(item + "Data");
			
			var positionY = scroll.getComputedPosition().y * -1;
			var blockHeight = settings.blockSize + settings.blockGap;
			var index = Math.round(positionY / blockHeight);
			
			return $ele.find("[role='text']").eq(index).text();
		}
	};
	
	// 初始化样式对象
	function initCss() {
		styles.containerCss = {
			"position": "absolute",
			"left": "0",
			"top": "0",
			"z-index": settings.zIndex,
			"width": "100%",
			"height": "100%",
			"background-color": "#555",
			"overflow": "hidden",
			"visibility": "hidden",
			"font-family": "'楷体', '微软雅黑', '幼圆', Arial, Helvetica, sans-serif"
		};
		
		styles.titleCss = {
			"color": "#fff",
			"font-size": "11px",
			"height": "30px",
			"line-height": "30px",
			"margin-left": "15px",
			"font-family": "宋体"
		};
		
		styles.topCss = {
			"width": "100%",
			"position": "absolute",
			"left": "0",
			"top": "0",
			"height": "30px",
			"z-index": settings.zIndex + 1,
			"background-color": "#333"
		};
		
		styles.footCss = {
			"width": "100%",
			"position": "absolute",
			"left": "0",
			"bottom": "0",
			"height": "30px",
			"z-index": settings.zIndex + 1,
			"background-color": "#333",
			"text-align": "center",
			"-webkit-user-select": "none",
			"-moz-user-select": "none",
			"-ms-user-select": "none",
			"user-select": "none"
		};
		
		styles.footOptionCss = {
			"width": "20px",
			"height": "20px",
			"line-height": "20px",
			"-moz-border-radius": "10px",
			"-webkit-border-radius": "10px",
			"border-radius": "20px",
			"border": "1px solid #fff",
			"margin": "4px 10px 0 10px",
			"display": "inline-block",
			"text-align": "center",
			"color": "#fff",
			"font-size": "14px",
			"font-weight": "bold",
			"vertical-align": "middle",
			"cursor": "default"
		};
		
		styles.footOptionImageCss = {
			"width": "12px",
			"height": "12px",
			"margin-top": "4px"
		};
		
		styles.contentCss = {
			"width": "100%",
			"position": "absolute",
			"left": "0",
			"top": "30px",
			"bottom": "30px",
			"padding-left": "15px",
			"overflow": "hidden",
			"z-index": settings.zIndex
		};
		
		styles.itemCss = {
			"width": settings.blockSize + settings.blockGap + "px",
			"height": "100%",
			"float": "left",
			"position": "relative"
		};
		
		styles.wrapperCss = {
			"width": "100%",
			"height": "100%",
			"position": "absolute",
			"left": "0",
			"top": "0",
			"z-index": settings.zIndex + 1
		};
		
		var fixedLeft = settings.blockGap / 2;
		if (/android/i.test(navigator.userAgent)) { fixedLeft -= 1; }
		styles.centerBlockCss = {
			"border": "1px solid " + settings.blockColor,
			"background-color": settings.blockColor,
			"width": settings.blockSize - 2 + "px",
			"height": settings.blockSize - 2 + "px",
			"position": "absolute",
			"left": fixedLeft + "px",
			"top": "50%",
			"margin-top": "-" + ((settings.blockSize + settings.blockGap - 2) / 2) + "px",
			"z-index": settings.zIndex - 1
		};
	
		var bodyHeight = $(document.body).height();
		var clientHeight = bodyHeight == 0 ? $(document).height() : bodyHeight;
		var paddingHeight = (clientHeight - 60 - settings.blockSize - settings.blockGap) / 2;
		styles.scrollCss = {
			"width": "100%",
			"-webkit-tap-highlight-color": "rgba(0,0,0,0)",
			"-webkit-transform": "translateZ(0)",
			"-moz-transform": "translateZ(0)",
			"-ms-transform": "translateZ(0)",
			"-o-transform": "translateZ(0)",
			"transform": "translateZ(0)",
			"-webkit-touch-callout": "none",
			"-webkit-user-select": "none",
			"-moz-user-select": "none",
			"-ms-user-select": "none",
			"user-select": "none",
			"-webkit-text-size-adjust": "none",
			"-moz-text-size-adjust": "none",
			"-ms-text-size-adjust": "none",
			"-o-text-size-adjust": "none",
			"text-size-adjust": "none",
			"padding": paddingHeight + "px 0"
		};

		styles.blockCss = {
			"width": settings.blockSize + "px",
			"height": settings.blockSize + "px",
			"padding": settings.blockGap / 2 + "px",
			"display": "table",
			"cursor": "default"
		};

		styles.blockTextCss = {
			"font-family": "'楷体', '微软雅黑', '幼圆', Arial, Helvetica, sans-serif",
			"font-size": settings.blockSize * 14 / 60 + "px",
			"font-weight": "bold",
			"display": "table-cell",
			"vertical-align": "middle",
			"text-align": "center",
			"color": settings.blockTextColor,
			"height": settings.blockSize + "px",
			"width": settings.blockSize + "px",
			"border": "1px solid " + settings.blockColor
		};
		
		styles.inavailableItemCss = {
			"position": "absolute",
			"left": "-10000",
			"top": "-10000",
			"visibility": "hidden"
		};
	}
	
	// 其他函数
	Array.prototype.contains = function(ele) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] === ele) return true;
		}
		return false;
	};
	
	// 对外接口
	var instance;
	window.AreaChoose = function(settings) {
		if (!instance) {
			instance = new AreaChoose(settings);
			$(window.document).ready(function() { instance._init(); });			
		}
		return instance; 
	};
	window.AreaChoose.areaData = settings.areaData;
})(window, jQuery);


// 区域数据
$.extend(window.AreaChoose.areaData, {
"country": 
[
	"中国"
],

"province":  
[
	[
		"安徽", "澳门", "北京", "重庆", "福建", "广东", "甘肃", "广西", "贵州", "湖北", 
		"河北", "黑龙江", "海南", "河南", "湖南", "吉林", "江苏", "江西", "辽宁", "内蒙古", 
		"宁夏", "青海", "山东", "山西", "陕西", "上海", "四川", "天津", "台湾", "西藏", 
		"新疆", "云南", "浙江", "香港"
	]
],

"city":
[
	[
		[
			"安庆", "蚌埠", "巢湖", "池州", "滁州", "阜阳", "合肥", "淮北", "淮南", "黄山", "六安",
			"马鞍山", "宿州", "铜陵", "芜湖", "宣城", "亳州"
		],
		[
			"大堂区", "氹仔", "风顺堂区", "花地玛堂区", "路环岛", "圣安多尼堂区", "望德堂区"
		],
		[
			"昌平", "朝阳", "东城", "大兴", "房山", "丰台", "海淀", "怀柔", "门头沟", "密云", "平谷", "石景山", 
			"顺义", "通州", "西城", "延庆"
		],
		[
			"北碚", "巴南", "璧山", "城口", "长寿", "大渡口", "垫江", "大足", "丰都", "奉节", "合川", "江北", "江津", 
			"九龙坡", "开县", "两江新区", "梁平", "南岸", "南川", "彭水", "黔江", "荣昌", "沙坪坝", "双桥", "石柱", 
			"铜梁", "潼南", "武隆", "万盛", "巫山", "巫溪", "万州", "秀山", "渝北", "永川", "酋阳", "云阳", "渝中", 
			"忠县", "涪陵区", "綦江县"
		],
		[
			"福州", "龙岩", "南平", "宁德", "莆田", "泉州", "三明", "厦门", "漳州"
		],
		[
			"潮州", "东莞", "佛山", "广州", "河源", "惠州", "江门", "揭阳", "茂名", "梅州",
			"清远", "汕头", "汕尾", "韶关", "深圳", "阳江", "云浮", "湛江", "肇庆", "中山",
			"珠海"
		],
		[
			"白银", "定西", "甘南藏族自治州", "嘉峪关", "金昌", "酒泉", "兰州", "临夏回族自治州", "陇南", "平凉",
			"庆阳", "天水", "武威", "张掖"
		],
		[
			"百色", "北海", "崇左", "防城港", "桂林", "贵港", "河池", "贺州", "来宾", "柳州",
			"南宁", "钦州", "梧州", "玉林"
		],
		[
			"安顺", "毕节", "贵阳", "六盘水", "黔东南苗族侗族自治州", "黔南布依族苗族自治州", "黔西南布依族苗族自治州", "铜仁", "遵义"
		],
		[
			"鄂州", "恩施土家族苗族自治州", "黄冈", "黄石", "荆门", "荆州", "潜江", "神农架林区", "十堰", "随州",
			"天门", "武汉", "仙桃", "咸宁", "襄樊", "孝感", "宜昌"
		],
		[
			"保定", "沧州", "承德", "邯郸", "衡水", "廊坊", "秦皇岛", "石家庄", "唐山", "邢台", "张家口"
		],
		[
			"大庆", "大兴安岭", "哈尔滨", "鹤岗", "黑河", "鸡西", "佳木斯", "牡丹江", "七台河", "齐齐哈尔",
			"双鸭山", "绥化", "伊春"
		],
		[
			"白沙黎族自治县", "保亭黎族苗族自治县", "昌江黎族自治县", "澄迈县", "定安县", "东方", "海口", "乐东黎族自治县", 
			"临高县", "陵水黎族自治县", "琼海", "琼中黎族苗族自治县", "三亚", "屯昌县", "万宁", "文昌", "五指山", "儋州"
		],
		[
			"安阳", "鹤壁", "济源", "焦作", "开封", "洛阳", "南阳", "平顶山", "三门峡", "商丘", 
			"新乡", "信阳", "许昌", "郑州", "周口", "驻马店", "漯河", "濮阳"
		],
		[
			"常德", "长沙", "郴州", "衡阳", "怀化", "娄底", "邵阳", "湘潭", "湘西土家族苗族自治州", "益阳",
			"永州", "岳阳", "张家界", "株洲"
		],
		[
			"白城", "白山", "长春", "吉林", "辽源", "四平", "松原", "通化", "延边朝鲜族自治州"
		],
		[
			"常州", "淮安", "连云港", "南京", "南通", "苏州", "宿迁", "泰州", "无锡", "徐州",
			"盐城", "扬州", "镇江"
		],
		[
			"抚州", "赣州", "吉安", "景德镇", "九江", "南昌", "萍乡", "上饶", "新余", "宜春", "鹰潭"
		],
		[
			"鞍山", "本溪", "朝阳", "大连", "丹东", "抚顺", "阜新", "葫芦岛", "锦州", "辽阳",
			"盘锦", "沈阳", "铁岭", "营口"
		],
		[
			"阿拉善盟", "巴彦淖尔盟", "包头", "赤峰", "鄂尔多斯", "呼和浩特", "呼伦贝尔", "通辽", "乌海", "乌兰察布盟",
			"锡林郭勒盟", "兴安盟"
		],	
		[
			"固原", "石嘴山", "吴忠", "银川"
		],
		[
			"果洛藏族自治州", "海北藏族自治州", "海东", "海南藏族自治州", "海西蒙古族藏族自治州", "黄南藏族自治州", 
			"西宁", "玉树藏族自治州"
		],
		[
			"滨州", "德州", "东营", "菏泽", "济南", "济宁", "莱芜", "聊城", "临沂", "青岛",
			"日照", "泰安", "威海", "潍坊", "烟台", "枣庄", "淄博"
		],
		[
			"长治", "大同", "晋城", "晋中", "临汾", "吕梁", "朔州", "太原", "忻州", "阳泉", "运城"
		],
		[
			"安康", "宝鸡", "汉中", "商洛", "铜川", "渭南", "西安", "咸阳", "延安", "榆林"
		],
		[
			"宝山", "崇明", "长宁", "奉贤", "虹口", "黄浦", "静安", "嘉定", "金山", "卢湾", "闵行", "浦东新区", 
			"普陀", "松江", "青浦", "徐汇", "闸北", "杨浦"
		],
		[
			"阿坝藏族羌族自治州", "巴中", "成都", "达州", "德阳", "甘孜藏族自治州", "广安", "广元", "乐山", "凉山彝族自治州",
			"眉山", "绵阳", "南充", "内江", "攀枝花", "遂宁", "雅安", "宜宾", "资阳", "自贡", "泸州"
		],
		[
			"北辰", "宝坻", "东丽", "河北", "河东", "和平", "红桥", "河西", "静海", "蓟县", "宁河", 
			"南开", "武清", "西青"
		],
		[	
			"高雄市", "花莲县", "嘉义市", "基隆市", "嘉义县", "苗栗县", "南投县", "屏东县", "澎湖县", "台北市", "台东市", 
			"台南市", "桃园县", "台中市", "新竹县", "宜兰县", "云林县", "金门县", "连江县", "新北市"
		],
		[
			"阿里", "昌都", "拉萨", "林芝", "那曲", "日喀则", "山南"
		],
		[
			"阿克苏", "阿拉尔", "巴音郭楞蒙古自治州", "博尔塔拉蒙古自治州", "昌吉回族自治州", "哈密", "和田", "喀什", 
			"克拉玛依", "克孜勒苏柯尔克孜自治州", "石河子", "图木舒克", "吐鲁番", "乌鲁木齐", "五家渠", "伊犁哈萨克自治州"
		],
		[
			"保山", "楚雄彝族自治州", "大理白族自治州", "德宏傣族景颇族自治州", "迪庆藏族自治州", "红河哈尼族彝族自治州", 
			"昆明", "丽江", "临沧","怒江傈傈族自治州", "曲靖", "思茅", "文山壮族苗族自治州", "西双版纳傣族自治州", "玉溪", "昭通"
		],
		[
			"杭州", "湖州", "嘉兴", "金华", "丽水", "宁波", "绍兴", "台州", "温州", "舟山", "衢州"
		],
		[
			"北区", "大埔区", "东区", "观塘区", "黄大仙区", "九龙城区", "葵青区", "南区", "荃湾区", "深水埗区", "沙田区", 
			"屯门区", "湾仔区", "西贡区", "油尖旺区", "元朗区", "中西区" 
		]
	]
]
});
