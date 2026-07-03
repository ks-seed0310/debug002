import { writeFileSync } from 'fs';
import DecimalJS from 'decimal.js';
import Decimal30 from './decimal3.0_dev15.mjs'; 

const NUM_QUESTIONS = 10000;
const TOTAL_DIGITS = 256; // 全体の桁数は256桁

// 【完全修正】精度16桁（prec=16）に完璧に適合させた256桁文字列生成
function generateHugeNumberString() {
    const isMinus = Math.random() > 0.5 ? '-' : '';
    
    // 小数部は prec=16 に合わせて最大16桁の乱数にする
    const floatLen = Math.floor(Math.random() * 16) + 1; 
    // 残りの桁（240桁以上）をすべて整数部に割り振って、確実に全体で256桁にする
    const intLen = TOTAL_DIGITS - floatLen;
    
    let intPart = '';
    // 先頭の数字が0にならないようにする
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

// 正しい問題セットを安全に生成
console.log(`Generating ${NUM_QUESTIONS} test cases (${TOTAL_DIGITS} digits total, max 16 decimal places)...`);
const testCases = [];
for (let i = 0; i < NUM_QUESTIONS; i++) {
    const a = generateHugeNumberString();
    const b = generateHugeNumberString();
    
    // 割り算の分母用（分母が極小値や0にならないように調整）
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

// ==========================================
// 👑 ENTRY NO.1: decimal.js
// ==========================================
console.log('\n--- Running decimal.js ---');

// 足し算
let start = performance.now();
for (const { a, b } of testCases) {
    // 256桁の計算で精度16を担保するため、precisionは272で固定
    DecimalJS.set({ precision: 272 });
    new DecimalJS(a).add(b);
}
results['decimal.js'].add = performance.now() - start;

// 引き算
start = performance.now();
for (const { a, b } of testCases) {
    DecimalJS.set({ precision: 272 });
    new DecimalJS(a).sub(b);
}
results['decimal.js'].sub = performance.now() - start;

// 掛け算
start = performance.now();
for (const { a, b } of testCases) {
    DecimalJS.set({ precision: 272 });
    new DecimalJS(a).mul(b);
}
results['decimal.js'].mul = performance.now() - start;

// 割り算
start = performance.now();
for (const { a, bDiv } of testCases) {
    DecimalJS.set({ precision: 272 });
    new DecimalJS(a).div(bDiv);
}
results['decimal.js'].div = performance.now() - start;


// ==========================================
// 👑 ENTRY NO.2: decimal3.0 dev15
// ==========================================
console.log('--- Running decimal3.0 dev15 ---');

// decimal3.0の精度を16桁に設定
if (typeof d30.setprecision === 'function') {
    d30.setprecision(16);
}

// 足し算
start = performance.now();
for (const { a, b } of testCases) {
    d30.add(a, b);
}
results['decimal3.0'].add = performance.now() - start;

// 引き算
start = performance.now();
for (const { a, b } of testCases) {
    d30.sub(a, b);
}
results['decimal3.0'].sub = performance.now() - start;

// 掛け算
start = performance.now();
for (const { a, b } of testCases) {
    d30.mul(a, b);
}
results['decimal3.0'].mul = performance.now() - start;

// 割り算
start = performance.now();
for (const { a, bDiv } of testCases) {
    d
