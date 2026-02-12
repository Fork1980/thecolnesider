const today = new Date();
const month = today.getMonth();

const names = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

// 📅 Month label
document.getElementById("monthBox").innerText = names[month];

// 🌍 Season detection (UK meteorological)
let season;

if (month === 11 || month <= 1) {
    season = "winter";
}
else if (month <= 4) {
    season = "spring";
}
else if (month <= 7) {
    season = "summer";
}
else {
    season = "autumn";
}

// 🎅 December festive Willie
const festive = (month === 11);

const willie = document.getElementById("willie");

// 🧥 Sprite mapping
if (season === "winter" && festive) {
    willie.src = "images/VegPatch/xmas_willie.jpg";
}
else if (season === "winter") {
    willie.src = "images/VegPatch/winter_wj.jpg";
}
else if (season === "spring") {
    willie.src = "images/VegPatch/spring_wj.jpg";
}
else if (season === "summer") {
    willie.src = "images/VegPatch/summa_wj.jpg";
}
else if (season === "autumn") {
    willie.src = "images/VegPatch/aut_wj.jpg";
}

// 📍 Smooth yearly progress
const start = new Date(today.getFullYear(), 0, 1);
const end   = new Date(today.getFullYear(), 11, 31);

const progress = (today - start) / (end - start);
willie.style.left = (progress * 100) + "%";

// ❄️ Snowfall (winter only)
const snowContainer = document.getElementById("snow");

if (season === "winter") {
    createSnow();
} else {
    snowContainer.innerHTML = "";
}

function createSnow() {
    snowContainer.innerHTML = "";

    for (let i = 0; i < 25; i++) {
        const flake = document.createElement("div");
        flake.className = "snowflake";

        flake.style.left = Math.random() * 100 + "%";
        flake.style.animationDuration = (5 + Math.random() * 6) + "s";
        flake.style.animationDelay = Math.random() * 5 + "s";

        snowContainer.appendChild(flake);
    }
}

// 🌧 Spring Drizzle
const drizzleContainer = document.getElementById("drizzle");

if (season === "spring") {
    createDrizzle();
} else {
    drizzleContainer.innerHTML = "";
}

function createDrizzle() {
    drizzleContainer.innerHTML = "";

    for (let i = 0; i < 18; i++) {
        const drop = document.createElement("div");
        drop.className = "raindrop";

        drop.style.left = Math.random() * 100 + "%";
        drop.style.animationDuration = (6 + Math.random() * 4) + "s";
        drop.style.animationDelay = Math.random() * 5 + "s";

        drizzleContainer.appendChild(drop);
    }
}

// 💬 Captions
const captions = {
    winter: festive ?
        "Willie-Joe is feeling festive." :
        "Willie-Joe loves winter.",

    spring: "Willie-Joe tolerates the drizzle - but he can start planting!.",
    summer: "Willie-Joe does not like heat. He's off for a swim.",
    autumn: "Willie-Joe approves of autumn."
};

document.getElementById("seasonCaption").innerText = captions[season];

// 🌱 Season icon
const icons = {
    winter: "❄️",
    spring: "🌧",
    summer: "☀️",
    autumn: "🍂"
};

document.getElementById("seasonIcon").innerText = icons[season];

// 🎨 Seasonal background tint
const widget = document.querySelector(".year-widget");

widget.classList.remove("winter-mode", "spring-mode");

if (season === "winter") widget.classList.add("winter-mode");
if (season === "spring") widget.classList.add("spring-mode");

