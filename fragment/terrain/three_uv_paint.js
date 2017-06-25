var ThreeUVPaint = (function(){

	var scene;
	var camera;
	var renderer;
	var light;
	var initCompFunc;

	var paintMap;
	var waterTexture;
	var groundTexture;
	var groundTexture2
	var groundNormalTexture2;

	var mesh;
    var renderTarget;
    var paintMaterial;
    var colorMaterial;

    var brushCanvas;
    var brushContext;

    var brushHtml = '<ul id="brush">' +
		            '<li>' +
		                '<a href="javascript:void(0);">' +
		                    '<img src="img/brush/stamp7.png" maxW="100" maxH="100">' +
		                '</a>' +
		            '</li>' +
	            '</ul>';
	var brushImages = [];
    var nowBrush;
    var brushImageMaxW = 0;
    var brushImageMaxH = 0;

    var textureLoadCount = 0;


	function ThreeUVPaint( _scene, _camera, _renderer, _light, callback ){

		scene = _scene;
		camera = _camera;
		renderer = _renderer;
		light = _light;
		initCompFunc = callback;

		initBrush();
		initCanvas();
		this.initTexture();

        renderTarget = new THREE.WebGLRenderTarget(
	        	window.innerWidth,
	        	window.innerHeight,
	        	{
					magFilter: THREE.NearestFilter,
					minFilter: THREE.NearestFilter,
					wrapS: THREE.ClampToEdgeWrapping,
					wrapT: THREE.ClampToEdgeWrapping
				}
        	);

	}


	function initCanvas(){

	    //paintMaterial
	    paintCanvas = document.createElement('canvas');
		paintCanvas.width = 1024;
		paintCanvas.height = 1024;
		$( document.body ).append( paintCanvas );
		var ctx = paintCanvas.getContext('2d');
		ctx.beginPath();
		ctx.fillStyle = 'rgba(0, 0, 0, 255)';
		ctx.rect( 0, 0, 1024,1024 );
		ctx.fill();

	}


    function readPixel( x, y ){

    	var ctx = renderer.getContext("experimental-webgl", {preserveDrawingBuffer: false});
		var arr = new Uint8Array( 4 );
		//https://www.support.softbankmobile.co.jp/partner_st/home_tech9/column11-4.cfm
		ctx.readPixels(
				x,
				window.innerHeight - y,
				//y,
				1,
				1,
				ctx.RGBA,
				ctx.UNSIGNED_BYTE,
				arr
			);
		var num = .00392157;// 1/255
		return [arr[0]*num, arr[1]*num];

    }



	function doPaintPoint(_x, _y, drawRadius){

		var image = paintMaterial.uniforms.texture.value.image;
		//var image = mesh.material.map.image;
		var ctx		= image.getContext('2d');
		if (_x > 0){
			//circle( _x, _y, drawRadius, MYAPP.nowColor, ctx );
			drawImage( _x, _y, brushImages[0], MYAPP.nowColor, ctx );
		}
	}


	var brushHardness = 10;
    var arcPI = Math.PI*2;
	function circle(x, y, r, c, ctx) {

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'rgba('+c+')';
        ctx.arc( round(x), round(y), r, 0, arcPI, false);
        ctx.fill();
        ctx.restore();

	}


    //ビット演算でMath.roundの高速化
    function round( num ){

        num = (0.5 + num) | 0;
        num = ~~ (0.5 + num);
        num = (0.5 + num) << 0;

        return num;

    }


    function initBrush(){

    	$( document.body ).append( brushHtml );
        var brushBtns = $( '#brush li a' );
        for( var i = 0; i < brushBtns.length; i++ ){
            //$( brushBtns[i] ).on( 'mousedown', { index:i }, brushClickHandler.bind( this ) );
            brushImages.push( $( brushBtns[i] ).find( 'img' )[0] );
        }

        var canvas = $( '<canvas>' );
        canvas.attr({ width:512, height:512 });
        canvas.css({ width:512, height:512, display:'block' });
        $( canvas ).hide();
        $( document.body ).append( canvas );
        brushCanvas = canvas[0];
        brushContext = canvas[0].getContext("2d");

        //selectBrush( 5 );
        nowBrush = brushImages[ 0 ];
        brushImageMaxW = $( nowBrush ).attr( 'maxW' );
        brushImageMaxH = $( nowBrush ).attr( 'maxH' );
    }


    function drawImage( x, y, image, c, ctx ){

        //create brush
        brushContext.save();
        brushContext.clearRect( 0, 0, 512, 512 );
        brushContext.drawImage( image, 0, 0 )
        brushContext.globalCompositeOperation = 'source-in';//'lighter';
        brushContext.fillStyle = 'rgba('+c+')';
        brushContext.fillRect( 0, 0, 512, 512 );
        brushContext.restore();



        var half0W = brushImageMaxW / 2;
        var half0H = brushImageMaxH / 2;
        
        ctx.save();
        
        // //set rad
        // var rad = 180 * toRad;
        // var offsetPos = getDrawPosition( MYAPP.touch.x + 30, MYAPP.touch.y );
        // if( offsetPos ){
        //    var offsetX = offsetPos.x - x;
        //    var offsetY = offsetPos.y - y;
        //    rad += Math.atan2(offsetY, offsetX);
        // }


        //rotation draw
        ctx.translate( x, y );
        //ctx.rotate( rad );
        ctx.drawImage( brushCanvas, -half0W, -half0H )
        //ctx.rotate( -rad );
        ctx.translate( -x, -y );
        
        //
        ctx.restore();

    }


	ThreeUVPaint.prototype = {

		initTexture : function(){

			paintMap = new THREE.Texture( paintCanvas );
			paintMap.flipY = false;
			paintMap.needsUpdate = true;
		    //paintMaterial = new THREE.MeshLambertMaterial( { map:paintMap } );

		    waterTexture = THREE.ImageUtils.loadTexture( 'img/water1.jpg', THREE.UVMapping, this.textureLoadCheck.bind( this ) );
            waterTexture.wrapS = waterTexture.wrapT = THREE.RepeatWrapping;
		    waterNormalTexture = THREE.ImageUtils.loadTexture( 'img/water_normal3.jpg', THREE.UVMapping, this.textureLoadCheck.bind( this ) );
            waterNormalTexture.wrapS = waterNormalTexture.wrapT = THREE.RepeatWrapping;
		    groundTexture = THREE.ImageUtils.loadTexture( 'img/beach0_512.jpg', THREE.UVMapping, this.textureLoadCheck.bind( this ) );
            groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
		    groundTexture2 = THREE.ImageUtils.loadTexture( 'img/grass0_512.jpg', THREE.UVMapping, this.textureLoadCheck.bind( this ) );
            groundTexture2.wrapS = groundTexture2.wrapT = THREE.RepeatWrapping;
		    groundNormalTexture2 = THREE.ImageUtils.loadTexture( 'img/grass0_normal_512.jpg', THREE.UVMapping, this.textureLoadCheck.bind( this ) );
            groundNormalTexture2.wrapS = groundNormalTexture2.wrapT = THREE.RepeatWrapping;

        },


        textureLoadCheck : function(){

            textureLoadCount++;
            if( textureLoadCount == 5 ){
                this.initMaterial();
                initCompFunc();
            }

        },


        initMaterial : function(){

		    paintMaterial = new THREE.ShaderMaterial({
				vertexShader: document.getElementById('vshader').textContent,
				fragmentShader: document.getElementById('fshader').textContent,
				uniforms: {
					texture: { 
						type: 't',
						value: paintMap //THREE.ImageUtils.loadTexture('img/color0.jpg')
					},
					waterTexture:{
						type: 't',
						value: waterTexture
					},
					waterNormalTexture:{
						type:'t',
						value:waterNormalTexture
					},
					groundTexture:{
						type: 't',
						value: groundTexture
					},
					groundTexture2:{
						type:'t',
						value:groundTexture2
					},
					groundNormalTexture2:{
						type:'t',
						value:groundNormalTexture2
					},
					lightPos: {
						type:'v3',
						value:light.position
					},
					eyePosition:{
						type:'v3',
						value:camera.position
					},
	                time:{
	                    type:"f",
	                    value:0.0
	                }
				},
				needsUpdate:true,
				transparent:true
			});

		    this.paintMaterial = paintMaterial;

		    colorMaterial = new THREE.ShaderMaterial({
				vertexShader: document.getElementById('color-vshader').textContent,
				fragmentShader: document.getElementById('color-fshader').textContent,
				needsUpdate:true
			});
		},


		setMesh : function( _mesh ){

			mesh = _mesh;

		},


		draw : function( pos, color, drawRadius ){

			mesh.material = colorMaterial;
			renderer.render( scene, camera, renderTarget );
			var uv = readPixel( pos.x, pos.y );
			mesh.material = paintMaterial;

			//canvasにdraw
			color[3] = .3;
			doPaintPoint( uv[0] * 1024, uv[1] * 1024, drawRadius );


			//テクスチャの更新
			var paintMap = new THREE.Texture( paintCanvas );
			paintMap.flipY = false;
			paintMap.needsUpdate = true;
			mesh.material.uniforms.texture.value = paintMap;

		},


		resize : function(){

			renderTarget.setSize( window.innerWidth, window.innerHeight );

		}

	}

	return ThreeUVPaint;

})();