<html>
	<head>
		<title>WebGl Samples</title>
		<link rel="stylesheet" href="../css/main.css" />
		<link rel="stylesheet" href="css/main.css" />
		<!-- include logger first -->
		<script type="text/javascript" src="js/logger.js"></script>
		<script type="text/javascript" src="js/webglutils.js"></script>
		<script type="text/javascript" src="js/m4.js"></script>
		<script type="text/javascript" src="js/primitives.js"></script>
		<script type="text/javascript" src="js/trs.js"></script>
		<script type="text/javascript" src="js/node.js"></script>
		<script type="text/javascript" src="js/main.js"></script>
		<script type="text/javascript" src="js/tutorial.js"></script>
		<script type="text/javascript" src="js/mtlparser.js"></script>
		<script type="text/javascript" src="js/objparser.js"></script>
		<script id="vertex-shader-sky-id" type="nojs">
attribute vec4 a_position;

uniform mat4 u_matrix;

varying vec3 v_normal;

void main(){
	gl_Position = u_matrix * a_position;

	v_normal = normalize(a_position.xyz);
}
		</script>
		<script id="fragment-shader-sky-id" type=nojs">
precision mediump float;

varying vec3 v_normal;

uniform samplerCube u_texture;

void main(){
	gl_FragColor = textureCube(u_texture,normalize(v_normal));
}
		</script>
	</head>
	<body>
		<div class="tab">
			<button id="btnCanvas" class="tabLinks">Canvas</button>
			<button id="btnHtml" class="tabLinks">Html</button>
			<button id="btnJavascript1" class="tabLinks">Javascript 1</button>
			<button id="btnJavascript2" class="tabLinks">Javascript 2</button>
			<button id="btnCss" class="tabLinks">Css</button>
		</div>
		<div id="Canvas" class="tabContent">
			<h3>Canvas</h3>
			<canvas id="canvs" width="800" height="600"></canvas>	
			<div id="uiContainer">
			</div>
		</div>
		<div id="Html" class="tabContent">
			<h3>Html</h3>
			<iframe width="100%" height="600" src="https://www.swhistlesoft.com/demo/paste/paste-25/abcdefabcdefabcdefababcdefabcdef"></iframe>	
		</div>
		<div id="Javascript1" class="tabContent">
			<h3>Javascript 1</h3>
			<iframe width="100%" height="600" src="https://www.swhistlesoft.com/demo/paste/paste-26/abcdefabcdefabcdefababcdefabcdef"></iframe>	
		</div>
		<div id="Javascript2" class="tabContent">
			<h3>Javascript 2</h3>
			<iframe width="100%" height="600" src="https://www.swhistlesoft.com/demo/paste/paste-27/abcdefabcdefabcdefababcdefabcdef"></iframe>	
		</div>
		<div id="Css" class="tabContent">
			<h3>Css</h3>
			<iframe width="100%" height="600" src="https://www.swhistlesoft.com/demo/paste/paste-28/abcdefabcdefabcdefababcdefabcdef"></iframe>	
		</div>
		<div id="log">

		</div>
	</body>
</html>
