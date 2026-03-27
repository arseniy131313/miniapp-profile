const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const avatarEl = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const usernameEl = document.getElementById("username");
const vpnStatusEl = document.getElementById("vpnStatus");
const currentPlanEl = document.getElementById("currentPlan");
const daysLeftEl = document.getElementById("daysLeft");
const summaryPlanEl = document.getElementById("summaryPlan");
const summaryPriceEl = document.getElementById("summaryPrice");
const subscriptionInfoEl = document.getElementById("subscriptionInfo");
const buyBtn = document.getElementById("buyBtn");
const planCards = document.querySelectorAll(".plan-card");
const statusDot = document.querySelector(".dot");

let selectedPlan = {
  name: "1 месяц",
  price: "199₽",
  days: "30"
};

// Подтягиваем данные Telegram-пользователя
const user = tg?.initDataUnsafe?.user;

if (user) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  nameEl.textContent = fullName || "Пользователь";
  usernameEl.textContent = user.username ? `@${user.username}` : `id${user.id}`;

  if (user.photo_url) {
    avatarEl.src = user.photo_url;
  }
}

// Haptic helper
function lightHaptic() {
  tg?.HapticFeedback?.impactOccurred("light");
}

function selectHaptic() {
  tg?.HapticFeedback?.selectionChanged();
}

function successHaptic() {
  tg?.HapticFeedback?.notificationOccurred("success");
}

function updateSummary() {
  summaryPlanEl.textContent = selectedPlan.name;
  summaryPriceEl.textContent = selectedPlan.price;
}

planCards.forEach(card => {
  card.addEventListener("click", () => {
    planCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    selectedPlan = {
      name: card.dataset.plan,
      price: card.dataset.price,
      days: card.dataset.days
    };

    updateSummary();
    selectHaptic();
  });
});

buyBtn.addEventListener("click", () => {
  lightHaptic();

  buyBtn.disabled = true;
  buyBtn.textContent = "Обработка...";
  buyBtn.style.opacity = "0.85";

  setTimeout(() => {
    currentPlanEl.textContent = selectedPlan.name;
    daysLeftEl.textContent = `${selectedPlan.days} дней`;
    vpnStatusEl.textContent = "VPN активен";
    subscriptionInfoEl.className = "subscription-active";
    subscriptionInfoEl.innerHTML = `
      <strong>Подписка активирована</strong><br>
      Тариф: ${selectedPlan.name}<br>
      Стоимость: ${selectedPlan.price}<br>
      Срок: ${selectedPlan.days} дней
    `;

    statusDot.style.background = "#22c55e";
    statusDot.style.boxShadow = "0 0 10px rgba(34, 197, 94, 0.7)";

    buyBtn.textContent = "Куплено";
    buyBtn.style.background = "linear-gradient(135deg, #16a34a, #22c55e)";
    buyBtn.disabled = false;
    buyBtn.style.opacity = "1";

    successHaptic();

    // Если захочешь отправить данные в бота:
    // tg?.sendData(JSON.stringify({
    //   action: "buy_plan",
    //   plan: selectedPlan.name,
    //   price: selectedPlan.price,
    //   days: selectedPlan.days
    // }));
  }, 1200);
});

updateSummary();