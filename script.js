// --- Firebase через CDN ---
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getAuth, 
  signInAnonymously 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// --- Конфигурация Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyB1smXiZ3DoJEHZqFnfTxd6Ou0f_64Omyg",
  authDomain: "khakberdi-portfolio.firebaseapp.com",
  projectId: "khakberdi-portfolio",
  storageBucket: "khakberdi-portfolio.firebasestorage.app",
  messagingSenderId: "436110540502",
  appId: "1:436110540502:web:5ed55ff264b98b13cf1377",
};

// --- Инициализация Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

loginBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Вход через Google успешен:", result.user);
      updateUI(result.user);
    })
    .catch((error) => {
      console.error("Ошибка входа:", error);
    });
});

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("Вышли из аккаунта");
      updateUI(null);
    })
    .catch((error) => {
      console.error("Ошибка выхода:", error);
    });
});

onAuthStateChanged(auth, (user) => {
  updateUI(user);
});

function updateUI(user) {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    // Можно вывести имя или email где-нибудь
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

// --- Ждём авторизацию перед работой ---
signInAnonymously(auth)
  .then(() => console.log("✅ Signed in anonymously"))
  .catch((error) => console.error("❌ Auth error:", error));

// --- Рейтинг ---
const projects = [
  { key: "donut", starsId: "stars-donut", commentId: "comment-donut", buttonId: "send-donut" },
  { key: "apartment", starsId: "stars-apartment", commentId: "comment-apartment", buttonId: "send-apartment" },
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
