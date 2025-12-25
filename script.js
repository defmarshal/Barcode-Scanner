/***********************
 * GLOBAL STATE
 ***********************/
let cart = JSON.parse(localStorage.getItem("cart")) || {};
let lastCode = null;
let quaggaActive = false;

/***********************
 * DATABASE BARANG
 ***********************/
function getDB() {
    return JSON.parse(localStorage.getItem("barangDB")) || {};
}

function saveDB(db) {
    localStorage.setItem("barangDB", JSON.stringify(db));
}

/***********************
 * CART
 ***********************/
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
    const list = document.getElementById("list");
    list.innerHTML = "";
    let total = 0;

    for (const code in cart) {
        const item = cart[code];
        const subtotal = item.harga * item.qty;
        total += subtotal;

        list.innerHTML += `
            <tr>
                <td>${item.nama}</td>
                <td>Rp ${item.harga}</td>
                <td>
                    <button onclick="ubahQty('${code}', -1)">➖</button>
                    ${item.qty}
                    <button onclick="ubahQty('${code}', 1)">➕</button>
                </td>
                <td>Rp ${subtotal}</td>
                <td>
                    <button onclick="hapusItem('${code}')">❌</button>
                </td>
            </tr>
        `;
    }

    document.getElementById("total").innerText = total;
    saveCart();
}

function addToCart(code, data) {
    if (cart[code]) {
        cart[code].qty++;
    } else {
        cart[code] = {
            nama: data.nama,
            harga: data.harga,
            qty: 1
        };
    }
    renderCart();
}

function ubahQty(code, delta) {
    if (!cart[code]) return;
    cart[code].qty += delta;
    if (cart[code].qty <= 0) delete cart[code];
    renderCart();
}

function hapusItem(code) {
    delete cart[code];
    renderCart();
}

function resetCart() {
    if (!confirm("Reset semua belanja?")) return;
    cart = {};
    renderCart();
}

/***********************
 * BARANG BARU
 ***********************/
function simpanBarang() {
    const nama = document.getElementById("nama").value.trim();
    const harga = parseInt(document.getElementById("harga").value);

    if (!nama || !harga) {
        alert("Nama dan harga wajib diisi");
        return;
    }

    const db = getDB();
    db[lastCode] = { nama, harga };
    saveDB(db);

    document.getElementById("form").style.display = "none";
    addToCart(lastCode, db[lastCode]);
}

/***********************
 * BARCODE SCANNER (QUAGGA2)
 ***********************/
function startScan() {
    if (quaggaActive) return;
    quaggaActive = true;

    const scanner = document.getElementById("scanner");
    scanner.style.display = "block";

    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: scanner,
            constraints: {
                facingMode: "environment",
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        },
        locate: true,
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        decoder: {
            readers: ["ean_reader"] // 🔥 INI YANG BENAR
        }
    }, function (err) {
        if (err) {
            alert("CameraError: " + err);
            quaggaActive = false;
            return;
        }
        Quagga.start();
    });
}

let lastScan = 0;

Quagga.onDetected(function (result) {
    const now = Date.now();
    if (now - lastScan < 1500) return;
    lastScan = now;

    const code = result.codeResult.code;

    Quagga.stop();
    quaggaActive = false;
    document.getElementById("scanner").style.display = "none";

    lastCode = code;

    const db = getDB();
    if (db[code]) {
        addToCart(code, db[code]);
    } else {
        document.getElementById("form").style.display = "block";
        document.getElementById("nama").value = "";
        document.getElementById("harga").value = "";
    }
});

/***********************
 * INIT
 ***********************/
renderCart();
