const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const devices = [
  { id: "ios", icon: "", name: "iOS", subtitle: "iPhone / iPad" },
  { id: "android", icon: "🤖", name: "Android", subtitle: "Телефон / планшет" },
  { id: "windows", icon: "🪟", name: "Windows", subtitle: "ПК / ноутбук" },
  { id: "macos", icon: "💻", name: "macOS", subtitle: "MacBook / iMac" },
  { id: "linux", icon: "🐧", name: "Linux", subtitle: "Desktop / server" },
  { id: "smarttv", icon: "📺", name: "SmartTV", subtitle: "Телевизор / приставка" }
];

const state = {
  currentScreen: "home",
  selectedPlan: null,
  selectedDeviceCount: 1,
  selectedPaymentMethod: "ЮKassa",
  user: {
    name: "Пользователь",
    username: "@username",
    avatar: "https://via.placeholder.com/80"
  },
  subscription: {
    active: false,
    plan: null,
    daysLeft: 0,
    devices: 0,
    traffic: "Безлимит"
  },
  plans: [
    {
      id: 1,
      name: "1 месяц",
      basePrice: 199,
      days: 30,
      description: "Для знакомства"
    },
    {
      id: 2,
      name: "3 месяца",
      basePrice: 499,
      days: 90,
      description: "Выгодный старт"
    },
    {
      id: 3,
      name: "12 месяцев",
      basePrice: 1490,
      days: 365,
      description: "Лучшее предложение"
    }
  ]
};

const appContent = document.getElementById("appContent");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userUsername = document.getElementById("userUsername");
const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");

const paymentModal = document.getElementById("paymentModal");
const paymentBackdrop = document.getElementById("paymentBackdrop");
const closePaymentModal = document.getElementById("closePaymentModal");
const modalPlanName = document.getElementById("modalPlanName");
const modalPlanPrice = document.getElementById("modalPlanPrice");
const modalDeviceCount = document.getElementById("modalDeviceCount");
const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
const toast = document.getElementById("toast");

function hapticLight() {
  tg?.HapticFeedback?.impactOccurred("light");
}

function hapticSelection() {
  tg?.HapticFeedback?.selectionChanged();
}

function hapticSuccess() {
  tg?.HapticFeedback?.notificationOccurred("success");
}

function formatRubles(value) {
  return `${value}₽`;
}

function getPlanTotalPrice(plan) {
  return plan.basePrice * state.selectedDeviceCount;
}

function setTelegramUser() {
  const user = tg?.initDataUnsafe?.user;

  if (user) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
    state.user.name = fullName || "Пользователь";
    state.user.username = user.username ? `@${user.username}` : `id${user.id}`;

    if (user.photo_url) {
      state.user.avatar = user.photo_url;
    }
  }

  userAvatar.src = state.user.avatar;
  userName.textContent = state.user.name;
  userUsername.textContent = state.user.username;
}

function updateStatusBar() {
  if (state.subscription.active) {
    statusText.textContent = "VPN активен";
    statusDot.style.background = "#22c55e";
    statusDot.style.boxShadow = "0 0 10px rgba(34, 197, 94, 0.7)";
  } else {
    statusText.textContent = "VPN не активен";
    statusDot.style.background = "#ef4444";
    statusDot.style.boxShadow = "0 0 10px rgba(239, 68, 68, 0.7)";
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 1800);
}

function getStatusTitle() {
  return state.subscription.active ? "Активен" : "Не активен";
}

function renderHome() {
  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="stats-row">
        <div class="stat-box">
          <div class="label">Статус</div>
          <div class="value">${getStatusTitle()}</div>
        </div>
        <div class="stat-box">
          <div class="label">Осталось</div>
          <div class="value">${state.subscription.daysLeft} дн.</div>
        </div>
        <div class="stat-box">
          <div class="label">Трафик</div>
          <div class="value">${state.subscription.traffic}</div>
        </div>
        <div class="stat-box">
          <div class="label">Количество устройств</div>
          <div class="value">${state.subscription.devices}</div>
        </div>
      </div>

      <div class="action-row">
        <button class="primary-btn" id="goToPlansBtn" type="button">Купить</button>
        <button class="secondary-btn" id="goToDevicesBtn" type="button">Подключить</button>
      </div>
    </section>

    <section class="card fade-in delay-1">
      <h3>Как это работает</h3>
      <div class="small-text">
        Сначала пользователь выбирает тариф, количество устройств и оплачивает подписку.
        После этого можно открыть инструкции для нужного устройства и подключить VPN.
        При покупке нового тарифа оставшиеся дни складываются с уже активными.
      </div>
    </section>
  `;

  document.getElementById("goToPlansBtn").addEventListener("click", () => {
    hapticLight();
    navigate("plans");
  });

  document.getElementById("goToDevicesBtn").addEventListener("click", () => {
    hapticLight();
    navigate("devices");
  });
}

function refreshPlanPrices() {
  document.querySelectorAll(".plan-card").forEach((card) => {
    const planId = Number(card.dataset.planId);
    const plan = state.plans.find((p) => p.id === planId);
    const priceEl = card.querySelector(".plan-price");

    if (priceEl) {
      priceEl.textContent = formatRubles(getPlanTotalPrice(plan));
    }
  });
}

function renderPlans() {
  if (!state.selectedPlan) {
    state.selectedPlan = state.plans[0];
  }

  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="section-title">
        <div>
          <h2>Тарифы</h2>
          <p>Выберите план и количество устройств</p>
        </div>
      </div>

      <div class="device-count-block">
        <div class="device-count-title">Количество устройств</div>
        <div class="device-count-grid">
          ${[1, 2, 3, 4, 5, 6].map((count) => `
            <button
              class="device-count-btn ${state.selectedDeviceCount === count ? "active" : ""}"
              data-device-count="${count}"
              type="button"
            >
              ${count}
            </button>
          `).join("")}
        </div>
      </div>

      <div class="plan-list">
        ${state.plans.map((plan) => `
          <button
            class="plan-card ${state.selectedPlan.id === plan.id ? "active" : ""}"
            data-plan-id="${plan.id}"
            type="button"
          >
            <div class="plan-head">
              <span class="plan-name">${plan.name}</span>
              <span class="plan-price">${formatRubles(getPlanTotalPrice(plan))}</span>
            </div>
            <div class="plan-desc">${plan.description} · ${plan.days} дней</div>
          </button>
        `).join("")}
      </div>

      <div class="action-row">
        <button class="primary-btn" id="openPaymentBtn" type="button">Перейти к оплате</button>
      </div>

      <button class="back-btn" id="backHomeFromPlans" type="button">Назад на главную</button>
    </section>
  `;

  const planButtons = document.querySelectorAll(".plan-card");
  const deviceButtons = document.querySelectorAll(".device-count-btn");

  planButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      hapticSelection();

      const id = Number(btn.dataset.planId);
      const plan = state.plans.find((p) => p.id === id);

      state.selectedPlan = plan;

      planButtons.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  deviceButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      hapticSelection();

      const count = Number(btn.dataset.deviceCount);
      state.selectedDeviceCount = count;

      deviceButtons.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");

      refreshPlanPrices();
    });
  });

  document.getElementById("openPaymentBtn").addEventListener("click", () => {
    hapticLight();
    openPaymentModal();
  });

  document.getElementById("backHomeFromPlans").addEventListener("click", () => {
    hapticLight();
    navigate("home");
  });
}

function renderDevices() {
  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="section-title">
        <div>
          <h2>Подключение</h2>
          <p>Выбери устройство для инструкции</p>
        </div>
      </div>

      <div class="device-grid">
        ${devices.map((device) => `
          <button class="device-card device-btn" data-device-id="${device.id}" type="button">
            <div class="device-icon">${device.icon}</div>
            <div class="device-name">${device.name}</div>
            <div class="device-subtitle">${device.subtitle}</div>
          </button>
        `).join("")}
      </div>

      <button class="back-btn" id="backHomeFromDevices" type="button">Назад на главную</button>
    </section>
  `;

  document.querySelectorAll(".device-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      hapticLight();
      const deviceId = btn.dataset.deviceId;
      const device = devices.find((d) => d.id === deviceId);
      showToast(`Инструкция для ${device.name}`);
    });
  });

  document.getElementById("backHomeFromDevices").addEventListener("click", () => {
    hapticLight();
    navigate("home");
  });
}

function navigate(screen) {
  state.currentScreen = screen;

  switch (screen) {
    case "home":
      renderHome();
      break;
    case "plans":
      renderPlans();
      break;
    case "devices":
      renderDevices();
      break;
    default:
      renderHome();
  }
}

function openPaymentModal() {
  if (!state.selectedPlan) {
    state.selectedPlan = state.plans[0];
  }

  modalPlanName.textContent = state.selectedPlan.name;
  modalDeviceCount.textContent = String(state.selectedDeviceCount);
  modalPlanPrice.textContent = formatRubles(getPlanTotalPrice(state.selectedPlan));
  paymentModal.classList.remove("hidden");

  document.querySelectorAll(".payment-method").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.method === state.selectedPaymentMethod);
  });
}

function closePayment() {
  paymentModal.classList.add("hidden");
}

function simulatePayment() {
  const plan = state.selectedPlan;

  confirmPaymentBtn.disabled = true;
  confirmPaymentBtn.textContent = "Обработка...";

  setTimeout(() => {
    state.subscription.active = true;
    state.subscription.plan = plan.name;
    state.subscription.daysLeft += plan.days;
    state.subscription.devices = Math.max(state.subscription.devices, state.selectedDeviceCount);

    updateStatusBar();
    closePayment();
    confirmPaymentBtn.disabled = false;
    confirmPaymentBtn.textContent = "Оплатить";

    hapticSuccess();
    showToast(`Добавлено ${plan.days} дней · ${state.selectedDeviceCount} устр.`);
    navigate("home");
  }, 1200);
}

document.querySelectorAll(".payment-method").forEach((btn) => {
  btn.addEventListener("click", () => {
    hapticSelection();
    state.selectedPaymentMethod = btn.dataset.method;

    document.querySelectorAll(".payment-method").forEach((item) => {
      item.classList.toggle("active", item.dataset.method === state.selectedPaymentMethod);
    });
  });
});

paymentBackdrop.addEventListener("click", closePayment);
closePaymentModal.addEventListener("click", closePayment);

confirmPaymentBtn.addEventListener("click", () => {
  hapticLight();
  simulatePayment();
});

setTelegramUser();
updateStatusBar();
state.selectedPlan = state.plans[0];
navigate("home");