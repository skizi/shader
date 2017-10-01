var ColorPicker = (function(){
	
	//colorPicker
	var colorPicker1;
	var colorPicker1Context;
	var colorPicker2;
	var colorPicker2Context;
	var colorPicker3;
	var colorPicker3Context;

	
	var html =  '<div id="color-picker">' +
					'<h2>ColorPicker</h2>' +
					'<canvas id="color-picker1" width="19" height="253"></canvas>' +
					'<canvas id="color-picker2" width="30" height="20"></canvas>' +
					'<canvas id="color-picker3" width="256" height="256"></canvas>' +
				'</div>';


	function ColorPicker(){

		this.element = $( html );
		$( document.body ).append( this.element );
		this.element.find( 'h2' ).on( 'mousedown', colorPickerHeaderDownHandler.bind( this ) );
		
		colorPicker1 = $( '#color-picker1' );
		colorPicker1Context = colorPicker1[0].getContext( "2d" );
		colorPicker1.on( 'mousedown', colorPicker1DownHandler.bind( this ) );
		
		colorPicker2 = document.getElementById( 'color-picker2' );
		colorPicker2Context = colorPicker2.getContext( "2d" );
		
		colorPicker3 = $( '#color-picker3' );
		colorPicker3Context = colorPicker3[0].getContext( "2d" );
		colorPicker3.on( 'mousedown', colorPicker3DownHandler.bind( this ) );

		this.downFlag = false;

		createColorPicker();

	}


	function createColorPicker(){
		
		colorPicker1Context.fillStyle = "rgb(255, 255, 255)";
		colorPicker1Context.fillRect( 0, 0, 19, 253 );
		
		var u = Math.floor(255 / 6);
		var ra = new Array(0,-1,0,0,1,0);
		var ga = new Array(1,0,0,-1,0,0);
		var ba = new Array(0,0,1,0,0,-1);

		var r = 255;
		var g = 0;
		var b = 0;
		for (var i = 0; i < 255; i++) {
			colorPicker1Context.fillStyle = "rgb(" +r+ ", " +g+ ", " +b+ ")";
			colorPicker1Context.fillRect( 0, i, 19, 1 );
			var s = Math.floor(i / u);
			r+= ra[s] * 6;
			g+= ga[s] * 6;
			b+= ba[s] * 6;
		}
		
		//繧ｫ繝ｩ繝ｼ繝斐ャ繧ｫ繝ｼ縺ｧ驕ｸ謚槭＠縺ｦ縺�ｋ濶ｲ
		colorPicker2Context.fillStyle = "rgb(255, 0, 0)";
		colorPicker2Context.fillRect( 0, 0, 30, 20 );
		
		//
		colorPicker3FillRect( [255, 0, 0] );
		
	}





	//-------------------------------colorPickerContainer-------------------------------
	function colorPickerHeaderDownHandler( e ){

		this.downFlag = true;
		
		var relativeTouch = getRelativeMousePosition( this.element );
		oldX = relativeTouch.x;
		oldY = relativeTouch.y;
		
		$( document.body ).on( 'mousemove', colorPickerMoveHandler.bind( this ) );
		$( document.body ).on( 'mouseup',  colorPickerUpHandler.bind( this ) );
		
	}


	function colorPickerMoveHandler( e ){
		
		var x = MYAPP.touch.x - oldX;
		var y = MYAPP.touch.y - oldY;
		this.element.css( { left:x + 'px', top:y + 'px' } );
		
	}


	function colorPickerUpHandler( e ){
		
		this.downFlag = false;

		$( document.body ).off( 'mouseup' );
		$( document.body ).off( 'mousemove' );
		
	}



	//-------------------------------colorPicker1-------------------------------
	function colorPicker1DownHandler(e){

		colorPicker1.on( 'mousemove', colorPicker1MoveHandler.bind( this ) );
		$( document.body ).on( 'mouseup', colorPicker1UpHandler );
		
		var relativeTouch = getRelativeMousePosition( colorPicker1 );
		var col = getColor( colorPicker1Context, relativeTouch );
		nowColor = col;
		this.element.triggerHandler( 'callback', { nowColor:nowColor } );
			
		//濶ｲ陦ｨ遉ｺ縺ｮ螟画峩
		colorPicker2Context.fillStyle = "rgba(" +col+ ")";
		colorPicker2Context.fillRect( 0, 0, 30, 20 );
		
		colorPicker3FillRect( col );
	}



	function colorPicker1MoveHandler(e) {
						
		//濶ｲ縺ｮ蜿門ｾ
		var relativeTouch = getRelativeMousePosition( colorPicker1 );
		var col = getColor( colorPicker1Context, relativeTouch );
		//text001.text=col002.toString(16);
						
		//濶ｲ陦ｨ遉ｺ縺ｮ螟画峩
		colorPicker2Context.fillStyle = "rgba(" +col+ ")";
		colorPicker2Context.fillRect( 0, 0, 30, 20 );
		
		nowColor = col;
		this.element.triggerHandler( 'callback', { nowColor:nowColor } );

		colorPicker3FillRect( col );

	}

	function colorPicker1UpHandler(e) {
		
		$( document.body ).off( 'mouseup' );
		colorPicker1.off( 'mousemove' );
		
	}





	//---------------------------colorPicker3----------------------------
	function colorPicker3DownHandler(e){
		
		//addEventListener(Event.ENTER_FRAME,ent002);
		colorPicker3.on( 'mousemove', colorPicker3MoveHandler.bind( this ) );
		$( document.body ).on( 'mouseup', colorPicker3UpHandler );
		
		//濶ｲ縺ｮ蜿門ｾ
		var relativeTouch = getRelativeMousePosition( colorPicker3 );
		var col = getColor( colorPicker3Context, relativeTouch );
		//text001.text=col002.toString(16);
		nowColor = col;
		this.element.triggerHandler( 'callback', { nowColor:nowColor } );
			
		//濶ｲ陦ｨ遉ｺ縺ｮ螟画峩
		colorPicker2Context.fillStyle = "rgba(" +col+ ")";
		colorPicker2Context.fillRect( 0, 0, 30, 20 );
	}


	function colorPicker3MoveHandler(e) {
						
		var relativeTouch = getRelativeMousePosition( colorPicker3 );
		var col = getColor( colorPicker3Context, relativeTouch );
		nowColor = col;
		this.element.triggerHandler( 'callback', { nowColor:nowColor } );

		colorPicker2Context.fillStyle = "rgba(" +col+ ")";
		colorPicker2Context.fillRect( 0, 0, 30, 20 );

	}


	function colorPicker3UpHandler(e) {
		
		$( document.body ).off( 'mouseup' );
		colorPicker3.off( 'mousemove' );
		
	}


	function colorPicker3FillRect( color ){

		colorPicker3Context.fillStyle = "rgb(255, 255, 255)";
		colorPicker3Context.fillRect( 0, 0, 256, 256 );

		colorPicker3Context.beginPath();
		var grad  = colorPicker3Context.createLinearGradient( 0, 0, 256, 0 );
		grad.addColorStop(0,'rgba( ' + color[0] + ',' + color[1] + ',' + color[2] + ', 0 )');
		grad.addColorStop(1,'rgba( ' + color[0] + ',' + color[1] + ',' + color[2] + ', 1 )');
		colorPicker3Context.fillStyle = grad;
		colorPicker3Context.rect(0,0,256,256);
		colorPicker3Context.fill();
		
		colorPicker3Context.beginPath();
		grad  = colorPicker3Context.createLinearGradient( 0, 0, 0, 256 );
		grad.addColorStop(0,'rgba( 0, 0, 0, 0 )');
		grad.addColorStop(1,'rgba( 0, 0, 0, 1 )');
		colorPicker3Context.fillStyle = grad;
		colorPicker3Context.rect(0,0,256,256);
		colorPicker3Context.fill();

	}





	//-----------------------------utils--------------------------------
	function getColor( ctx, pos ){

		var imageData = ctx.getImageData( pos.x, pos.y, 1, 1 );
		var data = imageData.data;
		//text001.text=col002.toString(16);
		return [data[0], data[1], data[2], 255];
	
	}


	function getRelativeMousePosition( target ){

		var offset = target.offset();
		var x = offset.left;
		var y = offset.top;
		var relativeX = MYAPP.touch.x - x;
		var relativeY = MYAPP.touch.y - y;

		return { x:relativeX, y:relativeY };
	}


	return ColorPicker;

})();