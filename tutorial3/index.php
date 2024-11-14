<html>
	<head>
		<title>WebGl Samples</title>
		<link rel="stylesheet" href="../css/main.css" />
		<script type="text/javascript" src="../js/main.js"></script>
		<script type="text/javascript" src="js/tutorial.js"></script>
		<script id="vertex-shader-1" type="notjs">
attribute vec2 a_position;

uniform vec2 u_resolution;

void main(){
	vec2 zeroToOne = a_position/ u_resolution;
	vec2 zeroToTwo = zeroToOne * 2.0;
	vec2 clipSpace = zeroToTwo - 1.0;
	gl_Position = vec4(clipSpace*vec2(1,-1),0,1);
}
		</script>
		<script id="fragment-shader-1" type="notjs">
precision mediump float;

uniform vec4 u_color;

void main(){
	gl_FragColor = u_color;
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
			<iframe width="100%" height="600" src="https://www.swhistlesoft.com/demo/paste/paste-17/abcdefabcdefabcdefababcdefabcdef"></iframe>	
		</div>
		<div id="Javascript" class="tabContent">
			<h3>Javascript</h3>
			<iframe width="100%" height="600" src="https://www.swhistlesoft.com/demo/paste/paste-18/abcdefabcdefabcdefababcdefabcdef"></iframe>	
		</div>
		<div id="Css" class="tabContent">
			<h3>Css</h3>
			<iframe width="100%" height="600" src="https://www.swhistlesoft.com/demo/paste/paste-19/abcdefabcdefabcdefababcdefabcdef"></iframe>	
		</div>
	</body>
</html>
