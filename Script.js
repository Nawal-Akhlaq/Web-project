
function Submit() {
    let name = document.getElementById("Name").value;
    let email = document.getElementById("Email").value;
    let phoneNumber = document.getElementById("Phone").value;
    let msg = document.getElementById("TextMessage").value;
    alert(`Congrats! ${name}, your data is Submitted.\n\nName:${name} \n Email:${email} \n Phone Number:${phoneNumber}\nMessage:${msg}`)
}

function LoadFigures() {
    let counter1 = 0, counter2 = 0;
    let counter_1 = document.getElementById("counter_1");
    let counter_2 = document.getElementById("counter_2");


    let projectsCounter = setInterval(function() {
            counter1++;
            counter_1.innerText = counter1 + "K+";

            if(counter1 >= 21) {   
                clearInterval(projectsCounter);    
            }
        }, 200);

    let clientsCounter = setInterval(function() {
        counter2++;
        counter_2.innerText = counter2;
        if(counter2 >= 225) {
            clearInterval(clientsCounter);    
        }
    }, 25);
}
LoadFigures();

let roles = ["PLAYER", "CODER", "PERSON", "WoMAN", "ARTIST", "STUDENT", "WORKER"]
let AnimatedName = document.getElementById("AnimatedName");
let Names = setInterval(function () {
    let randomNum = Math.floor(Math.random() * roles.length);
    AnimatedName.innerText = roles[randomNum];
}, 2000)