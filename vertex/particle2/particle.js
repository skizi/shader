var MYAPP = MYAPP||{};


MYAPP.Particle = (function(){

    var resolutionW = 32;
    var resolution = resolutionW * resolutionW;

    var renderer;
    var scene;
    var camera;
    var light;

    var renderTargetParameters = {
        minFilter: THREE.NearestFilter,//縮めた時にじまないように //THREE.LinearFilter,
        magFilter: THREE.NearestFilter,//広げたときにじまない様に //THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type:THREE.FloatType,//テクスチャの色の解像度　高
        stencilBuffer: false
    }




    function Particle( _target, baseColor, _renderer, _scene, _camera, _light ){

        this.target = _target;
        this.targetPosition = new THREE.Vector3();
        this.mousePosition = new THREE.Vector3();
        this.oldMousePosition = new THREE.Vector3();

        this.baseColor = baseColor;

        renderer = _renderer;
        scene = _scene;
        camera = _camera;
        light = _light;

        var obj = initParticle( this );
        this.points = obj.points;
        this.mesh = obj.mesh;


    }


    function initParticle( self ){

        self.nowPositionRenderTarget1 = new THREE.WebGLRenderTarget( resolutionW, resolutionW, renderTargetParameters);
        self.nowPositionRenderTarget2 = new THREE.WebGLRenderTarget( resolutionW, resolutionW, renderTargetParameters);
        self.nowPositionRenderTarget = self.nowPositionRenderTarget1;
        
        self.velocityRenderTarget1 = new THREE.WebGLRenderTarget( resolutionW, resolutionW, renderTargetParameters);
        self.velocityRenderTarget2 = new THREE.WebGLRenderTarget( resolutionW, resolutionW, renderTargetParameters);
        self.velocityRenderTarget = self.velocityRenderTarget1;

        self.percentRenderTarget1 = new THREE.WebGLRenderTarget( resolutionW, resolutionW, renderTargetParameters);
        self.percentRenderTarget2 = new THREE.WebGLRenderTarget( resolutionW, resolutionW, renderTargetParameters);
        self.percentRenderTarget = self.percentRenderTarget1;


        var pointGeometry = new THREE.PlaneGeometry( 5, 5, resolutionW, resolutionW );
        var obj1 = getSourceIndexsAndVertices( pointGeometry );

        self.percentMaterial = new THREE.ShaderMaterial({
            uniforms:{
                percentTexture:{
                    type:'t',
                    value:self.percentRenderTarget
                },
                time:{
                    type:'f',
                    value:0.0
                },
                initFlag:{
                    type:'i',
                    value:1
                }
            },
            attributes:{
                indexs:{
                    type:'f',
                    value:obj1.indexs
                }
            },
            vertexShader: $( '#percent-vshader' ).text(),
            fragmentShader: $( '#percent-fshader' ).text()
        });


        self.positionMaterial = new THREE.ShaderMaterial({
            uniforms:{
                percentTexture:{
                    type:'t',
                    value:self.percentRenderTarget
                },
                nowPosTexture:{
                    type:'t',
                    value:self.nowPositionRenderTarget
                },
                startPos:{
                    type:'v3',
                    value:self.targetPosition
                },
                time:{
                    type:'f',
                    value:0.0
                },
                resolution:{
                    type:'f',
                    value:resolution
                },
            },
            attributes:{
                indexs:{
                    type:'f',
                    value:obj1.indexs
                }
            },
            vertexShader: $( '#position-vshader' ).text(),
            fragmentShader: $( '#position-fshader' ).text()
        });


        self.velocityMaterial = new THREE.ShaderMaterial({
            uniforms:{
                percentTexture:{
                    type:'t',
                    value:self.percentRenderTarget
                },
                velocityTexture:{
                    type:'t',
                    value:self.velocityRenderTarget
                },
                mouseVelocity:{
                    type:'v3',
                    value:self.mousePosition.clone().sub(  self.oldMousePosition )
                },
                time:{
                    type:'f',
                    value:0.0
                },
                resolution:{
                    type:'f',
                    value:resolution
                }
            },
            attributes:{
                indexs:{
                    type:'f',
                    value:obj1.indexs
                }
            },
            vertexShader: $( '#velocity-vshader' ).text(),
            fragmentShader: $( '#velocity-fshader' ).text()
        });

        var points = new THREE.PointCloud( pointGeometry, self.positionMaterial );
        //points.rotation.x = 0 * toRad;
        points.frustumCulled = false;



        var meshGeometry = new THREE.PlaneGeometry( 5, 5, resolutionW, resolutionW );
        var obj2 = separateMesh( meshGeometry );
        meshGeometry = obj2.geometry;

        self.particleMaterial = new THREE.ShaderMaterial({
            uniforms:{
                nowPosTexture:{
                    type:'t',
                    value:self.nowPositionRenderTarget
                },
                velocityTexture:{
                    type:'t',
                    value:self.velocityRenderTarget  
                },
                percentTexture:{
                    type:'t',
                    value:self.percentRenderTarget  
                },
                time:{
                    type:'f',
                    value:0.0
                },
                resolution:{
                    type:'f',
                    value:resolution
                },
                lightPos:{
                    type:'v3',
                    value:light.position.clone()
                },
                baseColor:{
                    type:'v3',
                    value:self.baseColor
                }
            },
            attributes:{
                indexs:{
                    type:'f',
                    value:obj2.indexs
                },
                origins:{
                    type:'v3',
                    value:obj2.origins
                },
                randoms:{
                    type:'v3',
                    value:obj2.randoms
                }
            },
            vertexShader: $( '#particle-vshader' ).text(),
            fragmentShader: $( '#particle-fshader' ).text(),
            side:THREE.DoubleSide
        });

        var mesh = new THREE.Mesh( meshGeometry, self.particleMaterial );
        mesh.frustumCulled = false;



        return { points:points, mesh:mesh };

    }


    function separateMesh( sourceGeometry ){

        var geometry = new THREE.Geometry();

        var faceNormals = [];
        var indexs = [];
        var origins = [];
        var originChache = [];
        var randoms = [];
        var faceLength = sourceGeometry.faces.length;
        for( var i = 0; i < faceLength; i++ ){

            var index = Math.floor( i / 2 );
            
            var sourceFace = sourceGeometry.faces[ i ].clone();
            var face = new THREE.Face3( i*3, i*3+1, i*3+2 );
            var vs = [];
            var a = sourceGeometry.vertices[sourceFace.a];
            var b = sourceGeometry.vertices[sourceFace.b];
            var c = sourceGeometry.vertices[sourceFace.c];
            geometry.vertices.push( a.clone() );
            geometry.vertices.push( b.clone() );
            geometry.vertices.push( c.clone() );
            for( var j = 0; j < 3; j++ ){
                //faceNormals.push( face.normal.clone() );
                face.vertexNormals.push( sourceFace.vertexNormals[j].clone() );
                // faceNormals.push( v.clone() );
                indexs.push( index );
            }

            var n = getFaceNormal( a, b, c );
            faceNormals.push( n );
            faceNormals.push( n );
            faceNormals.push( n );
            face.normal = n;

            
            //var face = sourceFace.clone();
            geometry.faces.push( face );

            geometry.faceVertexUvs[0].push([
                new THREE.Vector2( 0, 1 ),
                new THREE.Vector2( 1, 0 ),
                new THREE.Vector2( 0, 0 )
            ]);

            originChache.push( a );
            originChache.push( b );
            originChache.push( c );
            if( i % 2 == 1 ){
                var origin = getCenter( originChache );
                var randomVec = new THREE.Vector3( Math.random(), Math.random(), Math.random() );
                for( j = 0; j < 6; j++ ){
                    origins.push( origin );
                    randoms.push( randomVec );
                }
                originChache = [];

            }
        }

        geometry.verticesNeedUpdate = true;


        return { geometry:geometry, indexs:indexs, origins:origins, randoms:randoms };

    }


    function getCenter( array ){

        var length = array.length;
        var x = 0;
        var y = 0;
        var z = 0;
        for( var i = 0; i < length; i++ ){
            x += array[i].x;
            y += array[i].y;
            z += array[i].z;
        }
        
        return new THREE.Vector3( x/length, y/length, z/length );

    }


    function getFaceNormal(v0, v1, v2){

        // 頂点を結ぶベクトルを算出
        var vec1 = new THREE.Vector3( v1.x - v0.x, v1.y - v0.y, v1.z - v0.z );
        var vec2 = new THREE.Vector3( v2.x - v0.x, v2.y - v0.y, v2.z - v0.z );

        // ベクトル同士の外積
        var n = new THREE.Vector3();
        n.x = vec1.y * vec2.z - vec1.z * vec2.y;
        n.y = vec1.z * vec2.x - vec1.x * vec2.z;
        n.z = vec1.x * vec2.y - vec1.y * vec2.x;

        return n.normalize();
    }


    function getSourceIndexsAndVertices( sourceGeometry ){
        
        var _length = sourceGeometry.vertices.length;

        var vertices = [];
        var indexs = [];

        for( var i = 0; i < _length; i++ ){
            if( sourceGeometry.vertices[i] ){
                var v = sourceGeometry.vertices[i].clone();
            }else{
                v = new THREE.Vector3();
            }
            vertices[i] = v.clone();
            indexs[i] = i;
        }

        return { vertices:vertices, indexs:indexs };

    }




    
    Particle.prototype = {

        render : function( time ){

            this.mesh.visible = false;
            this.points.visible = true;

            if( this.nowPositionRenderTarget == this.nowPositionRenderTarget1 ){
                this.nowPositionRenderTarget = this.nowPositionRenderTarget2;
                this.velocityRenderTarget = this.velocityRenderTarget2;
                //this.percentRenderTarget = this.percentRenderTarget2;
            }else{
                this.nowPositionRenderTarget = this.nowPositionRenderTarget1;
                this.velocityRenderTarget = this.velocityRenderTarget1;
                //this.percentRenderTarget = this.percentRenderTarget1;
            }

            //hairPositionMesh.material.uniforms.renderingNowPositionFlag.value = 1;


            //percent
            // this.points.material = this.percentMaterial;
            // renderer.render( scene, camera, this.percentRenderTarget );
            // this.percentMaterial.uniforms.percentTexture.value = this.percentRenderTarget;
            // this.percentMaterial.uniforms.time.value = time;
            // this.percentMaterial.uniforms.initFlag.value = 0;

            //position
            this.points.material = this.positionMaterial;
            renderer.render( scene, camera, this.nowPositionRenderTarget );
            this.positionMaterial.uniforms.nowPosTexture.value = this.nowPositionRenderTarget;
            this.positionMaterial.uniforms.time.value = time;
            this.targetPosition = this.target.getWorldPosition();
            this.positionMaterial.uniforms.startPos.value = this.targetPosition;


            // //velocity
            this.points.material = this.velocityMaterial;
            renderer.render( scene, camera, this.velocityRenderTarget );
            this.velocityMaterial.uniforms.time.value = time;
            this.velocityMaterial.uniforms.velocityTexture.value = this.velocityRenderTarget;
            //mousePosition = new THREE.Vector3( MYAPP.touch.x, MYAPP.touch.y, 0 );
            this.mousePosition = this.targetPosition.clone();
            var mouseVelocity = this.mousePosition.clone().sub(  this.oldMousePosition ).normalize();
            this.velocityMaterial.uniforms.mouseVelocity.value = mouseVelocity;
            



            // this.points.visible = false;
            // copyMesh.visible = true;
            // renderer.render( scene, camera, percentRenderTarget );


            this.particleMaterial.uniforms.time.value = time;
            this.particleMaterial.uniforms.velocityTexture.value = this.velocityRenderTarget;
            this.particleMaterial.uniforms.nowPosTexture.value = this.nowPositionRenderTarget;

    

    this.points.material = this.positionMaterial;
    this.mesh.material = this.particleMaterial;


            this.mesh.visible = true;
            this.points.visible = false;

            this.oldMousePosition = this.mousePosition.clone();
        }
    }

    return Particle;

})();