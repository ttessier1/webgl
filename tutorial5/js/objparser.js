window.ObjectParser = (function(){

return {
	Parse:function(text){
		if ( typeof(text)=="string"){
			const objPositions= [[0,0,0]];
			const objTexCoords =[[0,0]];
			const objNormals = [[0,0,0]];


			const objVertexData = [
				objPositions,
				objTexCoords,
				objNormals
			];

			let webglVertexData = [
				[], // positions
				[], // texcoords
				[], // normals
			];
			function addVertex(vert){
				const point = vert.split("/");
				point.forEach((objIndexStr,i)=>{
					if(!objIndexStr){
						return;
					}
					const objIndex = parseInt(objIndexStr);
					const index = parseInt(objIndex + (objIndex >= 0?0:objVertexData[i].length));
					webglVertexData[i].push(...objVertexData[i][index]);
				});
			}
			
			const keywords={
				v(parts){
					objPositions.push(parts.map(parseFloat));
				},
				vn(parts){
					objNormals.push(parts.map(parseFloat));
				},
				vt(parts){
					objTexCoords.push(parts.map(parseFloat));	
				},
				f(parts){
					const numTriangles = parts.length - 2;
					for(let tri = 0;tri<numTriangles;++tri){
						addVertex(parts[0]);
						addVertex(parts[tri+1]);
						addVertex(parts[tri+2]);
					}
				},
			};
					
			const keywordsRE=/(\w*)(?: )*(.*)/;

			const lines = text.split("\n");

			for (lineNo = 0 ; lineNo < lines.length;lineNo++){
				const line = lines[lineNo].trim();
				if(line==="" || line.startsWith("#")){
					continue;
				}
				const m = keywordsRE.exec(line);
				if(!m){
					continue;
				}
				const [,keyword,unparsedArgs] = m;
				const parts = line.split(/\s+/).slice(1);
				const handler = keywords[keyword];
				if(!handler){
					console.warn("Unhandled Keyword:",keyword," at line ",lineNo+1);
					continue;
				}
				handler(parts,unparsedArgs);
			}
			return {

				position: webglVertexData[0],
				texcoord: webglVertexData[1],
				normal: webglVertexData[2],
			};
		}

	}

};

}());
