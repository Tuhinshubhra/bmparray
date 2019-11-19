var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var rowNums = undefined;
var rowsize = undefined;
var mousex = undefined;
var mousey = undefined;
var cells = [];
var types = [[0, '#ffffff'], [1, 'darkgray']]
var canvas_div = document.getElementById('canvas');
var text_div = document.getElementById('copytext');
var conf_div = document.getElementById('configure');
var pills_div = document.getElementById('pillholder');
var selector_div = document.getElementById('selector');
var pills = "";
var clicked = false;
var currentType = 1;


function c_cell(x, y, type, width, colors){
	this.x     = x;
	this.y     = y;
	this.type  = type;
	this.width = width;
	this.colors = colors;

	this.m_draw = (context) => {
		context.fillStyle = this.colors[this.type];
		context.strokeStyle = "black";
		context.fillRect(this.x, this.y, this.width, this.width);
		context.strokeRect(this.x, this.y, this.width, this.width);
	}
}

function clearSelections(){
	if (cells.length > 0){
		for (let c in cells){
			cells[c].type = 0;
		}
	}
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
}

function copyArray(){
	var copyText = document.getElementById("arraytext");
	copyText.select();
	copyText.setSelectionRange(0, 99999); 
	document.execCommand("copy");
	alert('Copied array to clipboard!');
}

function createGraph(ret = false){
	rowNums = parseInt(document.getElementById('gridsize').value) 
	if (rowNums && !isNaN(rowNums)){
		// create graphs
		if (!ret) {
			rowsize = 600/rowNums;
			cells = new Array(rowNums*rowNums);
			let l_row = 1;
			let l_colors = [];
			for (let t in types) l_colors.push(types[t][1]);
			for (var n=0; n<cells.length; n++){
				if (n+1 > l_row*rowNums){
					l_row++
				}

				var l_column = ((n+1) - ((l_row-1)*rowNums)) // Column of the cell

				cells[n] = new c_cell(
					((l_column-1) * rowsize), 
					(rowsize * (l_row-1)),
					0,
					rowsize,
					l_colors
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

function draw(){
	if (cells.length != 0 && canvas_div.style.visibility == 'visible'){
		context.strokeRect(0, 0, canvas.width, canvas.height)
		for (let c in cells){
			cells[c].m_draw(context);
		}
		if (mousex && mousey){
		for (let c in cells){
			if ((mousex <= cells[c].x + cells[c].width && mousex >= cells[c].x) && (mousey <= cells[c].y + cells[c].width && mousey >= cells[c].y)){
				//cells[c].type = (!cells[c].type) ? currentType : 0;
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
	for (let c in cells) arraytxt.push(cells[c].type);
	for (let t in types) colorarray.push(`"${types[t][1]}"`);
	colorarray = `Color Array: [${colorarray}]<br>Grid Dimensions: ${rowNums}x${rowNums}<br>Cell Dimensions: ${rowsize} px`

	document.getElementById('arraytext').value = "[" + arraytxt + "]";
	document.getElementById('colorArray').innerHTML = colorarray;
	canvas_div.style.visibility = 'hidden';
	conf_div.style.visibility = 'hidden';
	text_div.style.visibility = 'visible';
}

changeArraySize()
draw();

canvas.addEventListener('mousedown', (event) => {
	mousex = event.clientX - canvas.getBoundingClientRect().x;
	mousey = event.clientY - canvas.getBoundingClientRect().y;
	clicked = true;
});

canvas.addEventListener('mousemove', (event) => {
	if (clicked){
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
	mousex = event.touches[0].clientX - canvas.getBoundingClientRect().x;
	mousey = event.touches[0].clientY - canvas.getBoundingClientRect().y;
	clicked = true;
}, { passive: true});

canvas.addEventListener('touchmove', (event) => {
	if (clicked){
		mousex = event.touches[0].clientX - canvas.getBoundingClientRect().x;
		mousey = event.touches[0].clientY - canvas.getBoundingClientRect().y;
	}
}, { passive: true});

document.addEventListener('touchend', (event) => {
	mousex = undefined;
	mousey = undefined;
	clicked = false;
}, { passive: true});