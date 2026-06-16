// ==========================================
// CONFIGURASI MATRIKS STANDAR S-DES [cite: 95]
// ==========================================
const P10 = [3, 5, 2, 7, 4, 10, 1, 9, 8, 6]; // [cite: 29]
const P8 = [6, 3, 7, 4, 8, 5, 10, 9];         // [cite: 32]
const IP = [2, 6, 3, 1, 4, 8, 5, 7];          // [cite: 35]
const IP_INV = [4, 1, 3, 5, 7, 2, 8, 6];      // [cite: 50]
const EP = [4, 1, 2, 3, 2, 3, 4, 1];          // [cite: 38]
const P4 = [2, 4, 3, 1];                      // [cite: 42]

const S0 = [ // [cite: 41, 95]
    [1, 0, 3, 2],
    [3, 2, 1, 0],
    [0, 2, 1, 3],
    [3, 1, 3, 2]
];

const S1 = [ // [cite: 41, 95]
    [0, 1, 2, 3],
    [2, 0, 1, 3],
    [3, 0, 1, 0],
    [2, 1, 0, 3]
];

// ==========================================
// FUNGSI UTILITAS MATEMATIS BINER
// ==========================================
function permute(input, table) {
    return table.map(pos => input[pos - 1]).join('');
}

function leftShift(bits, n) {
    return bits.substring(n) + bits.substring(0, n);
}

function xor(bits1, bits2) {
    let result = "";
    for (let i = 0; i < bits1.length; i++) {
        result += bits1[i] === bits2[i] ? "0" : "1";
    }
    return result;
}

function lookupSBox(bits, box) {
    const row = parseInt(bits[0] + bits[3], 2);
    const col = parseInt(bits[1] + bits[2], 2);
    const val = box[row][col];
    return val.toString(2).padStart(2, '0');
}

// ==========================================
// LOGIKA INTI ALGORITMA S-DES
// ==========================================
function generateKeys(keyAwal) {
    const p10Result = permute(keyAwal, P10); // [cite: 29]
    const left0 = p10Result.substring(0, 5); // [cite: 30]
    const right0 = p10Result.substring(5, 10); // [cite: 30]

    const ls1Left = leftShift(left0, 1); // [cite: 31]
    const ls1Right = leftShift(right0, 1); // [cite: 31]
    const k1 = permute(ls1Left + ls1Right, P8); // [cite: 32]

    const ls2Left = leftShift(ls1Left, 2); // [cite: 33]
    const ls2Right = leftShift(ls1Right, 2); // [cite: 33]
    const k2 = permute(ls2Left + ls2Right, P8); // [cite: 33]

    return {
        keyAwal, p10: p10Result,
        p10Left: left0, p10Right: right0,
        ls1Left, ls1Right, k1,
        ls2Left, ls2Right, k2
    };
}

function runRound(left, right, key) {
    const epResult = permute(right, EP); // [cite: 38]
    const xorKeyResult = xor(epResult, key); // [cite: 39]

    const s0Input = xorKeyResult.substring(0, 4); // [cite: 40]
    const s1Input = xorKeyResult.substring(4, 8); // [cite: 40]

    const s0Output = lookupSBox(s0Input, S0); // [cite: 41]
    const s1Output = lookupSBox(s1Input, S1); // [cite: 41]

    const p4Result = permute(s0Output + s1Output, P4); // [cite: 42]
    const afterXorLeft = xor(p4Result, left); // [cite: 43]

    return {
        ep: epResult,
        xorKey: xorKeyResult,
        s0Input, s0Output,
        s1Input, s1Output,
        p4: p4Result,
        afterXorLeft
    };
}

function processSDES(data, key, mode) {
    const keyLogs = generateKeys(key);
    const k1 = keyLogs.k1;
    const k2 = keyLogs.k2;

    const ipResult = permute(data, IP); // [cite: 35]
    const ipLeft = ipResult.substring(0, 4); // [cite: 36]
    const ipRight = ipResult.substring(4, 8); // [cite: 36]

    // Jalur kunci dibalik tergantung Enkripsi / Dekripsi [cite: 39, 47]
    const round1Key = mode === 'encrypt' ? k1 : k2;
    const round2Key = mode === 'encrypt' ? k2 : k1;

    // Round 1 [cite: 37]
    const round1Logs = runRound(ipLeft, ipRight, round1Key);

    // Swap (SW) setelah Round 1 [cite: 45]
    const swapLeft = ipRight;
    const swapRight = round1Logs.afterXorLeft;

    // Round 2 [cite: 46]
    const round2Logs = runRound(swapLeft, swapRight, round2Key);

    // Hasil Akhir Round 2 (L2 + R2) Tanpa Swap Lagi [cite: 48]
    const beforeInverseIP = round2Logs.afterXorLeft + swapRight; // [cite: 44]
    const ciphertext = permute(beforeInverseIP, IP_INV); // [cite: 50]

    return {
        output: ciphertext,
        logs: {
            keyGeneration: keyLogs,
            ip: ipResult,
            ipLeft, ipRight,
            round1: round1Logs,
            round1OutLeft: round1Logs.afterXorLeft,
            round1OutRight: ipRight,
            swapLeft, swapRight,
            round2: round2Logs,
            beforeInverseIP,
            ciphertext
        }
    };
}

// ==========================================
// MANIPULASI ANTARMUKA DOM (UI/UX)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const sdesForm = document.getElementById('sdesForm');
    const inputData = document.getElementById('inputData');
    const inputKey = document.getElementById('inputKey');
    const resultSection = document.getElementById('resultSection');
    const finalOutput = document.getElementById('finalOutput');
    const btnToggleSolusi = document.getElementById('btnToggleSolusi');
    const solutionDetail = document.getElementById('solutionDetail');

    if (!sdesForm) return;

    sdesForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Menghentikan reload halaman bawaan HTML

        const dataValue = inputData.value.trim();
        const keyValue = inputKey.value.trim();
        const mode = document.querySelector('input[name="mode"]:checked').value;

        // Validasi input biner [cite: 21]
        if (!/^[01]{8}$/.test(dataValue)) {
            alert('Input Data harus berupa 8-bit biner (contoh: 10100101)');
            return;
        }
        if (!/^[01]{10}$/.test(keyValue)) {
            alert('Kunci / Key harus berupa 10-bit biner (contoh: 1010000010)');
            return;
        }

        // Jalankan kalkulasi S-DES
        const result = processSDES(dataValue, keyValue, mode);

        // Munculkan kontainer hasil [cite: 55]
        resultSection.classList.remove('hidden');
        finalOutput.innerHTML = generateBitHTML(result.output); // [cite: 51]

        // Render detail teks langkah-demi-langkah [cite: 60]
        renderDetailedSolution(result.logs, dataValue, keyValue, mode);

        // Reset toggle solusi agar tertutup secara default [cite: 58]
        solutionDetail.classList.add('hidden');
        btnToggleSolusi.textContent = 'Tampilkan Solusi Penyelesaian';
    });

    sdesForm.addEventListener('reset', function () { // [cite: 23]
        resultSection.classList.add('hidden');
        solutionDetail.classList.add('hidden');
    });

    btnToggleSolusi.addEventListener('click', function () { // [cite: 58]
        if (solutionDetail.classList.contains('hidden')) {
            solutionDetail.classList.remove('hidden');
            btnToggleSolusi.textContent = 'Sembunyikan Solusi Penyelesaian';
            solutionDetail.scrollIntoView({ behavior: 'smooth' });
        } else {
            solutionDetail.classList.add('hidden');
            btnToggleSolusi.textContent = 'Tampilkan Solusi Penyelesaian';
        }
    });

    function generateBitHTML(bitString) { // [cite: 60]
        return `<div class="bit-row">` +
            bitString.split('').map(bit => `<span class="bit-box ${bit === '1' ? 'one' : 'zero'}">${bit}</span>`).join('') +
            `</div>`;
    }

    function renderDetailedSolution(logs, dataValue, keyValue, mode) { // [cite: 27, 60]
        const labelInput = mode === 'encrypt' ? 'Plaintext' : 'Ciphertext';
        const keyLogs = logs.keyGeneration;

        solutionDetail.innerHTML = `
            <div class="solution-block">
                <h3>🔑 FASE 1: PEMBANGKITAN KUNCI (KEY GENERATION) [cite: 28]</h3>
                <div class="step-item">
                    <p><strong>Kunci Awal (10-bit):</strong></p>
                    ${generateBitHTML(keyLogs.keyAwal)}
                </div>
                <div class="step-item">
                    <p><strong>Permutasi P10 [3, 5, 2, 7, 4, 10, 1, 9, 8, 6]:</strong></p>
                    ${generateBitHTML(keyLogs.p10)}
                </div>
                <div class="step-item">
                    <p><strong>Bagi Dua Bagian (Kiri & Kanan @5-bit):</strong></p>
                    <div class="flex-row">
                        <div>L: ${generateBitHTML(keyLogs.p10Left)}</div>
                        <div>R: ${generateBitHTML(keyLogs.p10Right)}</div>
                    </div>
                </div>
                <div class="step-item">
                    <p><strong>Circular Left Shift 1 (LS-1):</strong></p>
                    <div class="flex-row">
                        <div>L (LS-1): ${generateBitHTML(keyLogs.ls1Left)}</div>
                        <div>R (LS-1): ${generateBitHTML(keyLogs.ls1Right)}</div>
                    </div>
                </div>
                <div class="step-item">
                    <p><strong>Permutasi P8 [6, 3, 7, 4, 8, 5, 10, 9] ➔ KUNCI 1 (K1):</strong></p>
                    ${generateBitHTML(keyLogs.k1)}
                </div>
                <div class="step-item">
                    <p><strong>Dari status LS-1, lakukan Left Shift 2 (LS-2):</strong></p>
                    <div class="flex-row">
                        <div>L (LS-2): ${generateBitHTML(keyLogs.ls2Left)}</div>
                        <div>R (LS-2): ${generateBitHTML(keyLogs.ls2Right)}</div>
                    </div>
                </div>
                <div class="step-item">
                    <p><strong>Permutasi P8 ➔ KUNCI 2 (K2):</strong></p>
                    ${generateBitHTML(keyLogs.k2)}
                </div>
            </div>

            <div class="solution-block">
                <h3>⚙️ FASE 2: PROSES ${mode.toUpperCase()} (8-BIT DATA) [cite: 34]</h3>
                <div class="step-item">
                    <p><strong>Input ${labelInput} Awal:</strong></p>
                    ${generateBitHTML(dataValue)}
                </div>
                <div class="step-item">
                    <p><strong>Initial Permutation (IP) [2, 6, 3, 1, 4, 8, 5, 7]:</strong></p>
                    ${generateBitHTML(logs.ip)}
                </div>
                <div class="step-item">
                    <p><strong>Bagi Dua Bagian (Kiri & Kanan @4-bit):</strong></p>
                    <div class="flex-row">
                        <div>L0: ${generateBitHTML(logs.ipLeft)}</div>
                        <div>R0: ${generateBitHTML(logs.ipRight)}</div>
                    </div>
                </div>

                <h4 class="round-title">🔄 Round 1 (Menggunakan Kunci: ${mode === 'encrypt' ? keyLogs.k1 : keyLogs.k2}) [cite: 37]</h4>
                <div class="nested-step">
                    <p>• Ekspansi EP [4, 1, 2, 3, 2, 3, 4, 1] pada R0: <strong>${logs.round1.ep}</strong></p>
                    <p>• Hasil XOR dengan Kunci Round 1: <strong>${logs.round1.xorKey}</strong></p>
                    <p>• Masuk S-Box Kiri (S0) dengan input [${logs.round1.s0Input}] ➔ Hasil: <strong>${logs.round1.s0Output}</strong></p>
                    <p>• Masuk S-Box Kanan (S1) dengan input [${logs.round1.s1Input}] ➔ Hasil: <strong>${logs.round1.s1Output}</strong></p>
                    <p>• Gabungkan hasil S-Box & Permutasi P4 [2, 4, 3, 1]: <strong>${logs.round1.p4}</strong></p>
                    <p>• XOR hasil P4 dengan L0 awal ➔ L1 Baru: <strong>${logs.round1.afterXorLeft}</strong></p>
                </div>

                <div class="step-item highlight-swap" style="margin-top: 1rem;">
                    <p><strong>🔄 Fungsi SWAP (Tukar Posisi Kiri dan Kanan):</strong></p>
                    <div class="flex-row">
                        <div>L1 Baru (dari R0): ${generateBitHTML(logs.swapLeft)}</div>
                        <div>R1 Baru (dari L1): ${generateBitHTML(logs.swapRight)}</div>
                    </div>
                </div>

                <h4 class="round-title">🔄 Round 2 (Menggunakan Kunci: ${mode === 'encrypt' ? keyLogs.k2 : keyLogs.k1}) [cite: 46]</h4>
                <div class="nested-step">
                    <p>• Ekspansi EP pada R1 Baru: <strong>${logs.round2.ep}</strong></p>
                    <p>• Hasil XOR dengan Kunci Round 2: <strong>${logs.round2.xorKey}</strong></p>
                    <p>• Masuk S-Box Kiri (S0) dengan input [${logs.round2.s0Input}] ➔ Hasil: <strong>${logs.round2.s0Output}</strong></p>
                    <p>• Masuk S-Box Kanan (S1) dengan input [${logs.round2.s1Input}] ➔ Hasil: <strong>${logs.round2.s1Output}</strong></p>
                    <p>• Gabungkan hasil S-Box & Permutasi P4: <strong>${logs.round2.p4}</strong></p>
                    <p>• XOR hasil P4 dengan L1 Baru ➔ L2 Baru: <strong>${logs.round2.afterXorLeft}</strong></p>
                </div>
                <div class="step-item" style="margin-top: 1rem;">
                    <p><strong>Gabungan Hasil Akhir Round 2 (L2 + R1 Baru - Tanpa Swap Lagi):</strong></p>
                    ${generateBitHTML(logs.beforeInverseIP)}
                </div>
                <div class="step-item">
                    <p><strong>Inverse Initial Permutation (IP⁻¹) [4, 1, 3, 5, 7, 2, 8, 6] ➔ HASIL AKHIR:</strong></p>
                    ${generateBitHTML(logs.ciphertext)}
                </div>
            </div>
        `;
    }
});