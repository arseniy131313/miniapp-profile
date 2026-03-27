const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const mainBtn = document.getElementById("mainBtn");
const changeStatusBtn = document.getElementById("changeStatusBtn");
const nameEl = document.getElementById("name");
const usernameEl = document.getElementById("username");
const avatarEl = document.getElementById("avatar");
const statusTextEl = document.getElementById("statusText");

// Берём данные пользователя из Telegram, если страница открыта именно внутри Telegram
const user = tg.initDataUnsafe?.user;

if (user) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  nameEl.textContent = fullName || "Пользователь Telegram";
  usernameEl.textContent = user.username ? `@${user.username}` : `id${user.id}`;

  if (user.photo_url) {
    avatarEl.src = user.photo_url;
  }
}

// Простая кнопка с тактильным откликом
mainBtn.addEventListener("click", () => {
  if (tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred("light");
  }

  alert("Кнопка нажата");
});

// Имитация смены статуса
let isOnline = true;

changeStatusBtn.addEventListener("click", () => {
  isOnline = !isOnline;
  statusTextEl.textContent = isOnline ? "Онлайн" : "Не в сети";

  if (tg.HapticFeedback) {
    tg.HapticFeedback.selectionChanged();
  }
});