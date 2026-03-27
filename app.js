const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const state = {
  currentScreen: "home",
  selectedPlan: null,
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
    expiresAt: null
  },
  plans: [
    {
      id: 1,
      name: "1 месяц",
      price: "199₽",
      days: 30,
      description: "Для знакомства"
    },
    {
      id: 2,
      name: "3 месяца",
      price: "499₽",
      days: 90,
      description: "Выгодный старт"
    },
    {
      id: 3,
      name: "12 месяцев",
      price: "1490₽",
      days: 365,
      description: "Лучшее предложение"
    }
  ],
  keys: [
    {
      id: 1,
      name: "WireGuard ключ",
      type: "WireGuard",
      meta: "Готов к подключению"
    },
    {
      id: 2,
      name: "Outline ключ",
      type: "Outline",
      meta: "Можно скопировать в 1 тап"
    },
    {
      id: 3,
      name: "OpenVPN конфиг",
      type: "OpenVPN",
      meta: "Получение конфигурации"
    }
  ],
  payments: []
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

function formatSubscriptionText() {
  if (!state.subscription.active) {
    return "Нет активной подписки";
  }

  return `${state.subscription.plan} · ${state.subscription.daysLeft} дней`;
}

function renderHome() {
  const activePlanText = formatSubscriptionText();

  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="section-title">
        <div>
          <h2>Главная</h2>
          <p>Управление подпиской и быстрый доступ к VPN</p>
        </div>
        <span class="badge">${state.subscription.active ? "Активен" : "Не активен"}</span>
      </div>

      <div class="stats-row">
        <div class="stat-box">
          <div class="label">Подписка</div>
          <div class="value">${state.subscription.active ? state.subscription.plan : "Нет"}</div>
        </div>
        <div class="stat-box">
          <div class="label">Осталось</div>
          <div class="value">${state.subscription.daysLeft} дн.</div>
        </div>
      </div>

      <div class="action-row">
        <button class="primary-btn" id="goToPlansBtn" type="button">Купить VPN</button>
        <button class="secondary-btn" id="openVpnBtn" type="button">Открыть VPN</button>
      </div>
    </section>

    <section class="card fade-in delay-1">
      <h3>Моя подписка</h3>
      <div class="kv">
        <span>Статус</span>
        <strong>${state.subscription.active ? "Активна" : "Неактивна"}</strong>
      </div>
      <div class="kv">
        <span>План</span>
        <strong>${activePlanText}</strong>
      </div>
      <div class="kv">
        <span>Доступ</span>
        <strong>${state.subscription.active ? "Готов к подключению" : "Требуется покупка"}</strong>
      </div>
    </section>

    <section class="card fade-in delay-1">
      <h3>Как это работает</h3>
      <div class="small-text">
        После оплаты пользователь получает доступ или конфигурацию для подключения в VPN-клиенте.
        Список серверов уже отображается внутри самого клиента.
      </div>
    </section>
  `;

  document.getElementById("goToPlansBtn").addEventListener("click", () => {
    hapticLight();
    navigate("plans");
  });

  document.getElementById("openVpnBtn").addEventListener("click", () => {
    hapticLight();
    showToast("Здесь позже будет ссылка на VPN-клиент");
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
          <p>Выберите план для покупки</p>
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
              <span class="plan-price">${plan.price}</span>
            </div>
            <div class="plan-desc">${plan.description} · ${plan.days} дней</div>
          </button>
        `).join("")}
      </div>

      <div class="action-row">
        <button class="primary-btn" id="openPaymentBtn" type="button">Перейти к оплате</button>
      </div>
    </section>
  `;

  document.querySelectorAll(".plan-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      hapticSelection();
      const id = Number(btn.dataset.planId);
      state.selectedPlan = state.plans.find((p) => p.id === id);
      renderPlans();
    });
  });

  document.getElementById("openPaymentBtn").addEventListener("click", () => {
    hapticLight();
    openPaymentModal();
  });
}

function renderProfile() {
  appContent.innerHTML = `
    <section class="card fade-in">
      <div class="section-title">
        <div>
          <h2>Профиль</h2>
          <p>Данные пользователя и доступ к VPN</p>
        </div>
      </div>

      <div class="kv">
        <span>Имя</span>
        <strong>${state.user.name}</strong>
      </div>
      <div class="kv">
        <span>Username</span>
        <strong>${state.user.username}</strong>
      </div>
      <div class="kv">
        <span>Подписка</span>
        <strong>${formatSubscriptionText()}</strong>
      </div>
    </section>

    <section class="card fade-in delay-1">
      <div class="section-title">
        <div>
          <h3>Доступ к VPN</h3>
          <p>Подключение через внешний клиент</p>
        </div>
      </div>

      <div class="key-list">
        ${state.keys.map((key) => `
          <div class="key-card">
            <div class="key-head">
              <span class="key-name">${key.name}</span>
              <span class="key-type">${key.type}</span>
            </div>
            <div class="key-meta">${key.meta}</div>
            <div class="action-row">
              <button class="secondary-btn copy-key-btn" data-key-id="${key.id}" type="button">Скопировать</button>
              <button class="primary-btn download-key-btn" data-key-id="${key.id}" type="button">Получить</button>
            </div>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="card fade-in delay-1">
      <div class="section-title">
        <div>
          <h3>История платежей</h3>
          <p>${state.payments.length ? "Последние операции" : "Пока пусто"}</p>
        </div>
      </div>

      <div class="history-list">
        ${state.payments.length
          ? state.payments.map((payment) => `
            <div class="history-item">
              <div class="history-head">
                <span class="plan-name">${payment.plan}</span>
                <span class="plan-price">${payment.price}</span>
              </div>
              <div class="history-meta">
                Метод: ${payment.method}<br>
                Дата: ${payment.date}<br>
                Статус: ${payment.status}
              </div>
            </div>
          `).join("")
          : `<div class="small-text">Платежей пока нет</div>`}
      </div>
    </section>
  `;

  document.querySelectorAll(".copy-key-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      hapticLight();

      const keyId = Number(btn.dataset.keyId);
      const key = state.keys.find((k) => k.id === keyId);
      const fakeKey = `${key.type.toLowerCase()}://demo-key-${key.id}-123456`;

      try {
        await navigator.clipboard.writeText(fakeKey);
        showToast(`${key.type} ключ скопирован`);
      } catch {
        showToast("Не удалось скопировать ключ");
      }
    });
  });

  document.querySelectorAll(".download-key-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      hapticLight();
      const keyId = Number(btn.dataset.keyId);
      const key = state.keys.find((k) => k.id === keyId);
      showToast(`Выдача доступа: ${key.name}`);
    });
  });
}

function navigate(screen) {
  state.currentScreen = screen;

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.screen === screen);
  });

  switch (screen) {
    case "home":
      renderHome();
      break;
    case "plans":
      renderPlans();
      break;
    case "profile":
      renderProfile();
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
  modalPlanPrice.textContent = state.selectedPlan.price;
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
    const now = new Date();

    const payment = {
      plan: plan.name,
      price: plan.price,
      method: state.selectedPaymentMethod,
      date: now.toLocaleString("ru-RU"),
      status: "Успешно"
    };

    state.payments.unshift(payment);
    state.subscription.active = true;
    state.subscription.plan = plan.name;
    state.subscription.daysLeft = plan.days;
    state.subscription.expiresAt = now;

    updateStatusBar();
    closePayment();
    confirmPaymentBtn.disabled = false;
    confirmPaymentBtn.textContent = "Оплатить";

    hapticSuccess();
    showToast(`Оплата прошла: ${plan.name}`);
    navigate("profile");
  }, 1200);
}

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    hapticSelection();
    navigate(btn.dataset.screen);
  });
});

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