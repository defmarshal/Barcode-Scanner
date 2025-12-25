let cart = JSON.parse(localStorage.getItem("cart")) || {};
let lastCode = null;
let scannerOn = false;

// ================= DATABASE BARANG =================
function getDB() {
    return JSON.parse(localStorage.getItem("barangDB")) || {};
}

function saveDB(db) {
    localStorage.setItem("barangDB", JSON.stringify(db));
}

// ================= CART =================
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
    const list = document.getElementById("list");
    list.innerHTML = "";
    let total = 0;

    for (const code in cart) {
        const i = cart[code];
        const subtotal = i.harga * i.qty;
        total += subtotal;

        list.innerHTML += `
            <tr>
                <td>${i.nama}</td>
                <td>Rp ${i.harga}</td>
                <td>
                    <button onclick="ubahQty('${code}',-1)">➖</button>
                    ${i.qty}
                    <button onclick="ubahQty('${code}',1)">➕</button>
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

function addToCart(code, item) {
    if (cart[code]) {
        cart[code].qty += 1;
    } else {
        cart[code] = {
            nama: item.nama,
            harga: item.harga,
            qty: 1
        };
    }
    renderCart();
}

function ubahQty(code, delta) {
    cart[code].qty += delta;
    if (cart[code].qty <= 0) delete cart[code];
    renderCart();
}

function hapusItem(code) {
    delete cart[code];
    renderCart();
}

function resetCart() {
    if (confirm("Reset semua belanja?")) {
        cart = {};
        renderCart();
    }
}

// ================= BARANG BARU =================
function simpanBarang() {
    const nama = document.getElementById("nama").value;
    const harga = parseInt(document.getElementById("harga").value);
    if (!nama || !harga) return alert("Lengkapi data");

    const db = getDB();
    db[lastCode] = { nama, harga };
    saveDB(db);

    document.getElementById("form").style.display = "none";
    addToCart(lastCode, db[lastCode]);
}

// ================= SCANNER =================
function startScan() {
    document.getElementById("scanner").style.display = "block";

    Quagga.init({
        inputStream: {
            type: "LiveStream",
            target: document.querySelector("#scanner"),
            constraints: {
                facingMode: "environment",
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        locate: true,
        decoder: {
            readers: ["ean_reader", "ean_13_reader"]
        },
        frequency: 10
    }, err => {
        if (err) {
            alert("Scanner error: " + err);
            return;
        }
        Quagga.start();
    });
}

Quagga.onDetected(data => {
    const code = data.codeResult.code;
    lastCode = code;

    Quagga.stop();
    scannerOn = false;
    document.getElementById("scanner").style.display = "none";

    const db = getDB();
    if (db[code]) {
        addToCart(code, db[code]);
    } else {
        document.getElementById("form").style.display = "block";
        document.getElementById("nama").value = "";
        document.getElementById("harga").value = "";
    }
});

// render awal
renderCart();
