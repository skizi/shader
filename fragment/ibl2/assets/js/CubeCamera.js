
THREE.CubeCamera = function ( near, far, cubeResolution ) {

	THREE.Object3D.call( this );

	this.type = 'CubeCamera';

	var fov = 90, aspect = 1;

	var cameraPX = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraPX.up.set( 0, - 1, 0 );
	cameraPX.lookAt( new THREE.Vector3( 1, 0, 0 ) );
	this.add( cameraPX );

	var cameraNX = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraNX.up.set( 0, - 1, 0 );
	cameraNX.lookAt( new THREE.Vector3( - 1, 0, 0 ) );
	this.add( cameraNX );

	var cameraPY = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraPY.up.set( 0, 0, 1 );
	cameraPY.lookAt( new THREE.Vector3( 0, 1, 0 ) );
	this.add( cameraPY );

	var cameraNY = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraNY.up.set( 0, 0, - 1 );
	cameraNY.lookAt( new THREE.Vector3( 0, - 1, 0 ) );
	this.add( cameraNY );

	var cameraPZ = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraPZ.up.set( 0, - 1, 0 );
	cameraPZ.lookAt( new THREE.Vector3( 0, 0, 1 ) );
	this.add( cameraPZ );

	var cameraNZ = new THREE.PerspectiveCamera( fov, aspect, near, far );
	cameraNZ.up.set( 0, - 1, 0 );
	cameraNZ.lookAt( new THREE.Vector3( 0, 0, - 1 ) );
	this.add( cameraNZ );



	var opt = { format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter };

	this.renderTarget = new THREE.WebGLRenderTargetCube( cubeResolution, cubeResolution, opt );

	this.renderTargetPX = new THREE.WebGLRenderTarget( cubeResolution, cubeResolution, opt );
	this.renderTargetNX = new THREE.WebGLRenderTarget( cubeResolution, cubeResolution, opt );
	this.renderTargetPY = new THREE.WebGLRenderTarget( cubeResolution, cubeResolution, opt );
	this.renderTargetNY = new THREE.WebGLRenderTarget( cubeResolution, cubeResolution, opt );
	this.renderTargetPZ = new THREE.WebGLRenderTarget( cubeResolution, cubeResolution, opt );
	this.renderTargetNZ = new THREE.WebGLRenderTarget( cubeResolution, cubeResolution, opt );

	this.renderTargets = [
		this.renderTargetPX,
		this.renderTargetNX,
		this.renderTargetPY,
		this.renderTargetNY,
		this.renderTargetPZ,
		this.renderTargetNZ,
	];

	this.updateCubeMap = function ( renderer, scene ) {

		var renderTarget = this.renderTarget;
		var generateMipmaps = renderTarget.generateMipmaps;

		renderTarget.generateMipmaps = false;

		renderTarget.activeCubeFace = 0;
		renderer.render( scene, cameraPX, this.renderTargetPX );

		renderTarget.activeCubeFace = 1;
		renderer.render( scene, cameraNX, this.renderTargetNX );

		renderTarget.activeCubeFace = 2;
		renderer.render( scene, cameraPY, this.renderTargetPY );

		renderTarget.activeCubeFace = 3;
		renderer.render( scene, cameraNY, this.renderTargetNY );

		renderTarget.activeCubeFace = 4;
		renderer.render( scene, cameraPZ, this.renderTargetPZ );

		renderTarget.generateMipmaps = generateMipmaps;

		renderTarget.activeCubeFace = 5;
		renderer.render( scene, cameraNZ, this.renderTargetNZ );

	};


	this.setRenderTargetsMinFilter = function( filter ){

		for( var i = 0; i < 6; i++ ){
	        this.renderTargets[i].minFilter = filter;
	    }

	}

};

THREE.CubeCamera.prototype = Object.create( THREE.Object3D.prototype );
