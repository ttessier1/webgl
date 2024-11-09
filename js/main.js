function log(message){
	var l = window.location;
	if(l.hash == "#debug"){
		console.log(message);
	}
}

window.Tabs = (function(){
	return {
		openTab:function(e){
			console.log(e);
			console.log(e.target.id);
			console.log(e.target.id.substr(3));	
			var tab = document.getElementById(e.target.id.substr(3));
			if(tab){
			var i, tabcontent, tablinks;
	
			tabcontent = document.getElementsByClassName("tabcontent");
 			for (i = 0; i < tabcontent.length; i++) {
 				tabcontent[i].style.display = "none";
			}
			tablinks = document.getElementsByClassName("tablinks");
			for (i = 0; i < tablinks.length; i++) {
				tablinks[i].className = tablinks[i].className.replace(" active", "");
			}
			tab.style.display = "block";
			e.target.className += " active";
			}else{
				log("Tab does not exist:"+e.target.id.substr(3));
			}
		}
	}
}());
window.addEventListener("load",function(e){
	log("Document Loaded");
	const canvasTab = document.getElementById("Canvas");
	const HtmlTab = document.getElementById("Html");
	const JavascriptTab = document.getElementById("Javascript");
	const CssTab = document.getElementById("Css");

	const canvasBtn = document.getElementById("btnCanvas");
	const htmlBtn = document.getElementById("btnHtml");
	const javascriptBtn = document.getElementById("btnJavascript");
	const cssBtn = document.getElementById("btnCss");
	if(canvasBtn){
		canvasBtn.addEventListener("click",Tabs.openTab);
	}else{
		log("Canvas Button Invalid");
	}
	if(htmlBtn){
		htmlBtn.addEventListener("click",Tabs.openTab);
	}else{
		log("Html Button Invalid");
	}
	if(javascriptBtn){
		javascriptBtn.addEventListener("click",Tabs.openTab);
	}else{
		log("Javascript Button Invalid");
	}
	if(cssBtn){
		cssBtn.addEventListener("click",Tabs.openTab);
	}else{
		log("Css Button Invalid");
	}
});
