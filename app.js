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

const rubFormatter = new Intl.NumberFormat("ru-RU");

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
    deviceLimit: 0,
    traffic: "Безлимит",
    connectedDeviceIds: []
  },
  plans: [
    {
      id: 1,
      key: "1m",
      name: "1 месяц",
      basePrice: 199,
      days: 30,
      months: 1,
      description: "Для знакомства"
    },
    {
      id: 2,
      key: "3m",
      name: "3 месяца",
      basePrice: 499,
      days: 90,
      months: 3,
      description: "Уже заметно выгоднее"
    },
    {
      id: 3,
      key: "6m",
      name: "6 месяцев",
      basePrice: 890,
      days: 180,
      months: 6,
      description: "Оптимальный баланс цены"
    },
    {
      id: 4,
      key: "12m",
      name: "12 месяцев",
      basePrice: 1490,
      days: 365,
      months: 12,
      description: "Максимум выгоды на год"
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
const modalPlanSave = document.getElementById("modalPlanSave");
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
  return `${rubFormatter.format(value)}₽`;
}

function getMonthlyPlan() {
  return state.plans.find((plan) => plan.months === 1) || state.plans[0];
}

function getPlanTotalPrice(plan) {
  return plan.basePrice * state.selectedDeviceCount;
}

function getPlanSavingsPercent(plan) {
  const monthlyPlan = getMonthlyPlan();

  if (!monthlyPlan || plan.months <= 1) {
    return 0;
  }

  const regularPrice = monthlyPlan.basePrice * plan.months;
  const diff = regularPrice - plan.basePrice;
  return Math.max(0, Math.round((diff / regularPrice) * 100));
}

function getConnectedDevicesCount() {
  return state.subscription.connectedDeviceIds.length;
}

function getDeviceUsageLabel() {
  if (!state.subscription.deviceLimit) {
    return "0/0 активно";
  }

  return `${getConnectedDevicesCount()}/${state.subscription.deviceLimit} активно`;
}

function getRemainingSlots() {
  return Math.max(0, state.subscription.deviceLimit - getConnectedDevicesCount());
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
    statusText.textContent = `VPN активен · ${state.subscription.daysLeft} дн.`;
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

function getStatusSubvalue() {
  if (!state.subscription.active) {
    return "После оплаты доступ откроется сразу";
  }

  return `${state.subscription.plan || "Подписка"}`;
}

function getBenefitCardsMarkup() {
  return `
    <div class="benefits-grid">
      <div class="benefit-card blue">
        <div class="benefit-icon">⚡</div>
        <div class="benefit-title">Быстрое подключение</div>
        <div class="benefit-text">Открытие конфигов и активация устройств в пару касаний прямо из миниаппы.</div>
      </div>

      <div class="benefit-card violet">
        <div class="benefit-icon">🛡️</div>
        <div class="benefit-title">Стабильность и приватность</div>
        <div class="benefit-text">Акцент на стабильных серверах, понятном управлении подпиской и аккуратной выдаче доступов.</div>
      </div>

      <div class="benefit-card green">
        <div class="benefit-icon">📶</div>
        <div class="benefit-title">Устройства под контролем</div>
        <div class="benefit-text">Будет легко видеть лимит устройств, активные подключения и продлевать подписку без лишних шагов.</div>
      </div>

      <div class="benefit-card gold">
        <div class="benefit-icon">✨</div>
        <div class="benefit-title">Сделано с заделом</div>
        <div class="benefit-text">Текущая логика уже подготовлена под подключение реального бэкенда, серверов и биллинга.</div>
      </div>
    </div>
  `;
}

function renderHome() {
  const hasSubscription = state.subscription.active;
  const connectedCount = getConnectedDevicesCount();
  const deviceLimit = state.subscription.deviceLimit;

  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="stats-row">
        <div class="stat-box ${hasSubscription ? "success" : "highlight"}">
          <div class="label">Статус</div>
          <div class="value">${getStatusTitle()}</div>
          <div class="subvalue">${getStatusSubvalue()}</div>
        </div>

        <div class="stat-box highlight">
          <div class="label">Осталось</div>
          <div class="value">${state.subscription.daysLeft} дн.</div>
          <div class="subvalue">${hasSubscription ? "Продление складывается сверху" : "Срок появится после оплаты"}</div>
        </div>

        <div class="stat-box">
          <div class="label">Трафик</div>
          <div class="value compact">${state.subscription.traffic}</div>
          <div class="subvalue">Без урезания по скорости в интерфейсе</div>
        </div>

        <div class="stat-box highlight">
          <div class="label">Устройства</div>
          <div class="value compact">${deviceLimit ? `${connectedCount}/${deviceLimit} активно` : "0/0 активно"}</div>
          <div class="subvalue">${deviceLimit ? `${getRemainingSlots()} свободно для активации` : "Выберите лимит на тарифах"}</div>
        </div>
      </div>

      <div class="action-row">
        <button class="primary-btn glow-btn" id="goToPlansBtn" type="button">${hasSubscription ? "Продлить" : "Купить"}</button>
        <button class="secondary-btn" id="goToDevicesBtn" type="button">Подключить</button>
      </div>

      <div class="mini-action-row">
        <button class="ghost-btn" id="renewSubscriptionBtn" type="button">Продлить подписку</button>
      </div>

      <div class="hero-note">
        <div class="hero-note-title"><span class="spark">✦</span> Будущая логика уже предусмотрена</div>
        <div class="hero-note-text">
          Структура состояния готова под реальные ответы API: статус подписки, лимит устройств, активные подключения,
          продление, биллинг и инструкции по платформам.
        </div>
      </div>
    </section>

    <section class="card fade-in delay-1">
      <div class="section-title">
        <div>
          <h3>Почему сервис выглядит сильнее других</h3>
          <p>Не просто «подключить VPN», а удобный сервис с нормальным управлением.</p>
        </div>
      </div>

      ${getBenefitCardsMarkup()}

      <div class="premium-banner">
        <div class="premium-banner-title">Премиальный сценарий внутри Telegram</div>
        <div class="premium-banner-text">
          Акцент на минимуме действий: выбрал тариф, задал лимит устройств, оплатил, активировал устройства и позже продлил доступ из того же экрана.
        </div>
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

  document.getElementById("renewSubscriptionBtn").addEventListener("click", () => {
    hapticLight();
    navigate("plans");
  });
}

function updateCountUI() {
  const triggerValue = document.getElementById("countValue");

  if (triggerValue) {
    triggerValue.textContent = String(state.selectedDeviceCount);
  }

  document.querySelectorAll(".count-option").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.deviceCount) === state.selectedDeviceCount);
  });
}

function refreshPlanPrices() {
  document.querySelectorAll(".plan-card").forEach((card) => {
    const planId = Number(card.dataset.planId);
    const plan = state.plans.find((item) => item.id === planId);
    const priceEl = card.querySelector(".plan-price");

    if (priceEl && plan) {
      priceEl.textContent = formatRubles(getPlanTotalPrice(plan));
    }
  });
}

function openCountMenu() {
  const picker = document.getElementById("countPicker");
  const menu = document.getElementById("countMenu");

  if (!picker || !menu) {
    return;
  }

  menu.classList.remove("hidden");
  picker.classList.add("open");
}

function closeCountMenu() {
  const picker = document.getElementById("countPicker");
  const menu = document.getElementById("countMenu");

  if (!picker || !menu) {
    return;
  }

  menu.classList.add("hidden");
  picker.classList.remove("open");
}

function bindCountPicker() {
  const trigger = document.getElementById("countTrigger");
  const options = document.querySelectorAll(".count-option");

  if (trigger) {
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const menu = document.getElementById("countMenu");

      if (menu?.classList.contains("hidden")) {
        openCountMenu();
      } else {
        closeCountMenu();
      }
    });
  }

  options.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      hapticSelection();

      state.selectedDeviceCount = Number(btn.dataset.deviceCount);
      updateCountUI();
      refreshPlanPrices();
      closeCountMenu();
    });
  });
}

function getPlanBadgeMarkup(plan) {
  const savings = getPlanSavingsPercent(plan);

  if (savings <= 0) {
    return `<span class="plan-badge base">Базовый тариф</span>`;
  }

  const bestBadge = plan.months >= 12 ? `<span class="plan-badge best">Хит</span>` : "";
  return `
    <span class="plan-badge discount">Выгоднее на ${savings}%</span>
    ${bestBadge}
  `;
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
          <p>Выберите срок и лимит устройств. Проценты сразу показывают выгоду относительно месячной подписки.</p>
        </div>
      </div>

      <div class="device-count-block">
        <div class="device-count-title">Количество устройств</div>

        <div class="count-picker" id="countPicker">
          <button class="count-trigger" id="countTrigger" type="button">
            <span class="count-trigger-label">Устройств</span>
            <span class="count-trigger-value">
              <strong id="countValue">${state.selectedDeviceCount}</strong>
              <span class="count-chevron">▾</span>
            </span>
          </button>

          <div class="count-menu hidden" id="countMenu">
            <div class="count-options-grid">
              ${Array.from({ length: 10 }, (_, index) => {
                const count = index + 1;
                return `
                  <button
                    class="count-option ${state.selectedDeviceCount === count ? "active" : ""}"
                    data-device-count="${count}"
                    type="button"
                  >
                    ${count}
                  </button>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      </div>

      <div class="plan-list">
        ${state.plans.map((plan) => `
          <button
            class="plan-card ${state.selectedPlan.id === plan.id ? "active" : ""}"
            data-plan-id="${plan.id}"
            type="button"
          >
            <div class="plan-topline">
              <div class="plan-badges">
                ${getPlanBadgeMarkup(plan)}
              </div>
            </div>

            <div class="plan-head">
              <div>
                <div class="plan-name">${plan.name}</div>
                <div class="plan-desc">${plan.description} · ${plan.days} дней доступа</div>
              </div>

              <div>
                <div class="plan-price">${formatRubles(getPlanTotalPrice(plan))}</div>
                <div class="plan-price-note">за ${state.selectedDeviceCount} устр.</div>
              </div>
            </div>
          </button>
        `).join("")}
      </div>

      <div class="action-row">
        <button class="primary-btn glow-btn" id="openPaymentBtn" type="button">${state.subscription.active ? "Продлить подписку" : "Перейти к оплате"}</button>
      </div>

      <button class="back-btn" id="backHomeFromPlans" type="button">Назад на главную</button>
    </section>
  `;

  const planButtons = document.querySelectorAll(".plan-card");

  planButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      hapticSelection();

      const id = Number(btn.dataset.planId);
      const plan = state.plans.find((item) => item.id === id);
      state.selectedPlan = plan;

      planButtons.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  bindCountPicker();

  document.getElementById("openPaymentBtn").addEventListener("click", () => {
    hapticLight();
    openPaymentModal();
  });

  document.getElementById("backHomeFromPlans").addEventListener("click", () => {
    hapticLight();
    navigate("home");
  });
}

function getDeviceStatus(deviceId) {
  if (!state.subscription.active) {
    return {
      text: "Нужна подписка",
      className: "inactive"
    };
  }

  if (state.subscription.connectedDeviceIds.includes(deviceId)) {
    return {
      text: "Подключено",
      className: "connected"
    };
  }

  if (getConnectedDevicesCount() < state.subscription.deviceLimit) {
    return {
      text: "Доступно",
      className: "available"
    };
  }

  return {
    text: "Лимит достигнут",
    className: "locked"
  };
}

function toggleDeviceConnection(deviceId) {
  if (!state.subscription.active) {
    return "inactive";
  }

  const alreadyConnected = state.subscription.connectedDeviceIds.includes(deviceId);

  if (alreadyConnected) {
    state.subscription.connectedDeviceIds = state.subscription.connectedDeviceIds.filter((id) => id !== deviceId);
    return "disconnected";
  }

  if (getConnectedDevicesCount() >= state.subscription.deviceLimit) {
    return "limit";
  }

  state.subscription.connectedDeviceIds = [...state.subscription.connectedDeviceIds, deviceId];
  return "connected";
}

function renderDevices() {
  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="section-title">
        <div>
          <h2>Подключение</h2>
          <p>Здесь позже можно будет открывать реальные конфиги и инструкции по платформам.</p>
        </div>
      </div>

      <div class="device-overview">
        <div class="device-overview-top">
          <div class="device-overview-title">Устройства в работе</div>
          <div class="usage-pill">${getDeviceUsageLabel()}</div>
        </div>
        <div class="small-text" style="margin-top: 8px;">
          ${state.subscription.active
            ? "Нажатие на карточку пока имитирует подключение или отключение устройства."
            : "После активации подписки тут можно будет подключать устройства и видеть живой статус."}
        </div>
      </div>

      <div class="device-grid">
        ${devices.map((device) => {
          const status = getDeviceStatus(device.id);
          const isConnected = status.className === "connected";
          const isLocked = status.className === "locked";

          return `
            <button
              class="device-card device-btn ${isConnected ? "connected" : ""} ${isLocked ? "locked" : ""}"
              data-device-id="${device.id}"
              type="button"
            >
              <div class="device-icon">${device.icon}</div>
              <div class="device-name">${device.name}</div>
              <div class="device-subtitle">${device.subtitle}</div>
              <span class="device-status ${status.className}">${status.text}</span>
            </button>
          `;
        }).join("")}
      </div>

      <button class="back-btn" id="backHomeFromDevices" type="button">Назад на главную</button>
    </section>
  `;

  document.querySelectorAll(".device-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      hapticLight();

      const deviceId = btn.dataset.deviceId;
      const device = devices.find((item) => item.id === deviceId);
      const action = toggleDeviceConnection(deviceId);

      updateStatusBar();
      renderDevices();

      if (action === "inactive") {
        showToast("Сначала активируйте подписку");
        return;
      }

      if (action === "limit") {
        showToast(`Достигнут лимит: ${state.subscription.deviceLimit} устройств`);
        return;
      }

      if (action === "disconnected") {
        showToast(`${device.name} отключено`);
        return;
      }

      if (action === "connected") {
        showToast(`${device.name} подключено`);
      }
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

  const savings = getPlanSavingsPercent(state.selectedPlan);

  modalPlanName.textContent = state.selectedPlan.name;
  modalDeviceCount.textContent = String(state.selectedDeviceCount);
  modalPlanPrice.textContent = formatRubles(getPlanTotalPrice(state.selectedPlan));
  modalPlanSave.textContent = savings > 0 ? `${savings}% к месячному` : "Базовый тариф";
  confirmPaymentBtn.textContent = state.subscription.active ? "Продлить" : "Оплатить";
  paymentModal.classList.remove("hidden");

  document.querySelectorAll(".payment-method").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.method === state.selectedPaymentMethod);
  });
}

function closePayment() {
  paymentModal.classList.add("hidden");
}

function ensureInitialConnectedDevice() {
  if (!state.subscription.connectedDeviceIds.length && state.subscription.deviceLimit > 0) {
    state.subscription.connectedDeviceIds = [devices[0].id];
  }
}

function simulatePayment() {
  const plan = state.selectedPlan;

  confirmPaymentBtn.disabled = true;
  confirmPaymentBtn.textContent = "Обработка...";

  setTimeout(() => {
    state.subscription.active = true;
    state.subscription.plan = plan.name;
    state.subscription.daysLeft += plan.days;
    state.subscription.deviceLimit = Math.max(state.subscription.deviceLimit, state.selectedDeviceCount);

    ensureInitialConnectedDevice();
    updateStatusBar();
    closePayment();
    confirmPaymentBtn.disabled = false;
    confirmPaymentBtn.textContent = "Оплатить";

    hapticSuccess();
    showToast(`Добавлено ${plan.days} дней · лимит ${state.subscription.deviceLimit} устр.`);
    navigate("home");
  }, 1200);
}

// TODO: при подключении реального бэкенда заменить эмуляцию оплаты на запрос к API.
// TODO: connectedDeviceIds, deviceLimit, plan, daysLeft и traffic готовы для подстановки реальных данных.

document.querySelectorAll(".payment-method").forEach((btn) => {
  btn.addEventListener("click", () => {
    hapticSelection();
    state.selectedPaymentMethod = btn.dataset.method;

    document.querySelectorAll(".payment-method").forEach((item) => {
      item.classList.toggle("active", item.dataset.method === state.selectedPaymentMethod);
    });
  });
});

document.addEventListener("click", (event) => {
  if (state.currentScreen !== "plans") {
    return;
  }

  const picker = document.getElementById("countPicker");
  if (!picker) {
    return;
  }

  if (!picker.contains(event.target)) {
    closeCountMenu();
  }
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
