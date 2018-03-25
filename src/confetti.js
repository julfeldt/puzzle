//canvas init
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
let confettiTimer;

//canvas dimensions
const W = window.innerWidth;
const H = window.innerHeight;
canvas.width = W;
canvas.height = H;

//snowflake particles
const mp = 200; //max particles
const particles = [];
for (let i = 0; i < mp; i++) {
    particles.push({
        x: Math.random() * W, //x-coordinate
        y: Math.random() * H, //y-coordinate
        r: Math.random() * 15 + 1, //radius
        d: Math.random() * mp, //density
        color: "rgba(" +
            Math.floor(Math.random() * 255) +
            ", " +
            Math.floor(Math.random() * 255) +
            ", " +
            Math.floor(Math.random() * 255) +
            ", 0.8)",
        tilt: Math.floor(Math.random() * 5) - 5
    });
}

//Lets draw the flakes
const draw = () => {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < mp; i++) {
        let p = particles[i];
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color; // Green path
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.tilt + p.r / 2, p.y + p.tilt);
        ctx.stroke(); // Draw it
    }

    update();
};

//Function to move the snowflakes
//angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
let angle = 0;

const update = () => {
    angle += 0.01;
    for (let i = 0; i < mp; i++) {
        let p = particles[i];
        //Updating X and Y coordinates
        //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
        //Every particle has its own density which can be used to make the downward movement different for each flake
        //Lets make it more random by adding in the radius
        p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
        p.x += Math.sin(angle) * 2;

        //Sending flakes back from the top when it exits
        //Lets make it a bit more organic and let flakes enter from the left and right also.
        if (p.x > W + 5 || p.x < -5 || p.y > H) {
            if (i % 3 > 0) {
                //66.67% of the flakes
                particles[i] = {
                    x: Math.random() * W,
                    y: -10,
                    r: p.r,
                    d: p.d,
                    color: p.color,
                    tilt: p.tilt
                };
            } else {
                //If the flake is exitting from the right
                if (Math.sin(angle) > 0) {
                    //Enter from the left
                    particles[i] = {
                        x: -5,
                        y: Math.random() * H,
                        r: p.r,
                        d: p.d,
                        color: p.color,
                        tilt: p.tilt
                    };
                } else {
                    //Enter from the right
                    particles[i] = {
                        x: W + 5,
                        y: Math.random() * H,
                        r: p.r,
                        d: p.d,
                        color: p.color,
                        tilt: p.tilt
                    };
                }
            }
        }
    }
};

export const showConfetti = () => {
    // Ensure potential already confettis are stopped
    if (confettiTimer) {
        clearTimeout(confettiTimer);
    }
    //animation loop
    confettiTimer = setInterval(draw, 30);
};