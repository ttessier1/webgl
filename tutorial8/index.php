<html>
	<head>
		<title>WebGl Samples</title>
		<link rel="stylesheet" href="../css/main.css" />
		<link rel="stylesheet" href="css/main.css" />
		<script type="text/javascript" src="js/main.js"></script>
		<script type="text/javascript" src="js/tutorial.js"></script>
		<script type="text/javascript" src="js/mtlparser.js"></script>
		<script type="text/javascript" src="js/objparser.js"></script>
		<script type="text/javascript" src="https://webglfundamentals.org/webgl/resources/m4.js"></script>
		<script id="vertex-shader-id" type="nojs">
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec4 a_color;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform mat3 u_viewWorldPosition;

varying vec3 v_normal;
varying vec3 v_surfaceToView;
varying vec4 v_color;

void main(){
	vec4 worldPosition = u_world * a_position;
	gl_Position = u_projection * u_view * worldPosition;
	v_surfaceToView = u_viewWorldPosition * worldPosition.xyz;
	v_normal = mat3(u_world) * a_normal;
	v_color = a_color;
}
		</script>
		<script id="vertex-shader-text-id" type="nojs">
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord;
attribute vec4 a_color;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform mat3 u_viewWorldPosition;

varying vec3 v_normal;
varying vec3 v_surfaceToView;
varying vec2 v_texcoord;
varying vec4 v_color;

void main(){
	vec4 worldPosition = u_world * a_position;
	gl_Position = u_projection * u_view * worldPosition;
	v_surfaceToView = u_viewWorldPosition * worldPosition.xyz;
	v_normal = mat3(u_world) * a_normal;
	v_texcoord = a_texcoord;
	v_color = a_color;
}
		</script>
		<script id="fragment-shader-id" type="nojs">
precision mediump float;

varying vec3 v_normal;
varying vec3 v_surfaceToView;
varying vec4 v_color;

uniform vec3 diffuse;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;

void main(){
	vec3 nrml = normalize(v_normal);

	vec3 surfaceToViewDirection = normalize(v_surfaceToView);
	vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);

	float fakeLight = dot(u_lightDirection, nrml)*.5+.5;
	float specularLight = clamp(dot(nrml,halfVector),0.0,1.0);

	vec3 effectiveDiffuse = diffuse * v_color.rgb;
	float effectiveOpacity = opacity * v_color.a;

	gl_FragColor = vec4(
		emissive + 
		ambient * u_ambientLight +
		effectiveDiffuse * fakeLight +
		specular * pow(specularLight,shininess),
		effectiveOpacity);
}
		</script>
		<script id="fragment-shader-text-id" type="nojs">
precision mediump float;

varying vec3 v_normal;
varying vec3 v_surfaceToView;
varying vec2 v_texcoord;
varying vec4 v_color;

uniform vec3 diffuse;
uniform sampler2D diffuseMap;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;

void main(){
	vec3 nrml = normalize(v_normal);

	vec3 surfaceToViewDirection = normalize(v_surfaceToView);
	vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);

	float fakeLight = dot(u_lightDirection, nrml)*.5+.5;
	float specularLight = clamp(dot(nrml,halfVector),0.0,1.0);

	//vec3 effectiveDiffuse = diffuse * v_color.rgb;
	//float effectiveOpacity = opacity * v_color.a;

	vec4 diffuseMapColor = texture2D(diffuseMap,v_texcoord);
	vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;
	float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;

	gl_FragColor = vec4(
		emissive + 
		ambient * u_ambientLight +
		effectiveDiffuse * fakeLight +
		specular * pow(specularLight,shininess),
		effectiveOpacity);
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
