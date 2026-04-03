// take data from localstorage
let users = JSON.parse(localStorage.getItem("users")) || {};

// Save data to localstorage
function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
}

// Load file dokumen.json
async function loadJSON() {
    const response = await fetch("dokumen.json");
    const data = await response.json();
    convertData(data);
}

// Convert JSON to aplication format
function convertData(data) {
    data.forEach(row => {
        const name = row.Nama;

        if (!users[name]) {
            users[name] = [];
        }

        users[name].push({
            amount: row.Income,
            type: "income",
            category: null
        });

        const categories = ["Consumption", "Transportation", "Others"];

        categories.forEach(cat => {
            users[name].push({
                amount: row[cat],
                type: "expense",
                category: cat
            });
        });
    });

    saveData();
    loadUsers();
}

// Number Format
function formatRupiah(number) {
    return Number(number).toLocaleString("id-ID");
}

// Show/Hide Category
function toggleCategory() {
    const type = document.getElementById("type").value;
    const categorySection = document.getElementById("categorySection");

    categorySection.style.display = (type === "income") ? "none" : "block";
}

// Add Transaction
function addTransaction() {
    const name =
        document.getElementById("userSelect").value ||
        document.getElementById("name").value;

    const type = document.getElementById("type").value;
    const amount = parseFloat(document.getElementById("amount").value);
    let category = document.getElementById("category").value;

    if (!name || isNaN(amount)) {
        alert("Isi nama dan amount dulu!");
        return;
    }

    if (!users[name]) {
        users[name] = [];
    }

    if (type === "income") {
        category = null;
    }

    users[name].push({
        amount: amount,
        type: type,
        category: category
    });

    saveData();
    loadUsers();
    render(name);
}

// Render data to UI
function render(name) {
    if (!users[name]) return;

    let income = 0;
    let expense = 0;
    let biggest = 0;
    let biggestCategory = "";

    const list = document.getElementById("list");
    list.innerHTML = "";

    users[name].forEach((t) => {
        let li = document.createElement("li");

        let typeText = t.type.charAt(0).toUpperCase() + t.type.slice(1);

        if (t.type === "income") {
            li.innerHTML = `${typeText} | ${formatRupiah(t.amount)}`;
            li.classList.add("income");
            income += Number(t.amount);
        } else {
            li.innerHTML = `${typeText} | ${t.category} | ${formatRupiah(t.amount)}`;
            li.classList.add("expense");

            expense += Number(t.amount);

            if (t.amount > biggest) {
                biggest = t.amount;
                biggestCategory = t.category;
            }
        }

        list.appendChild(li);
    });

    document.getElementById("income").innerText = "Income: " + formatRupiah(income);
    document.getElementById("expense").innerText = "Expense: " + formatRupiah(expense);
    document.getElementById("balance").innerText = "Balance: " + formatRupiah(income - expense);
    document.getElementById("biggest").innerText =
        "Biggest: " + biggestCategory + " (" + formatRupiah(biggest) + ")";

    let percent = income > 0 ? ((expense / income) * 100).toFixed(2) : 0;
    document.getElementById("expensePercent").innerText =
        "Expense Percentage: " + percent + "%";
}

// Delete User Data
function clearData() {
    const name =
        document.getElementById("userSelect").value ||
        document.getElementById("name").value;

    if (!name || !users[name]) {
        alert("Pilih user dulu!");
        return;
    }

    delete users[name];

    saveData();
    loadUsers();

    document.getElementById("list").innerHTML = "";
    document.getElementById("income").innerText = "";
    document.getElementById("expense").innerText = "";
    document.getElementById("balance").innerText = "";
    document.getElementById("biggest").innerText = "";
    document.getElementById("expensePercent").innerText = "";
}

// Load user ke dropdown
function loadUsers() {
    const select = document.getElementById("userSelect");

    select.innerHTML = '<option value="">-- Select User --</option>';

    for (let name in users) {
        let option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    }
}

// Select user
function selectUser() {
    const name = document.getElementById("userSelect").value;

    if (name) {
        document.getElementById("name").value = name;
        render(name);
    }
}

// When open page
window.onload = function () {
    loadUsers();

    if (Object.keys(users).length > 0) {
        const names = Object.keys(users);
        const firstUser = names[0];
        document.getElementById("name").value = firstUser;
        render(firstUser);
    }

    toggleCategory();
};
