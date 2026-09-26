const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const message = document.querySelector("#message");
const keypad = document.querySelector(".keypad");
const sprite = document.querySelector("#brand-sprite");

let currentInput = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;

function drawSprite() {
  const pixels = [
    "00111100",
    "01111110",
    "11000011",
    "10100101",
    "10111101",
    "10000001",
    "01111110",
    "00100100",
  ];
  const context = sprite.getContext("2d");

  pixels.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      if (pixel === "1") {
        context.fillStyle = y === 3 && x > 1 && x < 6 ? "#ffc47d" : "#b3f4c8";
        context.fillRect(x, y, 1, 1);
      }
    });
  });
}

function render() {
  display.textContent = currentInput;
}

function setMessage(text, isError = false) {
  message.textContent = text;
  message.dataset.state = isError ? "error" : "ready";
}

function clear() {
  currentInput = "0";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = false;
  expression.textContent = "LISTA PARA CALCULAR";
  setMessage("API DE OPERACIONES CONECTADA");
  render();
}

function inputDigit(digit) {
  if (waitingForOperand) {
    currentInput = digit;
    waitingForOperand = false;
  } else if (currentInput.replace("-", "").length < 14) {
    currentInput = currentInput === "0" ? digit : currentInput + digit;
  }
  setMessage("API DE OPERACIONES CONECTADA");
  render();
}

function inputDecimal() {
  if (waitingForOperand) {
    currentInput = "0.";
    waitingForOperand = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }
  render();
}

async function requestCalculation(left, right, operator) {
  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ left, right, operator }),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "No se pudo completar el cálculo.");
  }

  return payload.result;
}

async function chooseOperator(operator) {
  const inputValue = Number(currentInput);

  if (pendingOperator && !waitingForOperand) {
    try {
      currentInput = String(await requestCalculation(storedValue, inputValue, pendingOperator));
      storedValue = Number(currentInput);
      render();
    } catch (error) {
      setMessage(error.message, true);
      return;
    }
  } else {
    storedValue = inputValue;
  }

  pendingOperator = operator;
  waitingForOperand = true;
  expression.textContent = `${currentInput} ${operator}`;
  setMessage("OPERADOR SELECCIONADO");
}

async function equals() {
  if (!pendingOperator || waitingForOperand) return;

  const left = storedValue;
  const right = Number(currentInput);
  const operator = pendingOperator;
  expression.textContent = `${left} ${operator} ${right} =`;

  try {
    currentInput = String(await requestCalculation(left, right, operator));
    storedValue = null;
    pendingOperator = null;
    waitingForOperand = true;
    setMessage("CÁLCULO COMPLETADO");
    render();
  } catch (error) {
    setMessage(error.message, true);
  }
}

function handleAction(action, value) {
  if (action === "digit") inputDigit(value);
  if (action === "decimal") inputDecimal();
  if (action === "clear") clear();
  if (action === "backspace") {
    currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
    if (currentInput === "-") currentInput = "0";
    waitingForOperand = false;
    render();
  }
  if (action === "sign" && currentInput !== "0") {
    currentInput = currentInput.startsWith("-") ? currentInput.slice(1) : `-${currentInput}`;
    render();
  }
  if (action === "operator") void chooseOperator(value);
  if (action === "equals") void equals();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button) handleAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key)) handleAction("digit", event.key);
  else if (event.key === ".") handleAction("decimal");
  else if (["+", "-", "*", "/"].includes(event.key)) handleAction("operator", event.key);
  else if (event.key === "Enter" || event.key === "=") handleAction("equals");
  else if (event.key === "Backspace") handleAction("backspace");
  else if (event.key === "Escape") handleAction("clear");
  else return;

  event.preventDefault();
});

drawSprite();
render();