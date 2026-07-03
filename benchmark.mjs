import { writeFileSync } from 'fs';
import DecimalJS from 'decimal.js';
import Decimal30 from './decimal3.0_dev15.mjs';

const NUM_QUESTIONS = 10000;
const TOTAL_DIGITS = 65536;

function generateHugeNumberString() {
    const isMinus = Math.random() > 0.5 ? '-' : '';
    const floatLen = Math.floor(Math.random() * 16) + 1;
    const intLen = TOTAL_DIGITS - floatLen;
    
    let intPart = '';
    intPart += Math.floor(Math.random() * 9 + 1).toString();
    for (let i = 1; i < intLen; i++) {
        intPart += Math.floor(Math.random() * 10).toString();
    }
    
    let floatPart = '';
    for (let i = 0; i < floatLen; i++) {
        floatPart += Math.floor(Math.random() * 10).toString();
    }
    
    return `${isMinus}${intPart}.${floatPart}`;
}

console.log(`Generating ${NUM_QUESTIONS} test cases (${TOTAL_DIGITS} digits total, max 16 decimal places)...`);
const testCases = [];
for (let i = 0; i < NUM_QUESTIONS; i++) {
    const a = generateHugeNumberString();
    const b = generateHugeNumberString();
    
    let bDiv = generateHugeNumberString().replace('-', '');
    if (bDiv.startsWith('0.') || parseFloat(bDiv) === 0) {
        bDiv = '5.' + bDiv.split('.')[1];
    }
    
    testCases.push({ a, b, bDiv });
}

const d30 = new Decimal30();

const results = {
    'decimal.js': { add: 0, sub: 0, mul: 0, div: 0 },
    'decimal3.0': { add: 0, sub: 0, mul: 0, div: 0 }
};

console.log('\n--- Running decimal.js ---');

let start = performance.now();
for (const { a, b } of testCases) {
    DecimalJS.set({ precision: 272 });
    new DecimalJS(a).add(b);
}
results['decimal.js'].add = performance.now() - start;

start = performance.now();
for (const { a, b } of testCases) {
    DecimalJS.set({ precision: 272 });
    new DecimalJS(a).sub(b);
}
results['decimal.js'].sub = performance.now() - start;

start = performance.now();
for (const { a, b } of testCases) {
    DecimalJS.set({ precision: 272 });
    new DecimalJS(a).mul(b);
}
results['decimal.js'].mul = performance.now() - start;

start = performance.now();
for (const { a, bDiv } of testCases) {
    DecimalJS.set({ precision: 272 });
    new DecimalJS(a).div(bDiv);
}
results['decimal.js'].div = performance.now() - start;


console.log('--- Running decimal3.0 dev15 ---');

if (typeof d30.setprecision === 'function') {
    d30.setprecision(16);
}

start = performance.now();
for (const { a, b } of testCases) {
    d30.add(a, b);
}
results['decimal3.0'].add = performance.now() - start;

start = performance.now();
for (const { a, b } of testCases) {
    d30.sub(a, b);
}
results['decimal3.0'].sub = performance.now() - start;

start = performance.now();
for (const { a, b } of testCases) {
    d30.mul(a, b);
}
results['decimal3.0'].mul = performance.now() - start;

start = performance.now();
for (const { a, bDiv } of testCases) {
    d30.div(a, bDiv);
}
results['decimal3.0'].div = performance.now() - start;


console.log('\n====== 🏆 BENCHMARK RESULTS (256 Digits / 10,000 Questions) ======');
console.table({
    'Addition': {
        'decimal.js(ms)': results['decimal.js'].add.toFixed(2),
        'decimal3.0(ms)': results['decimal3.0'].add.toFixed(2),
        'Winner': results['decimal.js'].add < results['decimal3.0'].add ? 'decimal.js' : 'decimal3.0 🔥'
    },
    'Subtraction': {
        'decimal.js(ms)': results['decimal.js'].sub.toFixed(2),
        'decimal3.0(ms)': results['decimal3.0'].sub.toFixed(2),
        'Winner': results['decimal.js'].sub < results['decimal3.0'].sub ? 'decimal.js' : 'decimal3.0 🔥'
    },
    'Multiplication': {
        'decimal.js(ms)': results['decimal.js'].mul.toFixed(2),
        'decimal3.0(ms)': results['decimal3.0'].mul.toFixed(2),
        'Winner': results['decimal.js'].mul < results['decimal3.0'].mul ? 'decimal.js' : 'decimal3.0 🔥'
    },
    'Division': {
        'decimal.js(ms)': results['decimal.js'].div.toFixed(2),
        'decimal3.0(ms)': results['decimal3.0'].div.toFixed(2),
        'Winner': results['decimal.js'].div < results['decimal3.0'].div ? 'decimal.js' : 'decimal3.0 🔥'
    }
});
