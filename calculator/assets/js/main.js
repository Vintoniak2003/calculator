function calcNumber(event, number1, number2) {
	const CALCED_OPERATION = {
		sum: number1 + number2,
		div: number1 / number2,
		multi: number1 * number2,
		sub: number1 - number2,
	};
	if (event === 'div' && number2 == 0) {
		return 'division by 0';
	}
	if (event in CALCED_OPERATION) {
		return CALCED_OPERATION[event];
	}
	return 'unknown operation';
}
const HEADER_SIZE = {
	17:'30px'
};
for (let i = 0; i <= 13; i++) {
	HEADER_SIZE[i] = `${96 - 5 * i}px`;
}
const OPERATIONS = {
	sum: {
		role: '+',
		action: 'sum',
		priority: 0,
	},
	div: {
		role: '/',
		action: 'div',
		priority: 1,
	},
	multi: {
		role: '*',
		action: 'multi',
		priority: 1,
	},
	sub: {
		role: '-',
		action: 'sub',
		priority: 0,
	},
};

let calcHeader = document.querySelector('.calc__header');
let calcHeaderValue = calcHeader.innerHTML;
let currentOperator = '';
let currentClick = null;
let previousClick = null;
let actions = [];

function onClickNumBtn(value) {
	if (!checkHeaderSize()) {
		return;
	}
	// start click 0
	if (previousClick === null && value === 0) {
		return;
	}
	currentClick = value;
	// when previous was opertion and current is value
	if (previousClick in OPERATIONS || previousClick === null) {
		actions.push(currentClick);
	} else {
		// when previous was value and current is value
		actions.push(+(String(actions.pop()) + String(value)));
	}
	calcHeader.innerHTML += currentClick;
	previousClick = currentClick;
	splitNull();
}

function onClickOperation(operation) {
	if (!checkHeaderSize()) {
		return;
	}
	if (operation in OPERATIONS) {
		currentClick = operation;

		if (previousClick === currentClick || (currentClick && !previousClick)) {
			return;
		}
		// click operation when previous was operation
		if (currentClick in OPERATIONS && previousClick in OPERATIONS) {
			actions.pop();
			actions.push(OPERATIONS[operation].role);
			calcHeader.innerHTML = actions.join('');
			return;
		}

		actions.push(OPERATIONS[operation].action);
		calcHeader.innerHTML += OPERATIONS[currentClick].role;
		previousClick = operation;
	}
	splitNull();
}
function onCalculate() {
	let result = '';

	// when last value was opertion
	if (actions[actions.length - 1] in OPERATIONS && actions.length > 1) {
		actions.pop();
	}
	// when only one item in actions
	if (actions.length === 1) {
		calcHeader.innerHTML = actions[0] in OPERATIONS ? 0 : actions;
		checkHeaderSize()
		return;
	}
	let getOperations = actions.filter(e => typeof e === 'string'); // find count of operations in actions
	let actionsCopy = [...actions];
	let operationsBlocks = [];
	let previousOperations = [];

	// break an array into blocks of operations
	getOperations.forEach((item, index) => {
		let operationBlock = [];
		let findOperator = '';
		let blockIndex = actionsCopy.indexOf(item); // get operator index in actions
		let getOperatorIndex = blockIndex === 0 ? 0 : 1; // if operator start with index 0, change block start index
		let getNumber2Index = blockIndex === 0 ? 1 : 2; // if operator start with index 0, change number2 index

		//get operator block by start,end index
		let block = actionsCopy.splice(
			blockIndex - getOperatorIndex,
			blockIndex + 2
		);

		// set number1,number2 and operator for operationBlock with correct value and operator
		operationBlock['number1'] = block[0];
		operationBlock['operator'] = block[getOperatorIndex];
		operationBlock['number2'] = block[getNumber2Index];

		findOperator = operationBlock['operator'];

		if (index > 0) {
			isPreviousSub = previousOperations['operator'] === 'sub';
			let previousNumber = isPreviousSub
				? previousOperations['number2'] * -1 // if the previous operation is sub, multy value to -1
				: previousOperations['number2'];
			operationBlock['number1'] = previousNumber; // set number1 for not first operation block (special for priority 1)
		}
			if(OPERATIONS[findOperator]){

				operationBlock['priority'] = OPERATIONS[findOperator].priority; // set priority to each block
			}
		operationsBlocks.push(operationBlock);
		previousOperations = operationBlock;
	});

	// sort by priority if operation contain priority 1
	if (operationsBlocks.find(item => item.priority > 0)) {
		operationsBlocks.sort((a, b) => b['priority'] - a['priority']);
	}

	// calculate each operartions
	console.log(operationsBlocks);
	operationsBlocks.forEach((item, index) => {
		// if calculate not dirst block, get result value previous block
		if (index > 0) {
			item['result'] = result;
		}
		// if number < 0 convert sub operator to sum  -number1 - number2 =  -(number1 + number2)
		if (item['result'] < 0 && item['operator'] === 'sub') {
			item['operator'] = OPERATIONS.sum.action;
		}
		// calculate number
		result = calcNumber(
			item['operator'],
			item[index > 0 ? 'result' : 'number1'],
			item[item.priority === 0 && index > 0 ? 'number1' : 'number2']
		);
	});
	// show result
	if (result || result === 0) {
		calcHeader.innerHTML = result;
	}else{
		calcHeader.innerHTML = 'Error';
	}
	checkHeaderSize()
}

function onClicClear() {
	actions = [];
	previousClick = null;
	currentClick = null;
	calcHeader.innerHTML = '0';
}
function onUnion() {
	// to be continued
}
function splitNull() {
	let arr = calcHeader.innerHTML;
	if (arr.startsWith(0)) {
		arr = arr.slice(1);
		calcHeader.innerHTML = calcHeaderValue = arr;
	}
}
function checkHeaderSize() {
	console.log(calcHeader.innerHTML.length)
	let actionsLength = calcHeader.innerHTML.length;
		if (HEADER_SIZE[actionsLength]) {
			calcHeader.style.fontSize = HEADER_SIZE[actionsLength];
		}
	return actionsLength < 15;
}
