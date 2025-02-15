// p5 Control software for the Alfa-Zeta XY5 Flipdot display
// Created by Yon Maor for Golan Levin's Creative Coding
// course (60-212) at Carnegie Mellon University, Fall 2024
//
// More info: https://github.com/yonmaor1/p5-flipdots 
// https://flipdots.com/en/products-services/flip-dot-boards-xy5/
// Requires the file: flipdot.js: 
// https://github.com/yonmaor1/p5-flipdots/blob/main/libs/flipdot.js
// Requires the p5.js and p5.serialport.js libraries:
// https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.0/p5.js
// https://cdn.jsdelivr.net/npm/p5.serialserver@0.0.28/lib/p5.serialport.js
//
// Instructions: 
// 1. Follow node package installation instructions at 
//    https://github.com/yonmaor1/p5-flipdots/blob/main/README.md
// 2. Connect powered XY5 to serial port via USB-to-RS485 connector
// 3. Launch serial communications server: `node golive.js`
// 4. Ensure ENABLE_TX is true in flipdot.js
// 5. Run this sketch in the browser, fiddle with the f_str expression!
//
// Developed with support from the Frank-Ratchye Further Fund 
// at the Frank-Ratchye STUDIO for Creative Inquiry at CMU
// Inspired by https://tixy.land/ by Martin Kleppe


const ENABLE_TX = false; // set to true to enable sending signals to flipdot display

let f_str = 'sin(t-sqrt((x-7.5)**2+(y-6)**2))';
let color_func = eval(`(x,y,i,t,P) => ${f_str}`);

let function_field;
let canvas;
let frames_since = 0;
let pixs = [];

//------------------------------------------------------------
function setup() {
    canvas = createCanvas(800, 600);
    frameRate(15);
    textFont('monospace');
    function_field = createElement('textarea');
    function_field.size(750, 100);
    function_field.position(20, height - 120);
    function_field.style('font-size', '16px');
    function_field.value(f_str);
    windowResized();

    for (let i = 0; i < NUM_COLS * NUM_ROWS; i++) {
        pixs.push(0);
    }
}

//------------------------------------------------------------
function draw() {
    background(0);
    noStroke();
    fill(64);
    rect(0, 0, width, height);

    draw_info();
    func_input();
    draw_tixy_grid(color_func);

    // commented out for demo purposes
    // tixy2display();
    
    frames_since += 1;
}

//------------------------------------------------------------
/**
 * @brief check if the provided string is a valid function
 * 
 * @param {string} f_str string to check
 * 
 * @returns {boolean} true if the provided string is a valid function
 */
function is_valid_function(f_str) {
    
    if (!f_str) {
        return false;
    }

    try {
        // try to create a new function with the provided string
        let test_f = new Function(`return (x, y, i, t, P) => ${f_str}`);
        let test_value = test_f()(0, 0, 0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0]);

        if (typeof test_value != 'number' && typeof test_value != 'boolean') {
            return false;
        }
        
        return true;
    } catch (e) {
        return false;
    }
}

//------------------------------------------------------------
/**
 * @brief eval the function from the input field
 */
function func_input() {

    let prev_f_str = f_str;
    f_str = function_field.value();
    f_str = parse_function(f_str);

    if (f_str == prev_f_str) {
        return;
    }
    if (is_valid_function(f_str)) {
        try {
            color_func = eval(`(x, y, i, t, P) => ${f_str}`);
            frames_since = 0;
            for (let i = 0; i < NUM_COLS * NUM_ROWS; i++) {
                pixs[i] = 0;
            }
        } catch (e) { // probably in the middle of typing
            try {
                color_func = eval(`(x, y, i, t, P) => ${prev_f_str}`);
                f_str = prev_f_str;
                for (let i = 0; i < NUM_COLS * NUM_ROWS; i++) {
                    pixs[i] = 0;
                }
            } catch (e) { // something went wrong
                color_func = () => 0; // fallback to a default function
                f_str = '0';
            }
        }
    } else {
        color_func = eval(`(x, y, i, t, P) => ${prev_f_str}`);
        f_str = prev_f_str;
        for (let i = 0; i < NUM_COLS * NUM_ROWS; i++) {
            pixs[i] = 0;
        }
    }

}

/**
 * @brief get the value of the pixel at index i, or 0 if i is out of bounds
 * 
 * @param {number} i index of the pixel
 * 
 * @returns {number} value of the pixel
 */
function getP(i) {
    // i = i % (NUM_COLS * NUM_ROWS);
    if (i < 0 || i >= NUM_COLS * NUM_ROWS) {
        return 0;
    }
    return pixs[i];
}

/**
 * @brief parse the function string to replace P[i] with getP(i)
 * 
 * @param {string} f_str function string
 * 
 * @returns {string} parsed function string
 */
function parse_function(f_str) {
    return f_str.replace(/P/g, 'getP').replace(/\[/g, '(').replace(/\]/g, ')');
}

//------------------------------------------------------------
/**
 * @brief resize the function input field
 */
function windowResized() {
    let canvasX = canvas.position().x;
    let canvasY = canvas.position().y;
    function_field.position(canvasX + 20, canvasY + height - 120);
}

//------------------------------------------------------------
/**
 * @brief draw the info text
 */
function draw_info() {
    noStroke();
    fill('white');
    textSize(16);
    let displayStr = "// input must be a valid javascript expression\n";
    displayStr += "(x,y,i,t,P) =>";
    text(displayStr, 20, height - 150);
}

//------------------------------------------------------------
/**
 * @brief draw the tixy grid
 * 
 * @param {function} f function to determine the color of each cell
 */
function draw_tixy_grid(f) {
    // clear the panels
    panel_0_bits = [];
    panel_1_bits = [];

    let P = pixs;
    let tmp_pixs = []
    for (let x = 0; x < NUM_COLS; x++) {
        for (let y = 0; y < NUM_ROWS; y++) {
            let i = x + y * NUM_COLS;
            let t = frames_since;
            // let P = get_prev_bits(i);
            
            let bit = draw_tixy_cell(x, y, i, t, P, f);
            tmp_pixs[i] = bit;
            // P[i] = bit;

            // if (y == 0) {
            //     panel_1_bits.push(0);
            // } else if (y == 7) {
            //     panel_2_bits.push(0);
            // }

            if (y < 7) {
                panel_1_bits.push(bit);
            } else {
                panel_0_bits.push(bit);
            }
        }
    }

    pixs = tmp_pixs;
}

//------------------------------------------------------------
/**
 * @brief draw a single tixy cell
 * 
 * @param {number} x x coordinate of the cell
 * @param {number} y y coordinate of the cell
 * @param {number} i index of the cell
 * @param {number} t current frame
 * @param {number[]} P previous bits
 * 
 * @returns {number} the value of the cell (0 or 1)
 */
function draw_tixy_cell(x, y, i, t, P, f) {
    let margin = 30;
    let gridAreaWidth = (width - 2 * margin);
    let cellSize = gridAreaWidth / NUM_COLS;

    let px = x * cellSize + (cellSize / 2) + margin;
    let py = y * cellSize + (cellSize / 2) + margin;

    let v = (f(x, y, i, t, P) > 0) ? 1 : 0;
    let c = v ? 'white' : 'black';

    fill(c);
    noStroke();
    circle(px, py, 0.9 * cellSize);
    return v;
}