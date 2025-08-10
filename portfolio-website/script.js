// --- сначала определяем переменные и массивы --- //
const sliderImages = {
  1: ["house_practice12.png", "house_practice12 (another angle).png"],
};
let sliderIndex = { 1: 0 }; // эта переменная должна быть ДО использования

// --- потом функции --- //
function showSlide(cardId, n) {
  const imgs = sliderImages[cardId];
  sliderIndex[cardId] = (n + imgs.length) % imgs.length;
  document.getElementById("slider-img-" + cardId).src =
    imgs[sliderIndex[cardId]];
}
function prevSlide(cardId) {
  showSlide(cardId, sliderIndex[cardId] - 1);
}
function nextSlide(cardId) {
  showSlide(cardId, sliderIndex[cardId] + 1);
}

// --- Firebase через CDN ---
const firebaseConfig = {
  apiKey: "AIzaSyB1smXiZ3DoJEHZqFnfTxd6Ou0f_64Omyg",
  authDomain: "khakberdi-portfolio.firebaseapp.com",
  projectId: "khakberdi-portfolio",
  storageBucket: "khakberdi-portfolio.firebasestorage.app",
  messagingSenderId: "436110540502",
  appId: "1:436110540502:web:5ed55ff264b98b13cf1377",
  measurementId: "G-67MZWGZ4YX",
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const projectId = "project1"; // ID проекта

// --- Слайдер для карточки проектов ---

document.addEventListener("DOMContentLoaded", function () {
  showSlide(1, 0);
});

// Модальное окно
function openModalSlider(imgs) {
  modalSliderImages = imgs;
  modalSliderIndex = 0;
  document.getElementById("modal-slider-img").src = imgs[0];
  document.getElementById("modal-slider").style.display = "flex";
}
function closeModalSlider() {
  document.getElementById("modal-slider").style.display = "none";
}
function modalPrevSlide() {
  modalSliderIndex =
    (modalSliderIndex - 1 + modalSliderImages.length) %
    modalSliderImages.length;
  document.getElementById("modal-slider-img").src =
    modalSliderImages[modalSliderIndex];
}
function modalNextSlide() {
  modalSliderIndex = (modalSliderIndex + 1) % modalSliderImages.length;
  document.getElementById("modal-slider-img").src =
    modalSliderImages[modalSliderIndex];
}

// --- Звёзды и комментарии для проектов ---
const projects = [
  { key: "donut", starsId: "stars-donut", commentId: "comment-donut" },
  {
    key: "apartment",
    starsId: "stars-apartment",
    commentId: "comment-apartment",
  },
];

let selectedRatings = {};

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
});

function updateStars(key, starsId) {
  const stars = document.getElementById(starsId).children;
  for (let i = 0; i < 5; i++) {
    stars[i].style.color = i < selectedRatings[key] ? "#fbbf24" : "#d1d5db";
  }
}

function submitRating(projectKey) {
  const comment = document.getElementById(`comment-${projectKey}`).value.trim();
  const rating = selectedRatings[projectKey] || 0;
  if (!comment && !rating) {
    alert("Поставьте оценку или напишите комментарий!");
    return;
  }
  db.collection("reviews")
    .add({
      project: projectKey,
      rating: rating,
      comment: comment,
      created: new Date(),
    })
    .then(() => {
      alert("Спасибо за отзыв!");
      document.getElementById(`comment-${projectKey}`).value = "";
      selectedRatings[projectKey] = 0;
      updateStars(projectKey, `stars-${projectKey}`);
    });
}