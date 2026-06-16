/**
 * Fungsi Utama Permutasi
 * Mengatur ulang posisi bit berdasarkan tabel indeks (1-based index).
 * Fungsi ini sangat sakti karena bisa dipakai untuk P10, P8, P4, IP, dan IP-1.
 * 
 * @param {string|Array} input - Bit awal (misal: "10100101" atau [1,0,1,0,0,1,0,1])
 * @param {Array<number>} table - Matriks/Tabel urutan permutasi baru
 * @returns {Array<number>} - Hasil bit yang sudah diacak dalam bentuk array
 */
export function permute(input, table) {
    // Memastikan input diubah menjadi array of numbers agar mudah dimanipulasi
    const bitArray = Array.isArray(input) ? input : input.split('').map(Number);
    return table.map(index => bitArray[index - 1]);
}

/**
 * Fungsi Operasi XOR (Exclusive OR)
 * Membandingkan dua array bit dengan panjang yang sama.
 * Aturan: jika bit sama hasil 0, jika bit beda hasil 1.
 * 
 * @param {Array<number>} array1 
 * @param {Array<number>} array2 
 * @returns {Array<number>}
 */
export function xor(array1, array2) {
    return array1.map((bit, idx) => bit ^ array2[idx]);
}

/**
 * Fungsi Circular Left Shift (LS)
 * Menggeser bit ke kiri secara sirkular. Bit yang keluar dari kiri akan masuk ke kanan.
 * 
 * @param {Array<number>} array - Array bit yang mau digeser
 * @param {number} totalShift - Jumlah pergeseran (1 untuk LS-1, 2 untuk LS-2)
 * @returns {Array<number>}
 */
export function leftShift(array, totalShift) {
    // slice(totalShift) mengambil sisa bit, slice(0, totalShift) mengambil bit yang terdepan
    return [...array.slice(totalShift), ...array.slice(0, totalShift)];
}

/**
 * Fungsi Utility Tambahan
 * Mengubah array angka [1, 0, 1] menjadi string "101" agar rapi saat dicetak di UI.
 */
export function bitArrayToString(array) {
    return array.join('');
}