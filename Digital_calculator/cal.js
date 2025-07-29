const display = document.getElementById("main-display");
const secDisplay = document.getElementById("secondary-display");

document.querySelectorAll(".mode").forEach(button => {
  button.addEventListener("click", () => {
    const mode = button.textContent.toLowerCase();
    document.body.className = mode;
  });
});

document.querySelectorAll(".sci").forEach(btn => {
  btn.addEventListener("click", () => {
    let val = btn.textContent;
    switch (val) {
      case "π":
        display.textContent += Math.PI.toFixed(6);
        break;
      case "e":
        display.textContent += Math.E.toFixed(6);
        break;
      case "√":
        display.textContent = Math.sqrt(eval(display.textContent));
        break;
      case "sin":
        display.textContent = Math.sin(eval(display.textContent)).toFixed(4);
        break;
      case "cos":
        display.textContent = Math.cos(eval(display.textContent)).toFixed(4);
        break;
      case "tan":
        display.textContent = Math.tan(eval(display.textContent)).toFixed(4);
        break;
      case "log":
        display.textContent = Math.log10(eval(display.textContent)).toFixed(4);
        break;
      case "^":
        display.textContent += "**";
        break;
    }
  });
});

document.querySelectorAll(".buttons button:not(.sci):not(.mode)").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.textContent;

  if (val === "=") {
    try {
      secDisplay.textContent = display.textContent;
      const result = eval(display.textContent);

      if (
        result === Infinity || result === -Infinity || 
        isNaN(result) || !isFinite(result)
      ) {
        showError("Error");
      } else {
        display.textContent = result;
      }

    }catch {
    showError("Error");
    }
  }

    

    else if (val === "AC") {
      display.textContent = "0";
      secDisplay.textContent = "";
    } else if (val === "DEL") {
      display.textContent = display.textContent.slice(0, -1) || "0";
    } else {
      if (display.textContent === "0" || display.textContent === "Error") {
        display.textContent = val;
      } else {
        display.textContent += val;
      }
    }
  });
});
function showError(message) {
  display.textContent = message;
  display.classList.add("error-animate");

  setTimeout(() => {
    display.classList.remove("error-animate");
  }, 1000);
}


