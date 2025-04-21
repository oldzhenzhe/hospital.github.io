// Elements
const loginPage = document.getElementById("login-page");
const registerPage = document.getElementById("register-page");
const mainPage = document.getElementById("main-page");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegisterBtn = document.getElementById("show-register");
const showLoginBtn = document.getElementById("show-login");
const dropdownToggle = document.getElementById("menu-toggle");
const dropdownMenu = document.querySelector(".dropdown-menu");
const menuItems = document.querySelectorAll(".menu-item");
const logoutBtn = document.getElementById("logout");
const contentSections = document.querySelectorAll(".content-section");

// Utils
function showPage(page) {
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");
    mainPage.classList.add("hidden");
    page.classList.remove("hidden");
}

function showSection(sectionId) {
    contentSections.forEach(s => s.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");
}

function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
}

function findUser(username, password = null) {
    return getUsers().find(u => u.username === username && (password === null || u.password === password));
}

// Events
loginForm.onsubmit = (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const user = findUser(username, password);
    if (user) {
        localStorage.setItem("currentUser", username);
        showPage(mainPage);
        showSection("home");
    } else {
        alert("用戶名或密碼錯誤");
    }
};

registerForm.onsubmit = (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value.trim();
    if (findUser(username)) {
        alert("用戶名已存在");
        return;
    }
    const user = {
        username,
        password: document.getElementById("reg-password").value.trim(),
        phone: document.getElementById("reg-phone").value.trim(),
        id: document.getElementById("reg-id").value.trim(),
        nhi: document.getElementById("reg-nhi").value.trim(),
        height: document.getElementById("reg-height").value.trim(),
        weight: document.getElementById("reg-weight").value.trim(),
        birthday: document.getElementById("reg-birthday").value.trim(),
    };
    saveUser(user);
    alert("註冊成功，請登入");
    showPage(loginPage);
};

showRegisterBtn.onclick = () => showPage(registerPage);
showLoginBtn.onclick = () => showPage(loginPage);
dropdownToggle.onclick = () => dropdownMenu.classList.toggle("hidden");
logoutBtn.onclick = () => {
    localStorage.removeItem("currentUser");
    showPage(loginPage);
};

menuItems.forEach(btn => {
    btn.onclick = () => {
        const target = btn.dataset.page;
        if (target) showSection(target);
    };
});

// Auto login check
window.onload = () => {
    const user = localStorage.getItem("currentUser");
    if (user) {
        showPage(mainPage);
        showSection("home");
    } else {
        showPage(loginPage);
    }
};