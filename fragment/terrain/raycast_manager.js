
        RaycastManager = (function () {

            var scene;
            var camera;

            var intersected;
            var baseColor = 0x333333;
            var intersectColor = 0x00D66B;
            var raycastTargets = [];

            var cursorChangeTargets = [];
            var cursorChangeTargetsLength = 0;



            function RaycastManager( _scene, _camera ) {

                scene = _scene;
                camera = _camera;

                this.raycastType = 'normal';
                this.mouseMeshY = .1;
                this.mouseTopMeshY = 10;
                this.mouseMesh;
                this.mouseTopMesh;
                this.mouseOverTarget;
                this.downTarget;

                var geometry = new THREE.PlaneGeometry(300, 300, 10, 10);
                var material = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, visible: false });
                this.mouseMesh = new THREE.Mesh(geometry, material);
                this.mouseMesh.rotation.x = 270 * SKIZI.utils.toRad;
                this.mouseMesh.name = 'mouseMesh';
                scene.add(this.mouseMesh);
                this.add(this.mouseMesh);

                // Vars.pushMouseDownFunc(mouseDown.bind(this));
                // Vars.pushMouseMoveFunc(mouseMove.bind(this));
                // Vars.pushMouseUpFunc(mouseUp.bind(this));


                setInterval( this.animate.bind( this ), 1000 / MYAPP.fps );
            }


            var p = RaycastManager.prototype;

            p.raycast = function(raycaster) {

                var intersections = raycaster.intersectObjects(raycastTargets, true);

                return intersections;
            }

            p.add = function(object, mouseOverTargetFlag) {
                if (typeof mouseOverTargetFlag === "undefined") { mouseOverTargetFlag = false; }
                
                raycastTargets.push(object);

                if (mouseOverTargetFlag) {
                    cursorChangeTargets.push(object);
                    cursorChangeTargetsLength = cursorChangeTargets.length;
                }
            }

            p.remove = function(object) {
                var name = object.name;

                var index = -1;
                for (var i = 0; i < raycastTargets.length; i++) {
                    if (raycastTargets[i].name == name) index = i;
                }
                if (index != -1) raycastTargets.splice(index, 1);

                index = -1;
                for (i = 0; i < cursorChangeTargetsLength; i++) {
                    if (name == cursorChangeTargets[i].name) index = i;
                }
                if (index != -1) cursorChangeTargets.splice(index, 1);
                cursorChangeTargetsLength = cursorChangeTargets.length;
            }

            p.hitCheck = function(raycaster, dist, type) {
                if (typeof type === "undefined") { type = ''; }
                var obj = {};
                var hitFlag = false;
                var _mouseOverFlag = false;
                var mouseOutFlag = false;
                var oldMouseOverTarget;
                if (this.mouseOverTarget) oldMouseOverTarget = this.mouseOverTarget;

                intersections = this.raycast(raycaster);
            
                var intersectionsLength = intersections.length;
                if (intersectionsLength > 0) {

                    if (intersected != intersections[0].object) {
                        intersected = intersections[0].object;
                    }

                    var distance = intersections[0].distance;
                    if (distance > 0 && distance < dist) {
                        hitFlag = true;
                        obj.intersections = intersections;

                        if (type == 'mouse') {
                            for (var i = 0; i < intersectionsLength; i++) {
                                for (var j = 0; j < cursorChangeTargetsLength; j++) {
                                    if (intersections[i].object.name == cursorChangeTargets[j].name && intersections[i].object.visible) {
                                        if (!_mouseOverFlag)
                                            this.mouseOverTarget = intersections[i].object;
                                        _mouseOverFlag = true;
                                    }
                                }
                            }
                        }
                    }
                } else if (intersected) {
                    intersected = null;
                }

                if (type == 'mouse') {
                    if (_mouseOverFlag) {
                        document.body.style.cursor = 'pointer';
                        //this.mouseOverTarget.parent.mouseOver();
                    } else {
                        this.mouseOverTarget = null;
                    }

                    if (this.mouseOverTarget != oldMouseOverTarget) {
                        document.body.style.cursor = 'auto';
                        //if (oldMouseOverTarget)
                            //oldMouseOverTarget.parent.mouseOut();
                    }
                }

                obj.hitFlag = hitFlag;

                return obj;
            }


            p.getFirstPointByName = function(intersections, name) {
                var length = intersections.length;
                var point;
                for (var i = 0; i < length; i++) {
                    if (intersections[i].object.name == name && !point) {
                        point = new THREE.Vector3().copy(intersections[i].point);
                    }
                }

                return point;
            }


            p.getFirstObjectByName = function(intersections, name) {
                var length = intersections.length;
                var object;
                for (var i = 0; i < length; i++) {
                    if (intersections[i].object.name == name && !object) {
                        object = intersections[i];
                    }
                }

                return object;
            }

            // var downFlag = false;
            // function mouseDown() {
            //     if (this.mouseOverTarget) {
            //         this.mouseOverTarget.parent.mouseClick();

            //         downFlag = true;
            //         var downX = Vars.mouseX;
            //         var downY = Vars.mouseY;

            //         setTimeout(function () {
            //             if (!Vars.downFlag || downX != Vars.mouseX || downY != Vars.mouseY || !this.mouseOverTarget)
            //                 return;
            //             this.downTarget = this.mouseOverTarget;
            //             this.downTarget.parent.mouseDown();
            //         }.bind(this), 100);
            //     }
            // }

            // function mouseMove() {
            //     if (this.mouseOverTarget) {
            //         this.mouseOverTarget.parent.mouseMove();
            //     }
            // }

            // function mouseUp() {
            //     if (downFlag) {
            //         if (this.downTarget) {
            //             this.downTarget.parent.mouseUp();
            //             this.downTarget = null;
            //         } else {
            //             if (Vars.mouseDragDistX == 0 && Vars.mouseDragDistY == 0 && this.mouseOverTarget) {
            //             }
            //         }
            //     }

            //     downFlag = false;
            // }

            p.animate = function() {
                /*
                requestAnimationFrame(function () {
                    return this.animate();
                }.bind( this ));
                */
                if (camera) {
                    this.mouseMesh.position.copy( camera.position);
                    this.mouseMesh.position.y = this.mouseMeshY;
                }

                // if (this.downTarget) {
                //     this.downTarget.parent.drag();
                // }
            }

            return RaycastManager;

        })();