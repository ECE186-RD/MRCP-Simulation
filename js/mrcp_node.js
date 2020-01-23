class MRCPNode {
    constructor(scene, renderer, position, color = 0x64b1e8) {
        this.scene = scene;
        this.renderer = renderer;

        var geometry = new THREE.SphereGeometry(0.5, 100, 100);
        var material = new THREE.MeshLambertMaterial({color: color});            
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
        this.mesh.position.set(position.x, position.y, position.z);
        this.distanceDebugMeshes = [];
        this.connectedDebugMeshes = [];
    }

    render(){
        for(var i = 0; i < this.distanceDebugMeshes.length; i++){
            this.distanceDebugMeshes[i].render();
        }
    }

    generateDistanceMesh(target_object, dimensions=2, color=0x3cde7a){
        this.distanceDebugMeshes[this.distanceDebugMeshes.length] = new DistanceDebugMesh(scene, this, target_object, dimensions, color);
        target_object.connectedDebugMeshes[target_object.connectedDebugMeshes.length] = this.distanceDebugMeshes[this.distanceDebugMeshes.length-1];
    }

    trilaterate(){
        var n1 = [this.connectedDebugMeshes[0].source_object.mesh.position.x, this.connectedDebugMeshes[0].source_object.mesh.position.z, this.connectedDebugMeshes[0].radius];
        var n2 = [this.connectedDebugMeshes[1].source_object.mesh.position.x, this.connectedDebugMeshes[1].source_object.mesh.position.z, this.connectedDebugMeshes[1].radius];
        var n3 = [this.connectedDebugMeshes[2].source_object.mesh.position.x, this.connectedDebugMeshes[2].source_object.mesh.position.z, this.connectedDebugMeshes[2].radius];
        
        var y = -((n2[0]-n3[0])*(Math.pow(n2[0],2)-Math.pow(n1[0],2)+Math.pow(n2[1],2)-Math.pow(n1[1],2)+Math.pow(n1[2],2)-Math.pow(n2[2],2))
         - (n1[0]-n2[0])*(Math.pow(n3[0],2)-Math.pow(n2[0],2)+Math.pow(n3[1],2)-Math.pow(n2[1],2)+Math.pow(n2[2],2)-Math.pow(n3[2],2)))/(2*((n1[1]-n2[1])*(n2[0]-n3[0])-(n2[1]-n3[1])*(n1[0]-n2[0])));
        console.log(y);

        var x = -((n2[1]-n3[1])*(Math.pow(n2[1],2)-Math.pow(n1[1],2)+Math.pow(n2[0],2)-Math.pow(n1[0],2)+Math.pow(n1[2],2)-Math.pow(n2[2],2))
         - (n1[1]-n2[1])*(Math.pow(n3[1],2)-Math.pow(n2[1],2)+Math.pow(n3[0],2)-Math.pow(n2[0],2)+Math.pow(n2[2],2)-Math.pow(n3[2],2)))/(2*((n1[0]-n2[0])*(n2[1]-n3[1])-(n2[0]-n3[0])*(n1[1]-n2[1])));
         console.log(x);
    }
}

class DistanceDebugMesh{
    constructor(scene, source_object, target_object, dimensions = 2, color = 0x3cde7a){
        this.scene = scene;
        this.dimensions = dimensions;
        this.color = color;
        this.source_object = source_object;
        this.target_object = target_object;

        this.updateDistanceMesh();
    }

    render(){
        this.updateDistanceMesh();
    }

    updateDistanceMesh(){
        if(this.mesh != null){
            if(this.dimensions == 3){
                this.radius = this.source_object.mesh.position.distanceTo(this.target_object.mesh.position);
                this.mesh.scale.set(this.radius, this.radius, this.radius);
                this.mesh.position.set(this.source_object.mesh.position.x, this.source_object.mesh.position.y, this.source_object.mesh.position.z);
                return;
            }
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
        this.radius = this.source_object.mesh.position.distanceTo(this.target_object.mesh.position);
        var geometry;
        var scale = 1;
        if(this.dimensions == 1){
            var material = new THREE.LineBasicMaterial({
                color: this.color
            });
            
            var geometry = new THREE.Geometry();
            geometry.vertices.push(
                this.target_object.mesh.position,
                this.source_object.mesh.position,
            );
            this.mesh = new THREE.Line( geometry, material );
        }
        else{
            if(this.dimensions == 2){
                geometry = new THREE.TorusBufferGeometry(this.radius, 0.1, 16, 100 );
            }else{
                geometry = new THREE.SphereBufferGeometry(1, 100, 100);
                scale = this.radius;
            }
            var material = new THREE.MeshBasicMaterial( { color: this.color } );
            material.side = THREE.DoubleSide;
            material.clipIntersection = true;
            material.transparent = true;
            material.opacity = 0.25;
            material.depthWrite = false;
            this.mesh = new THREE.Mesh( geometry, material );
            this.mesh.rotation.x = Math.PI / 2;
            this.mesh.position.set(this.source_object.mesh.position.x, this.source_object.mesh.position.y, this.source_object.mesh.position.z);
            this.mesh.scale.set(scale, scale, scale);
        }
        this.scene.add(this.mesh);
    }
}