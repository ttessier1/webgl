class TRS {
	constructor(position = [0,0,0], rotation = [0,0,0,1],scale=[1,1,1]){
		this.position = position;
		this.rotation= rotation;
		this.scale = scale;
	}

	getMatrix(dst){
		dst= dst || new Float32Array(16);
		m4.compose(this.position,this.rotation,this.scale,dst);
		return dst;
	}

}

class Node {
	constructor(source,name){
		this.name= name;
		this.source = source;
		this.parent = null;
		this.children = [];
		this.localMatrix = m4.identity();
		this.worldMatrix = m4.identity();
		this.drawables = [];
	}
	setParent(parent){
		if(this.parent){
			this.parent._removeChild(this);
			this.parent= null;
		}
		if(parent){
			parent._addChild(this);
			this.parent = parent;
		}
	}
	updateWorldMatrix(parentWorldMatrix){
		const source = this.source;
		if(source){
			source.getMatrix(this.localMatrix);
		}
		if(parentWorldMatrix){
			m4.multiply(parentWorldMatrix,this.localMatrix, this.worldMatrix);
		}else{
			m4.copy(this.localMatrix,this.worldMatrix);
		}
		const worldMatrix = this.worldMatrix;
		for(const child if this.children){
			child.updateWorldMatrix(worldMatrix);
		}
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
		this.children.splice(nds,1);
	}
}
