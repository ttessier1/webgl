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
		<script type="text/javascript" src="js/meshrenderer.js"></script>
		<script type="text/javascript" src="js/skin.js"></script>
		<script type="text/javascript" src="js/skinrenderer.js"></script>
		<script type="text/javascript" src="js/gltfparser.js"></script>
		<script type="text/javascript" src="js/main.js"></script>
		<script type="text/javascript" src="js/tutorial.js"></script>
		<script type="text/javascript" src="js/mtlparser.js"></script>
		<script type="text/javascript" src="js/objparser.js"></script>
		<script id="vertex-shader-skin-id" type="nojs">
attribute vec4 a_POSITION;
attribute vec3 a_NORMAL;
attribute vec4 a_WEIGHTS_0;
attribute vec4 a_JOINTS_0;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform sampler2D u_jointTexture;
uniform float u_numJoints;

varying vec3 v_normal;

#define ROW0_U ((0.5+0.0)/4.)
#define ROW1_U ((0.5+1.0)/4.)
#define ROW2_U ((0.5+2.0)/4.)
#define ROW3_U ((0.5+3.0)/4.)

mat4 getBoneMatrix(float jointNdx){
	float v =(jointNdx+0.5)/u_numJoints;
	return mat4(
		texture2D(u_jointTexture,vec2(ROW0_U,v)),
		texture2D(u_jointTexture,vec2(ROW1_U,v)),
		texture2D(u_jointTexture,vec2(ROW2_U,v)),
		texture2D(u_jointTexture,vec2(ROW3_U,v)));
}

void main(){
	mat4 skinMatrix = 
		getBoneMatrix(a_JOINTS_0[0])*a_WEIGHTS_0[0]+
		getBoneMatrix(a_JOINTS_0[1])*a_WEIGHTS_0[1]+
		getBoneMatrix(a_JOINTS_0[2])*a_WEIGHTS_0[2]+
		getBoneMatrix(a_JOINTS_0[2])*a_WEIGHTS_0[3];
	mat4 world = u_world * skinMatrix;
	gl_Position = u_projection * u_view * world * a_POSITION;
	v_normal = mat3(world)*a_NORMAL;
}
		</script>
		<script id="vertex-shader-gltf-id" type="nojs">
attribute vec4 a_POSITION;
attribute vec3 a_NORMAL;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

varying vec3 v_normal;

void main(){
		gl_Position = u_projection* u_view* u_world * a_POSITION;
		v_normal = mat3(u_world)*a_NORMAL;
}
		</script>
		<script id="fragment-shader-gltf-id" type="nojs">
precision mediump float;

varying vec3 v_normal;
uniform vec4 u_diffuse;
uniform vec3 u_lightDirection;

void main(){
	vec3 normal = normalize(v_normal);
	float light = dot(u_lightDirection,normal)*.5+.5;
	gl_FragColor = vec4(u_diffuse.rgb *light,u_diffuse.a);
}
		</script>
		<script id="vertex-shader-env-id" type="nojs">
attribute vec4 a_position;
attribute vec3 a_normal;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;

void main(){
	gl_Position = u_projection * u_view * u_world * a_position;
	v_worldPosition = (u_world * a_position).xyz;
	v_worldNormal = mat3(u_world)*a_normal;
}		
		</script>
		<script id="vertex-shader-sky-id" type="nojs">
attribute vec4 a_position;

varying vec4 v_position;

void main(){
	v_position = a_position;
	gl_Position = vec4(a_position.xy,1,1);
}
		</script>
		<script id="fragment-shader-env-id" type="nojs">
precision highp float;

varying vec3 v_worldPosition;
varying vec3 v_worldNormal;

uniform samplerCube u_texture;

uniform vec3 u_worldCameraPosition;

void main(){
	vec3 worldNormal = normalize(v_worldNormal);
	vec3 eyeToSurfaceDir = normalize(v_worldPosition- u_worldCameraPosition);
	vec3 direction = reflect(eyeToSurfaceDir,worldNormal);

	gl_FragColor = textureCube(u_texture,direction);
}
		</script>
		<script id="fragment-shader-sky-id" type=nojs">
precision mediump float;

uniform samplerCube u_skybox;
uniform mat4 u_viewDirectionProjectionInverse;

varying vec4 v_position;

void main(){
	vec4 t = u_viewDirectionProjectionInverse * v_position;
	gl_FragColor = textureCube(u_skybox,normalize(t.xyz/t.w));
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
				<div id="ui"></div>
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
