// --- Firebase через CDN ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- Конфигурация Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyCvVOm2_OxBRWiHmnjgojlb7OLCGa4B3Qw",
  authDomain: "khakberdi-portfolio.firebaseapp.com",
  projectId: "khakberdi-portfolio",
  storageBucket: "khakberdi-portfolio.appspot.com",
  messagingSenderId: "436110540502",
  appId: "1:436110540502:web:5ed55ff264b98b13cf1377",
};

// --- Инициализация Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Рейтинг ---
const projects = [
  {
    key: "donut",
    starsId: "stars-donut",
    commentId: "comment-donut",
    buttonId: "send-donut",
  },
  {
    key: "apartment",
    starsId: "stars-apartment",
    commentId: "comment-apartment",
    buttonId: "send-apartment",
  },
];
let selectedRatings = {};

document.addEventListener("DOMContentLoaded", () => {
  // Создание звёзд
  projects.forEach((project) => {
    const starsContainer = document.getElementById(project.starsId);
    selectedRatings[project.key] = 0;
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.innerHTML = "&#9733;";
      star.style.cursor = "pointer";
      star.dataset.value = i;
      star.onclick = function () {
        selectedRatings[project.key] = i;
        updateStars(project.key, project.starsId);
      };
      starsContainer.appendChild(star);
    }
    updateStars(project.key, project.starsId);

    // Кнопка отправки
    document.getElementById(project.buttonId).addEventListener("click", () => {
      submitRating(project.key);
    });
  });
});

function updateStars(key, starsId) {
  const stars = document.getElementById(starsId).children;
  for (let i = 0; i < 5; i++) {
    stars[i].style.color = i < selectedRatings[key] ? "#fbbf24" : "#d1d5db";
  }
}

async function submitRating(projectKey) {
  const comment = document.getElementById(`comment-${projectKey}`).value.trim();
  const rating = selectedRatings[projectKey] || 0;

  if (!comment && !rating) {
    alert("Поставьте оценку или напишите комментарий!");
    return;
  }

  try {
    await addDoc(collection(db, "reviews"), {
      project: projectKey,
      rating: rating,
      comment: comment,
      created: serverTimestamp(),
    });
    alert("Спасибо за отзыв!");
    document.getElementById(`comment-${projectKey}`).value = "";
    selectedRatings[projectKey] = 0;
    updateStars(projectKey, `stars-${projectKey}`);
  } catch (error) {
    console.error("Ошибка при отправке:", error);
    alert("Ошибка при отправке отзыва, попробуйте позже.");
  }
}

window.submitRating = submitRating;

document.querySelectorAll(".show-more-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const description = btn.previousElementSibling; // абзац <p> перед кнопкой
    description.classList.toggle("expanded");

    if (description.classList.contains("expanded")) {
      btn.textContent = "Show less";
    } else {
      btn.textContent = "Show more";
    }
  });
});

// Объект со слайдами
const sliders = {
  apartment: {
    images: ["house_practice12.png", "house_practice12 (another angle).png"],
    currentIndex: 0
  },
  // можно добавлять другие карточки
};

// Показ слайда
function showSlide(cardKey, index) {
  const slider = sliders[cardKey];
  if (!slider) return;

  if (index < 0) index = slider.images.length - 1;
  if (index >= slider.images.length) index = 0;

  slider.currentIndex = index;

  const img = document.getElementById(`slider-img-${cardKey}`);
  if (img) img.src = slider.images[slider.currentIndex];
}

// Кнопки prev
document.querySelectorAll(".slider-btn.prev").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const cardKey = btn.dataset.card;
    showSlide(cardKey, sliders[cardKey].currentIndex - 1);
    e.stopPropagation(); // чтобы не открывалось модальное окно
  });
});

// Кнопки next
document.querySelectorAll(".slider-btn.next").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const cardKey = btn.dataset.card;
    showSlide(cardKey, sliders[cardKey].currentIndex + 1);
    e.stopPropagation();
  });
});

// Фуллскрин
function openFullscreen(imgId) {
  const elem = document.getElementById(imgId);
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { // Safari
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE11
    elem.msRequestFullscreen();
  }
}
