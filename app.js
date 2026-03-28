const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const MAX_DEVICES = 10;

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
    traffic: "Безлимит"
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

function isRenewMode() {
  return state.subscription.active;
}

function getMonthlyPlan() {
  return state.plans.find((plan) => plan.months === 1) || state.plans[0];
}

function getMaxAddableDevices() {
  return Math.max(0, MAX_DEVICES - state.subscription.deviceLimit);
}

function getSelectedTotalDeviceCount() {
  return isRenewMode()
    ? state.subscription.deviceLimit + state.selectedDeviceCount
    : state.selectedDeviceCount;
}

function getCountOptions() {
  if (!isRenewMode()) {
    return Array.from({ length: MAX_DEVICES }, (_, index) => index + 1);
  }

  const maxAddable = getMaxAddableDevices();
  return Array.from({ length: maxAddable + 1 }, (_, index) => index);
}

function getPlanTotalPrice(plan) {
  return plan.basePrice * getSelectedTotalDeviceCount();
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

function getStatusSubvalue() {
  if (!state.subscription.active) {
    return "Доступ откроется после оплаты";
  }

  return state.subscription.plan || "Подписка активна";
}

function getDeviceUsageLabel() {
  if (!state.subscription.deviceLimit) {
    return "0/0 активно";
  }

  return `0/${state.subscription.deviceLimit} активно`;
}

function renderHome() {
  const hasSubscription = state.subscription.active;

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
          <div class="subvalue">${hasSubscription ? "Продление прибавляет дни сверху" : "Срок появится после оплаты"}</div>
        </div>

        <div class="stat-box">
          <div class="label">Трафик</div>
          <div class="value compact">${state.subscription.traffic}</div>
          <div class="subvalue">Параметр можно будет получать с backend</div>
        </div>

        <div class="stat-box highlight">
          <div class="label">Устройства</div>
          <div class="value compact">${state.subscription.deviceLimit ? getDeviceUsageLabel() : "0/0 активно"}</div>
          <div class="subvalue">${state.subscription.deviceLimit ? "Лимит определяется тарифом" : "Выберите лимит на тарифах"}</div>
        </div>
      </div>

      <div class="action-row">
        <button class="primary-btn glow-btn" id="goToPlansBtn" type="button">${hasSubscription ? "Продлить" : "Купить"}</button>
        <button class="secondary-btn" id="goToDevicesBtn" type="button">Подключить</button>
      </div>

      <div class="mini-action-row">
        <button class="ghost-btn" id="goToMonitoringBtn" type="button">Мониторинг</button>
      </div>

      <div class="hero-note">
        <div class="hero-note-title"><span class="spark">✦</span> Что будет в разделе Мониторинг</div>
        <div class="hero-note-text">
          При нажатии на кнопку <strong>Мониторинг</strong> открываться статуистика загруженности по локациям.
        </div>
      </div>
    </section>
  `;

  document.getElementById("goToPlansBtn").addEventListener("click", () => {
    hapticLight();

    if (hasSubscription) {
      state.selectedDeviceCount = 0;
    } else {
      state.selectedDeviceCount = 1;
    }

    navigate("plans");
  });

  document.getElementById("goToDevicesBtn").addEventListener("click", () => {
    hapticLight();
    navigate("devices");
  });

  document.getElementById("goToMonitoringBtn").addEventListener("click", () => {
    hapticLight();
    navigate("monitoring");
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
    const noteEl = card.querySelector(".plan-price-note");

    if (priceEl && plan) {
      priceEl.textContent = formatRubles(getPlanTotalPrice(plan));
    }

    if (noteEl) {
      if (isRenewMode()) {
        const total = getSelectedTotalDeviceCount();
        const added = state.selectedDeviceCount;
        noteEl.textContent = added > 0
          ? `${state.subscription.deviceLimit} + ${added} = ${total} устр.`
          : `${total} устр. без изменений`;
      } else {
        noteEl.textContent = `за ${state.selectedDeviceCount} устр.`;
      }
    }
  });
}

function openCountMenu() {
  const picker = document.getElementById("countPicker");
  const menu = document.getElementById("countMenu");

  if (!picker || !menu) return;

  menu.classList.remove("hidden");
  picker.classList.add("open");
}

function closeCountMenu() {
  const picker = document.getElementById("countPicker");
  const menu = document.getElementById("countMenu");

  if (!picker || !menu) return;

  menu.classList.add("hidden");
  picker.classList.remove("open");
}

function bindCountPicker() {
  const trigger = document.getElementById("countTrigger");
  const options = document.querySelectorAll(".count-option");

  if (trigger && !trigger.disabled) {
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

  const bestBadge = plan.months === 3 ? `<span class="plan-badge best">Хит</span>` : "";

  return `
    <span class="plan-badge discount">Выгоднее на ${savings}%</span>
    ${bestBadge}
  `;
}

function renderPlans() {
  if (!state.selectedPlan) {
    state.selectedPlan = state.plans[0];
  }

  const renewMode = isRenewMode();
  const countOptions = getCountOptions();
  const maxAddable = getMaxAddableDevices();

  if (renewMode) {
    if (state.selectedDeviceCount < 0 || state.selectedDeviceCount > maxAddable) {
      state.selectedDeviceCount = 0;
    }
  } else if (state.selectedDeviceCount < 1) {
    state.selectedDeviceCount = 1;
  }

  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="section-title">
        <div>
          <h2>Тарифы</h2>
          <p>${renewMode
            ? "Выберите срок продления. При необходимости можно добавить устройства до максимума 10."
            : "Выберите срок и общее количество устройств. Выгода считается относительно месячного тарифа."}
          </p>
        </div>
      </div>

      <div class="device-count-block">
        <div class="device-count-title">${renewMode ? "Добавить устройства" : "Количество устройств"}</div>

        <div class="count-picker" id="countPicker">
          <button class="count-trigger" id="countTrigger" type="button" ${renewMode && maxAddable === 0 ? "disabled" : ""}>
            <span class="count-trigger-label">${renewMode ? "Добавить" : "Устройств"}</span>
            <span class="count-trigger-value">
              <strong id="countValue">${state.selectedDeviceCount}</strong>
              <span class="count-chevron">▾</span>
            </span>
          </button>

          <div class="count-menu hidden" id="countMenu">
            <div class="count-options-grid">
              ${countOptions.map((count) => `
                <button
                  class="count-option ${state.selectedDeviceCount === count ? "active" : ""}"
                  data-device-count="${count}"
                  type="button"
                >
                  ${count}
                </button>
              `).join("")}
            </div>
          </div>
        </div>

        <div class="count-helper">
          ${renewMode
            ? (maxAddable > 0
              ? `Сейчас у вас ${state.subscription.deviceLimit} из ${MAX_DEVICES} устройств. Можно добавить ещё до ${maxAddable}.`
              : `У вас уже максимальный лимит — ${MAX_DEVICES} устройств.`)
            : `На первой покупке выбирается общее количество устройств от 1 до ${MAX_DEVICES}.`}
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
                <div class="plan-price-note">
                  ${renewMode
                    ? (state.selectedDeviceCount > 0
                      ? `${state.subscription.deviceLimit} + ${state.selectedDeviceCount} = ${getSelectedTotalDeviceCount()} устр.`
                      : `${getSelectedTotalDeviceCount()} устр. без изменений`)
                    : `за ${state.selectedDeviceCount} устр.`}
                </div>
              </div>
            </div>
          </button>
        `).join("")}
      </div>

      <div class="action-row">
        <button class="primary-btn glow-btn" id="openPaymentBtn" type="button">
          ${renewMode ? "Продлить подписку" : "Перейти к оплате"}
        </button>
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

function renderDevices() {
  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="section-title">
        <div>
          <h2>Подключение</h2>
          <p>Выберите устройство и откройте инструкцию по настройке VPN.</p>
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
      const device = devices.find((item) => item.id === deviceId);
      showToast(`Открыта инструкция для ${device.name}`);
    });
  });

  document.getElementById("backHomeFromDevices").addEventListener("click", () => {
    hapticLight();
    navigate("home");
  });
}

function getMonitoringRow(title, percent, color) {
  return `
    <div class="stat-box" style="padding: 14px; margin-top: 12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:10px;">
        <div style="font-weight:800; font-size:15px;">${title}</div>
        <div style="color:#dbeafe; font-weight:700;">${percent}%</div>
      </div>

      <div style="height:10px; border-radius:999px; background:rgba(255,255,255,0.08); overflow:hidden;">
        <div style="width:${percent}%; height:100%; border-radius:999px; background:${color}; box-shadow:0 0 20px rgba(255,255,255,0.12);"></div>
      </div>

      <div style="margin-top:10px; color:var(--muted); font-size:13px; line-height:1.4;">
        ${percent < 50 ? "Низкая нагрузка, локация выглядит свободной." : percent < 80 ? "Средняя нагрузка, подключение возможно." : "Высокая нагрузка, желательно выбрать другую локацию."}
      </div>
    </div>
  `;
}

function renderMonitoring() {
  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="section-title">
        <div>
          <h2>Мониторинг</h2>
          <p>Заготовка под будущий экран нагрузки по локациям и лимитам подключений.</p>
        </div>
      </div>

      <div class="small-text" style="margin-top: 8px;">
        Здесь позже можно будет выводить реальные данные с backend: список стран, доступность серверов,
        процент заполненности и смену цвета индикатора от зелёного к красному.
      </div>

      ${getMonitoringRow("Germany", 28, "linear-gradient(90deg, #22c55e, #4ade80)")}
      ${getMonitoringRow("Netherlands", 57, "linear-gradient(90deg, #f59e0b, #fbbf24)")}
      ${getMonitoringRow("Poland", 84, "linear-gradient(90deg, #ef4444, #f87171)")}

      <button class="back-btn" id="backHomeFromMonitoring" type="button">Назад на главную</button>
    </section>
  `;

  document.getElementById("backHomeFromMonitoring").addEventListener("click", () => {
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
    case "monitoring":
      renderMonitoring();
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
  modalPlanPrice.textContent = formatRubles(getPlanTotalPrice(state.selectedPlan));
  modalPlanSave.textContent = savings > 0 ? `${savings}%` : "0%";

  if (isRenewMode()) {
    if (state.selectedDeviceCount > 0) {
      modalDeviceCount.textContent = `+${state.selectedDeviceCount} → ${getSelectedTotalDeviceCount()} всего`;
    } else {
      modalDeviceCount.textContent = `${getSelectedTotalDeviceCount()} всего`;
    }
  } else {
    modalDeviceCount.textContent = String(state.selectedDeviceCount);
  }

  confirmPaymentBtn.textContent = state.subscription.active ? "Продлить" : "Оплатить";
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
    if (isRenewMode()) {
      state.subscription.daysLeft += plan.days;
      state.subscription.plan = plan.name;
      state.subscription.deviceLimit = getSelectedTotalDeviceCount();
    } else {
      state.subscription.active = true;
      state.subscription.plan = plan.name;
      state.subscription.daysLeft += plan.days;
      state.subscription.deviceLimit = state.selectedDeviceCount;
    }

    updateStatusBar();
    closePayment();
    confirmPaymentBtn.disabled = false;
    confirmPaymentBtn.textContent = "Оплатить";

    hapticSuccess();

    if (state.subscription.active && isRenewMode()) {
      showToast(`Продлено на ${plan.days} дней · лимит ${state.subscription.deviceLimit} устр.`);
    } else {
      showToast(`Добавлено ${plan.days} дней · лимит ${state.subscription.deviceLimit} устр.`);
    }

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

document.addEventListener("click", (event) => {
  if (state.currentScreen !== "plans") return;

  const picker = document.getElementById("countPicker");
  if (!picker) return;

  if (!picker.contains(event.target)) {
    closeCountMenu();
  }
});

paymentBackdrop?.addEventListener("click", closePayment);
closePaymentModal?.addEventListener("click", closePayment);

confirmPaymentBtn?.addEventListener("click", () => {
  hapticLight();
  simulatePayment();
});

setTelegramUser();
updateStatusBar();
state.selectedPlan = state.plans[0];
navigate("home");