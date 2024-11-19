class Node{
	constructor(source,name){
		this.firstLoop = true;
		if ( typeof(name) == "string"){
			this.name = name;
			if(this.firstLoop) info("Creating Node:["+name+"]");
		}else{
			this.name = "Unnamed Object "+Math.random();
		}
		this.source = source;
		this.children = [];
		this.localMatrix = m4.identity();
		this.worldMatrix = m4.identity();
		this.drawables = [];
	}

	setParent(parent){
		// remove us from our parent
		if(this.parent){
			this.parent._removeChild(this);
			this.parent = null;
		}
		if(parent){
			parent._addChild(this);
			this.parent= parent;
		}
	}

	updateWorldMatrix(parentWorldMatrix){
		if(this.firstLoop)console.log("UpdateWorldMatrix:"+this.name);
		var source=this.source;
		if(source){
			if(this.firstLoop)info("Source Matrix:"+this.name+"-"+this.localMatrix);
			source.getMatrix(this.localMatrix);
		}
		if(parentWorldMatrix){
			if(this.firstLoop)console.log("ParentWorldMatrix:"+parentWorldMatrix);
			m4.multiply(parentWorldMatrix,this.localMatrix,this.worldMatrix);
		} else {
			if(this.firstLoop)console.log("ParentWorldMatrid[worldMatrix]:"+this.worldMatrix);
			m4.copy(this.localMatrix,this.worldMatrix);
		}
		var worldMatrix = this.worldMatrix;
		for(const child of this.children){
			child.updateWorldMatrix(worldMatrix);
		}
		this.firstLoop = false;
	}
	traverse(fn){
		fn(this);
		for(const child of this.children){
			child.traverse(fn);
		}
	}
	_addChild(child){
		this.children.push(child);
	}
	_removeChild(child){
		const ndx = this.children.indexOf(child);
		this.children.splice(ndx,1);
	}
}
