// script.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyCvVOm2_OxBRWiHmnjgojlb7OLCGa4B3Qw",
  authDomain: "khakberdi-portfolio.firebaseapp.com",
  projectId: "khakberdi-portfolio",
  storageBucket: "khakberdi-portfolio.appspot.com",
  messagingSenderId: "436110540502",
  appId: "1:436110540502:web:5ed55ff264b98b13cf1377",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Data for projects/sliders ---
const projects = [
  { key: "donut", starsId: "stars-donut", commentId: "comment-donut", buttonId: "send-donut" },
  { key: "apartment", starsId: "stars-apartment", commentId: "comment-apartment", buttonId: "send-apartment" },
];

const sliders = {
  apartment: {
    images: ["house_practice12.png", "house_practice12 (another angle).png"],
    currentIndex: 0,
  },
  // можно добавить другие
};

let selectedRatings = {};

// helper - safe query
const $ = sel => Array.from(document.querySelectorAll(sel));

// Вся логика запускается после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  try {
    // --- stars & send buttons ---
    projects.forEach((project) => {
      const starsContainer = document.getElementById(project.starsId);
      if (!starsContainer) {
        console.warn("Не найден контейнер звёзд:", project.starsId);
        return;
      }
      selectedRatings[project.key] = 0;

      // создаём 5 звёзд
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.innerHTML = "&#9733;"; // ★
        star.style.cursor = "pointer";
        star.dataset.value = i;
        star.addEventListener("click", () => {
          selectedRatings[project.key] = i;
          updateStars(project.key, project.starsId);
        });
        starsContainer.appendChild(star);
      }
      updateStars(project.key, project.starsId);

      // send button
      const sendBtn = document.getElementById(project.buttonId);
      if (sendBtn) {
        sendBtn.addEventListener("click", () => submitRating(project.key));
      } else {
        console.warn("Не найден sendBtn:", project.buttonId);
      }
    });

    // --- show-more buttons ---
    $(".show-more-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        // допустим, <p class="description"> прямо перед кнопкой
        const description = btn.previousElementSibling;
        if (!description) return;
        description.classList.toggle("expanded");
        btn.textContent = description.classList.contains("expanded") ? "Show less" : "Show more";
      });
    });

    // --- slider prev/next handlers (delegate if needed) ---
    $(".slider-btn.prev").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const cardKey = btn.dataset.card;
        if (!cardKey || !sliders[cardKey]) return;
        showSlide(cardKey, sliders[cardKey].currentIndex - 1);
      });
    });

    $(".slider-btn.next").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const cardKey = btn.dataset.card;
        if (!cardKey || !sliders[cardKey]) return;
        showSlide(cardKey, sliders[cardKey].currentIndex + 1);
      });
    });

    // --- fullscreen buttons ---
    $(".fullscreen-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const cardKey = btn.dataset.card || btn.closest('.slider')?.dataset.card;
        if (cardKey) toggleFullscreen(cardKey);
      });
    });

    // предотвращаем всплытие на кнопках prev/next чтобы не открыть модал
    $(".slider-btn.prev, .slider-btn.next").forEach(b => b.addEventListener('click', e => e.stopPropagation()));

    // слушаем событие fullscreenchange, чтобы поменять иконки
    document.addEventListener('fullscreenchange', () => {
      const isFS = !!document.fullscreenElement;
      $(".fullscreen-btn").forEach(btn => btn.textContent = isFS ? '×' : '⛶');
    });

    console.log("Инициализация script.js завершена");
  } catch (err) {
    console.error("Ошибка при инициализации:", err);
  }
}); // DOMContentLoaded end

// ----------------- FUNCTIONS -----------------
function updateStars(key, starsId) {
  const container = document.getElementById(starsId);
  if (!container) return;
  const stars = Array.from(container.children);
  stars.forEach((s, i) => {
    s.style.color = i < (selectedRatings[key] || 0) ? "#fbbf24" : "#d1d5db";
  });
}

async function submitRating(projectKey) {
  const sendBtn = document.getElementById(`send-${projectKey}`);
  if (sendBtn) sendBtn.disabled = true;
  const commentEl = document.getElementById(`comment-${projectKey}`);
  const comment = commentEl ? commentEl.value.trim() : "";
  const rating = selectedRatings[projectKey] || 0;

  if (!comment && !rating) {
    alert("Поставьте оценку или напишите комментарий!");
    if (sendBtn) sendBtn.disabled = false;
    return;
  }

  try {
    console.log("Submitting review:", { projectKey, rating, comment });
    const colRef = collection(db, "reviews");
    const docRef = await addDoc(colRef, {
      project: projectKey,
      rating,
      comment,
      created: serverTimestamp(),
    });
    console.log("Документ создан:", docRef.id);
    alert("Спасибо за отзыв!");
    if (commentEl) commentEl.value = "";
    selectedRatings[projectKey] = 0;
    updateStars(projectKey, `stars-${projectKey}`);
  } catch (error) {
    console.error("Ошибка при отправке отзыва:", error);
    const code = error.code || "(no code)";
    alert("Ошибка при отправке: " + code + " — " + (error.message || error));
    // важно: если ошибка permissions -> проверь правила Firestore
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

function showSlide(cardKey, index) {
  const slider = sliders[cardKey];
  if (!slider) return;
  if (index < 0) index = slider.images.length - 1;
  if (index >= slider.images.length) index = 0;
  slider.currentIndex = index;
  const img = document.getElementById(`slider-img-${cardKey}`);
  if (img) img.src = slider.images[slider.currentIndex];
}

// toggle fullscreen for the whole slider (not just image)
function toggleFullscreen(cardKey) {
  const img = document.querySelector(`#slider-img-${cardKey}`); 
  if (!img) return;

  if (document.fullscreenElement || document.webkitFullscreenElement) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document)
      .catch(err => console.error("Exit FS err", err));
  } else {
    const req = img.requestFullscreen || img.webkitRequestFullscreen || img.msRequestFullscreen;
    if (req) {
      req.call(img);
    } else {
      // fallback для iOS Safari
      img.classList.add("ios-fullscreen");
    }
  }
}
