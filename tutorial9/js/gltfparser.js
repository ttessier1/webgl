window.gltfParser = (function(){
	return {
		Parse:function(text){
			const gltf = await loadJSON(url);

			const baseURL = new URL(url,location.href);
			gltf.buffers = await Promise.all(gltf.buffers.map((buffer) => {
				const url = new URL(buffer.uri,baseURL.href);
				return loadBinary(url.href);
			}));

			async function loadFile(url,typeFunc){
				const response = await fetch(url);
				if(!response.ok){
					throw new Error ( `Could not load gltf ${url}`);
				}
				return await response[typeFunc]();
			}

			async function loadBinary(url){
				return loadFile(url,'arrayBuffer');
			}

			async function loadJSON(url){
				return loadFile(url,'json');
			}

		}
	};
}());
