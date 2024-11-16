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
	const Javascript1Tab = document.getElementById("Javascript1");
	const Javascript2Tab = document.getElementById("Javascript2");
	const CssTab = document.getElementById("Css");

	const canvasBtn = document.getElementById("btnCanvas");
	const htmlBtn = document.getElementById("btnHtml");
	const javascript1Btn = document.getElementById("btnJavascript1");
	const javascript2Btn = document.getElementById("btnJavascript2");
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
	if(javascript1Btn){
		javascript1Btn.addEventListener("click",Tabs.openTab);
	}else{
		log("Javascript1 Button Invalid");
	}
	if(javascript2Btn){
		javascript2Btn.addEventListener("click",Tabs.openTab);
	}else{
		log("Javascript2 Button Invalid");
	}
	if(cssBtn){
		cssBtn.addEventListener("click",Tabs.openTab);
	}else{
		log("Css Button Invalid");
	}
});
