var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var columnsNums = undefined;
var cellSize = undefined;
var mousex = undefined;
var mousey = undefined;
var cells = [];
var types = [[0, '#ffffff'], [1, 'darkgray']]
var canvas_div = document.getElementById('canvas');
var text_div = document.getElementById('copytext');
var conf_div = document.getElementById('configure');
var pills_div = document.getElementById('pillholder');
var selector_div = document.getElementById('selector');
var import_div = document.getElementById('import_settings');
var pills = "";
var clicked = false;
var currentType = 1;
var cellNumberMode = false;
var lastSelectedCell = undefined;
var drawBorder = true;
var checkpoints = [];


function c_cell(x, y, type, width, colors, cellNumber){
	this.x      = x;
	this.y      = y;
	this.type   = type;
	this.width  = width;
	this.colors = colors;
	this.num    = cellNumber;
	this.font   = ((this.width/4 > 10) ? this.width/4 : 10) + "px monospace";
	this.checkpoint = false;

	this.m_draw = (context, drawBorder, writecellnumber) => {
		context.fillStyle = this.colors[this.type];
		context.strokeStyle = "black";
		
		if (writecellnumber){
			//context.textAlign = "center"
			context.font = this.font;
			context.fillStyle = "black";
			context.fillText(this.num, this.x+this.width/2, this.y+this.width/2);
		} else {
			context.fillRect(this.x, this.y, this.width, this.width);
		}
		if (this.checkpoint){
			context.beginPath();
			context.arc(this.x+this.width/2, this.y+this.width/2, this.width/4, 0, Math.PI * 2)
			context.fillStyle = "black";
			context.strokeStyle = "white";
			context.fill();
			context.stroke();
		}
		(drawBorder) ? context.strokeRect(this.x, this.y, this.width, this.width) : null;
	}
}

function clearSelections(){
	if (cells.length > 0){
		for (let c in cells){
			cells[c].type = 0;
			cells[c].checkpoint = false;
		}
		checkpoints = []
	}
}

function showImportScreen(){
	conf_div.style.visibility = 'hidden';
	text_div.style.visibility = 'hidden';
	canvas_div.style.visibility = 'hidden';
	import_div.style.visibility = 'visible';
}


function addType(){
	let newType = prompt('Enter a valid color name or hex code');
	if (newType == "") {
		alert('Invalid input')
		return
	};
	types.push([types.length, newType]);
	changeArraySize();
}

function changeArraySize(){
	// create the pills
	pills = ""
	for (let t in types){
		pills += `<div class="pill" style="color:black; border:solid 1px ${types[t][1]}">${types[t][0]}</div>`;
	}
	pills_div.innerHTML = pills;
	conf_div.style.visibility = 'visible';
	text_div.style.visibility = 'hidden';
	canvas_div.style.visibility = 'hidden';
	import_div.style.visibility = 'hidden';
}

function copyArray(){
	var copyText = document.getElementById("arraytext");
	copyText.select();
	copyText.setSelectionRange(0, 99999); 
	document.execCommand("copy");
	alert('Copied array to clipboard!');
}

function createGraph(ret = false){
	columnsNums = parseInt(document.getElementById('gridsize').value)
    rowNums     = parseInt(document.getElementById('rowsnum').value);
	if (rowNums && columnsNums && !isNaN(columnsNums) && !isNaN(rowNums)){
		// create graphs
		if (!ret) {
			cellSize = parseInt((rowNums > columnsNums) ? 600/rowNums : 600/columnsNums);
            cellSize = (cellSize > 20) ? cellSize : 20;
            
            // set size of canvas based on the size
            canvas.height = cellSize * rowNums;
            canvas.width = cellSize * columnsNums;
            
			cells = new Array(rowNums*columnsNums);
			let l_row = 1;
			let l_colors = [];
			for (let t in types) l_colors.push(types[t][1]);
			for (var n=0; n<cells.length; n++){
				if (n+1 > l_row*columnsNums){
					l_row++
				}

				var l_column = ((n+1) - ((l_row-1)*columnsNums)) // Column of the cell
                // console.log(`n = ${n} c = ${l_column} r= ${l_row}`);
				cells[n] = new c_cell(
					((l_column-1) * cellSize), 
					(cellSize * (l_row-1)),
					0,
					cellSize,
					l_colors,
					n
				)
			}
		}
		// create type selectors
		let l_selectors = "";
		for (let t in types){
			l_selectors += `<div id="p${types[t][0]}" class="pill" onclick="updateCurrentType(${types[t][0]})" style="color:black; border:solid 1px ${types[t][1]}">${types[t][0]}</div>`
		}
		selector_div.innerHTML = l_selectors;
		conf_div.style.visibility = 'hidden';
		text_div.style.visibility = 'hidden';
		canvas_div.style.visibility = 'visible';
		import_div.style.visibility = 'hidden';
		document.getElementById('p1').classList.add('current');
	} else {
		alert('Invalid column size');
	}
}

function updateCurrentType(type){
	document.getElementById('p'+currentType).classList.remove('current');
	currentType = type;
	document.getElementById('p'+currentType).classList.add('current');
}

function importArray(){
	let arraytxt = document.getElementById('import_bmparray_txt').value;
	let colortxt = document.getElementById('import_colorarray_txt').value;

	if (arraytxt != "" && colortxt != ""){
		arraytxt = arraytxt.replace("[", "").replace("]", "").replace(/\n/g, '').split(',');
		colortxt = colortxt.replace("[", "").replace("]", "").replace(/\n/g, '').split(',');
		columnsNums = document.getElementById('gridsize2').value;
		rowNums = document.getElementById('rowsnum2').value;
		
		// create types from color array
		types = [];
		for (c in colortxt){
			types.push([c, colortxt[c].replace('"', "").replace('"', "")])
		}

		// create cells from bmparray
		cellSize = parseInt((rowNums > columnsNums) ? 600/rowNums : 600/columnsNums);
		cellSize = (cellSize > 20) ? cellSize : 20;

		// set size of canvas based on the size
		canvas.height = cellSize * rowNums;
		canvas.width = cellSize * columnsNums;
		let l_colors = [];
		cells = new Array(rowNums*columnsNums);
		for (let t in types) l_colors.push(types[t][1]);
		let l_row = 1;
		for (let t in types) l_colors.push(types[t][1]);
		for (var n=0; n<cells.length; n++){
			if (n+1 > l_row*columnsNums){
				l_row++
			}

			var l_column = ((n+1) - ((l_row-1)*columnsNums)) // Column of the cell
			cells[n] = new c_cell(
				((l_column-1) * cellSize), 
				(cellSize * (l_row-1)),
				arraytxt[n],
				cellSize,
				l_colors,
				n
			)
		}
		
		// create type selectors
		let l_selectors = "";
		for (let t in types){
			l_selectors += `<div id="p${types[t][0]}" class="pill" onclick="updateCurrentType(${types[t][0]})" style="color:black; border:solid 1px ${types[t][1]}">${types[t][0]}</div>`
		}
		
		// reset some vars
		lastSelectedCell = undefined;
		cellNumberMode = false;
		drawBorder = false;	
		
		selector_div.innerHTML = l_selectors;
		conf_div.style.visibility = 'hidden';
		text_div.style.visibility = 'hidden';
		canvas_div.style.visibility = 'visible';
		import_div.style.visibility = 'hidden';
		document.getElementById('p1').classList.add('current');
	} else {
		alert('Empty bitmap array or empty color array');
	}
}

function draw(){
	if (cells.length != 0 && canvas_div.style.visibility == 'visible'){
		context.strokeStyle = "black";
		context.fillStyle = "white";
		context.strokeRect(0, 0, canvas.width, canvas.height)
		context.fillRect(0, 0, canvas.width, canvas.height)
		for (let c in cells){
			cells[c].m_draw(context, drawBorder, cellNumberMode);
		}
		if (mousex && mousey){
		for (let c in cells){
			if ((mousex <= cells[c].x + cells[c].width && mousex >= cells[c].x) && (mousey <= cells[c].y + cells[c].width && mousey >= cells[c].y)){
				//cells[c].type = (!cells[c].type) ? currentType : 0;
				lastSelectedCell = c;
				cells[c].type = currentType;
				break;
			}
		}
		//mousex = mousey = undefined;
	}
	}
	requestAnimationFrame(draw);
}

function generateArray(){
	let arraytxt = [];
	let colorarray = [];
	for (let c in cells) arraytxt.push(((parseInt(c)+1) % columnsNums == 1 && c != 0) ? '\n ' + cells[c].type : cells[c].type);
	for (let t in types) colorarray.push(`"${types[t][1]}"`);
	colorarray = `Color Array: [${colorarray}]<br>Grid Dimensions: ${columnsNums}x${rowNums}<br>Cell Dimensions: ${cellSize} px<br>Checkpoints: [${checkpoints}]`

	document.getElementById('arraytext').value = "[" + arraytxt + "]";
	document.getElementById('colorArray').innerHTML = colorarray;
	canvas_div.style.visibility = 'hidden';
	conf_div.style.visibility = 'hidden';
	text_div.style.visibility = 'visible';
	import_div.style.visibility = 'hidden';
}

function toggleCheckpoint(){
	(lastSelectedCell) ? cells[lastSelectedCell].checkpoint = !cells[lastSelectedCell].checkpoint : null;
	for (let c in checkpoints) {
		if (checkpoints[c] == lastSelectedCell){
			checkpoints.splice(c, 1); 
			return;
		}
	}
	checkpoints.push(lastSelectedCell)
}

changeArraySize()
draw();

canvas.addEventListener('mousedown', (event) => {
	if (!cellNumberMode){
		mousex = event.clientX - canvas.getBoundingClientRect().x;
		mousey = event.clientY - canvas.getBoundingClientRect().y;
		clicked = true;
	}
});

canvas.addEventListener('mousemove', (event) => {
	if (clicked && !cellNumberMode){
		mousex = event.clientX - canvas.getBoundingClientRect().x;
		mousey = event.clientY - canvas.getBoundingClientRect().y;
	}
});

document.addEventListener('mouseup', (event) => {
	mousex = undefined;
	mousey = undefined;
	clicked = false;
});

canvas.addEventListener('touchstart', (event) => {
	if (!cellNumberMode){
		mousex = event.touches[0].clientX - canvas.getBoundingClientRect().x;
		mousey = event.touches[0].clientY - canvas.getBoundingClientRect().y;
		clicked = true;
	}
	
}, { passive: true});

canvas.addEventListener('touchmove', (event) => {
	if (clicked && !cellNumberMode){
		mousex = event.touches[0].clientX - canvas.getBoundingClientRect().x;
		mousey = event.touches[0].clientY - canvas.getBoundingClientRect().y;
	}
}, { passive: true});

document.addEventListener('touchend', (event) => {
	mousex = undefined;
	mousey = undefined;
	clicked = false;
}, { passive: true});

document.addEventListener('keydown', (event) => {
	switch (event.key.toLowerCase()){
		case 'b':
			drawBorder = !drawBorder;
			// console.log('Draw Border: ' + drawBorder)
			break;
		case 'n':
			cellNumberMode = !cellNumberMode;
			// console.log('Show Numbers: ' + cellNumberMode);
			break;
		case 'c':
			toggleCheckpoint(); 
			break;
	}
})
