import { writeFileSync } from 'fs';
import DecimalJS from 'decimal.js';
// ユーザー指定のパスからdecimal3.0_dev15を読み込み
import Decimal30 from './decimal3.0_dev15.mjs'; 

const NUM_QUESTIONS = 10000;

// ランダムな数値を文字列として生成する関数（整数部・小数部を不特定に）
function generateRandomNumberString() {
    const isMinus = Math.random() > 0.5 ? '-' : '';
    const intPart = Math.floor(Math.random() * 100000000).toString();
    const floatPart = Math.floor(Math.random() * 100000000).toString();
    return `${isMinus}${intPart}.${floatPart}`;
}

// 1万問の問題セットを生成
console.log(`Generating ${NUM_QUESTIONS} test cases...`);
const testCases = [];
for (let i = 0; i < NUM_QUESTIONS; i++) {
    const a = generateRandomNumberString();
    const b = generateRandomNumberString();
    // 割り算のゼロ除算防止（絶対起きないように適当な値に置換）
    const bDiv = b === '0' || b === '-0' || parseFloat(b) === 0 ? '1.2345' : b;
    testCases.push({ a, b, bDiv });
}

// decimal3.0の設定（仮にインスタンス化やグローバル設定が必要な場合の想定構造）
// ※もしクラス自体に設定関数がある場合は適宜合わせてください
const d30 = new Decimal30();
// もしインスタンス化不要のstaticクラスなら const d30 = Decimal30; に適宜修正してください

// 測定結果の格納用
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
    const maxDigits = Math.max(a.replace(/[-.]/g, '').length, b.replace(/[-.]/g, '').length);
    DecimalJS.set({ precision: maxDigits + 16 });
    new DecimalJS(a).add(b);
}
results['decimal.js'].add = performance.now() - start;

// 引き算
start = performance.now();
for (const { a, b } of testCases) {
    const maxDigits = Math.max(a.replace(/[-.]/g, '').length, b.replace(/[-.]/g, '').length);
    DecimalJS.set({ precision: maxDigits + 16 });
    new DecimalJS(a).sub(b);
}
results['decimal.js'].sub = performance.now() - start;

// 掛け算
start = performance.now();
for (const { a, b } of testCases) {
    const maxDigits = Math.max(a.replace(/[-.]/g, '').length, b.replace(/[-.]/g, '').length);
    DecimalJS.set({ precision: maxDigits + 16 });
    new DecimalJS(a).mul(b);
}
results['decimal.js'].mul = performance.now() - start;

// 割り算
start = performance.now();
for (const { a, bDiv } of testCases) {
    const maxDigits = Math.max(a.replace(/[-.]/g, '').length, bDiv.replace(/[-.]/g, '').length);
    DecimalJS.set({ precision: maxDigits + 16 });
    new DecimalJS(a).div(bDiv);
}
results['decimal.js'].div = performance.now() - start;


// ==========================================
// 👑 ENTRY NO.2: decimal3.0 dev15
// ==========================================
console.log('--- Running decimal3.0 dev15 ---');

// 精度を16桁に設定（メソッド名は既存の getprecision/setprecision に準拠）
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
    d30.div(a, bDiv);
}
results['decimal3.0'].div = performance.now() - start;


// ==========================================
// 📊 結果出力
// ==========================================
console.log('\n====== 🏆 BENCHMARK RESULTS (10,000 Questions) ======');
console.table({
    'Addition (加算)': {
        'decimal.js (ms)': results['decimal.js'].add.toFixed(2),
        'decimal3.0 (ms)': results['decimal3.0'].add.toFixed(2),
        'Winner': results['decimal.js'].add < results['decimal3.0'].add ? 'decimal.js' : 'decimal3.0 🔥'
    },
    'Subtraction (減算)': {
        'decimal.js (ms)': results['decimal.js'].sub.toFixed(2),
        'decimal3.0 (ms)': results['decimal3.0'].sub.toFixed(2),
        'Winner': results['decimal.js'].sub < results['decimal3.0'].sub ? 'decimal.js' : 'decimal3.0 🔥'
    },
    'Multiplication (乗算)': {
        'decimal.js (ms)': results['decimal.js'].mul.toFixed(2),
        'decimal3.0 (ms)': results['decimal3.0'].mul.toFixed(2),
        'Winner': results['decimal.js'].mul < results['decimal3.0'].mul ? 'decimal.js' : 'decimal3.0 🔥'
    },
    'Division (除算)': {
        'decimal.js (ms)': results['decimal.js'].div.toFixed(2),
        'decimal3.0 (ms)': results['decimal3.0'].div.toFixed(2),
        'Winner': results['decimal.js'].div < results['decimal3.0'].div ? 'decimal.js' : 'decimal3.0 🔥'
    }
});
