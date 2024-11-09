<html>
	<head>
		<title>WebGl Samples</title>
		<link rel="stylesheet" href="../css/main.css" />
		<script type="text/javascript" src="../js/main.js"></script>
		<script type="text/javascript" src="js/tutorial.js"></script>
		<script id="vertex-shader-1" type="notjs">
//an attribute
attribute vec4 a_position;

void main(){
	gl_Position = a_position;
}
		</script>
		<script id="fragment-shader-1" type="notjs">
precision mediump float;

void main(){
	gl_FragColor = vec4(1,0,0.5,1);
}
		</script>
	</head>
	<body>
		<div class="tab">
			<button id="btnCanvas" class="tabLinks">Canvas</button>
			<button id="btnHtml" class="tabLinks">Html</button>
			<button id="btnJavascript" class="tabLinks">Javascript</button>
			<button id="btnCss" class="tabLinks">Css</button>
		</div>
		<div id="Canvas" class="tabContent">
			<h3>Canvas</h3>
			<canvas id="canvs" width="800" height="600"></canvas>	
		</div>
		<div id="Html" class="tabContent">
			<h3>Html</h3>
			<iframe width="100%" height="600" src="https://www.swhistlesoft.com/demo/paste/paste-16/abcdefabcdefabcdefababcdefabcdef"></iframe>	
		</div>
		<div id="Javascript" class="tabContent">
			<h3>Javascript</h3>
			<iframe width="100%" height="600" src="https://www.swhistlesoft.com/demo/paste/paste-15/abcdefabcdefabcdefababcdefabcdef"></iframe>	
		</div>
		<div id="Css" class="tabContent">
			<h3>Css</h3>
			<iframe width="100%" height="600" src="https://www.swhistlesoft.com/demo/paste/paste-14/abcdefabcdefabcdefababcdefabcdef"></iframe>	
		</div>
	</body>
</html>
