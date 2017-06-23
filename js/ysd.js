var YSD = { REVISION:0 };
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

YSD.SpriteAnimator = (function(){
	
	function SpriteAnimator( element, spriteUrl, json, fps ){

		this.element = $( element );
		this.spriteUrl = spriteUrl;
		this.json = json;
		this.frames = this.json.frames;

		this.stopFlag = true;
		this.spriteFrame = 0;
		this.animations = {};
		this.nowAnimationName = '';
		setInterval( this.animate.bind( this ), 1000 / fps );

		var dummyElement = $('<div>');
		dummyElement.css({backgroundImage:this.spriteUrl});
	}

	
	SpriteAnimator.prototype = {

		show:function(){

			this.element.show();

		},


		hide: function(){

			this.element.hide();

		},


		animate:function(){

			if( this.stopFlag ){
				return;
			}else{
				var animation = this.animations[ this.nowAnimationName ];
			}

			var obj = this.frames[ this.spriteFrame ];
			if( this.spriteFrame > animation.end ){
				this.spriteFrame = animation.start;
				if( !animation.loopFlag ){
					this.stopFlag = true;
					if( !animation.forwardFlag ){
						this.element.css({backgroundImage:'none'});
					}
					return;
				}
			}
			this.spriteFrame++;

			var x = -obj.frame.x;
			var y = -obj.frame.y;

			this.element.css({
				backgroundPosition:x + 'px ' + y + 'px'
			});

		},


		start:function( name ){

			if( name ) this.nowAnimationName = name;
			var animation = this.animations[ this.nowAnimationName ];
			this.stopFlag = false;
			this.spriteFrame = animation.start;
			this.element.css({backgroundImage:'url("' + this.spriteUrl + '")'});

		},


		stop:function(){

			this.stopFlag = true;
			this.element.css({backgroundImage:'none'});
					
		},


		pause:function(){

			this.stopFlag = true;
					
		},


		refresh:function(){

			this.stopFlag = false;
			this.spriteFrame = 0;

		},


		setAnimation:function( name, start, end, loopFlag, forwardFlag ){

			this.animations[ name ] = {
				start:start,
				end:end,
				loopFlag:loopFlag,
				forwardFlag:forwardFlag
			};

		}

	}

	return SpriteAnimator;

})();
YSD.KeyManager = (function(){


	
	function KeyManager(){

		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.shift = false;
		this.alt = false;


        window.onkeydown = this.keyDown.bind(this);
        window.onkeyup = this.keyUp.bind(this);

	}


	var p = KeyManager.prototype;
    p.keyDown = function (e) {
        e.preventDefault();

        if (e.keyCode === 37 || e.keyCode === 65) {
            this.x = -1;
        }
        if (e.keyCode === 38 || e.keyCode === 87) {
            this.z = 1;
        }

        if (e.keyCode === 39 || e.keyCode === 68) {
            this.x = 1;
        }

        if (e.keyCode === 40 || e.keyCode === 83) {
            this.z = -1;
        }

        if (e.keyCode === 32) {
            this.y = 1;
        }

        if (e.keyCode === 16) {
            this.shift = true;
        }

        if (e.keyCode === 18) {
            this.alt = true;
        }

        if (e.keyCode === 13) {
            Vars.enterDown();
        }
    };

    p.keyUp = function (e) {
        e.preventDefault();

        if (e.keyCode === 37 || e.keyCode === 65) {
            this.x = 0;
        }
        if (e.keyCode === 38 || e.keyCode === 87) {
            this.z = 0;
        }

        if (e.keyCode === 39 || e.keyCode === 68) {
            this.x = 0;
        }

        if (e.keyCode === 40 || e.keyCode === 83) {
            this.z = 0;
        }

        if (e.keyCode === 32) {
            this.y = 0;
        }

        if (e.keyCode === 16) {
            this.shift = false;
        }

        if (e.keyCode === 18) {
            this.alt = false;
        }
    };


	return KeyManager;

})();
YSD.MouseWheelManager = (function(){
	
	var funcs = [];
	var funcLength = 0;


	function MouseWheelManager(){

		this.delta = 0;

		var mousewheelevent = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
		 $(document).on( mousewheelevent, this.wheelHandler.bind( this ) );

	}


	MouseWheelManager.prototype = {

		wheelHandler : function(e){

	        this.delta = e.originalEvent.deltaY || e.originalEvent.wheelDelta;

			for( var i = 0; i < funcLength; i++ ) funcs[ i ]( e );

	    },


	    setWheelFunc : function( func ){

	    	funcs.push( func );
	    	funcLength = funcs.length;

	    }

	}

	return MouseWheelManager;

})();
			

YSD.touch = {
	x:0,
	y:0,
	oldX:0,
	oldY:0,
	dragDistX:0,
	dragDistY:0,
	offsetX:0, 
	offsetY:0,
	totalOffsetX:0,
	totalOffsetY:0,
	downFlag:false
};


YSD.TouchManager = (function(){

	var touchStartFuncs = [];
	var touchStartFuncLength = 0;
	var touchMoveFuncs = [];
	var touchMoveFuncLength = 0;
	var touchEndFuncs = [];
	var touchEndFuncLength = 0;
	var touch;
	var preventDefaultCheckFuncs = [];
	var preventDefaultCheckFuncLength = 0;



	function TouchManager(){
	 
		touch = YSD.touch;
		this.ua = new YSD.UserAgent();

		this.movePreventDefaultFlag = false;
		this.movePreventDefaultNoneFlag = false;

		if( this.ua.platform == 'pc' ){
			$( document ).off( 'mousedown' );
			$( document ).off( 'mousemove' );
			$( document ).off( 'mouseup' );
		    $( document ).on( 'mousedown', this.touchStartHandler.bind( this ) );
		    $( document ).on( 'mousemove', this.touchMoveHandler.bind( this ) );
		    $( document ).on( 'mouseup', this.touchEndHandler.bind( this ) );
		}else{
			document.removeEventListener( 'touchstart', this.touchStartHandler );
			document.removeEventListener( 'touchmove', this.touchMoveHandler );
			document.removeEventListener( 'touchend', this.touchEndHandler );
		    document.addEventListener('touchstart', this.touchStartHandler.bind( this ), false);
		    document.addEventListener('touchmove', this.touchMoveHandler.bind( this ), false);
		    document.addEventListener('touchend', this.touchEndHandler.bind( this ), false);
		}
	}


	TouchManager.prototype = {

		//------------------------タッチイベント------------------------
		touchStartHandler : function(e){
			
			touch.downFlag = true;

			if( this.ua.platform == 'pc' ){
				touch.x = e.clientX;
				touch.y = e.clientY;
			}else{
				if (e.touches.length) {
					touch.x = e.touches[0].pageX;
					touch.y = e.touches[0].pageY;
				}
			}

			for( var i = 0; i < touchStartFuncLength; i++ ) touchStartFuncs[ i ]( e );
		},


		touchMoveHandler : function(e){

			//if( nowPage == 'top' && touch.y > 680 ) return;
			
			touch.oldX = touch.x;
			touch.oldY = touch.y;
			if( this.ua.platform == 'pc' ){
				touch.x = e.clientX;
				touch.y = e.clientY;
			}else{
				if (e.touches.length) {
					touch.x = e.touches[0].pageX;
					touch.y = e.touches[0].pageY;
				}
			}

			if( touch.downFlag ){
				touch.offsetX = touch.x - touch.oldX;
				touch.offsetY = touch.y - touch.oldY;
				touch.totalOffsetX += touch.offsetX;
				touch.totalOffsetY += touch.offsetY;
		        touch.dragDistX = Math.abs(touch.offsetX);
		        touch.dragDistY = Math.abs(touch.offsetY);
		    }
		    
			for( var i = 0; i < touchMoveFuncLength; i++ ) touchMoveFuncs[ i ]( e );
	     	
			//AndroidでtouchEndを発火させる為の対策
        	if( e.touches && e.touches.length < 2 ){
        		if( this.preventDefaultCheck( e ) ) e.preventDefault();
    		}
	    	
		},


		preventDefaultCheck : function( e ){

            var preventDefaultFlag = false;
            if( touch.dragDistY < touch.dragDistX &&
                this.ua.platform != 'pc' ) preventDefaultFlag = true;
            if( this.movePreventDefaultFlag ) preventDefaultFlag = true;

        	for( var i = 0; i < preventDefaultCheckFuncLength; i++ ){
        		if( preventDefaultCheckFuncs[ i ]( e ) ) preventDefaultFlag = true;
        	}
        	if( this.movePreventDefaultNoneFlag )preventDefaultFlag = false;

            if( preventDefaultFlag ) e.preventDefault();

		},


		setPreventDefaultCheckFunc : function( func ){

			preventDefaultCheckFuncs.push( func );
			preventDefaultCheckFuncLength = preventDefaultCheckFuncs.length;

		},


		touchEndHandler : function(e){
			
			touch.downFlag = false;
			touch.offsetX = 0;
			touch.offsetY = 0;
			touch.totalOffsetX = 0;
			touch.totalOffsetY = 0;
	        touch.dragDistX = 0;
	        touch.dragDistY = 0;

			for( var i = 0; i < touchEndFuncLength; i++ ) touchEndFuncs[ i ]( e );
		},


		//------------------------グローバル関数------------------------
		setTouchStartFunc : function( func ){

			touchStartFuncs.push( func );
			touchStartFuncLength = touchStartFuncs.length;

		},

		setTouchMoveFunc : function( func ){

			touchMoveFuncs.push( func );
			touchMoveFuncLength = touchMoveFuncs.length;

		},

		setTouchEndFunc : function( func ){

			touchEndFuncs.push( func );
			touchEndFuncLength = touchEndFuncs.length;

		}

	}

	return TouchManager;

})();



YSD.DomView = (function(){

	function DomView(){
		
		var container = $('<div>');
		container.css({
			position:'absolute',
			top:'0px',
			left:'0px'
		});
		$(document.body).append( container );

		$( '*' ).each(function(){

			var target = $(this);
			var offset = target.offset();
			var color = Math.floor(Math.random() * 0xFFFFFF).toString(16);

			//add border
			var border = $('<div>');
			border.css({
				width:target.width() + 'px',
				height:target.height() + 'px',
				boxSizing:'border-box',
				border:'1px solid #' + color,
				position:'absolute',
				//left:'0px',
				//top:'0px',
				left:offset.left,
				top:offset.top
			});
			container.append( border );


			//add tooltip
			var tooltip = $('<div>');
			var id = target.attr( 'id' );
			if( !id ) id = '';
			var className = target.attr( 'class' );
			if( !className ) className = '無';

			var html = 'id:' + id + ', class:' + className;
			tooltip.html( html );

			tooltip.css({
				position:'absolute',
				left:'0px',
				top:'0px',
				fontSize:'20px',
				//left:offset.left,
				//top:offset.top,
				backgroundColor:'#' + color
			});
			border.append( tooltip );

		});


	}


	DomView.prototype = {



	}

	return DomView;

})();
YSD.CanvasAnimater0 = (function(){
	
	function CanvasAnimater0( canvas, img, length, strength, fps ){

		this.playFlag = false;
		this.loopFlag = false;
		this.reverseFlag = false;
		this.imgLoadCompFlag = false;

		this.element = $( canvas );
		this.img = img;

		this.length = length;
		if( !this.length ) this.length = 10;
		this.strength = strength;
		if( !this.strength ) this.strength = 10;
		this.fps = fps;
		if( !fps ) this.fps = 20;

		this.time = new YSD.Time();
		this.countTime = 0;
		this.oneFrameTime = 1000 / this.fps;

		this.index = 0;

		if( img.complete ){
			this.imgLoadComp();
		}else{
			img.onload = this.imgLoadComp.bind( this );
		}

		setInterval( this.animate.bind( this ), 1000 / 30 );
	}


	CanvasAnimater0.prototype = {

		imgLoadComp :function(){

			this.imgLoadCompFlag = true;

			//generate mosaic data
			var canvasMosaic = new YSD.CanvasMosaic( this.element[0], this.img );
			var strength = 0;
			this.imgDatas = [];
			for( var i = 0; i < this.length; i++ ){
				this.imgDatas[i] = canvasMosaic.getMosaicData( strength );
				strength += this.strength;
			}


			this.ctx = this.element[0].getContext('2d');

			this.element.triggerHandler( 'callback', { type:'imgLoadcomp' } );
		},


		play : function(){

			this.playFlag = true;
			if( this.reverseFlag ){
				this.index = this.length - 1;
			}else{
				this.index = 0;
			}

		},


		stop : function(){

			this.playFlag = false;

		},


		reverse : function( flag ){

			if( flag != false && !flag ) flag = true;
			this.reverseFlag = flag;

			if( flag ){
				this.index = this.length - 1;
			}else{
				this.index = 0;
			}

		},


		setFps : function( fps ){

			this.fps = fps;	
			this.oneFrameTime = 1000 / this.fps;

		},


		animate : function(){

			var delta = this.time.getDelta();
			this.countTime += delta;
			if( this.countTime < this.oneFrameTime ) return;
			this.countTime = 0;

			if( !this.imgLoadCompFlag ) return;

			if( this.playFlag ){
		    	this.ctx.putImageData( this.imgDatas[this.index], 0, 0 );

		    	if( this.reverseFlag ){
					this.index--;
					if( this.index < 0 ){
						this.index = this.length - 1;
						this.comp();
					}
		    	}else{
					this.index++;
					if( this.index > this.length - 1 ){
						this.index = 0;
						this.comp();
					}
				}
			}

		},


		comp : function(){
			
			if( !this.loopFlag ){
				this.playFlag = false;
				this.element.triggerHandler( 'callback', { type:'comp', reverse:this.reverseFlag } );
			}

		}

	}

	return CanvasAnimater0;

})();
YSD.CanvasMosaic = (function(){
	
	function CanvasMosaic( element, img ){

		this.element = $( element );
		this.ctx = this.element[0].getContext('2d');
		this.img = img;

	}


	CanvasMosaic.prototype = {

		mosaic : function( strength ){

			var dotSize = parseInt( strength, 10);

			var imgData;
			if( strength == 0 ){
				imgData = this.getDefaultData();
			}else{
				imgData = this.generateMosaic0( dotSize );
			}
		    // 生成したモノクロ画像データを適用
		    this.ctx.putImageData(imgData, 0, 0);

		},


		getMosaicData : function( strength ){

			var dotSize = parseInt( strength, 10);

			var imgData;
			if( strength == 0 ){
				imgData = this.getDefaultData();
			}else{
				imgData = this.generateMosaic0( dotSize );
			}

		    return imgData;
		},


		getDefaultData : function(){

			var w = this.element.width();
			var h = this.element.height();
			this.ctx.drawImage( this.img, 0, 0, w, h );
			var imgData = this.ctx.getImageData( 0, 0, w, h );

			return imgData;
		},


		generateMosaic0 : function( dotSize ){

			var w = this.element.width();
			var h = this.element.height();
			this.ctx.drawImage( this.img, 0, 0, w, h );
			var imgData = this.ctx.getImageData( 0, 0, w, h );

			var imgDataW = imgData.width;
			var imgDataH = imgData.height;

			var halfDotSize = dotSize * .5;

			for ( var x = 0; x < imgDataW; x+=dotSize ) {

				for ( var y = 0; y < imgDataH; y+=dotSize ) {
					var i = ((y * 4) * imgDataW) + (x * 4);

	                for( var mx = x; mx < x + dotSize; mx++ ){
	                	var mx0 = mx;
	                	if( mx < 0 ) mx0 = 0;
	                	if( mx > imgDataW ) mx0 = imgDataW;

			            for( var my = y; my < y + dotSize; my++ ){
			            	var my0 = my;
			            	if( my > imgDataH ) my0 = imgDataH; 

		                    var m_i = ((my0 * 4) * imgDataW) + (mx0 * 4);
		                    imgData.data[m_i] = imgData.data[i];
		                    imgData.data[m_i + 1] = imgData.data[i + 1];
		                    imgData.data[m_i + 2] = imgData.data[i + 2];
		                    imgData.data[m_i + 3] = imgData.data[i + 3];
		                }
		            }

				}
			}

			return imgData;

		},


		generateMosaic1 : function( dotSize ){

			var w = this.element.width();
			var h = this.element.height();
			this.ctx.drawImage( this.img, 0, 0, w, h );
			var imgData = this.ctx.getImageData( 0, 0, w, h );

			var imgDataW = imgData.width;
			var imgDataH = imgData.height;

			var halfDotSize = dotSize * .5;

			var maxX = Math.floor( w / dotSize ) * dotSize;
			var maxY = Math.floor( h / dotSize ) * dotSize;
			
			this.ctx.save();
			for ( var x = 0; x < w; x+=dotSize ) {

				for ( var y = 0; y < h; y+=dotSize ) {
					var i = ((y * 4) * imgDataW) + (x * 4);

		            this.ctx.fillStyle = 'rgb(' + imgData.data[i] + ',' + imgData.data[i+1] + ',' + imgData.data[i+2] + ')';
					
					this.ctx.fillRect(x, y, dotSize, dotSize);
					
				}
			}
			this.ctx.restore();

			imgData = this.ctx.getImageData( 0, 0, w, h );


			return imgData;

		}

	}

	return CanvasMosaic;

})();
YSD.CanvasMosaicAnimater0 = (function( _super ){
	
    __extends(CanvasMosaicAnimater0, _super);

	function CanvasMosaicAnimater0( canvas, img, length, strength, fps ){

        _super.call( this, canvas, img, length, strength, fps );

	}


	var p = CanvasMosaicAnimater0.prototype;
	
	p.imgLoadComp = function(){

		this.imgLoadCompFlag = true;

		//generate mosaic data
		var canvasMosaic = new YSD.CanvasMosaic( this.element[0], this.img );
		var strength = 0;
		this.imgDatas = [];
		for( var i = 0; i < this.length; i++ ){
			this.imgDatas[i] = canvasMosaic.getMosaicData( strength );
			strength += this.strength;
		}


		this.ctx = this.element[0].getContext('2d');

		this.element.triggerHandler( 'callback', { type:'imgLoadcomp' } );
	};

	return CanvasMosaicAnimater0;

})( YSD.CanvasAnimater0 );
YSD.CanvasPixelIndex0 = (function(){
	
	function CanvasPixelIndex0( img, defaultColor ){

        var canvas = $( '<canvas>' );
        canvas.attr({ width:64, height:64 });
        canvas.hide();
        $( document.body ).append( canvas );
        
		this.element = $( canvas );
		this.ctx = this.element[0].getContext('2d');
		this.img = img;
		this.defaultColor = defaultColor;

		if( img.complete ){
			this.imgLoadComp();
		}else{
			img.onload = this.imgLoadComp.bind( this );
		}
	}


	CanvasPixelIndex0.prototype = {

		imgLoadComp : function(){

			// var imgData = this.generateIndex0();
		 	//this.ctx.putImageData( imgData, 0, 0 );

			var colors = this.generateIndex0();
			setTimeout(function(){
				this.element.triggerHandler( 'callback', { colors:colors } );
			}.bind( this ), 100 );

		},


		generateIndex0 : function(){

			var w = this.element.width();
			var h = this.element.height();
			this.ctx.drawImage( this.img, 0, 0, w, h );
			var imgData = this.ctx.getImageData( 0, 0, w, h );

			var imgDataW = imgData.width;
			var imgDataH = imgData.height;

			var pixelIndex = 0;
			var colors = [];
			for ( var x = 0; x < imgDataW; x++ ) {
				for ( var y = 0; y < imgDataH; y++ ) {

					var i = ((y * 4) * imgDataW) + (x * 4);

					var r = imgData.data[i];
					var g = imgData.data[i+1];
					var b = imgData.data[i+2];
					if( Math.abs( r - this.defaultColor ) < 10 &&
						Math.abs( g - this.defaultColor ) < 10 &&
						Math.abs( b - this.defaultColor ) < 10 ){

	                    // imgData.data[i] = 0;
	                    // imgData.data[i + 1] = 0;
	                    // imgData.data[i + 2] = this.defaultColor;
	                    // imgData.data[i + 3] = this.defaultColor;
	                
	                }else{
						colors[ pixelIndex ] = {
							x:x,
							y:y,
							z:( r+g+b )/3/255
						};
						

	                    // imgData.data[i + 1] = imgData.data[i + 1];
	                    // imgData.data[i + 2] = imgData.data[i + 2];
	                    // imgData.data[i + 3] = imgData.data[i + 3];
	                    pixelIndex++;

	                }
             
				}
			}

			//return imgData;
			return colors;

		}

	};
	
	return CanvasPixelIndex0;

})();
YSD.CanvasRgbShift = (function(){
	
	function CanvasRgbShift( element, img ){

		this.element = $( element );
		this.ctx = this.element[0].getContext('2d');
		this.img = img;

	}


	CanvasRgbShift.prototype = {

		rgbShift : function( shiftType, shiftX, shiftY ){

			shiftX *= -1;
			shiftY *= -1;

			var imgData;
			if( shiftX == 0 && shiftY == 0 ){
				imgData = this.getDefaultData();
			}else{
				imgData = this.generateRgbShift0( shiftType, shiftX, shiftY );
			}
		    // 生成したモノクロ画像データを適用
		    this.ctx.putImageData(imgData, 0, 0);

		},


		getRgbShiftData : function( shiftType, shiftX, shiftY ){

			var imgData;
			if( shiftX == 0 && shiftY == 0 ){
				imgData = this.getDefaultData();
			}else{
				if( shiftType == 'all' ){

					var imgDatas = [];
					for( var i = 0; i < 3; i++ ){
						shiftX[i] *= -1;
						shiftY[i] *= -1;
						if( shiftX[i] == 0 ) shiftX[i] = 1;
						var type = 'r';
						if( i == 1 ) type = 'g';
						if( i == 2 ) type = 'b';
						imgDatas[i] = this.generateRgbShift0( type, shiftX[i], shiftY[i] );
					}

					var w = this.element.width();
					var h = this.element.height();
					imgData = this.ctx.getImageData( 0, 0, w, h );
					var imgDataW = imgData.width;
					var imgDataH = imgData.height;
					for ( var x = 0; x < imgDataW; x++ ) {
						for ( var y = 0; y < imgDataH; y++ ) {
							var i = ((y * 4) * imgDataW) + (x * 4);
		                    imgData.data[i] = imgDatas[0].data[i];
		                    imgData.data[i + 1] = imgDatas[1].data[i + 1];
		                    imgData.data[i + 2] = imgDatas[2].data[i + 2];
						}
					}

				}else{
					shiftX *= -1;
					shiftY *= -1;
					if( shiftX == 0 ) shiftX = 1;
					imgData = this.generateRgbShift0( shiftType, shiftX, shiftY );
				}
			}

		    return imgData;
		},


		getDefaultData : function(){

			var w = this.element.width();
			var h = this.element.height();
			this.ctx.drawImage( this.img, 0, 0, w, h );
			var imgData = this.ctx.getImageData( 0, 0, w, h );

			return imgData;
		},


		generateRgbShift0 : function( shiftType, shiftX, shiftY ){

			var w = this.element.width();
			var h = this.element.height();
			this.ctx.drawImage( this.img, 0, 0, w, h );
			var imgData = this.ctx.getImageData( 0, 0, w, h );

			var imgDataW = imgData.width;
			var imgDataH = imgData.height;

			if( shiftX < 0 ){

				for ( var x = imgDataW - 1; x > -1; x-- ) {
					var x2 = x + shiftX;
					imgData = this.getYImgData( imgData, x, x2, imgDataW, imgDataH, shiftType, shiftY );
				}

			}else{
				for ( var x = 0; x < imgDataW; x++ ) {
					var x2 = x + shiftX;
					imgData = this.getYImgData( imgData, x, x2, imgDataW, imgDataH, shiftType, shiftY );
				}
			}

			return imgData;

		},


		getYImgData : function( imgData, x, x2, imgDataW, imgDataH, shiftType, shiftY ){

			for ( var y = 0; y < imgDataH; y++ ) {
				var i = ((y * 4) * imgDataW) + (x * 4);

				var y2 = y + shiftY;
                var s_i = ((y2 * 4) * imgDataW) + (x2 * 4);
                if( shiftType == 'r' ){
                    imgData.data[i] = imgData.data[s_i];
                    imgData.data[i + 1] = imgData.data[i + 1];
                    imgData.data[i + 2] = imgData.data[i + 2];
                }else if( shiftType == 'g' ){
                    imgData.data[i] = imgData.data[i];
                    imgData.data[i + 1] = imgData.data[s_i + 1];
                    imgData.data[i + 2] = imgData.data[i + 2];
                }else if( shiftType == 'b' ){
            	    imgData.data[i] = imgData.data[i];
                    imgData.data[i + 1] = imgData.data[i + 1];
                    imgData.data[i + 2] = imgData.data[s_i + 2];
                }
                imgData.data[i + 3] = imgData.data[i + 3];
          
			}

			return imgData;

		}

	}

	return CanvasRgbShift;

})();
YSD.CanvasRgbShiftAnimater0 = (function( _super ){
	
    __extends(CanvasRgbShiftAnimater0, _super);

	function CanvasRgbShiftAnimater0( canvas, img, length, strength, fps ){

        _super.call( this, canvas, img, length, strength, fps );

	}


	var p = CanvasRgbShiftAnimater0.prototype;
	
	p.imgLoadComp = function(){

		this.imgLoadCompFlag = true;

		//generate rgbShift data
		var canvasRgbShift = new YSD.CanvasRgbShift( this.element[0], this.img );

		this.imgDatas = [];

		var strength = this.strength;
		var shiftX = [];
		var shiftY = [];
		this.imgDatas[0] = canvasRgbShift.getRgbShiftData( 'all', 0, 0 );
		for( var i = 1; i < this.length - 1; i++ ){
			strength = strength * 2;
			var halfStrength = strength * .5;
			shiftX[0] = Math.round( strength * Math.random() - halfStrength );
			shiftX[1] = Math.round( strength * Math.random() - halfStrength );
			shiftX[2] = Math.round( strength * Math.random() - halfStrength );
			shiftY[0] = Math.round( strength * Math.random() - halfStrength );
			shiftY[1] = Math.round( strength * Math.random() - halfStrength );
			shiftY[2] = Math.round( strength * Math.random() - halfStrength );

			this.imgDatas[i] = canvasRgbShift.getRgbShiftData( 'all', shiftX, shiftY );
		}
		this.imgDatas[this.length-1] = canvasRgbShift.getRgbShiftData( 'all', 0, 0 );


		this.ctx = this.element[0].getContext('2d');

		this.element.triggerHandler( 'callback', { type:'imgLoadcomp' } );
	
	};

	return CanvasRgbShiftAnimater0;

})( YSD.CanvasAnimater0 );



/****************************************************************/
//HistoryManagerクラス
/****************************************************************/
YSD.HistoryManager = (function(){


	function Manager( callback ){
	
		this.callback = callback;
		$(window).on('popstate', this.popstate.bind( this ) );

	}


	Manager.prototype = {

	    push : function( name, directory ){
	    
	    	var obj = {top:0, product:1, detail:2};
	        history.pushState( name, '', directory );
	    
	    },

	    popstate : function(e){
	    
	    	var state = e.originalEvent.state;
			this.callback( 'pageChange', state );
	    
	    }

	}

	return Manager;

})();



//まだiphoneのsafariに対応していない
YSD.CameraManager = (function(){
	
	var localMediaStream = null;
	this.video;
	this.canvas;
	var ctx;


	function CameraManager(){

		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
 		window.URL = window.URL || window.webkitURL;

		this.video = $('<video>');
		this.canvas = $('<canvas>');
		ctx = this.canvas[0].getContext('2d');

		if (this.hasGetUserMedia()) {
			console.log("カメラ OK");
		} else {
			alert("未対応ブラウザです。");
		}

		navigator.getUserMedia({video: true}, function(stream) {
		  if( this.video ) this.video.src = window.URL.createObjectURL(stream);
		  localMediaStream = stream;
		}, this.onFailSoHard);

	}


	CameraManager.prototype = {
	 
		hasGetUserMedia : function() {
			return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia || navigator.msGetUserMedia);
		},


		onFailSoHard : function( e ) {
			console.log('エラー!', e);
		},


		//----------------------------------グローバル関数-----------------------------------
		snapshot : function() {
			if (localMediaStream) {
				ctx.drawImage( this.video, 0, 0);
				return this.canvas.toDataURL('image/webp');
			}
		}


	}

	return CameraManager;

})();

YSD.VideoManager = (function(){

	var ua;
	
	var expr = '';
	var containers;
	var length = 0;
	var swfPlayerUrl = '';
	var expressinstallUrl = '';
	var skinUrl = '';

	function VideoManager( _expr, _swfPlayerUrl, _expressinstallUrl, _skinUrl ){

		expr = _expr;
		swfPlayerUrl = _swfPlayerUrl;
		expressinstallUrl = _expressinstallUrl;
		skinUrl = _skinUrl;

		ua = new YSD.UserAgent();
		
		if( ua.browser == 'ie' && ua.ieVer < 9 ){
		//if( true ){
			this.init();
		}else{
			var videos = $( expr );
			var length = videos.length;
			for( var i = 0; i < length; i++ ){
				$( videos[i] ).on( 'mousedown', function(){
					var _index = arguments[0];
					if( videos[_index].playFlag ){
						videos[_index].playFlag = false;
						$( videos[_index] )[0].pause();
					}else{
						videos[_index].playFlag = true;
						$( videos[_index] )[0].play();
					}
				}.bind( this, i ) );
			}
		}

	}

	var p = VideoManager.prototype;
	p.init = function(){

		var videos = $( expr );
		length = videos.length;
		var objs = [];
		for( var i = 0; i < length; i++ ){
			var container = $( videos[i] );
			objs[i] = {};
			objs[i].src = container.attr('src');
			objs[i].poster = container.attr('poster');
			objs[i].class0 = container.attr('class');
			objs[i].width = $( videos[i] ).attr('width');
			if( !objs[i].width ) objs[i].width = 600;
			objs[i].height = $( videos[i] ).attr('height');
			if( !objs[i].height ) objs[i].height = 300;
			videos[i] = $( videos[i] ).replaceWith('<div class="video-div"></div>');
		}

		containers = $('.video-div');
		for( var i = 0; i < length; i++ ){
			$( containers[i] ).attr({ src:objs[i].src, poster:objs[i].poster });
			$( containers[i] ).addClass( objs[i].class0 );
			$( containers[i] ).css({
				width:objs[i].width + 'px',
				height:objs[i].height + 'px'
			});
		}

		this.setFlashVideo();

	}

	p.setFlashVideo = function(){

		for( var i = 0; i < length; i++ ){

			if( !containers[ i ].addFlag ){

				var id = 'flash-video' + i;
				var class0 =  $( containers[i] ).attr( 'class' );
				containers[ i ].addFlag = true;
				$( containers[i] ).append('<div id="' + id + '"></div>');
				var src = $( containers[i] ).attr( 'src' );

				var vars = {
					file:src,
					skin:skinUrl
					//thumb:'',
				};
				swfobject.embedSWF(
						swfPlayerUrl,
						id,
						"100%", "100%",
						"11",
						expressinstallUrl,
						vars,
						{wmode:"transparent"}
					);

				//this.addPoster( 'flash', containers[i], id  );
			}

		}

	}


	p.addPoster = function( type, container, video ){

		var src = $( container ).attr( 'poster' );
		if( !src ) return;

		var poster = $( '<img>' );
		poster.attr({
			src:src
		});
		poster.addClass('poster');
		if( type == 'html5' ){
			video.attr( 'poster', src );
		}else{
			$( container ).css({height:'369px'});
			poster.css({top:'0px'});
		}
		poster.on('click', this.posterClickHandler.bind( this, type, video, poster ));
		$( container ).append( poster );

	}

	p.posterClickHandler = function(){

		var type = arguments[0];

		var video = arguments[1];
		if( type == 'html5' ){
			video[0].play();
		}else{	//flash
			var id = video;
			var swfObj = document.all? window[ id ] : document[ id ];
			swfObj.playFromJs();	
		}

		var poster = arguments[2];
		poster.hide();

	}


	return VideoManager;

})();
YSD.VideoManager2 = (function(){

	var ua;
	
	var expr = '';
	var containers;
	var length = 0;
	var swfPlayerUrl = '';
	var expressinstallUrl = '';
	var skinUrl = '';
	var playImgUrl = '';

	function VideoManager2( _expr, _swfPlayerUrl, _expressinstallUrl, _skinUrl, _playImgUrl ){

		expr = _expr;
		swfPlayerUrl = _swfPlayerUrl;
		expressinstallUrl = _expressinstallUrl;
		skinUrl = _skinUrl;
		playImgUrl = _playImgUrl;

		ua = new YSD.UserAgent();
		this.init();

	}

	var p = VideoManager2.prototype;
	p.init = function(){

		containers = $( expr );
		length = containers.length;

		if( ua.browser == 'ie' && ua.ieVer < 9 ){
		//if( true ){
			this.setFlashVideo();
		}else{
			this.setHtml5Video();
		}

	}


	p.setHtml5Video = function(){

		for( var i = 0; i < length; i++ ){

			if( !containers[ i ].addFlag ){

				var src = $( containers[i] ).attr( 'src' );
				var video = $('<video>');
				video.attr({
					controls: true,
					src:src,
					width:'100%'
				});
				containers[ i ].addFlag = true;
				$( containers[i] ).append( video );

				this.addPoster( 'html5', containers[i], video );
			}
			
		}

	}


	p.setFlashVideo = function(){

		for( var i = 0; i < length; i++ ){

			if( !containers[ i ].addFlag ){

				var id = 'flash-video' + i;
				containers[ i ].addFlag = true;
				$( containers[i] ).append('<div id="' + id + '"></div>');
				var src = $( containers[i] ).attr( 'src' );

				var vars = {
					file:src,
					skin:skinUrl
					//thumb:'',
				};
				swfobject.embedSWF(
						swfPlayerUrl,
						id,
						"100%", "100%",
						"11",
						expressinstallUrl,
						vars,
						{wmode:"transparent"}
					);

				this.addPoster( 'flash', containers[i], id  );

			}

		}

	}


	p.addPoster = function( type, container, video ){

		var src = $( container ).attr( 'poster' );
		if( !src ) return;

		var poster = $( '<img>' );
		poster.attr({
			src:src
		});
		poster.addClass('poster');
		if( type != 'html5' ){
			$( container ).css({height:'369px'});
			poster.css({top:'0px'});
		}
		poster.on('click', this.posterClickHandler.bind( this, type, video, poster ));
		$( container ).append( poster );

	}

	p.posterClickHandler = function(){

		var type = arguments[0];

		var video = arguments[1];
		if( type == 'html5' ){
			video[0].play();
		}else{	//flash
			var id = video;
			var swfObj = document.all? window[ id ] : document[ id ];
			swfObj.playFromJs();	
		}

		var poster = arguments[2];
		poster.hide();

	}


	return VideoManager2;

})();
YSD.VideoManager3 = (function(){

	var ua;
	
	var expr = '';
	var containers;
	var length = 0;
	var swfPlayerUrl = '';
	var expressinstallUrl = '';
	var skinUrl = '';

	function VideoManager3( _expr, _swfPlayerUrl, _expressinstallUrl, _skinUrl ){

		expr = _expr;
		swfPlayerUrl = _swfPlayerUrl;
		expressinstallUrl = _expressinstallUrl;
		skinUrl = _skinUrl;

		ua = new YSD.UserAgent();
		this.init();

	}

	var p = VideoManager3.prototype;
	p.init = function(){

		containers = $( expr );
		length = containers.length;

		if( ua.browser == 'ie' && ua.ieVer < 9 ){
		//if( true ){
			this.setFlashVideo();
		}else{
			this.setHtml5Video();
		}

	}


	p.setHtml5Video = function(){

		for( var i = 0; i < length; i++ ){

			if( !containers[ i ].addFlag ){

				var src = $( containers[i] ).attr( 'src' );
				var thumbnailSrc = $( containers[i] ).attr( 'poster' );
				var video = $('<video>');
				video.attr({
					controls: true,
					src:src,
					poster:thumbnailSrc,
					width:'100%'
				});
				containers[ i ].addFlag = true;
				$( containers[i] ).append( video );

				this.addPoster( 'html5', containers[i], video );
			}
			
		}

	}


	p.setFlashVideo = function(){

		for( var i = 0; i < length; i++ ){

			if( !containers[ i ].addFlag ){

				var id = 'flash-video' + i;
				containers[ i ].addFlag = true;
				$( containers[i] ).append('<div id="' + id + '"></div>');
				var src = $( containers[i] ).attr( 'src' );

				var vars = {
					file:src,
					skin:skinUrl
					//thumb:'',
				};
				swfobject.embedSWF(
						swfPlayerUrl,
						id,
						"100%", "100%",
						"11",
						expressinstallUrl,
						vars,
						{wmode:"transparent"}
					);

				this.addPoster( 'flash', containers[i], id  );

			}

		}

	}


	p.addPoster = function( type, container, video ){

		var src = $( container ).attr( 'poster' );
		if( !src ) return;

		var poster = $( '<img>' );
		poster.attr({
			src:src
		});
		poster.addClass('poster');
		if( type == 'html5' ){
			video.attr( 'poster', src );
		}else{
			$( container ).css({height:'369px'});
			poster.css({top:'0px'});
		}
		poster.on('click', this.posterClickHandler.bind( this, type, video, poster ));
		$( container ).append( poster );

	}

	p.posterClickHandler = function(){

		var type = arguments[0];

		var video = arguments[1];
		if( type == 'html5' ){
			video[0].play();
		}else{	//flash
			var id = video;
			var swfObj = document.all? window[ id ] : document[ id ];
			swfObj.playFromJs();	
		}

		var poster = arguments[2];
		poster.hide();

	}


	return VideoManager3;

})();

YSD.libs = {};

/****************************************************************/
//スムーススクロール
/****************************************************************/
YSD.libs.smoothScroll = function( speed, offsetY ){
	if( !speed ) speed = 400;
	if( !offsetY ) offsetY = 0;

	$('a[href^=#]').off( 'click', scrollClickHandler );
	$('a[href^=#]').on( 'click', scrollClickHandler );
	function scrollClickHandler(){
		var href= $(this).attr("href");
		var target = $(href == "#" || href == "" ? 'html' : href);
		var position = target.offset().top + offsetY;
		$('body,html').animate({scrollTop:position}, speed, 'swing');
		return false;
	}
}


/****************************************************************/
//ディレイ
/****************************************************************/
YSD.libs.delay = function( delay, func ){

	setTimeout(func, delay);

}



YSD.MouseOver3DRotate = (function(){

	var maxRotate = 25;
	
	function MouseOver3DRotate( expr, touch, shadowFlag ){

		if( typeof expr == 'string' ){
			this.expr = expr;
		}else{
			this.elementFlag = true;
			this.elements = expr;
		}
		this.touch = touch;	//YSD.touch
		this.shadowFlag = shadowFlag;

		this.scrollTop = 0;
		this.windowScroll();
		$( window ).scroll( this.windowScroll.bind( this ) );
		setInterval( this.intervalAnimate.bind( this ), 200 );
			
		this.init();
	}

	MouseOver3DRotate.prototype = {

		init : function(){

			if( !this.elementFlag ){
				this.elements = $( this.expr );
			}
			var length = this.elements.length;
			for( var i = 0; i < length; i++ ){
				var target = $( this.elements[i] );
				target.off();
				target.on( 'mouseover', { target:target }, this.overHandler.bind( this ) );
				target.on( 'mouseout', { target:target }, this.outHandler.bind( this ) );
				target.css({
					transitionDuration:'.3s'
				});
			}

		},


		addElements : function( elements ){

			var length = elements.length;
			for( var i = 0; i < length; i++ ){
				var target = $( elements[i] );
				target.off();
				target.on( 'mouseover', { target:target }, this.overHandler.bind( this ) );
				target.on( 'mouseout', { target:target }, this.outHandler.bind( this ) );
				target.css({
					transitionDuration:'.3s'
				});
			}

		},


		overHandler : function( e ){

			var target = e.data.target;
			this.nowTarget = target;
			this.rotateHalfW = this.nowTarget.width() * .5;
			this.rotateHalfH = this.nowTarget.height() * .5;
			this.rotateLiOffset = this.nowTarget.offset();

			var cssObj = { zIndex:10 };
			if( this.shadowFlag ){
				cssObj.boxShadow = 'rgba(71, 71, 71, 0.509804) 7px 8px 5px 0px';
			}
			this.nowTarget.css( cssObj );

		},


		outHandler : function( e ){

			var target = e.data.target;
			target.css({
				zIndex:'auto',
				transform:'none',
				boxShadow:'none'
			});
			this.nowTarget = null;

		},


		intervalAnimate : function(){

			if( this.nowTarget ){
				var offset = this.rotateLiOffset;
				var halfW = this.rotateHalfW;
				var halfH = this.rotateHalfH;

				var x = offset.left + halfW;
				var y = offset.top + halfH - this.scrollTop;
				
				var offsetX = this.touch.x - x;
				var offsetY = y - this.touch.y;
				var perX = offsetX / halfW;
				var perY = offsetY / halfH;

				var rotX = perX * maxRotate;
				var rotY = perY * maxRotate;

				this.nowTarget.css({
					transform:'rotateY(' + rotX + 'deg) rotateX(' + rotY + 'deg) translateZ(30px)'
				});
			}
		},


		windowScroll : function(){

			this.scrollTop = $( window ).scrollTop();
			
		}

	}

	return MouseOver3DRotate;

})();

YSD.MouseOverRotate = (function(){

	var maxRotate = 5;
	
	function MouseOverRotate( expr, touch, shadowFlag ){

		if( typeof expr == 'string' ){
			this.expr = expr;
		}else{
			this.elementFlag = true;
			this.elements = expr;
		}
		this.touch = touch;	//YSD.touch
		this.shadowFlag = shadowFlag;

		this.scrollTop = 0;
		this.windowScroll();
		$( window ).scroll( this.windowScroll.bind( this ) );
			
		this.init();
	}

	MouseOverRotate.prototype = {

		init : function(){

			if( !this.elementFlag ){
				this.elements = $( this.expr );
			}
			var length = this.elements.length;
			for( var i = 0; i < length; i++ ){
				var target = $( this.elements[i] );
				target.off();
				target.on( 'mouseover', { target:target }, this.overHandler.bind( this ) );
				target.on( 'mouseout', { target:target }, this.outHandler.bind( this ) );
				
			}

		},


		addElements : function( elements ){

			var length = elements.length;
			for( var i = 0; i < length; i++ ){
				var target = $( elements[i] );
				target.off();
				target.on( 'mouseover', { target:target }, this.overHandler.bind( this ) );
				target.on( 'mouseout', { target:target }, this.outHandler.bind( this ) );
				
			}

		},


		overHandler : function( e ){

			var target = e.data.target;
			this.nowTarget = target;
			this.rotateHalfW = this.nowTarget.width() * .5;
			this.rotateHalfH = this.nowTarget.height() * .5;
			this.rotateLiOffset = this.nowTarget.offset();

			this.rotate();

		},


		outHandler : function( e ){

			var target = e.data.target;
			target.css({
				zIndex:'auto',
				transform:'none',
				boxShadow:'none'
			});
			this.nowTarget = null;

		},


		rotate : function(){

			var offset = this.rotateLiOffset;
			var halfW = this.rotateHalfW;
			var halfH = this.rotateHalfH;

			var x = offset.left + halfW;
			var y = offset.top + halfH - this.scrollTop;
			
			var offsetX = this.touch.x - x;
			var offsetY = y - this.touch.y;
			var perX = -offsetX / halfW;
			var perY = offsetY / halfH;
			var per = perX * perY;

			var cssObj = { transform:'rotateZ(' + ( maxRotate * per ) + 'deg)' };
			if( this.shadowFlag ){
				cssObj.boxShadow = 'rgba(113, 135, 164, 0.380392) 7px 6px 4px -4px';
			}
			this.nowTarget.css( cssObj );

		},


		windowScroll : function(){

			this.scrollTop = $( window ).scrollTop();
			
		}

	}

	return MouseOverRotate;

})();

YSD.ScrollElement = (function(){


	function ScrollElement( expr, top, max, _offsetY ){

		this.stage;

		this.stageWidth = 0;
		this.scrollTop = 0;

		this.contentTop = 0;
		this.targetY = 0;
		this.defaultY = 0;

		this.height = 0;
		this.offsetY = 0;

		this.element = $( expr );
		this.element.css({ top:'0px' });
		this.height = this.element.height();

		this.contentTop = top;
		this.defaultY = top;
		this.scrollMax = max;
		this.offsetY = _offsetY;


		$( window ).scroll( this.windowScroll.bind( this ) );
		setInterval( this.animate.bind( this ), 1000 / 60 );

		this.resize();
		$( window ).on( 'resize', this.resize.bind( this ) );
	}

	var p = ScrollElement.prototype;
	p.windowScroll = function(){

		this.scrollTop = $( window ).scrollTop();
		
	}

	p.animate = function(){

		if( this.stageWidth < 641 ) return;
		
		this.targetY = ( this.scrollTop + this.stage.clientH - this.height - this.contentTop + this.offsetY );
		if( this.defaultY > this.targetY ) this.targetY = this.defaultY;
		if( this.scrollMax < this.targetY ) this.targetY = this.scrollMax;

		var nowY = this.element.offset().top - this.contentTop;
		var y = -( nowY - this.targetY ) * .1 + nowY;
		this.element.css({ top:y + 'px' });

	}

	p.resize = function(){

		this.stage = YSD.utils.getStageProperty();
		this.stageWidth = this.stage.w;
		
	}

	return ScrollElement;

})();



/****************************************************************/
//Elementクラス
/****************************************************************/
YSD.Element = (function(){

	function Element( expr, index ){

		if( index == null ){
			this.element = $( expr );
		}else{
			this.element = $( $( expr )[index] );
		}

	}

	return Element;

})();
YSD.PixiAssetManager = (function(){
    
    var callBack;

    function PixiAssetManager( assetUrls, _callBack ) {

        callBack = _callBack;

        var loader = new PIXI.AssetLoader( assetUrls, false);
        loader.onComplete = this.assetsLoadComp.bind(this);
        loader.load();
    
    }

    PixiAssetManager.prototype = {

        assetsLoadComp : function() {

            callBack();
        
        }
    
    }

    return PixiAssetManager;

})();

if( typeof( PIXI ) != 'undefined' ){

	YSD.PixiMovieClip = (function( _super ){

	    __extends( PixiMovieClip, _super );

		function PixiMovieClip( spriteSheet, frameLate ){

	        _super.call( this, spriteSheet );

	        this.animations = {};
	        this.nowAnimation = '';
	        this.renderFlag = false;
	        this.loop = false;

	        if( !frameLate ) frameLate = 30;
	        setInterval( this.animate.bind( this ), 1000 / frameLate );

		}


		var p = PixiMovieClip.prototype;
		
		p.setAnimation = function( name, start, end, loop, callback ){

			this.nowAnimation = name;
			this.animations[ name ] = {
				start:start,
				end:end,
				loop:loop,
				callback:callback
			};

		};


		p.playByName = function( name ){

			this.nowAnimation = name;
			var animation = this.animations[ this.nowAnimation ];
			this.gotoAndPlay( animation.start );
			if( !this.playing ) this.play();

		};


		p.animate = function(){

			if( !this.playing ) return;

			var animation = this.animations[ this.nowAnimation ];

			if( animation ){
				if( this.currentFrame >= animation.end ){
					if( animation.loop ){
						this.gotoAndPlay( animation.start );
					}else{
						this.stop();
						if( animation.callback ){
							animation.callback();
						}
					}
				}
			}

		};


		
		return PixiMovieClip;

	})( PIXI.MovieClip );

}

/****************************************************************/
//FPS、this.deltaTimeの取得クラス
/****************************************************************/
YSD.Time = (function(){
	
	function Time(){

		this.interval = 0;
		this.lastTime = 0;
		this.deltaTime = 0;
	
	}


	Time.prototype = {

		//------------------------フレームレート測定------------------------
		getFps : function(){

			this.deltaTime = this.getDelta();

	        this.interval += this.deltaTime;
	        if (this.interval > 1000) {
	            this.interval = 0;
	            var fps = Math.floor(1000 / this.deltaTime);
	            return "this.deltaTime:" + this.deltaTime + ", fps:" + fps;
	        } 

		},

		//------------------------デルタタイム取得------------------------
		getDelta : function(){
	        var dateNow = Date.now();
	        this.deltaTime = dateNow - this.lastTime;
	        this.lastTime = dateNow;
			return this.deltaTime;
		},


		//------------------------ミリ秒の取得------------------------
		getTime : function(){
	        var dateNow = Date.now();
			return dateNow;
		},


		//------------------------twitterのタイムコードを日付に変換------------------------
		// "Tue Feb 17 17:13:02 +0900 2015" -> '2015/02/09 19:49'
		getDate1 : function( dateStr ){
			
			var strs = dateStr.split(" ");
			dateStr = strs[1]+" "+strs[2]+", "+strs[5]+" "+strs[3];
			//dateStr = strs[0]+", " +strs[2]+" "+strs[1]+" "+strs[5]+" "+strs[3]+" "+strs[4];
			var dd = new Date( dateStr );

			return this.getDateTime( dd );

		},


		//1424160782 -> '2015/02/09 19:49'
		getDate2 : function( EpochSec ){

			var dd = new Date();
			//EpochSec = EpochSec + 32400;
			dd.setTime( EpochSec * 1000 );

			return this.getDateTime( dd );
			
		},


		getDateTime : function( dd ){

			var year = dd.getFullYear();	//getYear
			if( year < 1900 ) year += 1900;
			var month = dd.getMonth() + 1;
			var day = dd.getDate();
			var hour = dd.getHours();// + 9;
			//if( hour > 23 ){
			//	hour -= 24;
			//	day += 1;
			//}
			var min = dd.getMinutes();

			//'PM 01:00'
			var time = this.getTime1( hour, min );

			//'2015/2/20'
			var date = year + '/' + month + '/' + day;

			return { date:date, time:time };
		},


		getTime1 : function( hour, min ){

			min = '' + min;
			if( min.length == 1 ) min = '0' + min;

			if( hour < 13 ){
				hour += '';
				if( hour.length == 1 ) hour = '0' + hour;
				var time = 'AM ' + hour + ':' + min;
			}else{
				hour = hour - 12;
				hour += '';
				if( hour.length == 1 ) hour = '0' + hour;
				var time = 'PM ' + hour + ':' + min;
			}

			return time;

		}

	}

	return Time;

})();




/****************************************************************/
//UserAgent
/****************************************************************/

YSD.UserAgent = (function(){

	function UserAgent(){

		var ua = navigator.userAgent.toLowerCase();
		var ver = window.navigator.appVersion.toLowerCase();
		var browser = '';
		var ieVer = 9999;
		if (ua.indexOf("msie") != -1){
			browser = 'ie';
	        if (ver.indexOf("msie 6.") != -1){
	            ieVer = 6;
	        }else if (ver.indexOf("msie 7.") != -1){
	            ieVer = 7;
	        }else if (ver.indexOf("msie 8.") != -1){
	            ieVer = 8;
	        }else if (ver.indexOf("msie 9.") != -1){
	            ieVer = 9;
	        }else if (ver.indexOf("msie 10.") != -1){
	            ieVer = 10;
	        }
	    }else if(ua.indexOf('trident/7') != -1){
	        browser = 'ie';
	        ieVer = 11;
	    }else if (ua.indexOf('chrome') != -1) {
		    browser = 'chrome';
		} else if (ua.indexOf('safari') != -1) {
		    browser = 'safari';
		} else if (ua.indexOf('firefox') != -1) {
		    browser = 'firefox';
		} else if (ua.indexOf('opera') != -1) {
		    browser = 'opera';
		}

		ua = navigator.userAgent;
		var twitterFlag = false;
		if (ua.search(/Twitter/) != -1)
		    twitterFlag = true;
		var platform = 'pc';
		if (ua.search(/iPhone/) != -1) {
		    platform = "sp";
		} else if ((ua.search(/Android/) != -1) && (ua.search(/Mobile/) != -1)) {
		    platform = "sp";
		} else if ((ua.search(/iPad/) != -1) || (ua.search(/Android/) != -1)) {
		    platform = "ipad";
		}

		this.browser = browser;
		this.ieVer = ieVer;
		this.platform = platform;
	
	

		this.isAndroid = (navigator.userAgent.search(/Android/)> 0)?true:false;
		this.androidVersion = -1;
		if( this.isAndroid ) this.androidVersion = parseFloat(ua.slice(ua.indexOf("Android")+8));
		
		this.is_iOS = (navigator.userAgent.search(/iPhone/)> 0 || navigator.userAgent.search(/iPod/)> 0 || navigator.userAgent.search(/iPad/)> 0)?true:false;
		this.iosVersion = -1;
		if( this.is_iOS ){
			var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);  
	        this.iosVersion = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
		}
	}

	return UserAgent;

})();





YSD.utils = {
	
	toRad:Math.PI / 180,

	getStageProperty : function(){

		var w = window.innerWidth;
		var h = window.innerHeight;
		var documentW = document.body.clientWidth;
		var documentH = document.body.clientHeight;
		var clientW = document.documentElement.clientWidth;
		var clientH = document.documentElement.clientHeight;

		return {
				w:w, h:h,
				documentH:documentH, documentW:documentW,
				clientW:clientW, clientH:clientH
			};
	},


	setOpacity : function( element, opacity ){

		var ua = new YSD.UserAgent();

		if( ua.browser == 'ie' &&
			ua.ieVer < 9 ){
			element.style.filter = 'alpha(opacity=' + ( opacity * 100 ) + ')'; 
		}else{
			$( element ).css({ opacity:opacity } );
		}

	}

};