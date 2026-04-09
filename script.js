document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('lumemflow-theme');

  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('lumemflow-theme', next);
    });
  }

  const body = document.body;
  const currentPage = body.dataset.page;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transitionStorageKey = 'lumemflow-auth-transition';

  function createTransitionOverlay(direction) {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';

    const label = direction === 'register' ? 'Preparando cadastro' : 'Voltando ao login';
    overlay.innerHTML = `
      <div class="transition-wash"></div>
      <div class="transition-stripe"></div>
      <div class="transition-orb transition-orb-a"></div>
      <div class="transition-orb transition-orb-b"></div>
      <div class="transition-label">${label}</div>
    `;

    return overlay;
  }

  function consumePendingTransition() {
    const raw = sessionStorage.getItem(transitionStorageKey);
    if (!raw) return null;

    sessionStorage.removeItem(transitionStorageKey);

    try {
      const data = JSON.parse(raw);
      if (Date.now() - data.timestamp > 4000) return null;
      return data;
    } catch (error) {
      return null;
    }
  }

  function runEntryTransition() {
    if (prefersReducedMotion) return;

    const pending = consumePendingTransition();
    if (!pending || pending.to !== currentPage) return;

    body.classList.add('is-entering', `transition-${pending.from}-to-${pending.to}`);

    window.setTimeout(() => {
      body.classList.remove('is-entering', `transition-${pending.from}-to-${pending.to}`);
    }, 1500);
  }

  function runLegalEntryAnimation() {
    if (prefersReducedMotion) return;
    if (!body.classList.contains('legal-page')) return;

    requestAnimationFrame(() => {
      body.classList.add('is-legal-entering');
    });

    window.setTimeout(() => {
      body.classList.remove('is-legal-entering');
    }, 2400);
  }

  function setupAuthNavigation() {
    const navLinks = document.querySelectorAll('.auth-nav-link');
    if (!navLinks.length) return;

    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetPage = link.dataset.authNav;
        const href = link.getAttribute('href');

        if (!targetPage || !href) return;
        if (prefersReducedMotion) return;

        event.preventDefault();

        sessionStorage.setItem(transitionStorageKey, JSON.stringify({
          from: currentPage,
          to: targetPage,
          timestamp: Date.now()
        }));

        const overlay = createTransitionOverlay(targetPage);
        body.appendChild(overlay);

        body.classList.add('is-transitioning', `transition-${currentPage}-to-${targetPage}`);

        requestAnimationFrame(() => {
          overlay.classList.add('is-active');
        });

        window.setTimeout(() => {
          window.location.href = href;
        }, 820);
      });
    });
  }

  runEntryTransition();
  runLegalEntryAnimation();
  setupAuthNavigation();

  document.querySelectorAll('.btn-primary').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      const circle = document.createElement('span');
      circle.className = 'ripple';

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);

      circle.style.width = `${size}px`;
      circle.style.height = `${size}px`;
      circle.style.left = `${event.clientX - rect.left - size / 2}px`;
      circle.style.top = `${event.clientY - rect.top - size / 2}px`;

      btn.appendChild(circle);
      circle.addEventListener('animationend', () => circle.remove(), { once: true });
    });
  });

  document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const eyeOpen = btn.querySelector('.eye-icon');
      const eyeOff = btn.querySelector('.eye-off-icon');

      if (!input) return;

      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');

      eyeOpen.classList.toggle('hidden', isHidden);
      eyeOff.classList.toggle('hidden', !isHidden);
    });
  });

  const cnpjInput = document.getElementById('cnpj');
  if (cnpjInput) {
    cnpjInput.addEventListener('input', () => {
      let value = cnpjInput.value.replace(/\D/g, '').slice(0, 14);

      if (value.length > 12) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');
      } else if (value.length > 8) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, '$1.$2.$3/$4');
      } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{3})(\d{1,3})$/, '$1.$2.$3');
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{1,3})$/, '$1.$2');
      }

      cnpjInput.value = value;
    });
  }

  function setStatus(form, type, message) {
    const status = form.querySelector('.status-message');
    if (!status) return;

    status.textContent = message;
    status.className = `status-message is-visible is-${type}`;
  }

  function clearStatus(form) {
    const status = form.querySelector('.status-message');
    if (!status) return;

    status.textContent = '';
    status.className = 'status-message';
  }

  function showError(input, message) {
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');

    const wrapper = input.closest('.field-group') || input.parentElement;
    const existing = wrapper.querySelector('.error-message');
    if (existing) existing.remove();

    const errorId = `${input.id}-error`;
    const error = document.createElement('span');
    error.className = 'error-message';
    error.id = errorId;
    error.textContent = message;

    input.setAttribute('aria-describedby', errorId);
    wrapper.appendChild(error);
  }

  function clearErrors(form) {
    form.querySelectorAll('.input-error').forEach((input) => {
      input.classList.remove('input-error');
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    });

    form.querySelectorAll('.error-message').forEach((error) => error.remove());
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleSuccess(form, message) {
    const btn = form.querySelector('.btn-primary');
    if (btn) {
      btn.classList.add('btn-success');
      btn.addEventListener('animationend', () => btn.classList.remove('btn-success'), { once: true });
    }

    setStatus(form, 'success', message);
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors(loginForm);
      clearStatus(loginForm);

      let valid = true;
      const email = document.getElementById('email');
      const senha = document.getElementById('senha');

      if (!email.value.trim()) {
        showError(email, 'Informe seu e-mail.');
        valid = false;
      } else if (!isValidEmail(email.value.trim())) {
        showError(email, 'Digite um e-mail v\u00e1lido.');
        valid = false;
      }

      if (!senha.value.trim()) {
        showError(senha, 'Informe sua senha.');
        valid = false;
      }

      if (!valid) {
        setStatus(loginForm, 'error', 'Revise os campos destacados para continuar.');
        return;
      }

      handleSuccess(loginForm, 'Login validado com sucesso. A conta est\u00e1 pronta para prosseguir.');
    });
  }

  const cadastroForm = document.getElementById('cadastroForm');
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors(cadastroForm);
      clearStatus(cadastroForm);

      let valid = true;
      const email = document.getElementById('email');
      const cnpj = document.getElementById('cnpj');
      const razaoSocial = document.getElementById('razaoSocial');
      const senha = document.getElementById('senha');
      const confirmarSenha = document.getElementById('confirmarSenha');
      const termos = document.getElementById('termos');

      if (!email.value.trim()) {
        showError(email, 'Informe um e-mail corporativo.');
        valid = false;
      } else if (!isValidEmail(email.value.trim())) {
        showError(email, 'Digite um e-mail v\u00e1lido.');
        valid = false;
      }

      if (cnpj.value.replace(/\D/g, '').length !== 14) {
        showError(cnpj, 'Informe um CNPJ v\u00e1lido com 14 d\u00edgitos.');
        valid = false;
      }

      if (!razaoSocial.value.trim()) {
        showError(razaoSocial, 'Informe a raz\u00e3o social da empresa.');
        valid = false;
      }

      if (!senha.value) {
        showError(senha, 'Crie uma senha para continuar.');
        valid = false;
      } else if (senha.value.length < 6) {
        showError(senha, 'A senha precisa ter pelo menos 6 caracteres.');
        valid = false;
      }

      if (!confirmarSenha.value) {
        showError(confirmarSenha, 'Repita sua senha.');
        valid = false;
      } else if (confirmarSenha.value !== senha.value) {
        showError(confirmarSenha, 'As senhas precisam ser iguais.');
        valid = false;
      }

      if (!termos.checked) {
        setStatus(cadastroForm, 'error', 'Aceite os Termos de Uso e a Pol\u00edtica de Privacidade para concluir.');
        valid = false;
      }

      if (!valid) {
        if (!cadastroForm.querySelector('.status-message.is-visible')) {
          setStatus(cadastroForm, 'error', 'Revise os campos destacados para finalizar o cadastro.');
        }
        return;
      }

      handleSuccess(cadastroForm, 'Cadastro validado com sucesso. Sua empresa est\u00e1 pronta para avan\u00e7ar.');
    });
  }
});
