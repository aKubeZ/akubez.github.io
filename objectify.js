class Pos2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * RETURNS A NEW ONE
     *  */
    scale(factor) {
        return new Pos2D(this.x * factor, this.y * factor);
    }

    /**
     * ADDS TO EXISTING ONE
     */
    addTo(x, y) {
        this.x += x;
        this.y += y;
    }

    clone() {
        return new Pos2D(this.x, this.y);
    }
}

class Object {
    static dragObject = null;
    static dragTimestamp = Date.now();
    static tickRate = 1 / 60;
    static decel = 0.9;
    static bounceDecel = 0.9;

    constructor(element) {
        objects.push(this);
        this.element = element;
        
        this.rect = element.getBoundingClientRect();
        element.style.minWidth = `${this.rect.width}px`;
        element.style.minHeight = `${this.rect.height}px`;

        this.pos = new Pos2D(
            this.rect.left,
            this.rect.top
        );

        element.classList.add('object');

        const colors = randHexPair();
        element.style.backgroundColor = colors[0];
        element.style.color = colors[1];
        this.v = new Pos2D(0, 0);
        this.min = new Pos2D(0, 0);
        this.max = new Pos2D(innerWidth, innerHeight);
        this.listeners();
        this.updatePos();
        this.newVs = [];
    }

    move(dx, dy, dt, mult) {
        const multiplier =  mult ? dt : 1;
        this.pos = new Pos2D(this.pos.x + dx * multiplier, this.pos.y + dy * multiplier);
        this.a = new Pos2D(dx - this.v.x, dy - this.v.y).scale(1 / Object.tickRate);
        this.v = new Pos2D(dx, dy).scale(1 / dt);

        this.physics();
        this.updatePos();
    }

    accel(x, y) {
        this.a = new Pos2D(x, y);
        this.v = new Pos2D(this.v.x + x * Object.tickRate, this.v.y + y * Object.tickRate).scale(Math.pow(Object.decel, Object.tickRate));
        this.pos = new Pos2D(this.pos.x + this.v.x * Object.tickRate, this.pos.y + this.v.y * Object.tickRate);
    }

    listeners() {
        this.dragging = false;
        this.element.addEventListener('mousedown', (event) => {
            this.dragging = true;
            Object.dragObject = this;
        });
    }

    physics() {
        let xFlip = false;
        let yFlip = false;

        if (this.v.x > 1000000) this.v.x = 1000000;
        if (this.v.x < -1000000) this.v.x = -1000000;
        if (this.v.y > 1000000) this.v.y = 1000000;
        if (this.v.y < -1000000) this.v.y = -1000000;


        if (this.pos.x < this.min.x) {
            this.pos.x = this.min.x;
            xFlip = true;
        }

        if (this.pos.x + this.rect.width > this.max.x) {
            this.pos.x = this.max.x - this.rect.width;
            xFlip = true;
        }

        if (this.pos.y < this.min.y) {
            this.pos.y = this.min.y;
            yFlip = true;
        }

        if (this.pos.y + this.rect.height > this.max.y) {
            this.pos.y = this.max.y - this.rect.height;
            yFlip = true;
        }

        if (xFlip) {
            this.v = new Pos2D(-this.v.x, this.v.y).scale(Object.bounceDecel);
        }

        if (yFlip) {
            this.v = new Pos2D(this.v.x, -this.v.y).scale(Object.bounceDecel);
        }

        this.checkCollisions();
        this.updatePos();
    }

    updateCollisions() {
        this.pos.addTo(this.collisionOffset.x, this.collisionOffset.y);

        let avgNewV = new Pos2D(0, 0);
        this.newVs.forEach((newV) => {
            avgNewV.addTo(newV.x / this.newVs.length, newV.y / this.newVs.length);
        });

        this.v = this.newVs.length == 0? this.v : avgNewV;
        this.newVs = [];
    }

    checkCollisions() {
        // oh god i have to code this now its 3:03 am....
        // hollyyy shit i finished it at 4:29 am fuck fuck fuck
        this.collisionOffset = new Pos2D(0, 0);
        objects.forEach((object) => {
            if (object == this) return;
            this.collide(object);
        });
    }

    collide(object) {
        const myLeft = this.pos.x;
        const myRight = this.pos.x + this.rect.width;
        const myTop = this.pos.y;
        const myBottom = this.pos.y + this.rect.height;

        const yourLeft = object.pos.x;
        const yourRight = object.pos.x + object.rect.width;
        const yourTop = object.pos.y;
        const yourBottom = object.pos.y + object.rect.height;

        const xIntersection = [
            Math.max(myLeft, yourLeft),
            Math.min(myRight, yourRight)
        ];

        const yIntersection = [
            Math.max(myTop, yourTop),
            Math.min(myBottom, yourBottom)
        ];

        const xIntersectLen = xIntersection[1] - xIntersection[0];
        const yIntersectLen = yIntersection[1] - yIntersection[0];

        if (xIntersectLen <= 0) return;
        if (yIntersectLen <= 0) return;

        if (xIntersectLen < yIntersectLen) {
            this.xFlip = true;
            if (myRight == xIntersection[1]) { // RIGHT COLL
                const midpoint = (myRight + yourLeft) / 2;
                this.collisionOffset.addTo(midpoint - myRight, 0);
            } else { // LEFT COLL
                const midpoint = (myLeft + yourRight) / 2;
                this.collisionOffset.addTo(midpoint - myLeft, 0);
            }
        } else {
            this.yFlip = true;
            if (myBottom == yIntersection[1]) { // BOTTOM COLL
                const midpoint = (myBottom + yourTop) / 2;
                this.collisionOffset.addTo(0, midpoint - myBottom);
            } else { // TOP COLL
                const midpoint = (myTop + yourBottom) / 2;
                this.collisionOffset.addTo(0, midpoint - myTop);
            }
        }

        object.newVs.push(this.v.scale(Object.bounceDecel));
    }

    updatePos() {
        this.element.style.left = (`${this.pos.x}px`);
        this.element.style.top = (`${this.pos.y}px`);
    }
    
    tick() {
        this.rect = this.element.getBoundingClientRect();
        this.element.style.minWidth = `${this.rect.width}px`;
        this.element.style.minHeight = `${this.rect.height}px`;
        this.max = new Pos2D(innerWidth, innerHeight);
        if (!this.dragging) this.accel(0, 670);
    }

    toggleSelectable(selectable) {
        this.element.setAttribute('contenteditable', selectable ? 'true' : 'false');
        if (selectable) this.element.classList.remove('unselectable');
        else this.element.classList.add('unselectable');
    }
    
    static globalDrag() {
        addEventListener('mouseup', (event) => {
            if (!Object.dragObject) return;
            Object.dragObject.dragging = false;
            Object.dragObject = null;
        })

        addEventListener('mousemove', (event) => {
            if (!Object.dragObject) {
                this.dragTimestamp = Date.now();
                return;
            }
            
            Object.dragObject.move(event.movementX, event.movementY, (Date.now() - this.dragTimestamp) / 1000, false);
            this.dragTimestamp = Date.now();
        })
    }
}

Object.globalDrag();

const objects = [];
let interval = setInterval(tick, 1000 / 60);

function randHexPair() {
    const num1 = Math.floor(0x1000 * Math.random());
    const num2 = 0xfff - num1;

    return [`#${num1.toString(16)}`, `#${num2.toString(16)}`];
}

function objectify(element) {
    element.classList.remove('victim');
    const object = new Object(element);
    return object;
}

function tick() {
    objects.forEach((object) => {
        try {
            object.tick();
        } catch (error) {
            console.log(error);
            clearInterval(interval);
        }
    });

    objects.forEach((object) => {
        try {
            object.physics();
        } catch (error) {
            console.log(error);
            clearInterval(interval);
        }
    });

    objects.forEach((object) => {
        try {
            object.updateCollisions();
        } catch (error) {
            console.log(error);
            clearInterval(interval);
        }
    });
}

const container = document.getElementById('container');
const objectifier = document.createElement('p');
let summons = 0;
objectifier.textContent = 'click mi';
objectifier.classList.add('objectifier');

let selectable = true;
addEventListener('keydown', (event) => {
    if (event.key != '\\' || !event.ctrlKey) return;
    objects.forEach((object) => {
        object.toggleSelectable(!selectable);
    });
    selectable = !selectable;
});

objectifier.addEventListener('mousedown', (event) => {
    const victimsList = Array.from(document.getElementsByClassName('victim'));
    // bounce decel
    if (summons == 2 && victimsList[0].textContent.charAt(0).toLowerCase() == 'n') Object.bounceDecel = 1;
    if (summons == 4 && victimsList[0].textContent.charAt(0).toLowerCase() == 'n') Object.decel = 1;

    summons++;
    victimsList.forEach((victim) => {
        if (victim.textContent.length <= 1) {
            container.removeChild(victim);
            return;
        };
        objectify(victim).toggleSelectable(selectable);
    });

    let nextText;
    switch (summons) {
        case 1 : {
            nextText = 'click again & also u can drag';
            break;
        };
        case 2 : {
            nextText = 'do you want bounce decel. (y/n) replace this text for the love of god';
            break;
        };
        case 3 : {
            nextText = 'if you didnt answer correctly there be friction ok';
            break;
        };
        case 4 : {
            nextText = 'do you want deceleration in general (y/n)';
            break;
        };
        case 5 : {
            nextText = 'if you didnt answer correctly thats a yes ok';
            break;
        };
        case 6 : {
            nextText = 'by the way that was the 6th time youve clicked';
            break;
        };
        case 7 : {
            nextText = 'holy 67 reference??????';
            break;
        };
        case 8: {
            nextText = 'im sowwy';
            break;
        };
        case 9 : {
            nextText = 'shift+enter and enter do NOT do the same thing by the way &&&& also u cant make it with 1 chars';
            break;
        };
        case 10 : {
            nextText = 'ctrl+baskslash does something i rthink';
            break;
        };
        case 11 : {
            nextText = 'i probably coded ts in the worst way possible';
            break;
        };
        case 12 : {
            nextText = 'youre legally not allowed to inspect element and change the code jajaja';
            break;
        };
        case 13 : {
            nextText = 'ok br i stop talking';
            break;
        };
        case 20 : {
            nextText = 'i hope the (y/n)\'s worked';
            break;
        };
        case 67 : {
            nextText = '67TH PRESS LES GO MANGO OR SOMETHING HELP ME SAVE ME LO SIENTO WILSON';
            break;
        };
        case 100 : {
            nextText = 'ok thats it im taking away your button haahhahha';
            break;
        };
        default: {
            nextText = 'text';
        }

    }
    
    const newVictim = document.createElement('p');
    newVictim.classList.add('victim');
    newVictim.textContent = nextText;
    container.insertBefore(newVictim, container.firstChild);
    if (summons == 100) document.body.removeChild(objectifier);
});

document.body.appendChild(objectifier);