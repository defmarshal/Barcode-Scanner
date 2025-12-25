let total = 0;
let lastCode = null;

// Ambil database dari LocalStorage
function getDB() {
    return JSON.parse(localStorage.getItem("barangDB")) || {};
}

// Simpan database
function saveDB(db) {
    localStorage.setItem("barangDB", JSON.stringify(db));
}

// Tambah ke list belanja
function addToCart(item) {
    total += item.harga;
    document.getElementById("list").innerHTML += `
        <tr>
            <td>${item.nama}</td>
            <td>Rp ${item.harga}</td>
        </tr>
    `;
    document.getElementById("total").innerText = total;
}

// Simpan barang baru
function simpanBarang() {
    const nama = document.getElementById("nama").value;
    const harga = parseInt(document.getElementById("harga").value);

    if (!nama || !harga) return alert("Lengkapi data");

    const db = getDB();
    db[lastCode] = { nama, harga };
    saveDB(db);

    document.getElementById("form").style.display = "none";
    addToCart(db[lastCode]);
}

// Inisialisasi scanner
Quagga.init({
    inputStream: {
        type: "LiveStream",
        target: document.querySelector("#scanner"),
        constraints: { facingMode: "environment" }
    },
    decoder: {
        readers: ["ean_reader"]
    }
}, err => {
    if (!err) Quagga.start();
});

// Saat barcode terdeteksi
Quagga.onDetected(data => {
    const code = data.codeResult.code;
    Quagga.stop();

    const db = getDB();
    lastCode = code;

    if (db[code]) {
        addToCart(db[code]);
    } else {
        document.getElementById("form").style.display = "block";
        document.getElementById("nama").value = "";
        document.getElementById("harga").value = "";
    }

    setTimeout(() => Quagga.start(), 1500);
});
