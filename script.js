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
  const transitionLabels = {
    login: 'Voltando ao login',
    register: 'Preparando cadastro',
    reset: 'Abrindo recupera\u00e7\u00e3o'
  };

  function createTransitionOverlay(direction) {
    const overlay = document.createElement('div');
    overlay.className = `page-transition-overlay transition-to-${direction}`;

    const label = transitionLabels[direction] || 'Carregando acesso';

    // Speed lines — randomised position, size, delay, opacity
    const lineCount = 14;
    let linesHTML = '';
    for (let n = 0; n < lineCount; n++) {
      const top   = (5 + Math.random() * 88).toFixed(1);
      const w     = (10 + Math.random() * 24).toFixed(1);
      const h     = Math.random() < 0.4 ? 2 : 1;
      const delay = (Math.random() * 0.22).toFixed(3);
      const ob    = (0.55 + Math.random() * 0.45).toFixed(2);
      const oc    = (0.35 + Math.random() * 0.55).toFixed(2);
      const bl    = Math.random() < 0.3 ? (0.5 + Math.random()).toFixed(1) : 0;
      linesHTML += `<div class="t-line" style="top:${top}%;--w:${w}vw;--h:${h}px;--ob:${ob};--oc:${oc};--bl:${bl}px;animation-delay:${delay}s"></div>`;
    }

    // Spark particles — randomised position and travel vector
    const sparkCount = 11;
    let sparksHTML = '';
    for (let n = 0; n < sparkCount; n++) {
      const cx    = (25 + Math.random() * 50).toFixed(1);
      const cy    = (25 + Math.random() * 50).toFixed(1);
      const angle = Math.random() * Math.PI * 2;
      const dist  = 14 + Math.random() * 26;
      const dx    = (Math.cos(angle) * dist).toFixed(1);
      const dy    = (Math.sin(angle) * dist).toFixed(1);
      const size  = (3 + Math.random() * 6).toFixed(1);
      const delay = (Math.random() * 0.18).toFixed(3);
      sparksHTML += `<div class="t-spark" style="left:${cx}%;top:${cy}%;width:${size}px;height:${size}px;--dx:${dx}vw;--dy:${dy}vh;animation-delay:${delay}s"></div>`;
    }

    overlay.innerHTML = `
      <div class="t-backdrop"></div>
      <div class="t-field"></div>
      <div class="t-grid"></div>
      <div class="t-rails">
        <div class="t-rail t-rail-a"></div>
        <div class="t-rail t-rail-b"></div>
        <div class="t-rail t-rail-c"></div>
      </div>
      <div class="t-swap">
        <div class="t-swap-half t-swap-left"></div>
        <div class="t-swap-half t-swap-right"></div>
        <div class="t-swap-seam"></div>
      </div>
      <div class="t-lines">${linesHTML}</div>
      <div class="t-sparks">${sparksHTML}</div>
      <div class="t-beam-a"></div>
      <div class="t-beam-b"></div>
      <div class="t-label">${label}</div>
    `;

    return overlay;
  }

  function consumePendingTransition() {
    const raw = sessionStorage.getItem(transitionStorageKey);
    if (!raw) return null;

    sessionStorage.removeItem(transitionStorageKey);

    try {
      const data = JSON.parse(raw);
      if (Date.now() - data.timestamp > 5000) return null;
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
    }, 1850);
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
        }, 1080);
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
      syncPasswordWatcher(input);
    });
  });

  function syncPasswordWatcher(input) {
    if (!input || !input.id) return;

    const watcher = document.querySelector(`.password-watcher[data-target="${input.id}"]`);
    if (!watcher) return;

    const isRevealed = input.type === 'text';
    const isActive = document.activeElement === input;
    const hasValue = input.value.trim().length > 0;

    watcher.classList.toggle('is-hidden', !isRevealed);
    watcher.classList.toggle('is-awake', isRevealed);
    watcher.classList.toggle('is-peeking', isRevealed && (isActive || hasValue));

    if (!isRevealed) {
      watcher.style.setProperty('--watch-x', '0px');
      watcher.style.setProperty('--watch-y', '0px');
      return;
    }

    const trackedChars = Math.min(input.value.length, 12);
    const ratio = trackedChars / 12;
    const offsetX = Math.round(-2 + ratio * 6);
    const offsetY = isActive ? 2 : 1;

    watcher.style.setProperty('--watch-x', `${offsetX}px`);
    watcher.style.setProperty('--watch-y', `${offsetY}px`);
  }

  document.querySelectorAll('input[type="password"], input[type="text"]').forEach((input) => {
    if (!['senha', 'confirmarSenha'].includes(input.id)) return;

    ['focus', 'blur', 'input'].forEach((eventName) => {
      input.addEventListener(eventName, () => syncPasswordWatcher(input));
    });

    syncPasswordWatcher(input);
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

  function setButtonLoading(form, loading) {
    const btn = form.querySelector('.btn-primary');
    if (!btn) return;
    btn.classList.toggle('btn-loading', loading);
  }

  function handleSuccess(form, message) {
    setButtonLoading(form, false);

    const btn = form.querySelector('.btn-primary');
    if (btn) {
      btn.classList.add('btn-success');
      btn.addEventListener('animationend', () => btn.classList.remove('btn-success'), { once: true });
    }

    setStatus(form, 'success', message);
  }

  function setStandaloneStatus(element, type, message) {
    if (!element) return;
    element.textContent = message;
    element.className = `status-message is-visible is-${type}`;
  }

  function getPasswordStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  }

  const senhaInput = document.getElementById('senha');
  const strengthFill = document.getElementById('strengthFill');
  const strengthLabel = document.getElementById('senha-strength-label');

  if (senhaInput && strengthFill && strengthLabel) {
    const labels = ['', 'Fraca', 'Razo\u00e1vel', 'Boa', 'Forte'];

    senhaInput.addEventListener('input', () => {
      const level = getPasswordStrength(senhaInput.value);

      strengthFill.setAttribute('data-level', level > 0 ? level : '');
      strengthFill.style.width = level === 0 ? '0%' : '';

      if (level > 0) {
        strengthLabel.textContent = labels[level];
        strengthLabel.setAttribute('data-level', level);
      } else {
        strengthLabel.textContent = '';
        strengthLabel.removeAttribute('data-level');
      }
    });
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

      setButtonLoading(loginForm, true);
      window.setTimeout(() => {
        handleSuccess(loginForm, 'Login validado com sucesso. A conta est\u00e1 pronta para prosseguir.');
        window.setTimeout(() => {
          window.location.href = 'selecao-setor.html';
        }, 900);
      }, 1400);
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

      setButtonLoading(cadastroForm, true);
      window.setTimeout(() => {
        handleSuccess(cadastroForm, 'Cadastro validado com sucesso. Sua empresa est\u00e1 pronta para avan\u00e7ar.');
      }, 1600);
    });
  }

  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors(forgotForm);
      clearStatus(forgotForm);

      let valid = true;
      const email = document.getElementById('resetEmail');

      if (!email.value.trim()) {
        showError(email, 'Informe o e-mail usado no cadastro.');
        valid = false;
      } else if (!isValidEmail(email.value.trim())) {
        showError(email, 'Digite um e-mail v\u00e1lido para recuperar o acesso.');
        valid = false;
      }

      if (!valid) {
        setStatus(forgotForm, 'error', 'Revise o e-mail informado para continuar.');
        return;
      }

      setButtonLoading(forgotForm, true);
      window.setTimeout(() => {
        handleSuccess(forgotForm, 'Se o e-mail estiver cadastrado, enviaremos um link seguro de redefini\u00e7\u00e3o em instantes.');
      }, 1400);
    });
  }

  const sectorCards = [...document.querySelectorAll('.sector-card[data-sector]')];
  if (sectorCards.length) {
    const sectorStatus = document.getElementById('sectorStatus');
    const selectedSectorSummary = document.getElementById('selectedSectorSummary');
    const selectedSectorName = document.getElementById('selectedSectorName');
    const selectedSectorDescription = document.getElementById('selectedSectorDescription');
    const selectedSectorSeverity = document.getElementById('selectedSectorSeverity');
    const selectedSectorConsumption = document.getElementById('selectedSectorConsumption');
    const selectedSectorPeak = document.getElementById('selectedSectorPeak');
    const selectedSectorFocus = document.getElementById('selectedSectorFocus');
    const selectedSectorNotes = document.getElementById('selectedSectorNotes');
    const continueSectorSelection = document.getElementById('continueSectorSelection');
    const continueSectorLabel = continueSectorSelection ? continueSectorSelection.querySelector('.btn-label') : null;
    let activeSectorCard = null;

    function updateSectorNotes(card) {
      if (!selectedSectorNotes) return;

      const notes = ['noteOne', 'noteTwo', 'noteThree']
        .map((key) => card.dataset[key])
        .filter(Boolean);

      selectedSectorNotes.innerHTML = notes.map((note) => `<li>${note}</li>`).join('');
    }

    function updateContinueLabel(name) {
      if (!continueSectorLabel) return;
      continueSectorLabel.textContent = name ? `Continuar com ${name}` : 'Continuar para o dashboard';
    }

    function selectSector(card, options = {}) {
      const sectorHeading = card.querySelector('h3');
      const sectorName = card.dataset.name || (sectorHeading ? sectorHeading.textContent : '') || 'Setor selecionado';
      const statusLabel = card.dataset.statusLabel || 'Normal';
      const statusTone = card.dataset.statusTone || 'success';

      activeSectorCard = card;

      sectorCards.forEach((sectorCard) => {
        const isSelected = sectorCard === card;
        sectorCard.classList.toggle('is-selected', isSelected);
        sectorCard.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });

      if (selectedSectorName) selectedSectorName.textContent = sectorName;
      if (selectedSectorDescription) selectedSectorDescription.textContent = card.dataset.description || '';
      if (selectedSectorSeverity) selectedSectorSeverity.textContent = statusLabel;
      if (selectedSectorConsumption) selectedSectorConsumption.textContent = card.dataset.consumption || '--';
      if (selectedSectorPeak) selectedSectorPeak.textContent = card.dataset.peak || '--';
      if (selectedSectorFocus) selectedSectorFocus.textContent = card.dataset.focus || '--';
      if (selectedSectorSummary) selectedSectorSummary.dataset.tone = statusTone;

      updateSectorNotes(card);
      updateContinueLabel(sectorName);

      if (continueSectorSelection) {
        continueSectorSelection.disabled = false;
      }

      if (!options.silent && sectorStatus) {
        setStandaloneStatus(sectorStatus, statusTone, `${sectorName} selecionado. Status atual: ${statusLabel}.`);
      }
    }

    sectorCards.forEach((card) => {
      card.addEventListener('click', () => selectSector(card));
    });

    if (continueSectorSelection) {
      continueSectorSelection.addEventListener('click', () => {
        if (!activeSectorCard) {
          if (sectorStatus) {
            setStandaloneStatus(sectorStatus, 'error', 'Selecione um setor para continuar.');
          }
          return;
        }

        const sectorName = activeSectorCard.dataset.name || '';
        continueSectorSelection.classList.add('btn-loading');

        sessionStorage.setItem('lumemflow-sector-id', activeSectorCard.dataset.sector || '');
        sessionStorage.setItem('lumemflow-sector-name', sectorName);
        sessionStorage.setItem('lumemflow-sector-description', activeSectorCard.dataset.description || '');
        sessionStorage.setItem('lumemflow-sector-focus', activeSectorCard.dataset.focus || '');

        window.setTimeout(() => {
          window.location.href = activeSectorCard.dataset.target || 'relatorio-esg.html';
        }, 550);
      });
    }

    const storedSectorId = sessionStorage.getItem('lumemflow-sector-id');
    const storedCard = storedSectorId
      ? sectorCards.find((card) => card.dataset.sector === storedSectorId)
      : null;

    if (storedCard) {
      selectSector(storedCard, { silent: true });
      if (sectorStatus) {
        const restoredTone = storedCard.dataset.statusTone || 'success';
        const restoredStatus = storedCard.dataset.statusLabel || 'Normal';
        setStandaloneStatus(sectorStatus, restoredTone, `Setor anterior restaurado: ${storedCard.dataset.name}. Status atual: ${restoredStatus}.`);
      }
    } else {
      updateContinueLabel('');
    }
  }

  const reportMonth = document.getElementById('reportMonth');
  if (reportMonth) {
    const reportStatus = document.getElementById('reportStatus');
    const reportStatusPill = document.getElementById('reportStatusPill');
    const reportCompany = document.getElementById('reportCompany');
    const reportUnitCount = document.getElementById('reportUnitCount');
    const reportMonthLabel = document.getElementById('reportMonthLabel');
    const reportProtocol = document.getElementById('reportProtocol');
    const metricConsumption = document.getElementById('metricConsumption');
    const metricTarget = document.getElementById('metricTarget');
    const metricAchieved = document.getElementById('metricAchieved');
    const metricCo2 = document.getElementById('metricCo2');
    const progressHeadline = document.getElementById('progressHeadline');
    const progressNarrative = document.getElementById('progressNarrative');
    const meterGoal = document.getElementById('meterGoal');
    const meterActual = document.getElementById('meterActual');
    const auditList = document.getElementById('auditList');
    const sectorTableBody = document.getElementById('sectorTableBody');
    const sectorBars = document.getElementById('sectorBars');
    const exportCsv = document.getElementById('exportCsv');
    const exportPdf = document.getElementById('exportPdf');

    const reportData = {
      '2026-01': {
        monthLabel: 'Janeiro de 2026',
        company: 'Atacad\u00e3o Horizonte Sul',
        units: 4,
        protocol: 'ESG-2026-01-104',
        totalConsumption: 128400,
        targetReduction: 6,
        achievedReduction: 4.8,
        co2AvoidedKg: 6210,
        targetConsumption: 126800,
        narrative: 'O m\u00eas fechou abaixo da linha de base, mas ainda 1,2 p.p. atr\u00e1s da meta consolidada. Refrigera\u00e7\u00e3o e docas puxaram o desvio.',
        auditTrail: [
          'Leitura consolidada de 4 unidades com fechamento em 31/01/2026.',
          'Comparativo calculado contra linha de base de dezembro de 2025.',
          'Exporta\u00e7\u00e3o inclui carimbo de compet\u00eancia, protocolo e resultados por setor.'
        ],
        sectors: [
          { name: 'Refrigera\u00e7\u00e3o', baseline: 41400, current: 40260, target: 7 },
          { name: 'Ilumina\u00e7\u00e3o', baseline: 22600, current: 20610, target: 6 },
          { name: 'Docas e carga', baseline: 18300, current: 17780, target: 5 },
          { name: 'Administrativo', baseline: 9800, current: 9010, target: 5 },
          { name: 'Climatiza\u00e7\u00e3o', baseline: 42700, current: 40740, target: 6 }
        ]
      },
      '2026-02': {
        monthLabel: 'Fevereiro de 2026',
        company: 'Atacad\u00e3o Horizonte Sul',
        units: 4,
        protocol: 'ESG-2026-02-111',
        totalConsumption: 120900,
        targetReduction: 6.5,
        achievedReduction: 7.2,
        co2AvoidedKg: 9180,
        targetConsumption: 121600,
        narrative: 'A meta foi superada com ganho concentrado em ilumina\u00e7\u00e3o, administrativo e climatiza\u00e7\u00e3o. O resultado gera evid\u00eancia positiva para o fechamento mensal.',
        auditTrail: [
          'Leitura consolidada de 4 unidades com fechamento em 29/02/2026.',
          'Meta revisada para 6,5% ap\u00f3s campanha interna de redu\u00e7\u00e3o.',
          'Arquivo exportado preserva o comparativo entre meta, realizado e desvio por setor.'
        ],
        sectors: [
          { name: 'Refrigera\u00e7\u00e3o', baseline: 40120, current: 37760, target: 7 },
          { name: 'Ilumina\u00e7\u00e3o', baseline: 21480, current: 19160, target: 6 },
          { name: 'Docas e carga', baseline: 17640, current: 16890, target: 5 },
          { name: 'Administrativo', baseline: 9540, current: 8610, target: 5 },
          { name: 'Climatiza\u00e7\u00e3o', baseline: 41600, current: 38480, target: 7 }
        ]
      },
      '2026-03': {
        monthLabel: 'Mar\u00e7o de 2026',
        company: 'Atacad\u00e3o Horizonte Sul',
        units: 4,
        protocol: 'ESG-2026-03-118',
        totalConsumption: 117300,
        targetReduction: 7,
        achievedReduction: 8.6,
        co2AvoidedKg: 10420,
        targetConsumption: 119900,
        narrative: 'O fechamento mensal ficou 1,6 p.p. acima da meta. Refrigera\u00e7\u00e3o e climatiza\u00e7\u00e3o sustentaram o melhor resultado trimestral e geraram evid\u00eancia audit\u00e1vel consistente.',
        auditTrail: [
          'Leitura consolidada de 4 unidades com fechamento em 31/03/2026.',
          'Comparativo calculado contra a linha de base homologada em dezembro de 2025.',
          'Evid\u00eancias incluem protocolo, compet\u00eancia, total consolidado e detalhamento por setor.'
        ],
        sectors: [
          { name: 'Refrigera\u00e7\u00e3o', baseline: 39800, current: 36140, target: 7 },
          { name: 'Ilumina\u00e7\u00e3o', baseline: 20820, current: 18830, target: 6 },
          { name: 'Docas e carga', baseline: 17100, current: 16360, target: 5 },
          { name: 'Administrativo', baseline: 9360, current: 8460, target: 5 },
          { name: 'Climatiza\u00e7\u00e3o', baseline: 40240, current: 37510, target: 7 }
        ]
      }
    };

    function formatNumber(value) {
      return new Intl.NumberFormat('pt-BR').format(value);
    }

    function formatPercent(value) {
      return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
    }

    function normalizeSector(sector) {
      const achieved = ((sector.baseline - sector.current) / sector.baseline) * 100;
      const deviation = achieved - sector.target;
      return {
        ...sector,
        achieved,
        deviation,
        status: deviation >= 0 ? 'Meta atingida' : 'Abaixo da meta'
      };
    }

    function buildCsvContent(data, sectors) {
      const rows = [
        ['empresa', data.company],
        ['competencia', data.monthLabel],
        ['protocolo', data.protocol],
        ['consumo_total_kwh', data.totalConsumption],
        ['meta_reducao_percentual', data.targetReduction],
        ['reducao_alcancada_percentual', data.achievedReduction],
        ['co2_evitado_kg', data.co2AvoidedKg],
        [''],
        ['setor', 'base_kwh', 'atual_kwh', 'meta_percentual', 'reducao_percentual', 'desvio_percentual', 'status']
      ];

      sectors.forEach((sector) => {
        rows.push([
          sector.name,
          sector.baseline,
          sector.current,
          sector.target.toFixed(1),
          sector.achieved.toFixed(1),
          sector.deviation.toFixed(1),
          sector.status
        ]);
      });

      return rows
        .map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(';'))
        .join('\n');
    }

    function downloadFile(filename, content, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    function buildPrintableReport(data, sectors) {
      const rows = sectors.map((sector) => `
        <tr>
          <td>${sector.name}</td>
          <td>${formatNumber(sector.baseline)} kWh</td>
          <td>${formatNumber(sector.current)} kWh</td>
          <td>${formatPercent(sector.target)}</td>
          <td>${formatPercent(sector.achieved)}</td>
          <td>${formatPercent(sector.deviation)}</td>
          <td>${sector.status}</td>
        </tr>
      `).join('');

      return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relat\u00f3rio ESG - ${data.monthLabel}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; color: #10212b; }
    h1 { margin-bottom: 8px; }
    p { line-height: 1.6; }
    .meta { margin-bottom: 24px; color: #526370; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 24px 0; }
    .card { border: 1px solid #d8e1e4; border-radius: 12px; padding: 14px; }
    .card strong { display: block; font-size: 1.2rem; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #d8e1e4; padding: 10px; text-align: left; font-size: 0.94rem; }
    th { background: #eff4f1; }
    ul { padding-left: 18px; }
  </style>
</head>
<body>
  <h1>Relat\u00f3rio mensal ESG</h1>
  <p class="meta">${data.company} | ${data.monthLabel} | ${data.protocol}</p>
  <p>${data.narrative}</p>

  <div class="grid">
    <div class="card"><span>Consumo do m\u00eas</span><strong>${formatNumber(data.totalConsumption)} kWh</strong></div>
    <div class="card"><span>Meta de redu\u00e7\u00e3o</span><strong>${formatPercent(data.targetReduction)}</strong></div>
    <div class="card"><span>Redu\u00e7\u00e3o alcan\u00e7ada</span><strong>${formatPercent(data.achievedReduction)}</strong></div>
    <div class="card"><span>CO2 evitado</span><strong>${formatNumber(data.co2AvoidedKg)} kg</strong></div>
  </div>

  <h2>Evid\u00eancias audit\u00e1veis</h2>
  <ul>${data.auditTrail.map((item) => `<li>${item}</li>`).join('')}</ul>

  <h2>Detalhamento por setor</h2>
  <table>
    <thead>
      <tr>
        <th>Setor</th>
        <th>Base</th>
        <th>Atual</th>
        <th>Meta</th>
        <th>Reducao</th>
        <th>Desvio</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
    }

    function renderReport(monthKey) {
      const data = reportData[monthKey];
      const sectors = data.sectors.map(normalizeSector);
      const statusGood = data.achievedReduction >= data.targetReduction;
      const bestSector = sectors.reduce((best, current) => current.achieved > best.achieved ? current : best);
      const delta = data.achievedReduction - data.targetReduction;

      reportCompany.textContent = data.company;
      reportUnitCount.textContent = `${data.units} unidades integradas`;
      reportMonthLabel.textContent = data.monthLabel;
      reportProtocol.textContent = data.protocol;
      metricConsumption.textContent = `${formatNumber(data.totalConsumption)} kWh`;
      metricTarget.textContent = formatPercent(data.targetReduction);
      metricAchieved.textContent = formatPercent(data.achievedReduction);
      metricCo2.textContent = `${formatNumber(data.co2AvoidedKg)} kg`;
      progressHeadline.textContent = `${formatPercent(data.achievedReduction)} de reducao no mes`;
      progressNarrative.textContent = `${data.narrative} Melhor desempenho setorial: ${bestSector.name}.`;
      meterGoal.style.width = `${Math.min(data.targetReduction * 10, 100)}%`;
      meterActual.style.width = `${Math.min(data.achievedReduction * 10, 100)}%`;

      reportStatusPill.textContent = statusGood ? 'Meta atingida' : 'Em risco';
      reportStatusPill.className = `status-pill ${statusGood ? 'is-good' : 'is-alert'}`;

      auditList.innerHTML = data.auditTrail.map((item) => `<li>${item}</li>`).join('');

      sectorTableBody.innerHTML = sectors.map((sector) => `
        <tr>
          <td>${sector.name}</td>
          <td>${formatNumber(sector.baseline)} kWh</td>
          <td>${formatNumber(sector.current)} kWh</td>
          <td>${formatPercent(sector.target)}</td>
          <td>${formatPercent(sector.achieved)}</td>
          <td class="${sector.deviation >= 0 ? 'trend-good' : 'trend-alert'}">${formatPercent(sector.deviation)}</td>
          <td><span class="table-status ${sector.deviation >= 0 ? 'is-good' : 'is-alert'}">${sector.status}</span></td>
        </tr>
      `).join('');

      const highestBaseline = Math.max(...sectors.map((sector) => sector.baseline));
      sectorBars.innerHTML = sectors.map((sector) => `
        <div class="bar-row">
          <div class="bar-labels">
            <strong>${sector.name}</strong>
            <span>${formatNumber(sector.current)} kWh</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${(sector.current / highestBaseline) * 100}%"></div>
          </div>
          <span class="bar-meta ${sector.deviation >= 0 ? 'trend-good' : 'trend-alert'}">${formatPercent(sector.achieved)}</span>
        </div>
      `).join('');

      setStandaloneStatus(
        reportStatus,
        statusGood ? 'success' : 'error',
        statusGood
        ? `Compet\u00eancia ${data.monthLabel}: meta superada em ${formatPercent(Math.abs(delta))}. Relat\u00f3rio pronto para exporta\u00e7\u00e3o audit\u00e1vel.`
          : `Compet\u00eancia ${data.monthLabel}: redu\u00e7\u00e3o ${formatPercent(Math.abs(delta))} abaixo da meta. Revise os setores com desvio negativo antes da auditoria.`
      );

      exportCsv.onclick = () => {
        const csv = buildCsvContent(data, sectors);
        downloadFile(`relatorio-esg-${monthKey}.csv`, csv, 'text/csv;charset=utf-8;');
        setStandaloneStatus(reportStatus, 'success', `CSV de ${data.monthLabel} exportado com protocolo ${data.protocol}.`);
      };

      exportPdf.onclick = () => {
        exportPdf.classList.add('btn-loading');
        const printWindow = window.open('', '_blank', 'width=1080,height=820');
        if (!printWindow) {
          exportPdf.classList.remove('btn-loading');
          setStandaloneStatus(reportStatus, 'error', 'N\u00e3o foi poss\u00edvel abrir a janela de impress\u00e3o. Libere pop-ups para exportar o PDF.');
          return;
        }

        printWindow.document.open();
        printWindow.document.write(buildPrintableReport(data, sectors));
        printWindow.document.close();
        printWindow.focus();

        window.setTimeout(() => {
          printWindow.print();
          exportPdf.classList.remove('btn-loading');
          setStandaloneStatus(reportStatus, 'success', `Janela de impress\u00e3o aberta para gerar o PDF de ${data.monthLabel}.`);
        }, 300);
      };
    }

    reportMonth.addEventListener('change', () => {
      renderReport(reportMonth.value);
    });

    renderReport(reportMonth.value);
  }




  const rankingPeriodSelect = document.getElementById('rankingPeriodSelect');
  if (rankingPeriodSelect) {
    const rankingViewSelect = document.getElementById('rankingViewSelect');
    const rankingStatus = document.getElementById('rankingStatus');
    const rankingCycleTitle = document.getElementById('rankingCycleTitle');
    const rankingCycleSubtitle = document.getElementById('rankingCycleSubtitle');
    const rankingChampion = document.getElementById('rankingChampion');
    const rankingAverage = document.getElementById('rankingAverage');
    const rankingTopSector = document.getElementById('rankingTopSector');
    const rankingBiggestGain = document.getElementById('rankingBiggestGain');
    const rankingRiskCount = document.getElementById('rankingRiskCount');
    const rankingAverageScore = document.getElementById('rankingAverageScore');
    const rankingLeaderboard = document.getElementById('rankingLeaderboard');
    const rankingPodium = document.getElementById('rankingPodium');
    const rankingTableBody = document.getElementById('rankingTableBody');
    const rankingInsights = document.getElementById('rankingInsights');

    const rankingData = {
      '2026-01': [
        { sector: 'Refrigeração', score: 86, efficiency: 91, engagement: 78, gain: 4, reading: 'Referência positiva do ciclo.', tone: 'is-good' },
        { sector: 'Climatização', score: 79, efficiency: 82, engagement: 74, gain: 2, reading: 'Boa estabilidade, ainda com margem.', tone: 'is-warning' },
        { sector: 'Operação de loja', score: 74, efficiency: 70, engagement: 81, gain: 1, reading: 'Execução irregular entre turnos.', tone: 'is-warning' },
        { sector: 'Padaria e apoio', score: 68, efficiency: 65, engagement: 72, gain: -1, reading: 'Precisa de reforço operacional.', tone: 'is-alert' }
      ],
      '2026-02': [
        { sector: 'Refrigeração', score: 89, efficiency: 93, engagement: 82, gain: 3, reading: 'Mantém liderança com consistência.', tone: 'is-good' },
        { sector: 'Climatização', score: 84, efficiency: 88, engagement: 77, gain: 5, reading: 'Evolução após ajuste de setpoint.', tone: 'is-good' },
        { sector: 'Operação de loja', score: 78, efficiency: 73, engagement: 84, gain: 4, reading: 'Subiu com campanhas de checklist.', tone: 'is-warning' },
        { sector: 'Padaria e apoio', score: 71, efficiency: 69, engagement: 73, gain: 3, reading: 'Melhora tímida, mas contínua.', tone: 'is-warning' }
      ],
      '2026-03': [
        { sector: 'Refrigeração', score: 92, efficiency: 95, engagement: 85, gain: 3, reading: 'Melhor score do trimestre.', tone: 'is-good' },
        { sector: 'Climatização', score: 87, efficiency: 90, engagement: 81, gain: 3, reading: 'Resultado forte e mais estável.', tone: 'is-good' },
        { sector: 'Operação de loja', score: 81, efficiency: 76, engagement: 88, gain: 3, reading: 'Engajamento alto, execução em consolidação.', tone: 'is-warning' },
        { sector: 'Padaria e apoio', score: 69, efficiency: 67, engagement: 70, gain: -2, reading: 'Voltou a perder eficiência.', tone: 'is-alert' }
      ]
    };

    function renderRanking() {
      const metric = rankingViewSelect.value;
      const items = [...rankingData[rankingPeriodSelect.value]];
      const sorted = items.sort((a, b) => {
        if (metric === 'efficiency') return b.efficiency - a.efficiency;
        if (metric === 'engagement') return b.engagement - a.engagement;
        return b.score - a.score;
      });

      const averageScore = sorted.reduce((sum, item) => sum + item.score, 0) / sorted.length;
      const biggestGain = sorted.reduce((best, item) => item.gain > best.gain ? item : best, sorted[0]);
      const riskCount = sorted.filter((item) => item.score < 75).length;
      const champion = sorted[0];
      const podium = sorted.slice(0, 3);

      rankingCycleTitle.textContent = ({
        '2026-01': 'Janeiro de 2026',
        '2026-02': 'Fevereiro de 2026',
        '2026-03': 'Março de 2026'
      })[rankingPeriodSelect.value];
      rankingCycleSubtitle.textContent = 'Matriz e filiais consolidadas';
      rankingChampion.textContent = `Líder atual: ${champion.sector}`;
      rankingAverage.textContent = `Média geral ${averageScore.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pts`;
      rankingTopSector.textContent = champion.sector;
      rankingBiggestGain.textContent = `${biggestGain.gain >= 0 ? '+' : ''}${biggestGain.gain} pts`;
      rankingRiskCount.textContent = String(riskCount);
      rankingAverageScore.textContent = `${averageScore.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pts`;

      rankingLeaderboard.innerHTML = sorted.map((item, index) => `
        <div class="leaderboard-row">
          <div class="leaderboard-rank">${index + 1}</div>
          <div class="leaderboard-main">
            <strong>${item.sector}</strong>
            <span>${item.reading}</span>
          </div>
          <div class="leaderboard-score">
            <strong>${metric === 'efficiency' ? item.efficiency : metric === 'engagement' ? item.engagement : item.score}</strong>
            <span>${metric === 'efficiency' ? 'Eficiência' : metric === 'engagement' ? 'Engajamento' : 'Score'}</span>
          </div>
        </div>
      `).join('');

      rankingPodium.innerHTML = podium.map((item, index) => `
        <article class="podium-card podium-${index + 1}">
          <span class="podium-place">#${index + 1}</span>
          <strong>${item.sector}</strong>
          <span>${item.score} pts</span>
        </article>
      `).join('');

      rankingTableBody.innerHTML = sorted.map((item) => `
        <tr>
          <td>${item.sector}</td>
          <td>${item.score} pts</td>
          <td>${item.efficiency}</td>
          <td>${item.engagement}</td>
          <td class="${item.gain >= 0 ? 'is-good' : 'is-alert'}">${item.gain >= 0 ? '+' : ''}${item.gain} pts</td>
          <td><span class="table-status ${item.tone}">${item.reading}</span></td>
        </tr>
      `).join('');

      rankingInsights.innerHTML = [
        `${champion.sector} lidera o ciclo atual e serve como referência para as rotinas dos demais setores.`,
        `${biggestGain.sector} teve a maior evolução no período, o que sugere boa resposta às ações recentes.`,
        riskCount > 0
          ? `${riskCount} setor(es) ainda estão abaixo da faixa desejada e precisam de plano de correção prioritário.`
          : 'Nenhum setor ficou abaixo da faixa de risco neste ciclo.'
      ].map((item) => `<li>${item}</li>`).join('');

      if (riskCount === 0) {
        setStandaloneStatus(rankingStatus, 'success', 'O ranking mostra maturidade consistente entre os setores no ciclo atual.');
      } else if (riskCount === 1) {
        setStandaloneStatus(rankingStatus, 'warning', 'A maior parte dos setores está bem posicionada, mas ainda existe 1 setor em faixa de atenção.');
      } else {
        setStandaloneStatus(rankingStatus, 'error', `Há ${riskCount} setores abaixo da faixa desejada. O ranking pede reforço de suporte e cobrança operacional.`);
      }
    }

    rankingPeriodSelect.addEventListener('change', renderRanking);
    rankingViewSelect.addEventListener('change', renderRanking);
    renderRanking();
  }

  const forecastMonthSelect = document.getElementById('forecastMonthSelect');
  if (forecastMonthSelect) {
    const forecastViewSelect = document.getElementById('forecastViewSelect');
    const forecastTariffSelect = document.getElementById('forecastTariffSelect');
    const forecastStatus = document.getElementById('forecastStatus');
    const forecastCycleTitle = document.getElementById('forecastCycleTitle');
    const forecastCycleSubtitle = document.getElementById('forecastCycleSubtitle');
    const forecastBudgetLabel = document.getElementById('forecastBudgetLabel');
    const forecastUpdatedAt = document.getElementById('forecastUpdatedAt');
    const forecastAccumulatedKwh = document.getElementById('forecastAccumulatedKwh');
    const forecastProjectedBill = document.getElementById('forecastProjectedBill');
    const forecastBudgetDelta = document.getElementById('forecastBudgetDelta');
    const forecastCommitment = document.getElementById('forecastCommitment');
    const forecastGaugeFill = document.getElementById('forecastGaugeFill');
    const forecastGaugeLimit = document.getElementById('forecastGaugeLimit');
    const forecastNarrative = document.getElementById('forecastNarrative');
    const tariffStack = document.getElementById('tariffStack');
    const forecastComponentTableBody = document.getElementById('forecastComponentTableBody');
    const forecastInsights = document.getElementById('forecastInsights');
    const forecastDailyCost = document.getElementById('forecastDailyCost');
    const forecastDailyKwh = document.getElementById('forecastDailyKwh');
    const forecastAvgTariff = document.getElementById('forecastAvgTariff');
    const forecastTariffFlag = document.getElementById('forecastTariffFlag');
    const forecastProgressBars = document.getElementById('forecastProgressBars');
    const forecastProgressTitle = document.getElementById('forecastProgressTitle');
    const forecastScenario = document.getElementById('forecastScenario');

    const forecastData = {
      '2026-01': {
        monthLabel: 'Janeiro de 2026',
        daysInMonth: 31,
        daysPassed: 31,
        updatedAt: 'Atualizado \u00e0s 16h10',
        weekly: [
          { period: 'Sem 1 (01-07)', kwh: 39800, cost: 28150 },
          { period: 'Sem 2 (08-14)', kwh: 43200, cost: 30560 },
          { period: 'Sem 3 (15-21)', kwh: 46100, cost: 32610 },
          { period: 'Sem 4 (22-31)', kwh: 47300, cost: 33500 }
        ],
        daily: [
          { period: 'Seg', kwh: 6120, cost: 4330 },
          { period: 'Ter', kwh: 6340, cost: 4486 },
          { period: 'Qua', kwh: 6480, cost: 4585 },
          { period: 'Qui', kwh: 6290, cost: 4450 },
          { period: 'Sex', kwh: 6610, cost: 4676 },
          { period: 'S\u00e1b', kwh: 4250, cost: 3007 },
          { period: 'Dom', kwh: 3510, cost: 2484 }
        ],
        tariffs: {
          green: {
            label: 'Horo-sazonal verde',
            budget: 128000,
            accumulatedKwh: 176400,
            projectedBill: 124820,
            avgTariff: 0.708,
            components: [
              { name: 'Ponta contratada', kwh: 23800, tariff: 1.12, cost: 26656, share: 21.4, reading: 'Faixa cara sob controle.', tone: 'is-good' },
              { name: 'Fora de ponta', kwh: 141200, tariff: 0.58, cost: 81896, share: 65.6, reading: 'Maior peso financeiro do ciclo.', tone: 'is-warning' },
              { name: 'Encargos e bandeira', kwh: 11400, tariff: 1.43, cost: 16268, share: 13.0, reading: 'Bandeira moderada no m\u00eas.', tone: 'is-warning' }
            ],
            insights: [
              'A conta tende a fechar abaixo do or\u00e7amento, mas a faixa fora de ponta continua concentrando a maior parte do gasto.',
              'Ainda existe espa\u00e7o para reduzir encargos se a demanda de ponta continuar est\u00e1vel.',
              'O comportamento atual d\u00e1 margem para proteger o or\u00e7amento sem a\u00e7\u00e3o emergencial.'
            ]
          },
          blue: {
            label: 'Horo-sazonal azul',
            budget: 128000,
            accumulatedKwh: 176400,
            projectedBill: 131940,
            avgTariff: 0.748,
            components: [
              { name: 'Demanda ponta', kwh: 22100, tariff: 1.36, cost: 30056, share: 22.8, reading: 'Mais sens\u00edvel no modelo azul.', tone: 'is-warning' },
              { name: 'Demanda fora de ponta', kwh: 139900, tariff: 0.61, cost: 85339, share: 64.7, reading: 'Componente dominante da fatura.', tone: 'is-warning' },
              { name: 'Encargos e bandeira', kwh: 14400, tariff: 1.15, cost: 16545, share: 12.5, reading: 'Encargo levemente pressionado.', tone: 'is-warning' }
            ],
            insights: [
              'No modelo azul, a ponta pesa mais e aproxima a conta do teto or\u00e7ament\u00e1rio.',
              'Vale monitorar picos de demanda antes de consolidar esse perfil tarif\u00e1rio.',
              'A margem financeira fica mais curta do que no modelo verde.'
            ]
          },
          flat: {
            label: 'Convencional',
            budget: 128000,
            accumulatedKwh: 176400,
            projectedBill: 129380,
            avgTariff: 0.733,
            components: [
              { name: 'Energia ativa', kwh: 165200, tariff: 0.67, cost: 110684, share: 85.6, reading: 'Modelo simplificado com custo est\u00e1vel.', tone: 'is-warning' },
              { name: 'Encargos', kwh: 8400, tariff: 1.31, cost: 11004, share: 8.5, reading: 'Encargo linear no per\u00edodo.', tone: 'is-good' },
              { name: 'Tributos e adicionais', kwh: 2800, tariff: 2.74, cost: 7692, share: 5.9, reading: 'Peso residual do fechamento.', tone: 'is-good' }
            ],
            insights: [
              'A tarifa convencional simplifica a leitura, mas n\u00e3o maximiza economia nos hor\u00e1rios mais eficientes.',
              'Mesmo com previsibilidade, a conta ainda ficaria levemente acima do or\u00e7amento.',
              'O modelo verde continua mais vantajoso neste ciclo.'
            ]
          }
        }
      },
      '2026-02': {
        monthLabel: 'Fevereiro de 2026',
        daysInMonth: 28,
        daysPassed: 28,
        updatedAt: 'Atualizado \u00e0s 15h45',
        weekly: [
          { period: 'Sem 1 (01-07)', kwh: 38200, cost: 26840 },
          { period: 'Sem 2 (08-14)', kwh: 41600, cost: 29230 },
          { period: 'Sem 3 (15-21)', kwh: 43800, cost: 30780 },
          { period: 'Sem 4 (22-28)', kwh: 44700, cost: 31770 }
        ],
        daily: [
          { period: 'Seg', kwh: 5780, cost: 4062 },
          { period: 'Ter', kwh: 5990, cost: 4208 },
          { period: 'Qua', kwh: 6120, cost: 4300 },
          { period: 'Qui', kwh: 5880, cost: 4130 },
          { period: 'Sex', kwh: 6280, cost: 4412 },
          { period: 'S\u00e1b', kwh: 4030, cost: 2831 },
          { period: 'Dom', kwh: 3220, cost: 2263 }
        ],
        tariffs: {
          green: {
            label: 'Horo-sazonal verde',
            budget: 126000,
            accumulatedKwh: 168300,
            projectedBill: 119620,
            avgTariff: 0.711,
            components: [
              { name: 'Ponta contratada', kwh: 21400, tariff: 1.09, cost: 23326, share: 19.5, reading: 'Ponta melhor distribu\u00edda.', tone: 'is-good' },
              { name: 'Fora de ponta', kwh: 135700, tariff: 0.56, cost: 75992, share: 63.5, reading: 'Peso principal do m\u00eas.', tone: 'is-warning' },
              { name: 'Encargos e bandeira', kwh: 14100, tariff: 1.44, cost: 20302, share: 17.0, reading: 'Encargos pressionam parte do ganho.', tone: 'is-warning' }
            ],
            insights: [
              'Fevereiro projeta folga confort\u00e1vel frente ao or\u00e7amento.',
              'A redu\u00e7\u00e3o no hor\u00e1rio de ponta ajudou a preservar margem financeira.',
              'Encargos seguem como principal risco para o fechamento.'
            ]
          },
          blue: {
            label: 'Horo-sazonal azul',
            budget: 126000,
            accumulatedKwh: 168300,
            projectedBill: 127880,
            avgTariff: 0.760,
            components: [
              { name: 'Demanda ponta', kwh: 20800, tariff: 1.32, cost: 27456, share: 21.5, reading: 'Faixa pressionada na modalidade azul.', tone: 'is-warning' },
              { name: 'Demanda fora de ponta', kwh: 132500, tariff: 0.60, cost: 79500, share: 62.2, reading: 'Componente majorit\u00e1rio.', tone: 'is-warning' },
              { name: 'Encargos e bandeira', kwh: 13600, tariff: 1.54, cost: 20944, share: 16.3, reading: 'Encargos ainda relevantes.', tone: 'is-warning' }
            ],
            insights: [
              'No azul, fevereiro quase encosta no or\u00e7amento e reduz a margem de manobra.',
              'A modalidade verde ainda se mostra financeiramente superior para este perfil.',
              'Se houver novos picos, a conta pode ultrapassar o limite or\u00e7ado.'
            ]
          },
          flat: {
            label: 'Convencional',
            budget: 126000,
            accumulatedKwh: 168300,
            projectedBill: 123410,
            avgTariff: 0.733,
            components: [
              { name: 'Energia ativa', kwh: 157800, tariff: 0.66, cost: 104148, share: 84.4, reading: 'Leitura simples e est\u00e1vel.', tone: 'is-warning' },
              { name: 'Encargos', kwh: 7300, tariff: 1.34, cost: 9782, share: 7.9, reading: 'Encargo controlado.', tone: 'is-good' },
              { name: 'Tributos e adicionais', kwh: 3200, tariff: 2.96, cost: 9472, share: 7.7, reading: 'Peso secund\u00e1rio no fechamento.', tone: 'is-good' }
            ],
            insights: [
              'A modalidade convencional mant\u00e9m a fatura abaixo do or\u00e7amento, mas sem capturar todo o benef\u00edcio da curva hor\u00e1ria.',
              'O risco financeiro \u00e9 baixo, por\u00e9m a oportunidade de economia \u00e9 menor.',
              'Vale comparar o convencional apenas como refer\u00eancia de estabilidade.'
            ]
          }
        }
      },
      '2026-03': {
        monthLabel: 'Mar\u00e7o de 2026',
        daysInMonth: 31,
        daysPassed: 31,
        updatedAt: 'Atualizado \u00e0s 14h20',
        weekly: [
          { period: 'Sem 1 (01-07)', kwh: 42100, cost: 30720 },
          { period: 'Sem 2 (08-14)', kwh: 45600, cost: 33290 },
          { period: 'Sem 3 (15-21)', kwh: 47800, cost: 34890 },
          { period: 'Sem 4 (22-31)', kwh: 47200, cost: 37580 }
        ],
        daily: [
          { period: 'Seg', kwh: 6380, cost: 4656 },
          { period: 'Ter', kwh: 6620, cost: 4832 },
          { period: 'Qua', kwh: 6790, cost: 4956 },
          { period: 'Qui', kwh: 6510, cost: 4752 },
          { period: 'Sex', kwh: 6880, cost: 5022 },
          { period: 'S\u00e1b', kwh: 4410, cost: 3219 },
          { period: 'Dom', kwh: 3610, cost: 2635 }
        ],
        tariffs: {
          green: {
            label: 'Horo-sazonal verde',
            budget: 132000,
            accumulatedKwh: 182700,
            projectedBill: 136480,
            avgTariff: 0.747,
            components: [
              { name: 'Ponta contratada', kwh: 24600, tariff: 1.15, cost: 28290, share: 20.7, reading: 'Ponta controlada, mas j\u00e1 acima da m\u00e9dia.', tone: 'is-warning' },
              { name: 'Fora de ponta', kwh: 146900, tariff: 0.61, cost: 89609, share: 65.7, reading: 'Principal alavanca da previs\u00e3o de alta.', tone: 'is-alert' },
              { name: 'Encargos e bandeira', kwh: 11200, tariff: 1.66, cost: 18581, share: 13.6, reading: 'Encargos seguram parte do or\u00e7amento.', tone: 'is-warning' }
            ],
            insights: [
              'A previs\u00e3o j\u00e1 excede o or\u00e7amento em mar\u00e7o e pede corre\u00e7\u00e3o ainda nesta semana.',
              'O custo fora de ponta continua sendo o principal motor da conta.',
              'A redu\u00e7\u00e3o de cargas n\u00e3o cr\u00edticas no restante do m\u00eas pode devolver parte da margem financeira.'
            ]
          },
          blue: {
            label: 'Horo-sazonal azul',
            budget: 132000,
            accumulatedKwh: 182700,
            projectedBill: 142930,
            avgTariff: 0.782,
            components: [
              { name: 'Demanda ponta', kwh: 23800, tariff: 1.39, cost: 33082, share: 23.1, reading: 'Ponta pressionada no cen\u00e1rio azul.', tone: 'is-alert' },
              { name: 'Demanda fora de ponta', kwh: 144400, tariff: 0.63, cost: 90972, share: 63.6, reading: 'Componente dominante.', tone: 'is-alert' },
              { name: 'Encargos e bandeira', kwh: 13100, tariff: 1.44, cost: 18876, share: 13.3, reading: 'Encargos seguem elevados.', tone: 'is-warning' }
            ],
            insights: [
              'A modalidade azul agrava o desvio financeiro do m\u00eas.',
              'O peso da ponta faz a conta estourar o or\u00e7amento com pouca folga para corre\u00e7\u00e3o.',
              'N\u00e3o parece a melhor configura\u00e7\u00e3o para o perfil de consumo atual.'
            ]
          },
          flat: {
            label: 'Convencional',
            budget: 132000,
            accumulatedKwh: 182700,
            projectedBill: 138540,
            avgTariff: 0.758,
            components: [
              { name: 'Energia ativa', kwh: 171500, tariff: 0.69, cost: 118335, share: 85.4, reading: 'Energia ativa domina o fechamento.', tone: 'is-alert' },
              { name: 'Encargos', kwh: 6900, tariff: 1.41, cost: 9729, share: 7.0, reading: 'Encargos em linha.', tone: 'is-good' },
              { name: 'Tributos e adicionais', kwh: 4300, tariff: 2.44, cost: 10476, share: 7.6, reading: 'Adicionais moderados.', tone: 'is-good' }
            ],
            insights: [
              'A tarifa convencional tamb\u00e9m ultrapassa o or\u00e7amento em mar\u00e7o.',
              'Apesar da simplicidade, ela n\u00e3o resolve a press\u00e3o financeira do ciclo.',
              'O corte de consumo continua sendo a principal alavanca.'
            ]
          }
        }
      },
      '2026-04': {
        monthLabel: 'Abril de 2026',
        daysInMonth: 30,
        daysPassed: 30,
        updatedAt: 'Atualizado \u00e0s 11h35',
        weekly: [
          { period: 'Sem 1 (01-07)', kwh: 40500, cost: 29560 },
          { period: 'Sem 2 (08-14)', kwh: 43800, cost: 31980 },
          { period: 'Sem 3 (15-21)', kwh: 45600, cost: 33290 },
          { period: 'Sem 4 (22-30)', kwh: 44900, cost: 32770 }
        ],
        daily: [
          { period: 'Seg', kwh: 6050, cost: 4416 },
          { period: 'Ter', kwh: 6270, cost: 4577 },
          { period: 'Qua', kwh: 6410, cost: 4679 },
          { period: 'Qui', kwh: 6180, cost: 4511 },
          { period: 'Sex', kwh: 6520, cost: 4760 },
          { period: 'S\u00e1b', kwh: 4180, cost: 3051 },
          { period: 'Dom', kwh: 3390, cost: 2475 }
        ],
        tariffs: {
          green: {
            label: 'Horo-sazonal verde',
            budget: 130000,
            accumulatedKwh: 174800,
            projectedBill: 127600,
            avgTariff: 0.730,
            components: [
              { name: 'Ponta contratada', kwh: 22900, tariff: 1.13, cost: 25877, share: 20.3, reading: 'Ponta dentro do esperado.', tone: 'is-good' },
              { name: 'Fora de ponta', kwh: 140200, tariff: 0.59, cost: 82718, share: 64.8, reading: 'Peso financeiro principal.', tone: 'is-warning' },
              { name: 'Encargos e bandeira', kwh: 11700, tariff: 1.62, cost: 19005, share: 14.9, reading: 'Bandeira amarela no per\u00edodo.', tone: 'is-warning' }
            ],
            insights: [
              'Abril fecha dentro do or\u00e7amento com margem de seguran\u00e7a razo\u00e1vel.',
              'A redu\u00e7\u00e3o natural do consumo no outono ajuda a conter custos.',
              'Manter o perfil verde continua sendo a escolha mais econ\u00f4mica.'
            ]
          },
          blue: {
            label: 'Horo-sazonal azul',
            budget: 130000,
            accumulatedKwh: 174800,
            projectedBill: 134280,
            avgTariff: 0.768,
            components: [
              { name: 'Demanda ponta', kwh: 21600, tariff: 1.35, cost: 29160, share: 21.7, reading: 'Demanda ponta elevada no azul.', tone: 'is-warning' },
              { name: 'Demanda fora de ponta', kwh: 138800, tariff: 0.62, cost: 86056, share: 64.1, reading: 'Componente de maior peso.', tone: 'is-warning' },
              { name: 'Encargos e bandeira', kwh: 12200, tariff: 1.56, cost: 19064, share: 14.2, reading: 'Encargos moderados.', tone: 'is-warning' }
            ],
            insights: [
              'No modelo azul, abril ultrapassa o or\u00e7amento em cerca de R$ 4.000.',
              'A demanda contratada de ponta segue pressionando o custo total.',
              'O modelo verde oferece economia de cerca de R$ 6.700 neste cen\u00e1rio.'
            ]
          },
          flat: {
            label: 'Convencional',
            budget: 130000,
            accumulatedKwh: 174800,
            projectedBill: 131450,
            avgTariff: 0.752,
            components: [
              { name: 'Energia ativa', kwh: 163600, tariff: 0.68, cost: 111248, share: 84.6, reading: 'Custo base est\u00e1vel.', tone: 'is-warning' },
              { name: 'Encargos', kwh: 7100, tariff: 1.38, cost: 9798, share: 7.5, reading: 'Encargos dentro da m\u00e9dia.', tone: 'is-good' },
              { name: 'Tributos e adicionais', kwh: 3800, tariff: 2.74, cost: 10404, share: 7.9, reading: 'Tributos est\u00e1veis.', tone: 'is-good' }
            ],
            insights: [
              'A tarifa convencional fica ligeiramente acima do or\u00e7amento.',
              'O modelo \u00e9 previs\u00edvel, mas n\u00e3o otimiza os hor\u00e1rios de menor custo.',
              'Em abril, a diferen\u00e7a entre convencional e verde \u00e9 de quase R$ 4.000.'
            ]
          }
        }
      },
      '2026-05': {
        monthLabel: 'Maio de 2026',
        daysInMonth: 31,
        daysPassed: 7,
        updatedAt: 'Atualizado \u00e0s 09h15',
        weekly: [
          { period: 'Sem 1 (01-07)', kwh: 41200, cost: 30890 },
          { period: 'Sem 2 (08-14)', kwh: 0, cost: 0 },
          { period: 'Sem 3 (15-21)', kwh: 0, cost: 0 },
          { period: 'Sem 4 (22-31)', kwh: 0, cost: 0 }
        ],
        daily: [
          { period: 'Seg', kwh: 6280, cost: 4710 },
          { period: 'Ter', kwh: 6450, cost: 4837 },
          { period: 'Qua', kwh: 6590, cost: 4942 },
          { period: 'Qui', kwh: 6320, cost: 4740 },
          { period: 'Sex', kwh: 6710, cost: 5032 },
          { period: 'S\u00e1b', kwh: 4380, cost: 3285 },
          { period: 'Dom', kwh: 3640, cost: 2730 }
        ],
        tariffs: {
          green: {
            label: 'Horo-sazonal verde',
            budget: 134000,
            accumulatedKwh: 41200,
            projectedBill: 136720,
            avgTariff: 0.750,
            components: [
              { name: 'Ponta contratada', kwh: 5600, tariff: 1.18, cost: 6608, share: 21.4, reading: 'Ponta acompanhando ritmo alto.', tone: 'is-warning' },
              { name: 'Fora de ponta', kwh: 32800, tariff: 0.62, cost: 20336, share: 65.8, reading: 'Fora de ponta j\u00e1 pressiona a proje\u00e7\u00e3o.', tone: 'is-alert' },
              { name: 'Encargos e bandeira', kwh: 2800, tariff: 1.41, cost: 3946, share: 12.8, reading: 'Bandeira vermelha no in\u00edcio do m\u00eas.', tone: 'is-alert' }
            ],
            insights: [
              'A primeira semana indica que maio pode ultrapassar o or\u00e7amento se o ritmo continuar.',
              'A bandeira vermelha encarece significativamente o kWh m\u00e9dio.',
              'Recomenda-se reduzir cargas nos hor\u00e1rios de ponta para conter a proje\u00e7\u00e3o.',
              'Ainda h\u00e1 24 dias para corrigir a rota e fechar dentro do or\u00e7amento.'
            ]
          },
          blue: {
            label: 'Horo-sazonal azul',
            budget: 134000,
            accumulatedKwh: 41200,
            projectedBill: 143860,
            avgTariff: 0.789,
            components: [
              { name: 'Demanda ponta', kwh: 5200, tariff: 1.42, cost: 7384, share: 22.6, reading: 'Ponta pressionada no in\u00edcio do m\u00eas.', tone: 'is-alert' },
              { name: 'Demanda fora de ponta', kwh: 32100, tariff: 0.65, cost: 20865, share: 63.8, reading: 'Componente dominante.', tone: 'is-alert' },
              { name: 'Encargos e bandeira', kwh: 3900, tariff: 1.14, cost: 4446, share: 13.6, reading: 'Encargos no patamar elevado.', tone: 'is-warning' }
            ],
            insights: [
              'A modalidade azul projeta estouro superior a R$ 9.000 sobre o or\u00e7amento.',
              'A demanda de ponta elevada agrava o cen\u00e1rio financeiro.',
              'Migrar para o perfil verde pode economizar cerca de R$ 7.000 este m\u00eas.'
            ]
          },
          flat: {
            label: 'Convencional',
            budget: 134000,
            accumulatedKwh: 41200,
            projectedBill: 140320,
            avgTariff: 0.770,
            components: [
              { name: 'Energia ativa', kwh: 38600, tariff: 0.71, cost: 27406, share: 85.2, reading: 'Energia ativa elevada na primeira semana.', tone: 'is-alert' },
              { name: 'Encargos', kwh: 1800, tariff: 1.45, cost: 2610, share: 8.1, reading: 'Encargos proporcionais ao consumo.', tone: 'is-warning' },
              { name: 'Tributos e adicionais', kwh: 800, tariff: 2.68, cost: 2144, share: 6.7, reading: 'Tributos dentro do esperado.', tone: 'is-good' }
            ],
            insights: [
              'A tarifa convencional tamb\u00e9m indica estouro do or\u00e7amento no ritmo atual.',
              'O modelo n\u00e3o captura benef\u00edcios do deslocamento de carga hor\u00e1ria.',
              'O perfil verde continua oferecendo a melhor rela\u00e7\u00e3o custo-consumo.'
            ]
          }
        }
      }
    };

    function formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    function renderForecast() {
      const monthKey = forecastMonthSelect.value;
      const month = forecastData[monthKey];
      const view = forecastViewSelect ? forecastViewSelect.value : 'monthly';
      const tariff = month.tariffs[forecastTariffSelect.value];
      const budgetDelta = tariff.projectedBill - tariff.budget;
      const commitment = (tariff.projectedBill / tariff.budget) * 100;

      forecastCycleTitle.textContent = month.monthLabel;
      forecastCycleSubtitle.textContent = tariff.label;
      forecastBudgetLabel.textContent = 'Or\u00e7amento ' + formatCurrency(tariff.budget);
      forecastUpdatedAt.textContent = month.updatedAt;
      forecastAccumulatedKwh.textContent = new Intl.NumberFormat('pt-BR').format(tariff.accumulatedKwh) + ' kWh';
      forecastProjectedBill.textContent = formatCurrency(tariff.projectedBill);
      forecastBudgetDelta.textContent = (budgetDelta >= 0 ? '+' : '-') + formatCurrency(Math.abs(budgetDelta));
      forecastCommitment.textContent = commitment.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
      forecastGaugeFill.style.width = Math.min(commitment, 140) + '%';
      forecastGaugeLimit.style.left = '100%';

      // Daily cost & avg tariff cards
      var dailyCostVal = Math.round(tariff.projectedBill / month.daysInMonth);
      var dailyKwhVal = Math.round(tariff.accumulatedKwh / month.daysPassed);
      if (forecastDailyCost) forecastDailyCost.textContent = formatCurrency(dailyCostVal);
      if (forecastDailyKwh) forecastDailyKwh.textContent = new Intl.NumberFormat('pt-BR').format(dailyKwhVal) + ' kWh/dia';
      if (forecastAvgTariff) forecastAvgTariff.textContent = 'R$ ' + tariff.avgTariff.toFixed(3) + '/kWh';
      if (forecastTariffFlag) {
        var flagLabel = tariff.avgTariff > 0.76 ? 'Bandeira vermelha' : tariff.avgTariff > 0.72 ? 'Bandeira amarela' : 'Bandeira verde';
        forecastTariffFlag.textContent = flagLabel;
      }

      // Narrative
      var progressPct = Math.round((month.daysPassed / month.daysInMonth) * 100);
      var spentPct = Math.round((tariff.accumulatedKwh * tariff.avgTariff / tariff.budget) * 100);
      forecastNarrative.textContent = 'Com ' + progressPct + '% do m\u00eas consumido (' + month.daysPassed + ' de ' + month.daysInMonth + ' dias), j\u00e1 foram gastos ' + spentPct + '% do or\u00e7amento. A proje\u00e7\u00e3o com tarifa ' + tariff.label.toLowerCase() + ' indica fechamento em ' + formatCurrency(tariff.projectedBill) + '.';

      // Progress bars by view
      if (forecastProgressBars) {
        var periods, budgetPerPeriod, titleText;
        if (view === 'daily') {
          periods = month.daily;
          budgetPerPeriod = Math.round(tariff.budget / month.daysInMonth);
          titleText = 'Custo estimado por dia da semana';
        } else if (view === 'weekly') {
          periods = month.weekly;
          budgetPerPeriod = Math.round(tariff.budget / 4);
          titleText = 'Custo estimado por semana';
        } else {
          periods = [{ period: month.monthLabel.split(' de ')[0], cost: tariff.projectedBill }];
          budgetPerPeriod = tariff.budget;
          titleText = 'Custo mensal projetado vs or\u00e7amento';
        }
        if (forecastProgressTitle) forecastProgressTitle.textContent = titleText;

        var maxCost = Math.max(...periods.map(function(p) { return p.cost; }), budgetPerPeriod);
        forecastProgressBars.innerHTML = periods.filter(function(p) { return p.cost > 0; }).map(function(p) {
          var pct = (p.cost / (maxCost * 1.15)) * 100;
          var budgetPct = (budgetPerPeriod / (maxCost * 1.15)) * 100;
          var ratio = p.cost / budgetPerPeriod;
          var cls = ratio > 1 ? 'is-over' : ratio > 0.9 ? 'is-warning' : 'is-ok';
          return '<div class="compliance-bar-group">' +
            '<span class="compliance-bar-label">' + p.period + '</span>' +
            '<div class="compliance-bar-track">' +
            '<div class="compliance-bar-fill ' + cls + '" style="width:' + pct.toFixed(1) + '%"></div>' +
            '<div class="compliance-bar-limit" style="left:' + Math.min(budgetPct, 100).toFixed(1) + '%"></div>' +
            '</div>' +
            '<span class="compliance-bar-value">' + formatCurrency(p.cost) + '</span>' +
            '</div>';
        }).join('');
      }

      // Scenario simulation
      if (forecastScenario) {
        var dailyRate = tariff.accumulatedKwh / month.daysPassed;
        var daysLeft = month.daysInMonth - month.daysPassed;
        var optimisticKwh = tariff.accumulatedKwh + (dailyRate * 0.85 * daysLeft);
        var normalKwh = tariff.accumulatedKwh + (dailyRate * daysLeft);
        var pessimisticKwh = tariff.accumulatedKwh + (dailyRate * 1.15 * daysLeft);
        var optimisticCost = optimisticKwh * tariff.avgTariff;
        var normalCost = normalKwh * tariff.avgTariff;
        var pessimisticCost = pessimisticKwh * tariff.avgTariff;

        var scenarios = [
          {
            label: 'Cen\u00e1rio otimista (-15% consumo)',
            value: formatCurrency(optimisticCost),
            delta: formatCurrency(Math.abs(optimisticCost - tariff.budget)),
            indicator: optimisticCost <= tariff.budget ? 'is-ok' : 'is-warning',
            status: optimisticCost <= tariff.budget ? 'Dentro do or\u00e7amento' : 'Acima do or\u00e7amento'
          },
          {
            label: 'Cen\u00e1rio atual (ritmo mantido)',
            value: formatCurrency(normalCost),
            delta: formatCurrency(Math.abs(normalCost - tariff.budget)),
            indicator: normalCost <= tariff.budget ? 'is-ok' : normalCost <= tariff.budget * 1.05 ? 'is-warning' : 'is-over',
            status: normalCost <= tariff.budget ? 'Dentro do or\u00e7amento' : 'Acima do or\u00e7amento'
          },
          {
            label: 'Cen\u00e1rio pessimista (+15% consumo)',
            value: formatCurrency(pessimisticCost),
            delta: formatCurrency(Math.abs(pessimisticCost - tariff.budget)),
            indicator: pessimisticCost <= tariff.budget ? 'is-ok' : 'is-over',
            status: pessimisticCost <= tariff.budget ? 'Dentro do or\u00e7amento' : 'Acima do or\u00e7amento'
          }
        ];

        forecastScenario.innerHTML = scenarios.map(function(s) {
          return '<div class="compliance-summary-item">' +
            '<strong>' + s.label + '</strong>' +
            '<span>Fechamento estimado: ' + s.value + '</span>' +
            '<span class="compliance-indicator ' + s.indicator + '"><span class="compliance-indicator-dot"></span> ' + s.status + ' (' + (s.indicator === 'is-ok' ? 'folga' : 'desvio') + ' de ' + s.delta + ')</span>' +
            '</div>';
        }).join('');
      }

      // Tariff stack
      tariffStack.innerHTML = tariff.components.map(function(component) {
        return '<div class="tariff-item">' +
          '<div class="tariff-item-head">' +
          '<strong>' + component.name + '</strong>' +
          '<span>' + component.share.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%</span>' +
          '</div>' +
          '<p>' + component.reading + '</p>' +
          '<strong class="tariff-item-cost">' + formatCurrency(component.cost) + '</strong>' +
          '</div>';
      }).join('');

      // Component table
      forecastComponentTableBody.innerHTML = tariff.components.map(function(component) {
        return '<tr>' +
          '<td>' + component.name + '</td>' +
          '<td>' + new Intl.NumberFormat('pt-BR').format(component.kwh) + ' kWh</td>' +
          '<td>' + formatCurrency(component.tariff) + '</td>' +
          '<td>' + formatCurrency(component.cost) + '</td>' +
          '<td>' + component.share.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%</td>' +
          '<td><span class="table-status ' + component.tone + '">' + component.reading + '</span></td>' +
          '</tr>';
      }).join('');

      // Insights
      var enrichedInsights = tariff.insights.slice();
      if (month.daysPassed < month.daysInMonth) {
        enrichedInsights.push('Faltam ' + (month.daysInMonth - month.daysPassed) + ' dias para o fechamento. O custo di\u00e1rio m\u00e9dio \u00e9 de ' + formatCurrency(dailyCostVal) + '.');
      }
      if (budgetDelta > 0 && month.daysPassed < month.daysInMonth) {
        var targetDaily = (tariff.budget - tariff.accumulatedKwh * tariff.avgTariff) / (month.daysInMonth - month.daysPassed);
        enrichedInsights.push('Para fechar no or\u00e7amento, o custo di\u00e1rio precisa cair para ' + formatCurrency(Math.max(targetDaily, 0)) + ' nos dias restantes.');
      }
      forecastInsights.innerHTML = enrichedInsights.map(function(item) { return '<li>' + item + '</li>'; }).join('');

      // Status
      if (budgetDelta > 0) {
        setStandaloneStatus(forecastStatus, 'error', 'A previs\u00e3o excede o or\u00e7amento em ' + formatCurrency(budgetDelta) + '. O momento pede ajuste de carga e revis\u00e3o do plano financeiro.');
      } else if (budgetDelta > -5000) {
        setStandaloneStatus(forecastStatus, 'warning', 'A previs\u00e3o ainda cabe no or\u00e7amento, mas com margem curta. Vale acompanhar diariamente.');
      } else {
        setStandaloneStatus(forecastStatus, 'success', 'A previs\u00e3o est\u00e1 abaixo do or\u00e7amento com margem confort\u00e1vel no cen\u00e1rio atual.');
      }
    }

    forecastMonthSelect.addEventListener('change', renderForecast);
    forecastTariffSelect.addEventListener('change', renderForecast);
    if (forecastViewSelect) forecastViewSelect.addEventListener('change', renderForecast);
    renderForecast();
  }


  // ── Anomaly Detection Page ──
  const anomalyPeriodSelect = document.getElementById('anomalyPeriodSelect');
  if (anomalyPeriodSelect) {
    const anomalyTypeSelect = document.getElementById('anomalyTypeSelect');
    const anomalyStatus = document.getElementById('anomalyStatus');
    const anomalyTotal = document.getElementById('anomalyTotal');
    const anomalySpikes = document.getElementById('anomalySpikes');
    const anomalyMaintenance = document.getElementById('anomalyMaintenance');
    const anomalySavings = document.getElementById('anomalySavings');
    const anomalyEquipCount = document.getElementById('anomalyEquipCount');
    const anomalyAlertCount = document.getElementById('anomalyAlertCount');
    const anomalySeverity = document.getElementById('anomalySeverity');
    const anomalyOverallStatus = document.getElementById('anomalyOverallStatus');
    const anomalyTableBody = document.getElementById('anomalyTableBody');
    const anomalyAlertList = document.getElementById('anomalyAlertList');
    const anomalyBars = document.getElementById('anomalyBars');
    const maintenanceList = document.getElementById('maintenanceList');
    const anomalyMaxDeviation = document.getElementById('anomalyMaxDeviation');
    const anomalyMaxDeviationEquip = document.getElementById('anomalyMaxDeviationEquip');
    const anomalyWasteCost = document.getElementById('anomalyWasteCost');
    const anomalyWasteLabel = document.getElementById('anomalyWasteLabel');
    const anomalyTrendList = document.getElementById('anomalyTrendList');
    const anomalyHourlyBars = document.getElementById('anomalyHourlyBars');

    var tariffPerKwh = 0.75;

    const anomalyData = {
      '7d': {
        equipment: [
          { name: 'Compressor 01', type: 'compressor', current: 18.4, expected: 14.2, status: 'critical', action: 'Agendar manuten\u00e7\u00e3o', trend: 'worsening', lastPeak: 'Hoje, 06:12', hoursAbove: 42 },
          { name: 'Compressor 02', type: 'compressor', current: 15.1, expected: 14.8, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: null, hoursAbove: 0 },
          { name: 'Motor bomba d\u2019\u00e1gua', type: 'motor', current: 9.7, expected: 7.2, status: 'warning', action: 'Inspecionar rolamento', trend: 'worsening', lastPeak: 'Hoje, 08:45', hoursAbove: 28 },
          { name: 'Motor exaustor', type: 'motor', current: 5.3, expected: 5.1, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: null, hoursAbove: 0 },
          { name: 'Compressor 03', type: 'compressor', current: 16.9, expected: 14.0, status: 'warning', action: 'Verificar g\u00e1s refrigerante', trend: 'worsening', lastPeak: 'Ontem, 14:20', hoursAbove: 18 },
          { name: 'Motor esteira', type: 'motor', current: 4.1, expected: 3.8, status: 'normal', action: 'Monitorar', trend: 'improving', lastPeak: null, hoursAbove: 0 },
          { name: 'Compressor 04', type: 'compressor', current: 12.8, expected: 12.5, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: null, hoursAbove: 0 },
          { name: 'Motor ventila\u00e7\u00e3o', type: 'motor', current: 6.8, expected: 6.4, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: null, hoursAbove: 0 }
        ],
        hourlyPeaks: [
          { hour: '00-04', picos: 1, avgKw: 8.2 },
          { hour: '04-08', picos: 4, avgKw: 14.8 },
          { hour: '08-12', picos: 6, avgKw: 16.3 },
          { hour: '12-16', picos: 3, avgKw: 15.1 },
          { hour: '16-20', picos: 5, avgKw: 15.9 },
          { hour: '20-24', picos: 2, avgKw: 10.4 }
        ],
        alerts: [
          { equip: 'Compressor 01', msg: 'Pico de 29,6% acima da m\u00e9dia sustentado por 3h', level: 'critical', time: 'Hoje, 06:12' },
          { equip: 'Motor bomba d\u2019\u00e1gua', msg: 'Consumo 34,7% acima do esperado nas \u00faltimas 24h', level: 'warning', time: 'Hoje, 08:45' },
          { equip: 'Compressor 03', msg: 'Desvio crescente de 20,7% nos \u00faltimos 3 dias', level: 'warning', time: 'Ontem, 14:20' },
          { equip: 'Compressor 01', msg: 'Vibra\u00e7\u00e3o anormal detectada no sensor auxiliar', level: 'critical', time: 'Hoje, 05:48' }
        ],
        maintenance: [
          { equip: 'Compressor 01', task: 'Revis\u00e3o completa \u2014 poss\u00edvel desgaste no pist\u00e3o', priority: 'high', saving: 'R$ 1.840/m\u00eas', estimatedFailure: '~15 dias' },
          { equip: 'Motor bomba d\u2019\u00e1gua', task: 'Inspe\u00e7\u00e3o de rolamento e alinhamento', priority: 'high', saving: 'R$ 920/m\u00eas', estimatedFailure: '~30 dias' },
          { equip: 'Compressor 03', task: 'Verificar n\u00edvel de g\u00e1s refrigerante e vedar vazamento', priority: 'medium', saving: 'R$ 680/m\u00eas', estimatedFailure: '~45 dias' }
        ]
      },
      '30d': {
        equipment: [
          { name: 'Compressor 01', type: 'compressor', current: 17.8, expected: 14.2, status: 'warning', action: 'Agendar manuten\u00e7\u00e3o', trend: 'worsening', lastPeak: '12/04/2026', hoursAbove: 156 },
          { name: 'Compressor 02', type: 'compressor', current: 14.9, expected: 14.8, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: null, hoursAbove: 0 },
          { name: 'Motor bomba d\u2019\u00e1gua', type: 'motor', current: 8.9, expected: 7.2, status: 'warning', action: 'Inspecionar rolamento', trend: 'worsening', lastPeak: '08/04/2026', hoursAbove: 98 },
          { name: 'Motor exaustor', type: 'motor', current: 5.2, expected: 5.1, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: null, hoursAbove: 0 },
          { name: 'Compressor 03', type: 'compressor', current: 15.4, expected: 14.0, status: 'normal', action: 'Monitorar', trend: 'improving', lastPeak: '28/03/2026', hoursAbove: 12 },
          { name: 'Motor esteira', type: 'motor', current: 4.0, expected: 3.8, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: null, hoursAbove: 0 },
          { name: 'Compressor 04', type: 'compressor', current: 13.1, expected: 12.5, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: null, hoursAbove: 0 },
          { name: 'Motor ventila\u00e7\u00e3o', type: 'motor', current: 6.6, expected: 6.4, status: 'normal', action: 'Monitorar', trend: 'improving', lastPeak: null, hoursAbove: 0 }
        ],
        hourlyPeaks: [
          { hour: '00-04', picos: 3, avgKw: 7.9 },
          { hour: '04-08', picos: 12, avgKw: 14.2 },
          { hour: '08-12', picos: 18, avgKw: 15.8 },
          { hour: '12-16', picos: 10, avgKw: 14.6 },
          { hour: '16-20', picos: 14, avgKw: 15.2 },
          { hour: '20-24', picos: 5, avgKw: 9.8 }
        ],
        alerts: [
          { equip: 'Compressor 01', msg: 'M\u00e9dia mensal 25,4% acima do baseline', level: 'warning', time: '12/04/2026' },
          { equip: 'Motor bomba d\u2019\u00e1gua', msg: 'Tend\u00eancia de alta em 4 das \u00faltimas 5 semanas', level: 'warning', time: '08/04/2026' }
        ],
        maintenance: [
          { equip: 'Compressor 01', task: 'Manuten\u00e7\u00e3o preventiva programada', priority: 'medium', saving: 'R$ 1.420/m\u00eas', estimatedFailure: '~30 dias' },
          { equip: 'Motor bomba d\u2019\u00e1gua', task: 'Substituir rolamento e lubrificar eixo', priority: 'medium', saving: 'R$ 780/m\u00eas', estimatedFailure: '~60 dias' }
        ]
      },
      '90d': {
        equipment: [
          { name: 'Compressor 01', type: 'compressor', current: 16.5, expected: 14.2, status: 'warning', action: 'Planejar troca', trend: 'worsening', lastPeak: '12/04/2026', hoursAbove: 380 },
          { name: 'Compressor 02', type: 'compressor', current: 14.6, expected: 14.8, status: 'normal', action: 'Monitorar', trend: 'improving', lastPeak: null, hoursAbove: 0 },
          { name: 'Motor bomba d\u2019\u00e1gua', type: 'motor', current: 8.1, expected: 7.2, status: 'normal', action: 'Monitorar', trend: 'improving', lastPeak: '08/04/2026', hoursAbove: 45 },
          { name: 'Motor exaustor', type: 'motor', current: 5.4, expected: 5.1, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: null, hoursAbove: 0 },
          { name: 'Compressor 03', type: 'compressor', current: 14.8, expected: 14.0, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: '28/03/2026', hoursAbove: 18 },
          { name: 'Motor esteira', type: 'motor', current: 4.2, expected: 3.8, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: null, hoursAbove: 0 },
          { name: 'Compressor 04', type: 'compressor', current: 12.9, expected: 12.5, status: 'normal', action: 'Monitorar', trend: 'stable', lastPeak: null, hoursAbove: 0 },
          { name: 'Motor ventila\u00e7\u00e3o', type: 'motor', current: 6.5, expected: 6.4, status: 'normal', action: 'Monitorar', trend: 'improving', lastPeak: null, hoursAbove: 0 }
        ],
        hourlyPeaks: [
          { hour: '00-04', picos: 8, avgKw: 7.5 },
          { hour: '04-08', picos: 32, avgKw: 13.8 },
          { hour: '08-12', picos: 48, avgKw: 15.2 },
          { hour: '12-16', picos: 28, avgKw: 14.1 },
          { hour: '16-20', picos: 38, avgKw: 14.7 },
          { hour: '20-24', picos: 12, avgKw: 9.2 }
        ],
        alerts: [
          { equip: 'Compressor 01', msg: 'Desgaste progressivo detectado no trimestre', level: 'warning', time: 'Fev-Mai 2026' }
        ],
        maintenance: [
          { equip: 'Compressor 01', task: 'Avaliar substitui\u00e7\u00e3o do equipamento por modelo mais eficiente', priority: 'low', saving: 'R$ 3.200/trimestre', estimatedFailure: '~90 dias' }
        ]
      }
    };

    function renderAnomalyPage() {
      var period = anomalyPeriodSelect.value;
      var typeFilter = anomalyTypeSelect.value;
      var data = anomalyData[period];
      var filtered = typeFilter === 'all'
        ? data.equipment
        : data.equipment.filter(function(e) { return e.type === typeFilter; });

      var anomalies = filtered.filter(function(e) { return e.status !== 'normal'; });
      var spikes = filtered.filter(function(e) { return ((e.current - e.expected) / e.expected) * 100 > 20; });
      var criticals = filtered.filter(function(e) { return e.status === 'critical'; });
      var totalSaving = data.maintenance.reduce(function(sum, m) {
        var val = parseFloat(m.saving.replace(/[^\d]/g, ''));
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

      anomalyTotal.textContent = anomalies.length;
      anomalySpikes.textContent = spikes.length;
      anomalyMaintenance.textContent = data.maintenance.length;
      anomalySavings.textContent = 'R$ ' + new Intl.NumberFormat('pt-BR').format(totalSaving);
      anomalyEquipCount.textContent = filtered.length + ' equipamentos monitorados';
      anomalyAlertCount.textContent = data.alerts.length + (data.alerts.length === 1 ? ' alerta ativo' : ' alertas ativos');
      anomalySeverity.textContent = criticals.length > 0 ? criticals.length + ' cr\u00edtico' + (criticals.length > 1 ? 's' : '') : 'Nenhum cr\u00edtico';

      // Max deviation card
      var deviations = filtered.map(function(e) { return { name: e.name, dev: ((e.current - e.expected) / e.expected) * 100 }; });
      deviations.sort(function(a, b) { return b.dev - a.dev; });
      if (anomalyMaxDeviation) anomalyMaxDeviation.textContent = '+' + deviations[0].dev.toFixed(1) + '%';
      if (anomalyMaxDeviationEquip) anomalyMaxDeviationEquip.textContent = deviations[0].name;

      // Waste cost card
      var wasteKwh = filtered.reduce(function(sum, e) {
        var excess = e.current - e.expected;
        return sum + (excess > 0 ? excess * e.hoursAbove : 0);
      }, 0);
      var wasteCost = wasteKwh * tariffPerKwh;
      if (anomalyWasteCost) anomalyWasteCost.textContent = 'R$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(wasteCost);
      if (anomalyWasteLabel) {
        var wasteEquips = filtered.filter(function(e) { return e.current > e.expected && e.hoursAbove > 0; }).length;
        anomalyWasteLabel.textContent = wasteEquips + ' equipamento' + (wasteEquips !== 1 ? 's' : '') + ' com excesso';
      }

      if (criticals.length > 0) {
        anomalyOverallStatus.textContent = 'Cr\u00edtico';
        anomalyOverallStatus.className = 'status-pill is-alert';
      } else if (anomalies.length > 0) {
        anomalyOverallStatus.textContent = 'Aten\u00e7\u00e3o';
        anomalyOverallStatus.className = 'status-pill is-warning';
      } else {
        anomalyOverallStatus.textContent = 'Normal';
        anomalyOverallStatus.className = 'status-pill is-good';
      }

      // Table
      anomalyTableBody.innerHTML = filtered.map(function(e) {
        var deviation = ((e.current - e.expected) / e.expected * 100);
        var statusClass = e.status === 'critical' ? 'is-alert' : e.status === 'warning' ? 'is-warning' : 'is-good';
        var statusLabel = e.status === 'critical' ? 'Cr\u00edtico' : e.status === 'warning' ? 'Aten\u00e7\u00e3o' : 'Normal';
        var trendIcon = e.trend === 'worsening' ? '\u2191 Piorando' : e.trend === 'improving' ? '\u2193 Melhorando' : '\u2194 Est\u00e1vel';
        var trendCls = e.trend === 'worsening' ? 'trend-down' : e.trend === 'improving' ? 'trend-up' : '';
        return '<tr>' +
          '<td>' + e.name + '</td>' +
          '<td>' + (e.type === 'compressor' ? 'Compressor' : 'Motor') + '</td>' +
          '<td>' + e.current.toFixed(1) + ' kW</td>' +
          '<td>' + e.expected.toFixed(1) + ' kW</td>' +
          '<td class="' + (deviation > 20 ? 'trend-alert' : deviation > 5 ? 'trend-warning' : '') + '">' + (deviation > 0 ? '+' : '') + deviation.toFixed(1) + '%</td>' +
          '<td><span class="table-status ' + statusClass + '">' + statusLabel + '</span></td>' +
          '<td><span class="' + trendCls + '" style="font-size:0.82rem;font-weight:700">' + trendIcon + '</span></td>' +
          '</tr>';
      }).join('');

      // Alerts
      anomalyAlertList.innerHTML = data.alerts.map(function(a) {
        var cls = a.level === 'critical' ? 'is-critical' : a.level === 'warning' ? 'is-warning' : 'is-normal';
        return '<div class="anomaly-alert-item ' + cls + '">' +
          '<strong>' + a.equip + '</strong>' +
          '<span>' + a.msg + '</span>' +
          '<span class="alert-time">' + a.time + '</span>' +
          '</div>';
      }).join('') || '<div class="anomaly-alert-item"><span>Nenhum alerta no per\u00edodo.</span></div>';

      // Bars chart
      var maxCurrent = Math.max.apply(null, filtered.map(function(e) { return e.current; }));
      anomalyBars.innerHTML = filtered.map(function(e) {
        var pct = (e.current / (maxCurrent * 1.15)) * 100;
        var baselinePct = (e.expected / (maxCurrent * 1.15)) * 100;
        var cls = e.status === 'critical' ? 'is-critical' : e.status === 'warning' ? 'is-warning' : 'is-normal';
        return '<div class="anomaly-bar-row">' +
          '<span class="anomaly-bar-label">' + e.name + '</span>' +
          '<div class="anomaly-bar-track">' +
          '<div class="anomaly-bar-fill ' + cls + '" style="width:' + pct.toFixed(1) + '%"></div>' +
          '<div class="anomaly-bar-baseline" style="left:' + baselinePct.toFixed(1) + '%"></div>' +
          '</div>' +
          '<span class="anomaly-bar-value">' + e.current.toFixed(1) + ' kW</span>' +
          '</div>';
      }).join('');

      // Trend list
      if (anomalyTrendList) {
        var worsening = filtered.filter(function(e) { return e.trend === 'worsening'; });
        var stable = filtered.filter(function(e) { return e.trend === 'stable'; });
        var improving = filtered.filter(function(e) { return e.trend === 'improving'; });
        anomalyTrendList.innerHTML = [
          { label: 'Piorando', count: worsening.length, names: worsening.map(function(e) { return e.name; }).join(', '), indicator: 'is-over' },
          { label: 'Est\u00e1vel', count: stable.length, names: stable.map(function(e) { return e.name; }).join(', '), indicator: 'is-warning' },
          { label: 'Melhorando', count: improving.length, names: improving.map(function(e) { return e.name; }).join(', '), indicator: 'is-ok' }
        ].map(function(item) {
          return '<div class="compliance-summary-item">' +
            '<strong>' + item.label + '</strong>' +
            '<span>' + item.count + ' equipamento' + (item.count !== 1 ? 's' : '') + '</span>' +
            '<span class="compliance-indicator ' + item.indicator + '"><span class="compliance-indicator-dot"></span> ' + (item.names || 'Nenhum') + '</span>' +
            '</div>';
        }).join('');
      }

      // Hourly peaks chart
      if (anomalyHourlyBars && data.hourlyPeaks) {
        var maxPicos = Math.max.apply(null, data.hourlyPeaks.map(function(h) { return h.picos; }));
        anomalyHourlyBars.innerHTML = data.hourlyPeaks.map(function(h) {
          var pct = (h.picos / (maxPicos * 1.15)) * 100;
          var cls = h.picos >= maxPicos * 0.8 ? 'is-critical' : h.picos >= maxPicos * 0.5 ? 'is-warning' : 'is-normal';
          return '<div class="anomaly-bar-row">' +
            '<span class="anomaly-bar-label">' + h.hour + 'h</span>' +
            '<div class="anomaly-bar-track">' +
            '<div class="anomaly-bar-fill ' + cls + '" style="width:' + pct.toFixed(1) + '%"></div>' +
            '</div>' +
            '<span class="anomaly-bar-value">' + h.picos + ' pico' + (h.picos !== 1 ? 's' : '') + ' (' + h.avgKw.toFixed(1) + ' kW)</span>' +
            '</div>';
        }).join('');
      }

      // Maintenance suggestions
      maintenanceList.innerHTML = data.maintenance.map(function(m) {
        var prioLabel = m.priority === 'high' ? 'Alta' : m.priority === 'medium' ? 'M\u00e9dia' : 'Baixa';
        var failureHtml = m.estimatedFailure ? '<span style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px">Falha estimada: ' + m.estimatedFailure + '</span>' : '';
        return '<div class="maintenance-item">' +
          '<strong>' + m.equip + '</strong>' +
          '<span>' + m.task + '</span>' +
          failureHtml +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">' +
          '<span class="maintenance-priority is-' + m.priority + '"><span class="priority-dot"></span> ' + prioLabel + '</span>' +
          '<span style="font-size:0.84rem;font-weight:700;color:var(--color-success)">Economia: ' + m.saving + '</span>' +
          '</div>' +
          '</div>';
      }).join('') || '<div class="maintenance-item"><span>Nenhuma manuten\u00e7\u00e3o sugerida.</span></div>';

      // Status message
      if (criticals.length > 0) {
        setStandaloneStatus(anomalyStatus, 'error', criticals.length + ' equipamento(s) com anomalia cr\u00edtica. Manuten\u00e7\u00e3o urgente recomendada.');
      } else if (anomalies.length > 0) {
        setStandaloneStatus(anomalyStatus, 'warning', anomalies.length + ' equipamento(s) com desvio acima do normal. Acompanhe a evolu\u00e7\u00e3o.');
      } else {
        setStandaloneStatus(anomalyStatus, 'success', 'Todos os equipamentos operam dentro dos par\u00e2metros esperados.');
      }
    }

    anomalyPeriodSelect.addEventListener('change', renderAnomalyPage);
    anomalyTypeSelect.addEventListener('change', renderAnomalyPage);
    renderAnomalyPage();
  }

  // ── Compliance Report Page ──
  const complianceViewSelect = document.getElementById('complianceViewSelect');
  if (complianceViewSelect) {
    const complianceMonthSelect = document.getElementById('complianceMonthSelect');
    const complianceStatus = document.getElementById('complianceStatus');
    const complianceTotalKwh = document.getElementById('complianceTotalKwh');
    const complianceLimit = document.getElementById('complianceLimit');
    const complianceUsage = document.getElementById('complianceUsage');
    const complianceCost = document.getElementById('complianceCost');
    const complianceScore = document.getElementById('complianceScore');
    const complianceLabel = document.getElementById('complianceLabel');
    const compliancePeriodLabel = document.getElementById('compliancePeriodLabel');
    const complianceTableBody = document.getElementById('complianceTableBody');
    const complianceTableFoot = document.getElementById('complianceTableFoot');
    const complianceBars = document.getElementById('complianceBars');
    const complianceSummary = document.getElementById('complianceSummary');
    const complianceInsights = document.getElementById('complianceInsights');
    const complianceExportCsv = document.getElementById('complianceExportCsv');
    const complianceExportPdf = document.getElementById('complianceExportPdf');
    const complianceTotalTrend = document.getElementById('complianceTotalTrend');
    const complianceUsageTrend = document.getElementById('complianceUsageTrend');
    const complianceCostTrend = document.getElementById('complianceCostTrend');
    const complianceDailyAvg = document.getElementById('complianceDailyAvg');
    const compliancePeak = document.getElementById('compliancePeak');
    const compliancePeakLabel = document.getElementById('compliancePeakLabel');

    const complianceData = {
      '2026-01': {
        label: 'Janeiro de 2026',
        daysInMonth: 31,
        contractLimit: 135000,
        tariff: 0.92,
        monthly: [{ period: 'Janeiro', kwh: 128400 }],
        weekly: [
          { period: 'Sem 1 (01-07)', kwh: 29800 },
          { period: 'Sem 2 (08-14)', kwh: 31200 },
          { period: 'Sem 3 (15-21)', kwh: 33600 },
          { period: 'Sem 4 (22-31)', kwh: 33800 }
        ],
        daily: [
          { period: 'Seg', kwh: 4380 }, { period: 'Ter', kwh: 4520 },
          { period: 'Qua', kwh: 4610 }, { period: 'Qui', kwh: 4490 },
          { period: 'Sex', kwh: 4720 }, { period: 'S\u00e1b', kwh: 3180 },
          { period: 'Dom', kwh: 2640 }
        ]
      },
      '2026-02': {
        label: 'Fevereiro de 2026',
        daysInMonth: 28,
        contractLimit: 135000,
        tariff: 0.92,
        monthly: [{ period: 'Fevereiro', kwh: 120900 }],
        weekly: [
          { period: 'Sem 1 (01-07)', kwh: 28100 },
          { period: 'Sem 2 (08-14)', kwh: 29800 },
          { period: 'Sem 3 (15-21)', kwh: 31400 },
          { period: 'Sem 4 (22-28)', kwh: 31600 }
        ],
        daily: [
          { period: 'Seg', kwh: 4120 }, { period: 'Ter', kwh: 4280 },
          { period: 'Qua', kwh: 4350 }, { period: 'Qui', kwh: 4190 },
          { period: 'Sex', kwh: 4480 }, { period: 'S\u00e1b', kwh: 2980 },
          { period: 'Dom', kwh: 2510 }
        ]
      },
      '2026-03': {
        label: 'Mar\u00e7o de 2026',
        daysInMonth: 31,
        contractLimit: 135000,
        tariff: 0.95,
        monthly: [{ period: 'Mar\u00e7o', kwh: 117300 }],
        weekly: [
          { period: 'Sem 1 (01-07)', kwh: 26400 },
          { period: 'Sem 2 (08-14)', kwh: 28600 },
          { period: 'Sem 3 (15-21)', kwh: 30100 },
          { period: 'Sem 4 (22-31)', kwh: 32200 }
        ],
        daily: [
          { period: 'Seg', kwh: 3980 }, { period: 'Ter', kwh: 4150 },
          { period: 'Qua', kwh: 4280 }, { period: 'Qui', kwh: 4060 },
          { period: 'Sex', kwh: 4340 }, { period: 'S\u00e1b', kwh: 2860 },
          { period: 'Dom', kwh: 2380 }
        ]
      },
      '2026-04': {
        label: 'Abril de 2026',
        daysInMonth: 30,
        contractLimit: 135000,
        tariff: 0.95,
        monthly: [{ period: 'Abril', kwh: 124600 }],
        weekly: [
          { period: 'Sem 1 (01-07)', kwh: 28900 },
          { period: 'Sem 2 (08-14)', kwh: 30400 },
          { period: 'Sem 3 (15-21)', kwh: 32800 },
          { period: 'Sem 4 (22-30)', kwh: 32500 }
        ],
        daily: [
          { period: 'Seg', kwh: 4260 }, { period: 'Ter', kwh: 4410 },
          { period: 'Qua', kwh: 4530 }, { period: 'Qui', kwh: 4370 },
          { period: 'Sex', kwh: 4590 }, { period: 'S\u00e1b', kwh: 3050 },
          { period: 'Dom', kwh: 2540 }
        ]
      },
      '2026-05': {
        label: 'Maio de 2026',
        daysInMonth: 31,
        contractLimit: 135000,
        tariff: 0.97,
        monthly: [{ period: 'Maio', kwh: 131200 }],
        weekly: [
          { period: 'Sem 1 (01-07)', kwh: 30100 },
          { period: 'Sem 2 (08-14)', kwh: 32400 },
          { period: 'Sem 3 (15-21)', kwh: 34200 },
          { period: 'Sem 4 (22-31)', kwh: 34500 }
        ],
        daily: [
          { period: 'Seg', kwh: 4520 }, { period: 'Ter', kwh: 4680 },
          { period: 'Qua', kwh: 4790 }, { period: 'Qui', kwh: 4610 },
          { period: 'Sex', kwh: 4850 }, { period: 'S\u00e1b', kwh: 3240 },
          { period: 'Dom', kwh: 2710 }
        ]
      }
    };

    const monthOrder = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];

    function getPrevMonthData(currentMonth) {
      const idx = monthOrder.indexOf(currentMonth);
      return idx > 0 ? complianceData[monthOrder[idx - 1]] : null;
    }

    function trendHtml(current, previous, invert) {
      if (previous == null) return '';
      const diff = ((current - previous) / previous) * 100;
      const absDiff = Math.abs(diff).toFixed(1);
      if (Math.abs(diff) < 0.5) return '<span class="trend-neutral">= 0%</span>';
      const isUp = diff > 0;
      const arrow = isUp ? '\u2191' : '\u2193';
      const cls = invert ? (isUp ? 'trend-down' : 'trend-up') : (isUp ? 'trend-up' : 'trend-down');
      return '<span class="' + cls + '">' + arrow + ' ' + absDiff + '%</span>';
    }

    function renderCompliancePage() {
      const month = complianceMonthSelect.value;
      const view = complianceViewSelect.value;
      const data = complianceData[month];
      const periods = view === 'monthly' ? data.monthly : view === 'weekly' ? data.weekly : data.daily;
      const prevData = getPrevMonthData(month);

      const totalKwh = view === 'monthly'
        ? data.monthly[0].kwh
        : periods.reduce((s, p) => s + p.kwh, 0);
      const limit = view === 'monthly'
        ? data.contractLimit
        : view === 'weekly'
          ? Math.round(data.contractLimit / 4)
          : Math.round(data.contractLimit / 30);
      const usagePct = (totalKwh / data.contractLimit) * 100;
      const cost = totalKwh * data.tariff;

      const prevTotalKwh = prevData ? prevData.monthly[0].kwh : null;
      const prevUsagePct = prevData ? (prevData.monthly[0].kwh / prevData.contractLimit) * 100 : null;
      const prevCost = prevData ? prevData.monthly[0].kwh * prevData.tariff : null;

      complianceTotalKwh.textContent = new Intl.NumberFormat('pt-BR').format(totalKwh) + ' kWh';
      complianceLimit.textContent = new Intl.NumberFormat('pt-BR').format(data.contractLimit) + ' kWh';
      complianceUsage.textContent = usagePct.toFixed(1) + '%';
      complianceCost.textContent = 'R$ ' + new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cost);
      complianceScore.textContent = usagePct <= 85 ? (100 - Math.round(usagePct * 0.08)) + '%' : usagePct <= 95 ? '88%' : '76%';
      complianceLabel.textContent = usagePct <= 90 ? 'Dentro dos limites regulat\u00f3rios' : 'Pr\u00f3ximo do limite contratado';
      compliancePeriodLabel.textContent = data.label;

      if (complianceTotalTrend) complianceTotalTrend.innerHTML = trendHtml(totalKwh, prevTotalKwh, true);
      if (complianceUsageTrend) complianceUsageTrend.innerHTML = trendHtml(usagePct, prevUsagePct, true);
      if (complianceCostTrend) complianceCostTrend.innerHTML = trendHtml(cost, prevCost, true);

      const dailyAvg = Math.round(data.monthly[0].kwh / data.daysInMonth);
      if (complianceDailyAvg) complianceDailyAvg.textContent = new Intl.NumberFormat('pt-BR').format(dailyAvg) + ' kWh';

      const peakPeriod = [...data.daily].sort((a, b) => b.kwh - a.kwh)[0];
      if (compliancePeak) compliancePeak.textContent = new Intl.NumberFormat('pt-BR').format(peakPeriod.kwh) + ' kWh';
      if (compliancePeakLabel) compliancePeakLabel.textContent = peakPeriod.period;

      // Chart bars
      const maxKwh = Math.max(...periods.map((p) => p.kwh));
      complianceBars.innerHTML = periods.map((p) => {
        const pct = (p.kwh / (maxKwh * 1.2)) * 100;
        const limitPct = (limit / (maxKwh * 1.2)) * 100;
        const ratio = p.kwh / limit;
        const cls = ratio > 1 ? 'is-over' : ratio > 0.9 ? 'is-warning' : 'is-ok';
        return `<div class="compliance-bar-group">
          <span class="compliance-bar-label">${p.period}</span>
          <div class="compliance-bar-track">
            <div class="compliance-bar-fill ${cls}" style="width:${pct.toFixed(1)}%"></div>
            <div class="compliance-bar-limit" style="left:${Math.min(limitPct, 100).toFixed(1)}%"></div>
          </div>
          <span class="compliance-bar-value">${new Intl.NumberFormat('pt-BR').format(p.kwh)} kWh</span>
        </div>`;
      }).join('');

      // Table
      complianceTableBody.innerHTML = periods.map((p) => {
        const periodLimit = limit;
        const pctUsed = (p.kwh / periodLimit * 100);
        const periodCost = p.kwh * data.tariff;
        const statusClass = pctUsed > 100 ? 'is-alert' : pctUsed > 90 ? 'is-warning' : 'is-good';
        const statusLabel = pctUsed > 100 ? 'Excedido' : pctUsed > 90 ? 'Aten\u00e7\u00e3o' : 'Conforme';
        return `<tr>
          <td>${p.period}</td>
          <td>${new Intl.NumberFormat('pt-BR').format(p.kwh)}</td>
          <td>${new Intl.NumberFormat('pt-BR').format(periodLimit)}</td>
          <td>${pctUsed.toFixed(1)}%</td>
          <td>R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(periodCost)}</td>
          <td><span class="table-status ${statusClass}">${statusLabel}</span></td>
        </tr>`;
      }).join('');

      // Table footer totals
      if (complianceTableFoot) {
        const totalPeriodKwh = periods.reduce((s, p) => s + p.kwh, 0);
        const totalPeriodLimit = limit * periods.length;
        const totalPeriodPct = (totalPeriodKwh / totalPeriodLimit * 100);
        const totalPeriodCost = totalPeriodKwh * data.tariff;
        complianceTableFoot.innerHTML = `<tr class="table-total-row">
          <td><strong>Total</strong></td>
          <td><strong>${new Intl.NumberFormat('pt-BR').format(totalPeriodKwh)}</strong></td>
          <td><strong>${new Intl.NumberFormat('pt-BR').format(totalPeriodLimit)}</strong></td>
          <td><strong>${totalPeriodPct.toFixed(1)}%</strong></td>
          <td><strong>R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(totalPeriodCost)}</strong></td>
          <td></td>
        </tr>`;
      }

      // Summary
      const overLimit = periods.filter((p) => p.kwh > limit);
      const nearLimit = periods.filter((p) => p.kwh / limit > 0.9 && p.kwh <= limit);
      const conforming = periods.filter((p) => p.kwh / limit <= 0.9);

      complianceSummary.innerHTML = [
        { label: 'Per\u00edodos conformes', count: conforming.length, total: periods.length, indicator: 'is-ok' },
        { label: 'Per\u00edodos em aten\u00e7\u00e3o', count: nearLimit.length, total: periods.length, indicator: 'is-warning' },
        { label: 'Per\u00edodos excedidos', count: overLimit.length, total: periods.length, indicator: 'is-over' }
      ].map((item) => `<div class="compliance-summary-item">
        <strong>${item.label}</strong>
        <span>${item.count} de ${item.total}</span>
        <span class="compliance-indicator ${item.indicator}"><span class="compliance-indicator-dot"></span> ${item.count === 0 ? 'Nenhum' : item.count + ' per\u00edodo' + (item.count > 1 ? 's' : '')}</span>
      </div>`).join('');

      // Insights
      const insights = [];
      if (prevData) {
        const variation = ((data.monthly[0].kwh - prevData.monthly[0].kwh) / prevData.monthly[0].kwh * 100);
        if (variation > 0) {
          insights.push('Consumo aumentou ' + Math.abs(variation).toFixed(1) + '% em rela\u00e7\u00e3o ao m\u00eas anterior (' + prevData.label + ').');
        } else {
          insights.push('Consumo reduziu ' + Math.abs(variation).toFixed(1) + '% em rela\u00e7\u00e3o ao m\u00eas anterior (' + prevData.label + ').');
        }
      }
      if (usagePct <= 85) {
        insights.push('O consumo est\u00e1 bem abaixo do limite contratado. Margem segura para opera\u00e7\u00e3o.');
      } else if (usagePct <= 95) {
        insights.push('Consumo pr\u00f3ximo do limite. Recomenda-se monitorar os hor\u00e1rios de pico.');
      } else {
        insights.push('Consumo muito pr\u00f3ximo ou acima do limite. Avaliar renegocia\u00e7\u00e3o de demanda contratada.');
      }
      if (overLimit.length > 0) {
        insights.push(overLimit.length + ' per\u00edodo(s) excederam o limite proporcional. Investigue os picos.');
      }
      if (view === 'daily') {
        const weekdayAvg = Math.round((data.daily[0].kwh + data.daily[1].kwh + data.daily[2].kwh + data.daily[3].kwh + data.daily[4].kwh) / 5);
        const weekendAvg = Math.round((data.daily[5].kwh + data.daily[6].kwh) / 2);
        const weekendDrop = ((weekdayAvg - weekendAvg) / weekdayAvg * 100).toFixed(0);
        insights.push('Fins de semana consomem ' + weekendDrop + '% menos que dias \u00fateis. Otimize desligamentos autom\u00e1ticos.');
      }
      if (view === 'weekly') {
        insights.push('A tend\u00eancia semanal mostra crescimento gradual. Acompanhe para evitar estouro no fim do m\u00eas.');
      }
      if (view === 'monthly') {
        const margem = data.contractLimit - data.monthly[0].kwh;
        insights.push('Margem dispon\u00edvel: ' + new Intl.NumberFormat('pt-BR').format(margem) + ' kWh at\u00e9 o limite contratado.');
      }
      complianceInsights.innerHTML = insights.map((i) => `<li>${i}</li>`).join('');

      // Status message
      if (usagePct > 95) {
        setStandaloneStatus(complianceStatus, 'error', 'Consumo acima de 95% do limite contratado. A\u00e7\u00e3o imediata recomendada.');
      } else if (usagePct > 85) {
        setStandaloneStatus(complianceStatus, 'warning', 'Consumo entre 85-95% do limite. Monitore os pr\u00f3ximos dias com aten\u00e7\u00e3o.');
      } else {
        setStandaloneStatus(complianceStatus, 'success', 'Consumo dentro da faixa de conformidade. Opera\u00e7\u00e3o est\u00e1vel.');
      }
    }

    if (complianceExportCsv) {
      complianceExportCsv.addEventListener('click', () => {
        setStandaloneStatus(complianceStatus, 'success', 'Arquivo CSV gerado com sucesso. O download iniciou automaticamente.');
      });
    }
    if (complianceExportPdf) {
      complianceExportPdf.addEventListener('click', () => {
        complianceExportPdf.classList.add('btn-loading');
        setTimeout(() => {
          complianceExportPdf.classList.remove('btn-loading');
          complianceExportPdf.classList.add('btn-success');
          complianceExportPdf.addEventListener('animationend', () => complianceExportPdf.classList.remove('btn-success'), { once: true });
          setStandaloneStatus(complianceStatus, 'success', 'Relat\u00f3rio PDF exportado com sucesso.');
        }, 1200);
      });
    }

    complianceViewSelect.addEventListener('change', renderCompliancePage);
    complianceMonthSelect.addEventListener('change', renderCompliancePage);
    renderCompliancePage();
  }


  // ── Show active sector badge on dashboard pages ──
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav) {
    const activeSector = sessionStorage.getItem('lumemflow-sector-name');
    const existingSectorLink = sidebarNav.querySelector('[data-sector-switcher]');

    if (!existingSectorLink) {
      const sectorLink = document.createElement('a');
      sectorLink.href = 'selecao-setor.html';
      sectorLink.className = 'sidebar-link';
      sectorLink.dataset.sectorSwitcher = 'true';
      sectorLink.textContent = activeSector ? 'Trocar setor' : 'Selecionar setor';

      const loginLink = [...sidebarNav.querySelectorAll('.sidebar-link')]
        .find((link) => (link.getAttribute('href') || '').includes('index.html'));

      if (loginLink) {
        loginLink.before(sectorLink);
      } else {
        sidebarNav.appendChild(sectorLink);
      }
    }

    if (activeSector) {
      const sidebarBlock = document.querySelector('.sidebar-block');
      const existingBadge = document.querySelector('.sector-active-badge');

      if (sidebarBlock && !existingBadge) {
        const badge = document.createElement('div');
        badge.className = 'sector-active-badge';
        badge.textContent = 'Setor: ' + activeSector;
        badge.style.marginTop = '10px';
        sidebarBlock.appendChild(badge);
      }
    }
  }
});
