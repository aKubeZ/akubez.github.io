class Point3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    scale(mult) {
        return new Point3D(this.x * mult, this.y * mult, this.z * mult);
    }

    projectToZ() {
        return new Point2D(this.x, this.y);
    }

    add(pos) {
        return new Point3D(this.x + pos.x, this.y + pos.y, this.z + pos.z);
    }

    sub(pos) {
        return new Point3D(this.x - pos.x, this.y - pos.y, this.z - pos.z);
    }

    dot(pos) {
        return pos.x * this.x + pos.y * this.y + pos.z * this.z;
    }

    cross(pos) {
        return new Point3D(
            this.y * pos.z - this.z * pos.y,
            this.z * pos.x - this.x * pos.z,
            this.x * pos.y - this.y * pos.x
        )
    }

    norm() {
        return Math.hypot(this.x, this.y, this.z);
    }
}

class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    scale(mult) {
        return new Point2D(this.x * mult, this.y * mult);
    }

    add(pos) {
        return new Point2D(this.x + pos.x, this.y + pos.y);
    }
}

/**
 * 3D MATRIX
 */
class Matrix {
    constructor(i, j, k) {
        this.i = i;
        this.j = j;
        this.k = k;
    }

    mult(vector) {
        return this.i.scale(vector.x).add(this.j.scale(vector.y)).add(this.k.scale(vector.z));
    }

    matMult(matrix) {
        return new Matrix(
            this.i.scale(matrix.i.x).add(this.j.scale(matrix.i.y)).add(this.k.scale(matrix.i.z)),
            this.i.scale(matrix.j.x).add(this.j.scale(matrix.j.y)).add(this.k.scale(matrix.j.z)),
            this.i.scale(matrix.k.x).add(this.j.scale(matrix.k.y)).add(this.k.scale(matrix.k.z)),
        );
    }
    
    transpose() {
        return new Matrix(
            coords3(this.i.x, this.j.x, this.k.x),
            coords3(this.i.y, this.j.y, this.k.y),
            coords3(this.i.z, this.j.z, this.k.z)
        )
    }
}

function coords2(x, y) {
    return new Point2D(x, y);
}

function coords3(x, y, z) {
    return new Point3D(x, y, z);
}

function unitVec(start, end) {
    const ray = end.sub(start);
    return ray.scale(1 / ray.norm());
}

function unit(vector) {
    return vector.scale(1 / vector.norm());
}

function valueToHex(brightness) {
    const mult = Math.floor(brightness * 0x100);
    let hex = 0x010101 * mult;
    if (hex > 0xffffff) hex = 0xffffff;
    return `#${hex.toString(16).padStart(6, '0')}`;
}

// for testing only
class CanvasEl {
    static pointRadius = 1;

    constructor(id) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext("2d");
    }

    drawPoint(pos, color) {
        if (!color) color = "black";
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pos.x - CanvasEl.pointRadius, pos.y - CanvasEl.pointRadius, CanvasEl.pointRadius * 2, CanvasEl.pointRadius * 2);
    }

    drawLine(pos1, pos2) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "green";
        this.ctx.lineWidth = CanvasEl.pointRadius * 2;
        this.ctx.moveTo(pos1.x, pos1.y);
        this.ctx.lineTo(pos2.x, pos2.y);
        this.ctx.stroke();
    }

    drawPath(...poses) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "blue";
        this.ctx.moveTo(poses[0]);
        for (let i = 1; i < poses.length; i++) {
            this.ctx.lineTo(poses[i]);
        }

        this.ctx.stroke();
    }

    fillPath(...poses) {
        this.ctx.beginPath();
        this.ctx.fillStyle = "red";
        this.ctx.moveTo(poses[0].x, poses[0].y);
        for (let i = 1; i < poses.length; i++) {
            this.ctx.lineTo(poses[i].x, poses[i].y);
        }

        this.ctx.fill();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// the real one
class AsciiCanvas {
    /**
     * Returns a character that corresponds to the brightness level
     * @param {*} brightness brightness level from 0-1
     */
    static getChar(brightness) {
        // brightness = brightness ** 2;
        const rand = Math.random();
        let list = [];
        if      (brightness <= 0.1) list = ['&nbsp;'];
        else if (brightness <= 0.2) list = ['.', ',', '&#39;', '-', '`', '_'];
        else if (brightness <= 0.3) list = ['+', '~', '&quot;', ':', ';'];
        else if (brightness <= 0.4) list = ['=', ';', '&lt;', '&gt;', '!', '/', '*'];
        else if (brightness <= 0.5) list = ['(', ')', '*', '[', ']', 'i', 'l', '^'];
        else if (brightness <= 0.6) list = ['f', 't', '{', '}'];
        else if (brightness <= 0.7) list = ['?', '1', '7', 'o', '8', '9'];
        else if (brightness <= 0.8) list = ['3', '4', '5', '6'];
        else if (brightness <= 0.9) list = ['@', '$', '#', '&amp;', 'I', 'O', 'Q', 'D', '?'];
        else if (brightness <= 1.0) list = ['%', 'R', 'G', 'Z', 'W', 'M', 'N'];
        return list[Math.floor(rand * list.length) % list.length];
    }

    static testGrad() {
        const grad = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
        let out = '';
        const length = 50;
        for (let i = 0; i < grad.length; i++) {
            let line = '';
            const brightness = grad[i];
            for (let j = 0; j < length; j++) {
                line += AsciiCanvas.getChar(brightness);
            }

            grad[i] = line;
            out += `${line}<br>`;
        }

        return out;
    }

    constructor(id, width, height) {
        this.canvas = document.getElementById(id);
        this.width = width;
        this.height = height;
        this.setPxSize();
        this.reset();
        this.render();
    }

    addPoint(pos, z, value) {
        value = (Math.exp(value) - 1) / (Math.E - 1);
        const pxPos = this.getPxPos(pos);
        if (this.outOfBounds(pxPos)) return;
        if (this.zMap[pxPos.y][pxPos.x] >= z) return;
        this.valueMap[pxPos.y][pxPos.x] = value;
        this.zMap[pxPos.y][pxPos.x] = z;
    }

    getPxPos(pos) {
        const pxPosX = Math.floor((pos.x + this.width / 2) / this.pxWidth);
        const pxPosY = Math.floor((pos.y + this.height / 2) / this.pxHeight);
        return coords2(pxPosX, pxPosY);
    }

    outOfBounds(pxPos) {
        if (pxPos.x < 0 || pxPos.x >= this.textWidth) return true;
        if (pxPos.y < 0 || pxPos.y >= this.textHeight) return true;
        return false
    }

    reset() {
        this.valueMap = [...Array(this.textHeight)].map(e => Array(this.textWidth).fill(0));
        this.zMap = [...Array(this.textHeight)].map(e => Array(this.textWidth).fill(Number.NEGATIVE_INFINITY));
    }

    setPxSize() {
        const borderWidth = this.canvas.style.borderWidth;
        this.canvas.style.borderWidth = '0';
        
        this.canvas.innerHTML = 'x';
        const rect = this.canvas.getBoundingClientRect();
        this.pxHeight = rect.height;
        this.pxWidth = rect.width;
        console.log(this.pxWidth, this.pxHeight);
        this.canvas.style.borderWidth = borderWidth;

        this.textWidth = Math.floor(this.width / this.pxWidth);
        this.textHeight = Math.floor(this.height / this.pxHeight);
    }

    render() {
        let output = '';
        for (let i = 0; i < this.valueMap.length; i++) {
            for (let j = 0; j < this.valueMap[i].length; j++)
                output += AsciiCanvas.getChar(this.valueMap[i][j]);
            output += '<br>';
        }

        this.canvas.innerHTML = output;
        this.reset();
    }
}

class Perspective {
    /**
     * @param {*} cameraDistance distance from plane to camera, infty for orthorgraphic
     */
    constructor(cameraDistance) {
        this.orthographic = (cameraDistance == Number.POSITIVE_INFINITY);
        this.cameraDistance = cameraDistance;
    }

    project(pos) {
        const mult = (this.orthographic ? 1 : this.cameraDistance / (pos.z + this.cameraDistance));
        return pos.projectToZ().scale(mult);
    }
}

class Renderer {
    constructor(cameraPos, canvasWidth, canvasHeight, canvasElId) {
        this.diff = 0.01;
        this.perspective = new Perspective(-cameraPos);
        this.cameraPos = cameraPos;
        if (canvasElId) {
            this.canvasEl = new CanvasEl(canvasElId);
        }
        this.canvas = new AsciiCanvas('canvas', canvasWidth, canvasHeight);
    }

    setSurfaceFunc(surfaceFunc, uLowerBound, uUpperBound, uDiff, vLowerBound, vUpperBound, vDiff) {
        this.surfaceFunc = surfaceFunc;
        this.uLowerBound = uLowerBound;
        this.uUpperBound = uUpperBound;
        this.vLowerBound = vLowerBound;
        this.vUpperBound = vUpperBound;
        this.uDiff = uDiff;
        this.vDiff = vDiff;
    }

    normalFunc(u, v) {
        const sU = surfaceFunc(u + this.diff, v).sub(surfaceFunc(u, v)).scale(1 / this.diff);
        const sV = surfaceFunc(u, v + this.diff).sub(surfaceFunc(u, v)).scale(1 / this.diff);
        let crossProd = sU.cross(sV).scale(1);
        return crossProd.scale(1 / crossProd.norm());
    };

    render() {
        if (this.canvasEl)
            this.canvasEl.clear();
        for (let u = this.uLowerBound; u < this.uUpperBound; u += this.uDiff) {
            for (let v = this.vLowerBound; v < this.vUpperBound; v += this.vDiff) {
                const point = this.surfaceFunc(u, v);
                const normal = this.normalFunc(u, v);
                const unitRay = this.cameraPos != Number.NEGATIVE_INFINITY ? unitVec(coords3(0, 0, this.cameraPos), point) : coords3(0, 0, 1);
                const projection = this.perspective.project(point);

                // from wikipedia it says the brightness is the cosine of the the included angle of the surface normal and the ray vector so dot product it is 
                const brightness = unitRay.dot(normal);
                if (brightness < 0) continue;
                if (this.canvasEl)
                    this.canvasEl.drawPoint(projection.add(coords2(this.canvasEl.canvas.width / 2, this.canvasEl.canvas.height / 2)), valueToHex(brightness));
                this.canvas.addPoint(projection, point.z, brightness);
            }
        }

        this.canvas.render();
    }
}
let cumRotMat = new Matrix(
    coords3(1, 0, 0),
    coords3(0, 1, 0),
    coords3(0, 0, 1),
);

// const cameraPos = -500
// const perspective = new Perspective(-cameraPos);
// const canvasEl = new CanvasEl('canvasel');
// const canvas = new AsciiCanvas('canvas', 500, 500);

const r = 200;
const R = 100;
const surfaceFunc = (theta, phi) => cumRotMat.mult(coords3(
    (r + R * Math.cos(phi)) * Math.cos(theta),
    (r + R * Math.cos(phi)) * Math.sin(theta),
    R * Math.sin(phi)
));

const renderer = new Renderer(Number.NEGATIVE_INFINITY, 700, 700, 'canvasel');
renderer.setSurfaceFunc(surfaceFunc, 0, 2 * Math.PI, 0.04, 0, 2 * Math.PI, 0.08);

renderer.render();

// function getRotMat(axis, angle) {
//     const pitchRotMat = new Matrix(
//         coords3(1, 0, 0),
//         coords3(0, -Math.sin(angle), Math.cos(angle)),
//         coords3(0, Math.cos(angle), Math.sin(angle))
//     )

//     if ()

//     const iHat = coords3(1, 0, 0);
//     let axis = coords3(1, 2, 3);
//     axis = axis.scale(1 / axis.norm());
//     const basisMatrix = new Matrix(
//         unit(axis),
//         unit(axis.cross(iHat)),
//         unit(axis.scale(axis.dot(iHat)).sub(iHat))
//     );

//     const rotMat = basisMatrix.mult(pitchRotMat).mult(basisMatrix.transpose());
//     return rotMat;
// }

let upKey = false;
let downKey = false;
let rightKey = false;
let leftKey = false;

window.addEventListener('keydown', (event) => {
    if (event.key == 'ArrowUp') upKey = true;
    else if (event.key == 'ArrowDown') downKey = true;
    else if (event.key == 'ArrowLeft') leftKey = true;
    else if (event.key == 'ArrowRight') rightKey = true;
});

window.addEventListener('keyup', (event) => {
    if (event.key == 'ArrowUp') upKey = false;
    else if (event.key == 'ArrowDown') downKey = false;
    else if (event.key == 'ArrowLeft') leftKey = false;
    else if (event.key == 'ArrowRight') rightKey = false;
});

let omegaY = 0;
let omegaX = 0;
window.setInterval(() => {
    omegaY += 0.01 * (upKey && !downKey ? 1 : downKey && !upKey ? -1 : 0);
    omegaX += 0.01 * (leftKey && !rightKey ? 1 : rightKey && !leftKey ? -1 : 0);
    omegaY *= 0.98;
    omegaX *= 0.98;

    const rotMatY = new Matrix(
        coords3(1, 0, 0),
        coords3(0, Math.cos(omegaY), Math.sin(omegaY)),
        coords3(0, -Math.sin(omegaY), Math.cos(omegaY))
    );

    const rotMatX = new Matrix(
        coords3(Math.cos(omegaX), 0, Math.sin(omegaX)),
        coords3(0, 1, 0),
        coords3(-Math.sin(omegaX), 0, Math.cos(omegaX))
    );

    rotMat = rotMatY.matMult(rotMatX);
    cumRotMat = rotMat.matMult(cumRotMat);
    renderer.render();
}, 60);

// it's 5am i lit have to sleep

// const surfaceFunc = (theta, phi) => coords3(
//     200 * Math.cos(theta) * Math.sin(phi),
//     -200 * Math.cos(phi),
//     200 * Math.sin(theta) * Math.sin(phi) + 150,
// );