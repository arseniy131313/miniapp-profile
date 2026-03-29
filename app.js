const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const MAX_DEVICES = 10;

const iconSet = {
  ios: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="7" y="2.8" width="10" height="18.4" rx="2.4"></rect>
      <path d="M10 5.7h4"></path>
      <circle cx="12" cy="17.8" r="0.7" fill="currentColor" stroke="none"></circle>
    </svg>
  `,
  android: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M8 9h8a2 2 0 0 1 2 2v5.5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2Z"></path>
      <path d="M9 9l-1.2-2M15 9l1.2-2M9 5.8c.9-.6 1.9-.8 3-.8s2.1.2 3 .8"></path>
      <circle cx="10" cy="12.2" r="0.6" fill="currentColor" stroke="none"></circle>
      <circle cx="14" cy="12.2" r="0.6" fill="currentColor" stroke="none"></circle>
    </svg>
  `,
  windows: `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5.2 10.5 4v7.6H3V5.2Zm8.6-1.4L21 2.4v9.2h-9.4V3.8ZM3 12.5h7.5v7.6L3 18.9v-6.4Zm8.6 0H21v9.2l-9.4-1.4v-7.8Z"></path>
    </svg>
  `,
  macos: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="4" y="5" width="16" height="11" rx="2"></rect>
      <path d="M8 19h8M10 16v3M14 16v3"></path>
    </svg>
  `,
  linux: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3c2 0 3.4 1.8 3.4 4.1 0 1-.3 2.1-.9 3l2 5.6c.5 1.5-.6 3.1-2.2 3.1h-4.6c-1.6 0-2.7-1.6-2.2-3.1l2-5.6c-.6-.9-.9-2-.9-3C8.6 4.8 10 3 12 3Z"></path>
      <circle cx="10.6" cy="7.2" r="0.5" fill="currentColor" stroke="none"></circle>
      <circle cx="13.4" cy="7.2" r="0.5" fill="currentColor" stroke="none"></circle>
      <path d="M10.8 10.1c.4.3.8.4 1.2.4s.8-.1 1.2-.4"></path>
    </svg>
  `,
  smarttv: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="11" rx="2"></rect>
      <path d="M9 19h6M12 16v3"></path>
    </svg>
  `
};

const devices = [
  {
    id: "ios",
    name: "iPhone / iPad",
    subtitle: "Быстрое подключение для устройств Apple",
    icon: iconSet.ios
  },
  {
    id: "android",
    name: "Android",
    subtitle: "Смартфоны и планшеты на Android",
    icon: iconSet.android
  },
  {
    id: "windows",
    name: "Windows",
    subtitle: "ПК и ноутбуки на Windows",
    icon: iconSet.windows
  },
  {
    id: "macos",
    name: "macOS",
    subtitle: "MacBook, iMac и другие компьютеры Apple",
    icon: iconSet.macos
  },
  {
    id: "linux",
    name: "Linux",
    subtitle: "Подключение для desktop и server-сценариев",
    icon: iconSet.linux
  },
  {
    id: "smarttv",
    name: "Smart TV",
    subtitle: "Телевизоры и медиаприставки",
    icon: iconSet.smarttv
  }
];

const monitoringLocations = [
  { name: "Германия", load: 28, latency: 39, availability: "99.99%" },
  { name: "Нидерланды", load: 46, latency: 33, availability: "99.98%" },
  { name: "Польша", load: 81, latency: 58, availability: "99.94%" }
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
      description: "Комфортный старт"
    },
    {
      id: 3,
      key: "6m",
      name: "6 месяцев",
      basePrice: 890,
      days: 180,
      months: 6,
      description: "Оптимальный баланс цены и срока"
    },
    {
      id: 4,
      key: "12m",
      name: "12 месяцев",
      basePrice: 1490,
      days: 365,
      months: 12,
      description: "Максимальная экономия на долгий срок"
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

function formatPriceMarkup(value) {
  const numeric = rubFormatter.format(value);
  return `${numeric}<span class="price-ruble">₽</span>`;
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

function getPlanMonthlyPrice(plan) {
  return Math.round(getPlanTotalPrice(plan) / plan.months);
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

function getStatusSubvalue() {
  if (!state.subscription.active) {
    return "Оформите тариф и получите доступ сразу после оплаты";
  }

  return state.subscription.plan || "Подписка активна";
}

function getDeviceUsageLabel() {
  if (!state.subscription.deviceLimit) {
    return "0 / 0";
  }

  return `0 / ${state.subscription.deviceLimit}`;
}

function getBestLocation() {
  return monitoringLocations.reduce((best, item) => item.load < best.load ? item : best, monitoringLocations[0]);
}

function renderHome() {
  const hasSubscription = state.subscription.active;
  const bestLocation = getBestLocation();

  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="home-stack">
        <div class="hero-card ${hasSubscription ? "active-panel" : ""}">
          <h2 class="hero-title">${hasSubscription ? `${state.subscription.daysLeft} дней` : "Оформите подписку"}</h2>
          <div class="hero-subtext">${getStatusSubvalue()}</div>

          <div class="hero-meta">
            <div class="metric-card">
              <div class="metric-label">Устройства</div>
              <div class="metric-value">${hasSubscription ? getDeviceUsageLabel() : "До 10"}</div>
              <div class="metric-subtext">${hasSubscription ? "Подключено сейчас / доступно по тарифу" : "Количество выбирается при оформлении"}</div>
            </div>

            <div class="metric-card">
              <div class="metric-label">Трафик</div>
              <div class="metric-value compact">${state.subscription.traffic}</div>
              <div class="metric-subtext">Без ограничений для пользователя</div>
            </div>
          </div>
        </div>

        <div class="action-row">
          <button class="primary-btn glow-btn" id="goToPlansBtn" type="button">${hasSubscription ? "Продлить" : "Купить"}</button>
          <button class="secondary-btn" id="goToDevicesBtn" type="button">Подключить</button>
        </div>

        <div class="mini-action-row">
          <button class="monitor-card" id="goToMonitoringBtn" type="button">
            <div class="monitor-top">
              <div class="monitor-title">Мониторинг сети</div>
              <div class="monitor-link">${bestLocation.name} · ${bestLocation.load}%</div>
            </div>
            <div class="monitor-note">Проверяйте загруженность локаций и быстро открывайте самый стабильный маршрут.</div>
            <div class="monitor-cta">Открыть мониторинг →</div>
          </button>
        </div>
      </div>
    </section>
  `;

  document.getElementById("goToPlansBtn").addEventListener("click", () => {
    hapticLight();

    if (hasSubscription) {
      state.selectedDeviceCount = 0;
    } else {
      state.selectedDeviceCount = Math.max(1, state.selectedDeviceCount);
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
    const monthlyEl = card.querySelector(".plan-monthly");

    if (priceEl && plan) {
      priceEl.innerHTML = formatPriceMarkup(getPlanTotalPrice(plan));
    }

    if (monthlyEl && plan) {
      monthlyEl.textContent = `≈ ${formatRubles(getPlanMonthlyPrice(plan))} / мес.`;
    }

    if (noteEl) {
      if (isRenewMode()) {
        const total = getSelectedTotalDeviceCount();
        const added = state.selectedDeviceCount;
        noteEl.textContent = added > 0
          ? `${state.subscription.deviceLimit} + ${added} = ${total} устройств`
          : `${total} устройств без изменений`;
      } else {
        noteEl.textContent = `за ${state.selectedDeviceCount} устройств`;
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

  if (plan.months === 1) {
    return `<span class="plan-badge base">Старт</span>`;
  }

  return `
    <span class="plan-badge discount">Скидка ${savings}%</span>
    ${plan.months === 3 ? `<span class="plan-badge hit">Хит</span>` : ""}
  `;
}

function renderPlans() {
  if (!state.selectedPlan) {
    state.selectedPlan = state.plans.find((plan) => plan.months === 3) || state.plans[0];
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
          <div class="eyebrow">Выбор тарифа</div>
          <h2>Тарифы</h2>
          <p>${renewMode
            ? "Выберите срок продления и при необходимости добавьте устройства до лимита 10."
            : "Выберите срок подписки и общее количество устройств."}
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
              ? `Сейчас доступно ${state.subscription.deviceLimit} устройств. Можно добавить ещё до ${maxAddable}.`
              : `Уже выбран максимальный лимит — ${MAX_DEVICES} устройств.`)
            : `На первой покупке можно выбрать от 1 до ${MAX_DEVICES} устройств.`}
        </div>
      </div>

      <div class="plan-list">
        ${state.plans.map((plan) => `
          <button class="plan-card ${state.selectedPlan.id === plan.id ? "active" : ""} ${plan.months === 3 ? "hit-plan" : ""}" data-plan-id="${plan.id}" type="button">
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

              <div class="plan-price-wrap">
                <div class="plan-price">${formatPriceMarkup(getPlanTotalPrice(plan))}</div>
                <div class="plan-price-note">
                  ${renewMode
                    ? (state.selectedDeviceCount > 0
                      ? `${state.subscription.deviceLimit} + ${state.selectedDeviceCount} = ${getSelectedTotalDeviceCount()} устройств`
                      : `${getSelectedTotalDeviceCount()} устройств без изменений`)
                    : `за ${state.selectedDeviceCount} устройств`}
                </div>
                <div class="plan-monthly">≈ ${formatRubles(getPlanMonthlyPrice(plan))} / мес.</div>
              </div>
            </div>
          </button>
        `).join("")}
      </div>

      <div class="action-row" style="margin-top:14px;">
        <button class="primary-btn glow-btn" id="openPaymentBtn" type="button">${renewMode ? "Продлить подписку" : "Перейти к оплате"}</button>
      </div>

      <button class="back-btn" id="backHomeFromPlans" type="button" style="margin-top:14px;">Назад на главную</button>
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
          <div class="eyebrow">Инструкции</div>
          <h2>Подключение устройств</h2>
          <p>Выберите платформу и откройте инструкцию по настройке VPN без лишних повторяющихся названий.</p>
        </div>
      </div>

      <div class="device-grid">
        ${devices.map((device) => `
          <button class="device-card device-btn" data-device-id="${device.id}" type="button">
            <div class="device-icon-wrap">${device.icon}</div>
            <div class="device-name">${device.name}</div>
            <div class="device-subtitle">${device.subtitle}</div>
          </button>
        `).join("")}
      </div>

      <button class="back-btn" id="backHomeFromDevices" type="button" style="margin-top:14px;">Назад на главную</button>
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

function getMonitoringTone(percent) {
  if (percent < 35) return "low";
  if (percent < 65) return "mid";
  if (percent < 85) return "high";
  return "critical";
}

function getMonitoringLabel(percent) {
  if (percent < 35) return "Свободно";
  if (percent < 65) return "Стабильно";
  if (percent < 85) return "Нагрузка";
  return "Пик";
}

function getMonitoringMessage(percent) {
  if (percent < 35) return "Низкая нагрузка, локация подходит для подключения.";
  if (percent < 65) return "Сервер работает стабильно и подходит для повседневного использования.";
  if (percent < 85) return "Нагрузка повышена, в пиковые часы возможны небольшие задержки.";
  return "Высокая нагрузка, лучше выбрать соседнюю локацию.";
}

function getMonitoringRow(location, isBest) {
  const tone = getMonitoringTone(location.load);

  return `
    <div class="monitoring-row">
      <div class="monitoring-head">
        <div class="monitoring-location">${location.name}</div>
        <div class="monitoring-percent">${location.load}%</div>
      </div>

      <div class="monitoring-badges">
        <span class="status-badge ${tone}">${getMonitoringLabel(location.load)}</span>
        ${isBest ? `<span class="status-badge best">Рекомендуется</span>` : ""}
      </div>

      <div class="progress-track">
        <div class="progress-bar ${tone}" style="width:${location.load}%;"></div>
      </div>

      <div class="monitoring-meta">
        <span>Задержка: ${location.latency} мс</span>
        <span>Доступность: ${location.availability}</span>
      </div>

      <div class="metric-subtext">${getMonitoringMessage(location.load)}</div>
    </div>
  `;
}

function renderMonitoring() {
  const bestLocation = getBestLocation();
  const averageLoad = Math.round(monitoringLocations.reduce((sum, item) => sum + item.load, 0) / monitoringLocations.length);

  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="section-title">
        <div>
          <div class="eyebrow">Состояние сети</div>
          <h2>Мониторинг</h2>
          <p>Экран выглядит чище и ближе к премиальному продукту: сразу видно лучшую локацию, нагрузку и стабильность сети.</p>
        </div>
      </div>

      <div class="monitoring-summary">
        <div class="monitoring-summary-card">
          <div class="metric-label">Локаций</div>
          <div class="monitoring-summary-value">${monitoringLocations.length}</div>
          <div class="monitoring-summary-note">Доступно для выбора</div>
        </div>

        <div class="monitoring-summary-card">
          <div class="metric-label">Средняя нагрузка</div>
          <div class="monitoring-summary-value">${averageLoad}%</div>
          <div class="monitoring-summary-note">По активным серверам</div>
        </div>

        <div class="monitoring-summary-card">
          <div class="metric-label">Лучшая локация</div>
          <div class="monitoring-summary-value">${bestLocation.name}</div>
          <div class="monitoring-summary-note">Сейчас ${bestLocation.load}% нагрузки</div>
        </div>
      </div>

      <div class="monitoring-list">
        ${monitoringLocations.map((item) => getMonitoringRow(item, item.name === bestLocation.name)).join("")}
      </div>

      <button class="back-btn" id="backHomeFromMonitoring" type="button" style="margin-top:14px;">Назад на главную</button>
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
    state.selectedPlan = state.plans.find((plan) => plan.months === 3) || state.plans[0];
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
  const renew = isRenewMode();

  confirmPaymentBtn.disabled = true;
  confirmPaymentBtn.textContent = "Обработка...";

  setTimeout(() => {
    if (renew) {
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
    confirmPaymentBtn.textContent = renew ? "Продлить" : "Оплатить";

    hapticSuccess();

    if (renew) {
      showToast(`Продлено на ${plan.days} дней · лимит ${state.subscription.deviceLimit} устройств`);
    } else {
      showToast(`Активировано на ${plan.days} дней · лимит ${state.subscription.deviceLimit} устройств`);
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
state.selectedPlan = state.plans.find((plan) => plan.months === 3) || state.plans[0];
navigate("home");