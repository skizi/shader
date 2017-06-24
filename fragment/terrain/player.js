var Player = (function(){

    var animationStep = 4;
    animationFps = 30;
    var animationNames = [];
    var animationLength = 0;
    var nowAnimation = '';
    var animationType = 'morph';

    var targetPosition = new THREE.Vector3();

    var callback;

    function Player( _callback ){
        callback = _callback;
        var url = 'assets/player/player4.js';
        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load(url, this.jsonLoadCompHandler.bind(this));
    }


    Player.prototype = {


        jsonLoadCompHandler : function(geometry, materials){

            var url = 'assets/player/diffuse.jpg';
            var playerMap = THREE.ImageUtils.loadTexture(url);
            var playerDiffuseMaterial = new THREE.MeshBasicMaterial({
                map: playerMap,
                morphTargets: true
            });

            var playerOutlineMaterial = new THREE.MeshBasicMaterial({
                color: 0x2d1d5f,
                morphTargets: true
            });

            var playerTransparentMaterial = new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('assets/player/transparent2.png'),
                transparent: true,
                alphaTest: .5,
                side: THREE.DoubleSide,
                morphTargets: true
            });

            var playerMaterials = [playerDiffuseMaterial, playerOutlineMaterial, playerTransparentMaterial];

            this.mesh = this.getAnimationMesh( geometry, playerMaterials);

            animationFps = 40 / animationStep;
            this.setMorphAnimationKey('walk', 0, 10);
            this.setMorphAnimationKey('run', 11, 15);
            this.setMorphAnimationKey('default', 16, 20);
            this.setMorphAnimationKey('caught', 21, 22);
            this.setMorphAnimationKey('defaultCatch', 23, 27);
            this.setMorphAnimationKey('walkCatch', 28, 37);
            this.setMorphAnimationKey('runCatch', 38, 42);
            this.setMorphAnimationKey('throw', 43, 55);
            this.setMorphAnimationKey('jump', 55, 61);
            this.playAnimation('default');

            callback();

        },


        getAnimationMesh : function(geometry, materials) {
            for (var i = 0; i < materials.length; i++)
                materials[i].morphTargets = true;

            var material = new THREE.MeshFaceMaterial(materials);
            var mesh = new THREE.MorphAnimMesh(geometry, material);
            geometry.dispose();

            mesh.parseAnimations();
            mesh.baseDuration = mesh.duration;

            return mesh;
        },


        setMorphAnimationKey : function(name, start, end) {
            if (!this.mesh) {
                alert('mesh is null');
                return;
            }

            animationType = 'morph';

            this.mesh.setAnimationLabel(name, start, end);
            animationNames.push(name);
            animationLength++;
            nowAnimation = name;
        },

        playAnimation : function( name ) {
            if (nowAnimation == name || !this.mesh)
                return;

            nowAnimation = name;

            if (animationType == 'morph') {
                this.mesh.playAnimation(name, animationFps);
            }
        },

        render : function( delta ) {

            var dist = targetPosition.clone().sub( this.mesh.position );
            if( dist.length() > 10 ){
                this.playAnimation( 'run' );
                
                //move
                var direction = dist.normalize();
                this.mesh.position.add( direction.multiplyScalar( 5 ) );

                //rot
                this.mesh.lookAt( this.mesh.position.clone().add( direction ) );
            }else{
                this.playAnimation( 'default' );
            }


            if (nowAnimation != '' && this.mesh) {
                if (animationType == 'morph') {
                    this.mesh.updateAnimation(1000 * delta);//1000 * Vars.delta
                }
            }

        },


        setPosition : function( x, y, z ){

            player.mesh.position.set( x, y, z );
            targetPosition.set( x, y, z );

        },


        click : function(){

            var x = 700 * Math.random() - 350;
            var z = 700 * Math.random() - 350;
            targetPosition.set( x, 0, z );
            
        }
    }


    function getForward(obj) {
        var vector = new THREE.Vector3(0, 0, -1);
        vector.applyEuler(obj.rotation);
        return vector;
    }


    return Player;

})();