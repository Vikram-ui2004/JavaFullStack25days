let count = 0;
let value = document.getElementById("value");
let increment = document.getElementById("incre");
let decrement = document.getElementById("decre");
let reset = document.getElementById("reset");

function update(){
    value.innerHTML = count;
}

increment.addEventListener("click", ()=>{
    count++;
    update();
})
decrement.addEventListener("click", ()=>{
    count--;
    update();
})
reset.addEventListener("click", ()=>{
    count=0;
    update();
})

update();