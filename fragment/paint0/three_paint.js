
var MYAPP = MYAPP||{};

MYAPP.ThreePaint = (function(){

    var self;

	var mouse = {
		x:0,
		y:0
	};
	var scene;
    var parentScene;
	var parentCamera;
    var captureCamera;
	var clock;
	var renderer;

	var stageWidth = 0;
	var stageHeight = 0;

    var cacheMesh;
    var mixMesh;
    var masteringMesh;

    var renderTargetMixMaterial;
    var paintMaterial;
    var paintingMap;

    var drawCacheRenderTarget;
    var masterRenderTarget;
    var texRenderTarget;
    var uvRenderTarget;
    var uvRenderTarget2;
    var uvRenderTarget3;
    var alphaRenderTarget;

    var canvas;
    var context;
    var drawRect = { minX:0, maxX:0, minY:0, maxY:0, w:0, h:0 };
    var canvasSize = 512;

    var drawingFlag = false;

    var debugCanvas;
    var debugContext;

    var composer;
    var composerRenderTarget;


    var addImgFlg = false;


	
	function ThreePaint( _canvasSize, _renderer, _scene, _camera ){

        self = this;

        clock = new THREE.Clock();

		canvasSize = _canvasSize;
		renderer = _renderer;
        parentScene = _scene;
		parentCamera = _camera;

        scene = new THREE.Scene();
        captureCamera = new THREE.OrthographicCamera( canvasSize / - 2, canvasSize / 2, canvasSize / 2, canvasSize / - 2, 1, 2000 );
        initCanvas();
        initRenderTarget();
        initMaterial();
        initMesh();
        initComposer();

        this.paintingMap = paintingMap;

        masterRenderTarget = meshCapture( masteringMesh, scene, masterRenderTarget, canvasSize );
        this.masterRenderTarget = masterRenderTarget;

	}



	function initCanvas(){

        canvas = document.createElement('canvas');
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        //$( canvas ).hide();
        $( document.body ).append( canvas );
        context = canvas.getContext('2d');
        clearCanvas( context, 0 );

        debugCanvas = document.createElement('canvas');
        debugCanvas.width = canvasSize;
        debugCanvas.height = canvasSize;
        $( debugCanvas ).attr({id:'debug-canvas'});
        //$( debugCanvas ).hide();
        $( document.body ).append( debugCanvas );
        debugContext = debugCanvas.getContext('2d');
        clearCanvas( debugContext, 0 );
	}


	function initMaterial(){

        paintingMap = new THREE.Texture( canvas );
        paintingMap.flipY = false;
        paintingMap.needsUpdate = true;

        //a
        //paintMaterial = new THREE.MeshBasicMaterial({ map:paintingMap, transparent:true/*, blending:THREE.AdditiveBlending*/, wireframe:false });

        paintMaterial = new THREE.ShaderMaterial({
            vertexShader: $('#paint-vshader')[0].textContent,
            fragmentShader: $('#paint-fshader')[0].textContent,
            uniforms: {
                texture1: { 
                    type: 't',
                    value: paintingMap
                },
                flipY: {
                    type: 'i',
                    value: 0
                },
                showVColor:{
                    type: 'i',
                    value: 0
                }
            },
            //transparent: true,
            vertexColors: THREE.VertexColors,
            alphaTest:.5
        });

        renderTargetMixMaterial = new THREE.ShaderMaterial({
            vertexShader: $('#mix-vshader')[0].textContent,
            fragmentShader: $('#mix-fshader')[0].textContent,
            uniforms: {
                texture1: { 
                    type: 't',
                    value: drawCacheRenderTarget
                },
                texture2: {
                    type: 't',
                    value: masterRenderTarget
                },
                alphaTexture:{
                    type: 't',
                    value: alphaRenderTarget
                },
                alphaBlendFlag: {
                    type: 'i',
                    value: 0
                },
                drawColor:{
                    type: 'v3',
                    value:new THREE.Vector3()
                }
            },
            //transparent: true
        });


        createAlphaMaterial = new THREE.ShaderMaterial({
            vertexShader: $('#alpha-vshader')[0].textContent,
            fragmentShader: $('#alpha-fshader')[0].textContent,
            uniforms: {
                texture1: { 
                    type: 't',
                    value: drawCacheRenderTarget
                },
                texture2: {
                    type: 't',
                    value: masterRenderTarget
                },
                sameCheck: {
                    type: 'i',
                    value: 0
                }
            }
        });
	}


	function initMesh(){


        cacheMesh = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1, 1, 1 ), paintMaterial );
        cacheMesh.position.x = 200;
        scene.add( cacheMesh );
        //parentScene.add( cacheMesh );

        var geometry = new THREE.PlaneGeometry( canvasSize, canvasSize, 2, 2 );
        mixMesh = new THREE.Mesh( geometry, renderTargetMixMaterial );
        mixMesh.position.y = 10000;
        //mixMesh.position.x = -100;
        scene.add( mixMesh );

        masteringMesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ map:texRenderTarget }) );
        masteringMesh.position.y = 20000;
        //masteringMesh.position.x = -100;
        scene.add( masteringMesh );

        var geometry = new THREE.PlaneGeometry( canvasSize, canvasSize, 2, 2 );
        alphaMesh = new THREE.Mesh( geometry, createAlphaMaterial );
        alphaMesh.position.y = 30000;
        //mixMesh.position.x = -100;
        scene.add( alphaMesh );

	}




	function initRenderTarget(){

        drawCacheRenderTarget = new THREE.WebGLRenderTarget(
            canvasSize,
            canvasSize,
            {
                magFilter: THREE.NearestFilter,
                minFilter: THREE.NearestFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping
            }
        );

        masterRenderTarget = new THREE.WebGLRenderTarget(
            canvasSize,
            canvasSize,
            {
                magFilter: THREE.NearestFilter,
                minFilter: THREE.NearestFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping
            }
        );

        texRenderTarget = new THREE.WebGLRenderTarget(
            canvasSize,
            canvasSize,
            {
                magFilter: THREE.NearestFilter,
                minFilter: THREE.NearestFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping
            }
        );

        uvRenderTarget = new THREE.WebGLRenderTarget(
            canvasSize,
            canvasSize,
            {
                magFilter: THREE.LinearFilter,
                minFilter: THREE.LinearFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping
            }
        );

        uvRenderTarget2 = new THREE.WebGLRenderTarget(
            canvasSize,
            canvasSize,
            {
                magFilter: THREE.LinearFilter,
                minFilter: THREE.LinearFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping
            }
        );

        uvRenderTarget3 = new THREE.WebGLRenderTarget(
            canvasSize,
            canvasSize,
            {
                magFilter: THREE.LinearFilter,
                minFilter: THREE.LinearFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping
            }
        );

        alphaRenderTarget = new THREE.WebGLRenderTarget(
            canvasSize,
            canvasSize,
            {
                magFilter: THREE.LinearFilter,
                minFilter: THREE.LinearFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping
            }
        );


        composerRenderTarget = new THREE.WebGLRenderTarget(
            canvasSize,
            canvasSize,
            {
                magFilter: THREE.LinearFilter,
                minFilter: THREE.LinearFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping
            }
        );
	}



    function initComposer(){

        composer = new THREE.EffectComposer(renderer, composerRenderTarget);
        var renderPass = new THREE.RenderPass(scene, captureCamera, null, null, 0 );
        composer.addPass(renderPass);
        
        
        var shader1 = {
            uniforms: {
                tDiffuse: {
                    type: "t",
                    value: null
                },
                resolution: {
                    type:'v2',
                    value:new THREE.Vector2( canvasSize, canvasSize )
                },
                weight:{
                    type:'fv1',
                    value:[.1,.1,.1,.1,.1,.1,.1,.1,.1,.1]
                },
                horizontal:{
                    type:'i',
                    value:1
                }
            },
            vertexShader: document.getElementById('blur-vshader').textContent,
            fragmentShader: document.getElementById('blur-fshader').textContent
        };

        var blurShaderPass1 = new THREE.ShaderPass(shader1);
        blurShaderPass1.needsSwap = true;
        composer.addPass(blurShaderPass1);


        var blurShaderPass2 = new THREE.ShaderPass(shader1);
        blurShaderPass2.uniforms.horizontal.value = 0;
        blurShaderPass2.needsSwap = true;
        composer.addPass(blurShaderPass2);
        

        /*
        var hblur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
        var vblur = new THREE.ShaderPass(THREE.VerticalBlurShader);

        var bluriness = 3;
        hblur.uniforms["h"].value = .01;
        vblur.uniforms["v"].value = .01;
        composer.addPass(hblur);
        composer.addPass(vblur);
        */
        // var toScreenPass = new THREE.ShaderPass(THREE.CopyShader);
        // toScreenPass.renderToScreen = true;
        // composer.addPass(toScreenPass);


    }



    function draw( nowColor, circleRadius ){

        if( mouse.x > drawRect.minX &&
            mouse.x < drawRect.maxX &&
            mouse.y > drawRect.minY &&
            mouse.y < drawRect.maxY ){

            var size = stageWidth;
            if( size < stageHeight ) size = stageHeight; 

            var x = ( mouse.x - drawRect.minX ) / drawRect.w * canvasSize;
            var y = ( mouse.y - drawRect.minY ) / drawRect.h * canvasSize;

            drawCircle( x, y, circleRadius, nowColor, context );

            var paintCacheMap = new THREE.Texture( canvas );
            paintCacheMap.needsUpdate = true;
            self.sphereMesh.material.uniforms.texture2.value = paintCacheMap;
        }
    }


//cacheMeshは複数マテリアルで
//masterRenderTargetをベースに、paintMaterialをその上にかぶせる感じで・・・？

    //A
    //ペイント開始した瞬間に実行
    function startPaint(){

        clearCanvas( context, 0 );
        clearCanvas( debugContext, 0 );

        cacheMesh.geometry = createFrontGeometory( self.sphereMesh );
        cacheMesh.position.copy( self.sphereMesh.position );


        var newUvs = createDrawUv( cacheMesh );
        cacheMesh.geometry.faceVertexUvs[0] = newUvs;
        cacheMesh.geometry.uvsNeedUpdate = true;

        
        //original uv capture
        
        //self.sphereMesh.material.uniforms.showUV.value = 1;        
        cacheMesh.material.uniforms.showVColor.value = 1;

        var canvasScale = 3;

        var size = stageWidth;
        if( size < stageHeight ) size = stageHeight;
        uvRenderTarget.setSize( size*canvasScale, size*canvasScale );
        debugCanvas.width = size*canvasScale;
        debugCanvas.height = size*canvasScale;

        var x = (size-stageWidth)*.5;
        var y = (size-stageHeight)*.5;
        parentCamera.setViewOffset( stageWidth*canvasScale, stageHeight*canvasScale, -x*canvasScale, -y*canvasScale, size*canvasScale, size*canvasScale );
        renderer.render( scene, parentCamera, uvRenderTarget );

        parentCamera.setViewOffset( stageWidth, stageHeight, 0, 0, stageWidth, stageHeight );
        cacheMesh.material.uniforms.showVColor.value = 0;
     
        //renderTarget2canvas( debugContext, uvRenderTarget, size*canvasScale, size*canvasScale );


        
        //shaderで現在の描画中のcanvasをプロジェクションマッピング
        self.sphereMesh.material.uniforms.texture2.value = new THREE.Texture( canvas );
        self.sphereMesh.material.uniforms.drawColor.value = new THREE.Vector3( MYAPP.nowColor[0]/255, MYAPP.nowColor[1]/255, MYAPP.nowColor[2]/255 );
        self.sphereMesh.material.uniforms.showOnTimeDraw.value = 1;

    }



//sphereMeshのuvをキャプチャーしてそれをcacheMeshのマテリアルに割り当てた状態で
//cacheMeshのポリゴンをsphereMeshのuv座標に合わせて並べる
//その状態でマッピングされたテクスチャのuvと、実際のuvが一致しないところが隠れている部分と判定できる。
//（ただ、完全一致は難しいと思うので、誤差.1以内ならtrueというような判定が必要）
//その隠れているところをマスクしてあげればよい。



    //B
    //ペイント後カメラを移動させた瞬間に実行
    function saveTexture(){

        //drawCacheRenderTargetに新規にペイントした内容をレンダリング
        var paintCacheMap = new THREE.Texture( canvas );
        //paintCacheMap.premultiplyAlpha = true;
        paintCacheMap.flipY = false;
        paintCacheMap.needsUpdate = true;
        cacheMesh.material.uniforms.texture1.value = paintCacheMap;
        cacheMesh = createUvCoordinatesPlane( self.sphereMesh, cacheMesh, canvasSize );
        drawCacheRenderTarget = meshCapture( cacheMesh, scene, drawCacheRenderTarget, canvasSize );
        //cacheMesh.geometry.uvsNeedUpdate = true;

        //vColor capture
        cacheMesh.material.uniforms.flipY.value = 1;
        cacheMesh.material.uniforms.texture1.value = uvRenderTarget;
        uvRenderTarget2 = meshCapture( cacheMesh, scene, uvRenderTarget2, canvasSize );
        debugCanvas.width = canvasSize;
        debugCanvas.height = canvasSize;       
        cacheMesh.material.uniforms.flipY.value = 0;
        cacheMesh.material.uniforms.texture1.value = paintingMap;
         

             
        //vColor capture2
        cacheMesh.material.uniforms.showVColor.value = 1;
        uvRenderTarget3 = meshCapture( cacheMesh, scene, uvRenderTarget3, canvasSize );
        debugCanvas.width = canvasSize;
        debugCanvas.height = canvasSize;      
        cacheMesh.material.uniforms.showVColor.value = 0;
 

        alphaMesh.material.uniforms.sameCheck.value = 1;
        alphaMesh.material.uniforms.texture1.value = uvRenderTarget2;
        alphaMesh.material.uniforms.texture2.value = uvRenderTarget3;
        //alphaRenderTarget = meshCapture( alphaMesh, scene, alphaRenderTarget, canvasSize );
        meshCaptureStep1( alphaMesh, canvasSize );
        composer.render(0.1);
     
        alphaMesh.material.uniforms.sameCheck.value = 0;





//uv capture
/*
        //
        // debugCanvas.width = stageWidth;
        // debugCanvas.height = stageWidth;
        // renderTarget2canvas( debugContext, uvRenderTarget, stageWidth, stageWidth );
        // var uvMap = new THREE.Texture( debugCanvas );
        // uvMap.flipY = true;
        // uvMap.needsUpdate = true;
        cacheMesh.material.uniforms.flipY.value = 1;
        cacheMesh.material.uniforms.texture1.value = uvRenderTarget;
        uvRenderTarget2 = meshCapture( cacheMesh, scene, uvRenderTarget2, canvasSize );
        debugCanvas.width = canvasSize;
        debugCanvas.height = canvasSize;
        renderTarget2canvas( debugContext, uvRenderTarget2, canvasSize, canvasSize );
        cacheMesh.material.uniforms.flipY.value = 0;


        //uvのpixelを照合
        var length = canvasSize * canvasSize * 4;
        var pixels = new Uint8Array( length );
        //var imgData = ctx.createImageData( canvasSize, canvasSize );

        var gl = renderer.context;
        gl.bindFramebuffer(gl.FRAMEBUFFER, uvRenderTarget2.__webglFramebuffer);
        gl.readPixels(0, 0, canvasSize, canvasSize, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null );
var x = 0;
var y = 0;
for( var i = 0; i < length; i+=4 ){
    var xDist = Math.abs( pixels[i] - x/canvasSize );
    var yDist = Math.abs( pixels[i+1] - y/canvasSize );
    if( xDist < .1 && yDist < .1 ){
        console.log(1);
    }
    x++;
    if( x > 512 ){
        x = 0;
        y++;
    }
}
*/
        //imgData.data.set( pixels, 0, pixels.length );


        //新規にペイントしたものと、今までのペイント内容をshaderで合成する
        mixMesh.material.uniforms.alphaBlendFlag.value = 1;
        mixMesh.material.uniforms.alphaTexture.value = composer.renderTarget2;
        mixMesh.material.uniforms.texture1.value = drawCacheRenderTarget;
        mixMesh.material.uniforms.texture2.value = masterRenderTarget; 
        mixMesh.material.uniforms.drawColor.value = new THREE.Vector3( MYAPP.nowColor[0]/255, MYAPP.nowColor[1]/255, MYAPP.nowColor[2]/255 );

        //合成した状態でtexRenderTargetにレンダリング
        texRenderTarget = meshCapture( mixMesh, scene, texRenderTarget, canvasSize );
        mixMesh.material.uniforms.alphaBlendFlag.value = 0;

        masterRenderTarget = meshCapture( masteringMesh, scene, masterRenderTarget, canvasSize );

        self.sphereMesh.material.uniforms.texture1.value = texRenderTarget;


// setTimeout(function(){
// renderTarget2canvas( debugContext, composer.renderTarget2, canvasSize, canvasSize );
// }, 100);


        //cacheMesh.geometry.dispose();

        //if( !addImgFlg ){
            //webgl2canvas( context, 0, 0, canvasSize, canvasSize );
            //renderTarget2canvas( context, masterRenderTarget, canvasSize, canvasSize );
        //}

        self.sphereMesh.material.uniforms.showOnTimeDraw.value = 0;

    }



    function createFrontGeometory( mesh ){

        var q = mesh.quaternion.clone();
        var scale = mesh.scale.clone();
        var data = getFrontFaces( mesh );
        var geometry = new THREE.Geometry();
        var length = data.length;
        var colors = [];
        for( var i = 0; i < length; i++){
            geometry.faces[i] = data[i].face;
            geometry.faces[i].a = i*3;
            geometry.faces[i].b = i*3+1;
            geometry.faces[i].c = i*3+2;
            geometry.faces[i].vertexColors = data[i].vertexColors;
            geometry.faces[i].defaultIndex = data[i].index;
            for( var j = 0; j < 3; j++ ){
                data[i].vertices[j].applyQuaternion( q );
                data[i].vertices[j].multiply( scale );
                geometry.vertices[i*3+j] = data[i].vertices[j];
                // var color = new THREE.Color(0xFFFFFF);
                // color.setHSL(210/360, 1, 0.5);
                // colors.push( color );
                //geometry.colors[i*3+j] = data[i].vertexColors[j];
            }
            geometry.faceVertexUvs[0].push( data[i].uvs );
        }
        // geometry.verticesNeedUpdate = true;
        // geometry.uvsNeedUpdate = true;
        //geometry.dynamic = true;
        geometry.colorsNeedUpdate = true;
        //geometry.colors = colors;

        return geometry;
    }


    function createDrawUv( mesh ){

        var drawUvs = getWorld2ScreenVecs( mesh );

		var size = stageWidth;
		if( size < stageHeight ) size = stageHeight;

        var w = size;//canvasSize
        var h = size;
        var uMin = ( stageWidth - w ) * .5;
        var uMax = uMin + w;
        var vMin = ( stageHeight - h ) * .5;
        var vMax = vMin + h;


        drawRect.minX = uMin;
        drawRect.maxX = uMax;
        drawRect.minY = vMin;
        drawRect.maxY = vMax;
        drawRect.w = w;
        drawRect.h = h;


        //projectionVecsから新規uvを作成
        var newUvs = [];
        var length = drawUvs.length; 
        for( var i = 0; i < length; i++){
            newUvs[i] = [];
            var vecs = drawUvs[i];
            for( var j = 0; j < 3; j++){
                var uv = new THREE.Vector2();
                uv.x = ( vecs[j].x - uMin ) / w;
                uv.y = ( vecs[j].y - vMin ) / h;
                newUvs[i].push( uv );
            }
        }

        return newUvs;

    }



    function getWorld2ScreenVecs( mesh ){

        var q = mesh.quaternion.clone();
        var pos = mesh.position.clone();
        var scale = mesh.scale.clone();
        var geometry = mesh.geometry;
        var faces = geometry.faces;
        var vertices = mesh.geometry.vertices;

        //各頂点をスクリーン座標に変換して配列に格納
        var data = [];
        var length = faces.length; 
        for( var i = 0; i < length; i++){
            data[i] = [];
            var face = faces[i].clone();
            var _vertices = [ vertices[ face.a ].clone(), vertices[ face.b ].clone(), vertices[ face.c ].clone() ];
            for( var j = 0; j < 3; j++){
                var v = _vertices[j];
                var wV = v.applyQuaternion( q );
                var wPos = wV.clone().add( pos );
                wPos.multiply( scale );
                var uv = vecWorld2screen( wPos );
                data[i][j] = uv;
            }
       }

       return data;

    }


    function vecWorld2screen(pos) {

        pos.project( parentCamera );
        pos.x = (pos.x + 1) * .5 * MYAPP.stageWidth;
        pos.y = MYAPP.stageHeight -(pos.y + 1) * .5 * MYAPP.stageHeight;

        return pos;
    }



    function getFrontFaces( mesh ){

        //cameraの方向とfaceのnormalの方向を内積して
        //cameraの方向を向いているfaceのuvのみを格納
        var cameraVec = getForward( parentCamera ).negate();

        var geometry = mesh.geometry;
        var faces = geometry.faces;
        var vertices = geometry.vertices;
        var uvs = geometry.faceVertexUvs[0];

        var faceLength = faces.length;
        var q = mesh.quaternion.clone();


        //カメラへのベクトルと法線の内積を求めて
        //カメラ方向を向いている頂点とuvデータを配列にキャッシュ
        var data = [];
        var count = 0;
        for( var i = 0; i < faceLength; i++ ){
            var wNormal = faces[i].normal.clone().applyQuaternion( q );
            var dot = cameraVec.dot( wNormal );
            if( dot > 0 ){
                var face = faces[i].clone();
                var a = face.a;
                var b = face.b;
                var c = face.c;
                var _vertices = [ vertices[ a ].clone(), vertices[ b ].clone(), vertices[ c ].clone() ];
                var rand1 = Math.random();
                var rand2 = Math.random();
                var color = new THREE.Color( 1/count, rand1, rand2 );
                //var color = new THREE.Vector3( rand, 1/count, 1 );
                var vertexColors = [ color, color, color ];
                var uv = uvs[i];
                var _uvs = [uv[0].clone(), uv[1].clone(), uv[2].clone()];
                data[count] = { face:face, uv:_uvs, vertices:_vertices, vertexColors:vertexColors, index:i };
                count++;
            }

        }

        /*
        //faceをカメラからの距離に近いもの順に並び替える
        var length = count;
        var dists = [];
        for( var i = 0; i < length; i++ ){
            var wVecs = data[i].vertices[0].clone().applyQuaternion( q );
            dists[i] = parentCamera.position.distanceTo( wVecs );
        }

        var array = [];
        for( var i = 0; i < length; i++ ){
            var min = 9999;
            var index = -1;
            for( var j = 0; j < length; j++ ){
                if( min > dists[j] ){
                    min = dists[j];
                    index = j;
                }
            }
            dists.splice( index, 1 );
            array[i] = data[index];
            data.splice( index, 1 );

        }
        data = array;
        */

        return data;
    }


    //uvMeshのuvの並びに合わせてdivideMeshのfaceを並べる
    function createUvCoordinatesPlane( uvMesh, divideMesh, size ){

        var halfSize = size * .5;

        var cacheGeometory = divideMesh.geometry;
        var cacheFaces = divideMesh.geometry.faces;
        var cacheFaceLength = cacheFaces.length;
        var uvs = uvMesh.geometry.faceVertexUvs[0];
        for( var i = 0; i < cacheFaceLength; i++ ){
            var defaultIndex = cacheFaces[i].defaultIndex;
            var uv = uvs[defaultIndex];
            for( var k = 0; k < 3; k++ ){
                var vertex = cacheGeometory.vertices[i*3+k];
                vertex.x = uv[k].x * size - halfSize;
                vertex.y = uv[k].y * size - halfSize;
                vertex.z = 0;
            }
        }
        cacheGeometory.verticesNeedUpdate = true;

        return divideMesh;
    }


    function meshCapture( mesh, _scene, _renderTarget, size ){

        //var cameraDefalutPos = parentCamera.position.clone();
        meshCaptureStep1( mesh, size );

        _renderTarget.setSize( size, size );
        renderer.render( _scene, captureCamera, _renderTarget );

        return _renderTarget;

    }


    function meshCaptureStep1( mesh, size ){

        var cameraDist = (stageHeight * .5) / Math.tan((parentCamera.fov * Math.PI / 180) * .5);
        var forward = getForward( mesh ).negate();
        var cameraPos = mesh.position.clone().add( forward.multiplyScalar( cameraDist ) );
        captureCamera.position.copy( cameraPos );
        captureCamera.lookAt( mesh.position.clone() );

        var halfSize = size * .5;
        captureCamera.left = -halfSize;
        captureCamera.right = halfSize;
        captureCamera.top = -halfSize;
        captureCamera.bottom = halfSize;

    }



    //var brushHardness = 10;
    var arcPI = Math.PI*2;
    function drawCircle(x, y, r, c, ctx) {
        
        c[3] = .4;
        
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'rgba('+c+')';
        ctx.arc( round(x), round(y), r, 0, arcPI, false);
        ctx.fill();
        ctx.restore();

    }


    function clearCanvas( ctx, alpha ){

        if( alpha == 0 ){
            ctx.clearRect( 0, 0, canvasSize, canvasSize );
        }else{
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
            ctx.rect( 0, 0, canvasSize,canvasSize );
            ctx.fill();
        }
    }


    //ビット演算でMath.roundの高速化
    function round( num ){

        num = (0.5 + num) | 0;
        num = ~~ (0.5 + num);
        num = (0.5 + num) << 0;

        return num;

    }



    function getForward(obj) {
        var vector = new THREE.Vector3(0, 0, -1);
        vector.applyEuler(obj.rotation);
        return vector;
    }



    function renderTarget2canvas( ctx, _renderTarget, w, h ){

        var pixels = new Uint8Array( w * h * 4);
        var imgData = ctx.createImageData( w, h );

        var gl = renderer.context;
        gl.bindFramebuffer(gl.FRAMEBUFFER, _renderTarget.__webglFramebuffer);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null );

        imgData.data.set( pixels, 0, pixels.length );

        ctx.putImageData(imgData, 0, 0);

    }


    function webgl2canvas( ctx, readX, readY, w, h, putX, putY ){

        addImgFlg = true;
        var _ctx = renderer.getContext( 'experimental-webgl', {preserveDrawingBuffer: false});
        var imgData = ctx.createImageData( w, h );
        var pixels = new Uint8Array( w*h*4 );
        _ctx.readPixels( readX, readY, w, h, _ctx.RGBA, _ctx.UNSIGNED_BYTE, pixels );
        imgData.data.set( pixels, 0, pixels.length );

        ctx.putImageData(imgData, putX, putY);

    }


	ThreePaint.prototype = {

		draw : function( touch, nowColor, circleRadius ){

			mouse = touch;
            if( !drawingFlag ) startPaint();
            drawingFlag = true;
            draw( nowColor, circleRadius );

		},


		saveTexture : function(){

            if( drawingFlag ){
                saveTexture();
                drawingFlag = false;
            }

		},


		resize : function( w, h ){

			stageWidth = w;
			stageHeight = h;

		}

	};

	return ThreePaint;

})();