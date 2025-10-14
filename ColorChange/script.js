const colorBox = document.getElementById("colorBox");
const colorButtons = document.querySelectorAll(".color-button");

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const newColor = button.getAttribute("data-color");

    colorBox.style.backgroundColor = newColor;
  });
});
