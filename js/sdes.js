import { permute, leftShift, xor, bitArrayToString } from './utils.js';

// ==========================================
// 1. MATRIKS KONSTANTA STANDAR S-DES
// ==========================================
const P10 = [3, 5, 2, 7, 4, 10, 1, 9, 8, 6];
const P8 = [6, 3, 7, 4, 8, 5, 10, 9];
const P4 = [2, 4, 3, 1];
const EP = [4, 1, 2, 3, 2, 3, 4, 1];

const IP = [2, 6, 3, 1, 4, 8, 5, 7];
const IP_INV = [4, 1, 3, 5, 7, 2, 8, 6];

// Matriks S-Box (Array 2 Dimensi)
const S0 = [
    [1, 0, 3, 2],
    [3, 2, 1, 0],
    [0, 2, 1, 3],
    [3, 1, 3, 2]
];

const S1 = [
    [0, 1, 2, 3],
    [2, 0, 1, 3],
    [3, 0, 1, 0],
    [2, 1, 0, 3]
];

// ==========================================
// 2. FUNGSI PEMBANGKITAN KUNCI (KEY GENERATION)
// ==========================================
/**
 * Menghasilkan K1 dan K2 dari Kunci 10-bit awal beserta log langkahnya.
 * @param {string} rawKey - 10-bit string (misal: "1010000010")
 * @returns {object} - Berisi K1, K2, dan object log untuk UI
 */
export function generateKeys(rawKey) {
    const stepsLog = {};
    const keyArray = rawKey.split('').map(Number);
    stepsLog.keyAwal = bitArrayToString(keyArray);

    // Langkah 1: Permutasi P10
    const afterP10 = permute(keyArray, P10);
    stepsLog.p10 = bitArrayToString(afterP10);

    // Langkah 2: Bagi menjadi Kiri (L) dan Kanan (R) masing-masing 5 bit
    let left = afterP10.slice(0, 5);
    let right = afterP10.slice(5, 10);
    stepsLog.p10Left = bitArrayToString(left);
    stepsLog.p10Right = bitArrayToString(right);

    // Langkah 3: Left Shift 1 (LS-1) pada kedua bagian
    const leftLS1 = leftShift(left, 1);
    const rightLS1 = leftShift(right, 1);
    stepsLog.ls1Left = bitArrayToString(leftLS1);
    stepsLog.ls1Right = bitArrayToString(rightLS1);

    // Langkah 4: Gabungkan hasil LS-1 lalu Permutasi P8 untuk dapat K1
    const combinedLS1 = [...leftLS1, ...rightLS1];
    const K1 = permute(combinedLS1, P8);
    stepsLog.k1 = bitArrayToString(K1);

    // Langkah 5: Left Shift 2 (LS-2) dari posisi status LS-1
    const leftLS2 = leftShift(leftLS1, 2);
    const rightLS2 = leftShift(rightLS1, 2);
    stepsLog.ls2Left = bitArrayToString(leftLS2);
    stepsLog.ls2Right = bitArrayToString(rightLS2);

    // Langkah 6: Gabungkan hasil LS-2 lalu Permutasi P8 untuk dapat K2
    const combinedLS2 = [...leftLS2, ...rightLS2];
    const K2 = permute(combinedLS2, P8);
    stepsLog.k2 = bitArrayToString(K2);

    return { K1, K2, logs: stepsLog };
}