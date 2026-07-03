import { writeFileSync } from 'fs';
import DecimalJS from 'decimal.js';
import Decimal30 from './decimal3.0_dev15.mjs';

const NUM_QUESTIONS = 100; // logはめちゃくちゃ重いため、100問にしてメモリ爆発を防ぐ
const TOTAL_DIGITS = 256;  // 256桁の超巨大な数値で対数計算

function generateHugePositiveNumberString() {
    // logの引数は正の数（> 0）である必要があるため、マイナスはなし
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
    
    return `${intPart}.${floatPart}`;
}

console.log(`Generating ${NUM_QUESTIONS} positive test cases (${TOTAL_DIGITS} digits total)...`);
const testCases = [];
for (let i = 0; i < NUM_QUESTIONS; i++) {
    testCases.push(generateHugePositiveNumberString());
}

const d30 = new Decimal30();

const results = {
    'decimal.js': 0,
    'decimal3.0': 0
};

// ==========================================
// 👑 ENTRY NO.1: decimal.js
// ==========================================
console.log('\n--- Running decimal.js (log) ---');

let start = performance.now();
for (const val of testCases) {
    // 256桁 + 精度16 = precision 272
    DecimalJS.set({ precision: 272 });
    new DecimalJS(val).ln(); // decimal.jsの自然対数は .ln()
}
results['decimal.js'] = performance.now() - start;


// ==========================================
// 👑 ENTRY NO.2: decimal3.0 dev15
// ==========================================
console.log('--- Running decimal3.0 dev15 (log) ---');

if (typeof d30.setprecision === 'function') {
    d30.setprecision(16);
}

start = performance.now();
for (const val of testCases) {
    // decimal3.0のlog関数（メソッド名が ln か log か、もしくは引数構成に合わせて適宜修正してください）
    if (typeof d30.log === 'function') {
        d30.log(val);
    } else if (typeof d30.ln === 'function') {
        d30.ln(val);
    }
}
results['decimal3.0'] = performance.now() - start;


// ==========================================
// 📊 結果出力
// ==========================================
console.log(`\n====== 🏆 BENCHMARK RESULTS (Natural Logarithm / ${TOTAL_DIGITS} Digits) ======`);
console.table({
    'Natural Logarithm (ln)': {
        'decimal.js(ms)': results['decimal.js'].toFixed(2),
        'decimal3.0(ms)': results['decimal3.0'].toFixed(2),
        'Winner': results['decimal.js'] < results['decimal3.0'] ? 'decimal.js 👑' : 'decimal3.0 🔥'
    }
});
