//加密函数
function simpleEncoder(str) { 
	var len = str.length;
	var key = 0x5;
	var encode = "";
	var char = "";
	
	for(var i = 0; i < len; i++) {
		char = parseInt(str.charCodeAt(i) ^ key);
		if (char < 10)
			char = "3" + parseInt(Math.random() * 10).toString() + char.toString();
		if (char < 99 && char >= 10)
			char = "4" + char.toString();
		encode += char.toString();
	}
	return encode;
}

//解密函数
function simpleDecoder(str) { 
	if (!str) return "";
	
	var len = str.length;
	var key = 0x5;
	var encode = "";
	var char = "";
	
	for(var i = 0; i < len; i += 3) {
		if (str.charAt(i) == "3") {
			char = String.fromCharCode(parseInt(parseInt(str.charAt(i + 2)) ^ key));
		} else if(str.charAt(i) == "4") {
			char = String.fromCharCode(parseInt(parseInt(str.charAt(i + 1) + str.charAt(i + 2)) ^ key));
		} else {
			char = String.fromCharCode(parseInt(parseInt(str.charAt(i) + str.charAt(i + 1) + str.charAt(i + 2)) ^ key));
		}
		encode += char.toString();
	}
	return encode;
}
