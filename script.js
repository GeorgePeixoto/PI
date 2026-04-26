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
          window.location.href = 'relatorio-esg.html';
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

  const transparencySectorGrid = document.getElementById('transparencySectorGrid');
  if (transparencySectorGrid) {
    const transparencyStatus = document.getElementById('transparencyStatus');
    const transparencyTimestamp = document.getElementById('transparencyTimestamp');
    const transparencyStore = document.getElementById('transparencyStore');
    const transparencyWindow = document.getElementById('transparencyWindow');
    const transparencyPeak = document.getElementById('transparencyPeak');
    const transparencyGreenCount = document.getElementById('transparencyGreenCount');
    const transparencyYellowCount = document.getElementById('transparencyYellowCount');
    const transparencyRedCount = document.getElementById('transparencyRedCount');
    const transparencyLiveConsumption = document.getElementById('transparencyLiveConsumption');
    const incidentFeed = document.getElementById('incidentFeed');
    const transparencyBars = document.getElementById('transparencyBars');
    const transparencyMode = document.getElementById('transparencyMode');
    const refreshTransparency = document.getElementById('refreshTransparency');

    const transparencyFrames = [
      {
        timestamp: 'Atualizado agora',
        store: 'Loja matriz | Unidade 01',
        window: 'Janela de 5 minutos',
        peak: 482,
        sectors: [
          { name: 'Refrigeração', area: 'Câmaras frias', kw: 142, threshold: 150, variance: -5.3, status: 'green', label: 'Verde', action: 'Manter portas fechadas e rotina atual.', note: 'Dentro da faixa operacional.' },
          { name: 'Iluminação', area: 'Salão principal', kw: 74, threshold: 78, variance: -2.1, status: 'green', label: 'Verde', action: 'Sem ajuste necessário no momento.', note: 'Consumo estável para o turno.' },
          { name: 'Docas', area: 'Carga e descarga', kw: 66, threshold: 60, variance: 10, status: 'yellow', label: 'Amarelo', action: 'Revisar equipamentos ligados fora da janela de carga.', note: 'Leve excesso na operação das docas.' },
          { name: 'Climatização', area: 'Área de vendas', kw: 118, threshold: 103, variance: 14.6, status: 'red', label: 'Vermelho', action: 'Checar portas abertas e temperatura de setpoint.', note: 'Sobrecarga instantânea acima do limite ideal.' },
          { name: 'Administrativo', area: 'Backoffice', kw: 38, threshold: 40, variance: -5, status: 'green', label: 'Verde', action: 'Operação aderente ao padrão.', note: 'Sem anomalias detectadas.' },
          { name: 'Padaria', area: 'Forno e expositores', kw: 44, threshold: 42, variance: 4.8, status: 'yellow', label: 'Amarelo', action: 'Conferir expositores e resistência fora de pico.', note: 'Tendência de alta moderada.' }
        ]
      },
      {
        timestamp: 'Atualizado há 6 segundos',
        store: 'Loja matriz | Unidade 01',
        window: 'Janela de 5 minutos',
        peak: 494,
        sectors: [
          { name: 'Refrigeração', area: 'Câmaras frias', kw: 145, threshold: 150, variance: -3.4, status: 'green', label: 'Verde', action: 'Manter rotina de fechamento.', note: 'Pequena oscilação esperada.' },
          { name: 'Iluminação', area: 'Salão principal', kw: 76, threshold: 78, variance: -1.2, status: 'green', label: 'Verde', action: 'Sem intervenção imediata.', note: 'Painel luminoso em nível saudável.' },
          { name: 'Docas', area: 'Carga e descarga', kw: 71, threshold: 60, variance: 18.3, status: 'red', label: 'Vermelho', action: 'Desligar esteiras ociosas e revisar compressor auxiliar.', note: 'Excesso persistente na operação das docas.' },
          { name: 'Climatização', area: 'Área de vendas', kw: 112, threshold: 103, variance: 8.7, status: 'yellow', label: 'Amarelo', action: 'Ajustar setpoint e revisar portas de acesso.', note: 'Tensão reduziu, mas ainda pede atenção.' },
          { name: 'Administrativo', area: 'Backoffice', kw: 39, threshold: 40, variance: -2.5, status: 'green', label: 'Verde', action: 'Operação dentro do padrão.', note: 'Consumo sob controle.' },
          { name: 'Padaria', area: 'Forno e expositores', kw: 47, threshold: 42, variance: 11.9, status: 'yellow', label: 'Amarelo', action: 'Reorganizar aquecimento de estufa e expositores.', note: 'Sobrecarga leve no bloco térmico.' }
        ]
      },
      {
        timestamp: 'Atualizado há 12 segundos',
        store: 'Loja matriz | Unidade 01',
        window: 'Janela de 5 minutos',
        peak: 468,
        sectors: [
          { name: 'Refrigeração', area: 'Câmaras frias', kw: 139, threshold: 150, variance: -7.4, status: 'green', label: 'Verde', action: 'Continuar monitoramento automático.', note: 'Setor dentro do comportamento esperado.' },
          { name: 'Iluminação', area: 'Salão principal', kw: 73, threshold: 78, variance: -6.4, status: 'green', label: 'Verde', action: 'Operação eficiente mantida.', note: 'Faixa ideal preservada.' },
          { name: 'Docas', area: 'Carga e descarga', kw: 63, threshold: 60, variance: 5, status: 'yellow', label: 'Amarelo', action: 'Acompanhar próxima leitura para confirmar normalização.', note: 'Desvio em queda.' },
          { name: 'Climatização', area: 'Área de vendas', kw: 99, threshold: 103, variance: -3.9, status: 'green', label: 'Verde', action: 'Ajuste aplicado com sucesso.', note: 'Retorno à faixa ideal após intervenção.' },
          { name: 'Administrativo', area: 'Backoffice', kw: 37, threshold: 40, variance: -7.5, status: 'green', label: 'Verde', action: 'Sem ação adicional.', note: 'Consumo estável.' },
          { name: 'Padaria', area: 'Forno e expositores', kw: 45, threshold: 42, variance: 7.1, status: 'yellow', label: 'Amarelo', action: 'Fechar expositores aquecidos fora de pico.', note: 'Persistência leve de desperdício.' }
        ]
      }
    ];

    let currentFrameIndex = 0;
    let transparencyIntervalId = null;

    function getTransparencyTone(status) {
      if (status === 'green') return 'is-good';
      if (status === 'yellow') return 'is-warning';
      return 'is-alert';
    }

    function renderTransparencyFrame(frame) {
      const greenCount = frame.sectors.filter((sector) => sector.status === 'green').length;
      const yellowCount = frame.sectors.filter((sector) => sector.status === 'yellow').length;
      const redCount = frame.sectors.filter((sector) => sector.status === 'red').length;
      const liveConsumption = frame.sectors.reduce((sum, sector) => sum + sector.kw, 0);
      const highestKw = Math.max(...frame.sectors.map((sector) => sector.kw));
      const criticalSectors = frame.sectors
        .filter((sector) => sector.status !== 'green')
        .sort((a, b) => b.variance - a.variance);

      transparencyTimestamp.textContent = frame.timestamp;
      transparencyStore.textContent = frame.store;
      transparencyWindow.textContent = frame.window;
      transparencyPeak.textContent = `Pico atual ${frame.peak} kW`;
      transparencyGreenCount.textContent = String(greenCount);
      transparencyYellowCount.textContent = String(yellowCount);
      transparencyRedCount.textContent = String(redCount);
      transparencyLiveConsumption.textContent = `${liveConsumption} kW`;

      transparencySectorGrid.innerHTML = frame.sectors.map((sector) => `
        <article class="sector-card sector-card-${sector.status}">
          <div class="sector-card-head">
            <div>
              <span class="sector-title">${sector.name}</span>
              <span class="sector-area">${sector.area}</span>
            </div>
            <span class="sector-state ${getTransparencyTone(sector.status)}">${sector.label}</span>
          </div>
          <div class="sector-main-metric">
            <strong>${sector.kw} kW</strong>
            <span>Limite ideal ${sector.threshold} kW</span>
          </div>
          <div class="sector-delta ${getTransparencyTone(sector.status)}">
            Desvio ${sector.variance.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
          </div>
          <p class="sector-note">${sector.note}</p>
          <div class="sector-action">
            <span class="sector-action-label">Ação recomendada</span>
            <p>${sector.action}</p>
          </div>
        </article>
      `).join('');

      incidentFeed.innerHTML = criticalSectors.length
        ? criticalSectors.map((sector) => `
            <li class="incident-item ${getTransparencyTone(sector.status)}">
              <strong>${sector.name}</strong>
              <span>${sector.area}</span>
              <p>${sector.action}</p>
            </li>
          `).join('')
        : '<li class="incident-item is-good"><strong>Sem incidentes críticos</strong><span>Todos os setores permanecem em verde.</span><p>Continue acompanhando a atualização automática.</p></li>';

      transparencyBars.innerHTML = frame.sectors.map((sector) => `
        <div class="heat-column heat-column-${sector.status}">
          <span class="heat-label">${sector.name}</span>
          <div class="heat-track">
            <div class="heat-fill" style="height:${Math.max((sector.kw / highestKw) * 100, 18)}%"></div>
          </div>
          <strong>${sector.kw} kW</strong>
        </div>
      `).join('');

      const overallType = redCount > 0 ? 'error' : (yellowCount > 0 ? 'warning' : 'success');
      const overallMessage = redCount > 0
        ? `${redCount} setor(es) em vermelho e ${yellowCount} em amarelo. Priorize correção imediata nas áreas críticas.`
        : yellowCount > 0
          ? `${yellowCount} setor(es) em amarelo. Operação monitorada com ajustes recomendados.`
          : 'Todos os setores estão em verde. O painel indica comportamento energético estável no momento.';

      setStandaloneStatus(transparencyStatus, overallType, overallMessage);
    }

    function advanceTransparencyFrame() {
      if (transparencyMode.value === 'review') return;
      currentFrameIndex = (currentFrameIndex + 1) % transparencyFrames.length;
      renderTransparencyFrame(transparencyFrames[currentFrameIndex]);
    }

    refreshTransparency.addEventListener('click', () => {
      currentFrameIndex = (currentFrameIndex + 1) % transparencyFrames.length;
      renderTransparencyFrame(transparencyFrames[currentFrameIndex]);
    });

    transparencyMode.addEventListener('change', () => {
      if (transparencyMode.value === 'review') {
        renderTransparencyFrame(transparencyFrames[currentFrameIndex]);
        setStandaloneStatus(transparencyStatus, 'warning', 'Modo revisão ativado. O painel foi congelado na última leitura exibida.');
        return;
      }

      renderTransparencyFrame(transparencyFrames[currentFrameIndex]);
    });

    renderTransparencyFrame(transparencyFrames[currentFrameIndex]);
    transparencyIntervalId = window.setInterval(advanceTransparencyFrame, 7000);
    window.addEventListener('beforeunload', () => {
      if (transparencyIntervalId) {
        window.clearInterval(transparencyIntervalId);
      }
    });
  }

  const nightProfileSelect = document.getElementById('nightProfileSelect');
  if (nightProfileSelect) {
    const nightFocusSelect = document.getElementById('nightFocusSelect');
    const nightWasteStatus = document.getElementById('nightWasteStatus');
    const nightProfileTitle = document.getElementById('nightProfileTitle');
    const nightProfileStore = document.getElementById('nightProfileStore');
    const nightBaseBand = document.getElementById('nightBaseBand');
    const nightAlertWindow = document.getElementById('nightAlertWindow');
    const wasteOffHours = document.getElementById('wasteOffHours');
    const wastePeak = document.getElementById('wastePeak');
    const wasteAlertCount = document.getElementById('wasteAlertCount');
    const wastePotential = document.getElementById('wastePotential');
    const nightGrid = document.getElementById('nightGrid');
    const nightIdealBand = document.getElementById('nightIdealBand');
    const nightLine = document.getElementById('nightLine');
    const nightMarkers = document.getElementById('nightMarkers');
    const nightAxis = document.getElementById('nightAxis');
    const nightChartNarrative = document.getElementById('nightChartNarrative');
    const nightAlertList = document.getElementById('nightAlertList');
    const nightSuspectTableBody = document.getElementById('nightSuspectTableBody');
    const nightTimeline = document.getElementById('nightTimeline');

    const wasteProfiles = {
      '2026-03-18': {
        label: 'Madrugada de 18/03/2026',
        store: 'Loja matriz | Unidade 01',
        idealBand: [35, 55],
        criticalWindow: '02h30-03h30',
        tariff: 0.94,
        points: [
          { hour: '00h', kw: 54, status: 'ok' },
          { hour: '01h', kw: 58, status: 'watch' },
          { hour: '02h', kw: 63, status: 'watch' },
          { hour: '03h', kw: 81, status: 'alert' },
          { hour: '04h', kw: 77, status: 'alert' },
          { hour: '05h', kw: 59, status: 'watch' },
          { hour: '06h', kw: 52, status: 'ok' }
        ],
        suspects: [
          { equipment: 'Expositor refrigerado 04', sector: 'refrigeracao', area: 'Refrigeração', load: 12.4, lastActivity: '23h41', probability: 'Alta', tone: 'is-alert', action: 'Revisar termostato e rotina de desligamento parcial.' },
          { equipment: 'Ar-condicionado corredor B', sector: 'climatizacao', area: 'Climatização', load: 8.6, lastActivity: '23h58', probability: 'Média', tone: 'is-warning', action: 'Checar automação de setpoint noturno.' },
          { equipment: 'Estufa auxiliar', sector: 'padaria', area: 'Padaria e apoio', load: 6.8, lastActivity: '22h53', probability: 'Média', tone: 'is-warning', action: 'Confirmar desligamento ao fim da produção.' }
        ]
      },
      '2026-03-19': {
        label: 'Madrugada de 19/03/2026',
        store: 'Loja matriz | Unidade 01',
        idealBand: [35, 55],
        criticalWindow: '01h45-03h15',
        tariff: 0.94,
        points: [
          { hour: '00h', kw: 51, status: 'ok' },
          { hour: '01h', kw: 57, status: 'watch' },
          { hour: '02h', kw: 69, status: 'alert' },
          { hour: '03h', kw: 74, status: 'alert' },
          { hour: '04h', kw: 71, status: 'alert' },
          { hour: '05h', kw: 60, status: 'watch' },
          { hour: '06h', kw: 49, status: 'ok' }
        ],
        suspects: [
          { equipment: 'Compressor doca 02', sector: 'refrigeracao', area: 'Refrigeração', load: 13.1, lastActivity: '00h12', probability: 'Alta', tone: 'is-alert', action: 'Inspecionar partida indevida e ciclo fora do padrão.' },
          { equipment: 'Ar-condicionado área de vendas', sector: 'climatizacao', area: 'Climatização', load: 10.2, lastActivity: '23h49', probability: 'Alta', tone: 'is-alert', action: 'Aplicar setpoint de madrugada e revisar portas abertas.' },
          { equipment: 'Ilha aquecida de apoio', sector: 'padaria', area: 'Padaria e apoio', load: 5.4, lastActivity: '22h34', probability: 'Média', tone: 'is-warning', action: 'Retirar da tomada após fechamento.' }
        ]
      },
      '2026-03-20': {
        label: 'Madrugada de 20/03/2026',
        store: 'Loja matriz | Unidade 01',
        idealBand: [35, 55],
        criticalWindow: '02h00-04h00',
        tariff: 0.94,
        points: [
          { hour: '00h', kw: 48, status: 'ok' },
          { hour: '01h', kw: 53, status: 'ok' },
          { hour: '02h', kw: 66, status: 'watch' },
          { hour: '03h', kw: 84, status: 'alert' },
          { hour: '04h', kw: 79, status: 'alert' },
          { hour: '05h', kw: 62, status: 'watch' },
          { hour: '06h', kw: 50, status: 'ok' }
        ],
        suspects: [
          { equipment: 'Câmara fria auxiliar', sector: 'refrigeracao', area: 'Refrigeração', load: 14.8, lastActivity: '23h55', probability: 'Alta', tone: 'is-alert', action: 'Verificar porta mal fechada e degelo fora da rotina.' },
          { equipment: 'Split salão oeste', sector: 'climatizacao', area: 'Climatização', load: 11.6, lastActivity: '00h07', probability: 'Alta', tone: 'is-alert', action: 'Desligar manualmente e corrigir automação horária.' },
          { equipment: 'Forno de apoio', sector: 'padaria', area: 'Padaria e apoio', load: 7.2, lastActivity: '22h48', probability: 'Média', tone: 'is-warning', action: 'Reforçar checklist de fechamento do turno.' }
        ]
      }
    };

    function formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    function getFilteredSuspects(profile, focus) {
      if (focus === 'all') return profile.suspects;
      return profile.suspects.filter((item) => item.sector === focus);
    }

    function buildNightChart(profile) {
      const width = 760;
      const height = 320;
      const padding = { top: 24, right: 24, bottom: 42, left: 44 };
      const values = profile.points.map((point) => point.kw);
      const maxValue = Math.max(...values, profile.idealBand[1] + 10);
      const minValue = Math.min(profile.idealBand[0] - 8, ...values);
      const usableWidth = width - padding.left - padding.right;
      const usableHeight = height - padding.top - padding.bottom;

      function x(index) {
        return padding.left + (usableWidth / (profile.points.length - 1)) * index;
      }

      function y(value) {
        return padding.top + usableHeight - ((value - minValue) / (maxValue - minValue)) * usableHeight;
      }

      const polylinePoints = profile.points.map((point, index) => `${x(index)},${y(point.kw)}`).join(' ');
      const gridLines = [0, 0.25, 0.5, 0.75, 1].map((step) => {
        const yy = padding.top + usableHeight * step;
        return `<line x1="${padding.left}" y1="${yy}" x2="${width - padding.right}" y2="${yy}" class="chart-grid-line"></line>`;
      }).join('');
      const bandY = y(profile.idealBand[1]);
      const bandHeight = y(profile.idealBand[0]) - bandY;
      const axisLabels = profile.points.map((point, index) => `
        <text x="${x(index)}" y="${height - 12}" class="chart-axis-label" text-anchor="middle">${point.hour}</text>
      `).join('');
      const markers = profile.points.map((point, index) => `
        <circle cx="${x(index)}" cy="${y(point.kw)}" r="${point.status === 'alert' ? 7 : 5}" class="chart-marker chart-marker-${point.status}"></circle>
      `).join('');

      nightGrid.innerHTML = gridLines;
      nightIdealBand.innerHTML = `<rect x="${padding.left}" y="${bandY}" width="${usableWidth}" height="${bandHeight}" class="chart-ideal-band"></rect>`;
      nightLine.setAttribute('points', polylinePoints);
      nightMarkers.innerHTML = markers;
      nightAxis.innerHTML = axisLabels;
    }

    function renderWasteProfile() {
      const profile = wasteProfiles[nightProfileSelect.value];
      const focus = nightFocusSelect.value;
      const filteredSuspects = getFilteredSuspects(profile, focus);
      const idealMax = profile.idealBand[1];
      const alerts = profile.points.filter((point) => point.kw > idealMax);
      const offHoursKwh = profile.points.reduce((sum, point) => sum + Math.max(point.kw - idealMax, 0), 0);
      const peakPoint = profile.points.reduce((peak, point) => point.kw > peak.kw ? point : peak);
      const potentialSavings = offHoursKwh * profile.tariff;
      const narrativeEquipment = filteredSuspects.length ? filteredSuspects[0].equipment : 'nenhum equipamento neste filtro';
      const timelineItems = profile.points.map((point) => {
        const tone = point.status === 'alert' ? 'is-alert' : point.status === 'watch' ? 'is-warning' : 'is-good';
        const label = point.status === 'alert' ? 'Pico fora do horário' : point.status === 'watch' ? 'Acima da faixa ideal' : 'Faixa controlada';
        return `
          <div class="time-pulse-item ${tone}">
            <strong>${point.hour}</strong>
            <span>${point.kw} kW</span>
            <p>${label}</p>
          </div>
        `;
      }).join('');

      nightProfileTitle.textContent = profile.label;
      nightProfileStore.textContent = profile.store;
      nightBaseBand.textContent = `Faixa ideal ${profile.idealBand[0]}-${profile.idealBand[1]} kW`;
      nightAlertWindow.textContent = `Janela crítica ${profile.criticalWindow}`;
      wasteOffHours.textContent = `${offHoursKwh.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh`;
      wastePeak.textContent = `${peakPoint.kw} kW`;
      wasteAlertCount.textContent = String(alerts.length);
      wastePotential.textContent = formatCurrency(potentialSavings);

      nightChartNarrative.textContent = `${alerts.length} ponto(s) acima da faixa ideal. O principal suspeito no filtro atual é ${narrativeEquipment}.`;

      nightAlertList.innerHTML = alerts.length
        ? alerts.map((point) => `
            <li class="waste-alert-item ${point.status === 'alert' ? 'is-alert' : 'is-warning'}">
              <strong>${point.hour}</strong>
              <span>${point.kw} kW registrados na madrugada</span>
              <p>Ultrapassou o limite ideal de ${idealMax} kW e pede verificação operacional.</p>
            </li>
          `).join('')
        : '<li class="waste-alert-item is-good"><strong>Noite controlada</strong><span>Sem leituras acima da faixa ideal.</span><p>O comportamento da madrugada permaneceu dentro do esperado.</p></li>';

      nightSuspectTableBody.innerHTML = filteredSuspects.length
        ? filteredSuspects.map((suspect) => `
            <tr>
              <td>${suspect.equipment}</td>
              <td>${suspect.area}</td>
              <td>${suspect.load.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kW</td>
              <td>${suspect.lastActivity}</td>
              <td><span class="table-status ${suspect.tone}">${suspect.probability}</span></td>
              <td>${suspect.action}</td>
            </tr>
          `).join('')
        : '<tr><td colspan="6">Nenhum equipamento corresponde ao filtro atual.</td></tr>';

      nightTimeline.innerHTML = timelineItems;
      buildNightChart(profile);

      if (alerts.length >= 2) {
        setStandaloneStatus(nightWasteStatus, 'error', `Foram detectados ${alerts.length} picos fora do horário. Investigue climatização e refrigeração ainda nesta manhã.`);
      } else if (alerts.length === 1) {
        setStandaloneStatus(nightWasteStatus, 'warning', 'Foi detectado 1 pico fora do horário. Revise o equipamento mais provável e reforce o checklist de fechamento.');
      } else {
        setStandaloneStatus(nightWasteStatus, 'success', 'A madrugada permaneceu dentro da faixa ideal. Nenhum desperdício relevante foi identificado.');
      }
    }

    nightProfileSelect.addEventListener('change', renderWasteProfile);
    nightFocusSelect.addEventListener('change', renderWasteProfile);
    renderWasteProfile();
  }

  const campaignSelect = document.getElementById('campaignSelect');
  if (campaignSelect) {
    const campaignSectorFilter = document.getElementById('campaignSectorFilter');
    const campaignStatus = document.getElementById('campaignStatus');
    const campaignTitle = document.getElementById('campaignTitle');
    const campaignDate = document.getElementById('campaignDate');
    const campaignTarget = document.getElementById('campaignTarget');
    const campaignReach = document.getElementById('campaignReach');
    const campaignBefore = document.getElementById('campaignBefore');
    const campaignAfter = document.getElementById('campaignAfter');
    const campaignDelta = document.getElementById('campaignDelta');
    const campaignEngagement = document.getElementById('campaignEngagement');
    const campaignCompareBars = document.getElementById('campaignCompareBars');
    const campaignMilestones = document.getElementById('campaignMilestones');
    const campaignSectorTableBody = document.getElementById('campaignSectorTableBody');
    const campaignInsights = document.getElementById('campaignInsights');

    const campaignData = {
      'cold-door': {
        title: 'Feche a porta fria',
        date: 'Aplicada em 12/03/2026',
        target: 'Foco: refrigeração',
        reach: 'Alcance: 126 colaboradores',
        before: 48200,
        after: 44150,
        engagement: 84,
        milestones: [
          { date: '10/03', text: 'Briefing com líderes de loja e manutenção.' },
          { date: '12/03', text: 'Campanha lançada com cartazes e reforço no turno.' },
          { date: '19/03', text: 'Primeira leitura mostrou queda nas aberturas fora de rotina.' }
        ],
        sectors: [
          { name: 'Refrigeração', key: 'refrigeracao', before: 22400, after: 19180, delta: -14.4, reading: 'Queda forte nas portas frias.', next: 'Padronizar checklist no fechamento.', tone: 'is-good' },
          { name: 'Climatização', key: 'climatizacao', before: 11820, after: 11510, delta: -2.6, reading: 'Impacto indireto moderado.', next: 'Manter monitoramento cruzado.', tone: 'is-warning' },
          { name: 'Operação de loja', key: 'operacao', before: 13980, after: 13460, delta: -3.7, reading: 'Equipe aderiu parcialmente.', next: 'Reforçar turnos de reposição.', tone: 'is-warning' }
        ],
        insights: [
          'A maior resposta veio da refrigeração, onde a campanha atacou o hábito mais frequente de desperdício.',
          'Climatização e operação de loja melhoraram menos, então o tema ainda precisa de reforço visual e supervisão.',
          'A campanha já tem resultado suficiente para virar rotina permanente de fechamento.'
        ]
      },
      'night-shutdown': {
        title: 'Desligue ao sair',
        date: 'Aplicada em 03/03/2026',
        target: 'Foco: operação de loja',
        reach: 'Alcance: 98 colaboradores',
        before: 31700,
        after: 27840,
        engagement: 79,
        milestones: [
          { date: '01/03', text: 'Mapeamento de equipamentos esquecidos ao fim do turno.' },
          { date: '03/03', text: 'Campanha iniciada com checklist físico por setor.' },
          { date: '11/03', text: 'Queda nas cargas noturnas em padaria e apoio.' }
        ],
        sectors: [
          { name: 'Refrigeração', key: 'refrigeracao', before: 11800, after: 11340, delta: -3.9, reading: 'Setor menos sensível à campanha.', next: 'Manter foco em automação.', tone: 'is-warning' },
          { name: 'Climatização', key: 'climatizacao', before: 9200, after: 7850, delta: -14.7, reading: 'Bom efeito no desligamento do salão.', next: 'Replicar no turno da noite.', tone: 'is-good' },
          { name: 'Operação de loja', key: 'operacao', before: 10700, after: 8650, delta: -19.2, reading: 'Melhor ganho comportamental do ciclo.', next: 'Transformar checklist em padrão diário.', tone: 'is-good' }
        ],
        insights: [
          'A campanha teve impacto alto em equipamentos de apoio e no desligamento do ar-condicionado.',
          'Refrigeração quase não mudou, mostrando que o ganho ali depende mais de processo técnico do que de comportamento.',
          'O checklist de saída foi o principal vetor de adesão desta campanha.'
        ]
      },
      'ac-setpoint': {
        title: 'Temperatura consciente',
        date: 'Aplicada em 21/02/2026',
        target: 'Foco: climatização',
        reach: 'Alcance: 114 colaboradores',
        before: 27400,
        after: 24960,
        engagement: 88,
        milestones: [
          { date: '19/02', text: 'Treinamento rápido sobre setpoint ideal e portas abertas.' },
          { date: '21/02', text: 'Campanha ativada com QR code e reforço em murais.' },
          { date: '28/02', text: 'Setor de vendas apresentou queda consistente no consumo.' }
        ],
        sectors: [
          { name: 'Refrigeração', key: 'refrigeracao', before: 7900, after: 7720, delta: -2.3, reading: 'Pouca influência direta.', next: 'Seguir com campanha específica da cadeia fria.', tone: 'is-warning' },
          { name: 'Climatização', key: 'climatizacao', before: 12600, after: 10320, delta: -18.1, reading: 'Setor respondeu muito bem ao ajuste de setpoint.', next: 'Consolidar regra na automação.', tone: 'is-good' },
          { name: 'Operação de loja', key: 'operacao', before: 6900, after: 6920, delta: 0.3, reading: 'Sem efeito relevante fora do setor-alvo.', next: 'Não priorizar esta frente para operação.', tone: 'is-alert' }
        ],
        insights: [
          'A campanha gerou efeito claro na climatização, com ganho sustentado no salão de vendas.',
          'Os demais setores quase não se moveram, o que confirma o foco correto da iniciativa.',
          'Vale incorporar a campanha ao onboarding de líderes de piso.'
        ]
      }
    };

    function renderCampaign() {
      const campaign = campaignData[campaignSelect.value];
      const filter = campaignSectorFilter.value;
      const sectors = filter === 'all' ? campaign.sectors : campaign.sectors.filter((sector) => sector.key === filter);
      const overallDelta = ((campaign.after - campaign.before) / campaign.before) * 100;
      const highestValue = Math.max(...campaign.sectors.flatMap((sector) => [sector.before, sector.after]));

      campaignTitle.textContent = campaign.title;
      campaignDate.textContent = campaign.date;
      campaignTarget.textContent = campaign.target;
      campaignReach.textContent = campaign.reach;
      campaignBefore.textContent = `${new Intl.NumberFormat('pt-BR').format(campaign.before)} kWh`;
      campaignAfter.textContent = `${new Intl.NumberFormat('pt-BR').format(campaign.after)} kWh`;
      campaignDelta.textContent = `${overallDelta.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
      campaignEngagement.textContent = `${campaign.engagement}%`;

      campaignCompareBars.innerHTML = sectors.map((sector) => `
        <article class="compare-bar-card">
          <div class="compare-bar-head">
            <strong>${sector.name}</strong>
            <span class="${sector.tone}">${sector.delta.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
          </div>
          <div class="compare-bar-stack">
            <div class="compare-bar-row">
              <span>Antes</span>
              <div class="compare-bar-track"><div class="compare-bar-fill before-fill" style="width:${(sector.before / highestValue) * 100}%"></div></div>
              <strong>${new Intl.NumberFormat('pt-BR').format(sector.before)} kWh</strong>
            </div>
            <div class="compare-bar-row">
              <span>Depois</span>
              <div class="compare-bar-track"><div class="compare-bar-fill after-fill" style="width:${(sector.after / highestValue) * 100}%"></div></div>
              <strong>${new Intl.NumberFormat('pt-BR').format(sector.after)} kWh</strong>
            </div>
          </div>
        </article>
      `).join('');

      campaignMilestones.innerHTML = campaign.milestones.map((item) => `
        <div class="milestone-item">
          <strong>${item.date}</strong>
          <p>${item.text}</p>
        </div>
      `).join('');

      campaignSectorTableBody.innerHTML = sectors.length
        ? sectors.map((sector) => `
            <tr>
              <td>${sector.name}</td>
              <td>${new Intl.NumberFormat('pt-BR').format(sector.before)} kWh</td>
              <td>${new Intl.NumberFormat('pt-BR').format(sector.after)} kWh</td>
              <td class="${sector.tone}">${sector.delta.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</td>
              <td><span class="table-status ${sector.tone}">${sector.reading}</span></td>
              <td>${sector.next}</td>
            </tr>
          `).join('')
        : '<tr><td colspan="6">Nenhum setor corresponde ao filtro selecionado.</td></tr>';

      campaignInsights.innerHTML = campaign.insights.map((item) => `<li>${item}</li>`).join('');

      if (overallDelta < -10) {
        setStandaloneStatus(campaignStatus, 'success', `A campanha "${campaign.title}" reduziu o consumo em ${Math.abs(overallDelta).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% no recorte consolidado.`);
      } else if (overallDelta < 0) {
        setStandaloneStatus(campaignStatus, 'warning', `A campanha "${campaign.title}" gerou melhora, mas o ganho ainda é moderado. Vale reforçar comunicação e rotina.`);
      } else {
        setStandaloneStatus(campaignStatus, 'error', `A campanha "${campaign.title}" ainda não mostrou ganho consolidado. Revise mensagem, timing e aderência operacional.`);
      }
    }

    campaignSelect.addEventListener('change', renderCampaign);
    campaignSectorFilter.addEventListener('change', renderCampaign);
    renderCampaign();
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

    const forecastData = {
      '2026-01': {
        monthLabel: 'Janeiro de 2026',
        updatedAt: 'Atualizado às 16h10',
        tariffs: {
          green: {
            label: 'Horo-sazonal verde',
            budget: 128000,
            accumulatedKwh: 176400,
            projectedBill: 124820,
            components: [
              { name: 'Ponta contratada', kwh: 23800, tariff: 1.12, cost: 26656, share: 21.4, reading: 'Faixa cara sob controle.', tone: 'is-good' },
              { name: 'Fora de ponta', kwh: 141200, tariff: 0.58, cost: 81896, share: 65.6, reading: 'Maior peso financeiro do ciclo.', tone: 'is-warning' },
              { name: 'Encargos e bandeira', kwh: 11400, tariff: 1.43, cost: 16268, share: 13.0, reading: 'Bandeira moderada no mês.', tone: 'is-warning' }
            ],
            insights: [
              'A conta tende a fechar abaixo do orçamento, mas a faixa fora de ponta continua concentrando a maior parte do gasto.',
              'Ainda existe espaço para reduzir encargos se a demanda de ponta continuar estável.',
              'O comportamento atual dá margem para proteger o orçamento sem ação emergencial.'
            ]
          },
          blue: {
            label: 'Horo-sazonal azul',
            budget: 128000,
            accumulatedKwh: 176400,
            projectedBill: 131940,
            components: [
              { name: 'Demanda ponta', kwh: 22100, tariff: 1.36, cost: 30056, share: 22.8, reading: 'Mais sensível no modelo azul.', tone: 'is-warning' },
              { name: 'Demanda fora de ponta', kwh: 139900, tariff: 0.61, cost: 85339, share: 64.7, reading: 'Componente dominante da fatura.', tone: 'is-warning' },
              { name: 'Encargos e bandeira', kwh: 14400, tariff: 1.15, cost: 16545, share: 12.5, reading: 'Encargo levemente pressionado.', tone: 'is-warning' }
            ],
            insights: [
              'No modelo azul, a ponta pesa mais e aproxima a conta do teto orçamentário.',
              'Vale monitorar picos de demanda antes de consolidar esse perfil tarifário.',
              'A margem financeira fica mais curta do que no modelo verde.'
            ]
          },
          flat: {
            label: 'Convencional',
            budget: 128000,
            accumulatedKwh: 176400,
            projectedBill: 129380,
            components: [
              { name: 'Energia ativa', kwh: 165200, tariff: 0.67, cost: 110684, share: 85.6, reading: 'Modelo simplificado com custo estável.', tone: 'is-warning' },
              { name: 'Encargos', kwh: 8400, tariff: 1.31, cost: 11004, share: 8.5, reading: 'Encargo linear no período.', tone: 'is-good' },
              { name: 'Tributos e adicionais', kwh: 2800, tariff: 2.74, cost: 7692, share: 5.9, reading: 'Peso residual do fechamento.', tone: 'is-good' }
            ],
            insights: [
              'A tarifa convencional simplifica a leitura, mas não maximiza economia nos horários mais eficientes.',
              'Mesmo com previsibilidade, a conta ainda ficaria levemente acima do orçamento.',
              'O modelo verde continua mais vantajoso neste ciclo.'
            ]
          }
        }
      },
      '2026-02': {
        monthLabel: 'Fevereiro de 2026',
        updatedAt: 'Atualizado às 15h45',
        tariffs: {
          green: {
            label: 'Horo-sazonal verde',
            budget: 126000,
            accumulatedKwh: 168300,
            projectedBill: 119620,
            components: [
              { name: 'Ponta contratada', kwh: 21400, tariff: 1.09, cost: 23326, share: 19.5, reading: 'Ponta melhor distribuída.', tone: 'is-good' },
              { name: 'Fora de ponta', kwh: 135700, tariff: 0.56, cost: 75992, share: 63.5, reading: 'Peso principal do mês.', tone: 'is-warning' },
              { name: 'Encargos e bandeira', kwh: 14100, tariff: 1.44, cost: 20302, share: 17.0, reading: 'Encargos pressionam parte do ganho.', tone: 'is-warning' }
            ],
            insights: [
              'Fevereiro projeta folga confortável frente ao orçamento.',
              'A redução no horário de ponta ajudou a preservar margem financeira.',
              'Encargos seguem como principal risco para o fechamento.'
            ]
          },
          blue: {
            label: 'Horo-sazonal azul',
            budget: 126000,
            accumulatedKwh: 168300,
            projectedBill: 127880,
            components: [
              { name: 'Demanda ponta', kwh: 20800, tariff: 1.32, cost: 27456, share: 21.5, reading: 'Faixa pressionada na modalidade azul.', tone: 'is-warning' },
              { name: 'Demanda fora de ponta', kwh: 132500, tariff: 0.60, cost: 79500, share: 62.2, reading: 'Componente majoritário.', tone: 'is-warning' },
              { name: 'Encargos e bandeira', kwh: 13600, tariff: 1.54, cost: 20944, share: 16.3, reading: 'Encargos ainda relevantes.', tone: 'is-warning' }
            ],
            insights: [
              'No azul, fevereiro quase encosta no orçamento e reduz a margem de manobra.',
              'A modalidade verde ainda se mostra financeiramente superior para este perfil.',
              'Se houver novos picos, a conta pode ultrapassar o limite orçado.'
            ]
          },
          flat: {
            label: 'Convencional',
            budget: 126000,
            accumulatedKwh: 168300,
            projectedBill: 123410,
            components: [
              { name: 'Energia ativa', kwh: 157800, tariff: 0.66, cost: 104148, share: 84.4, reading: 'Leitura simples e estável.', tone: 'is-warning' },
              { name: 'Encargos', kwh: 7300, tariff: 1.34, cost: 9782, share: 7.9, reading: 'Encargo controlado.', tone: 'is-good' },
              { name: 'Tributos e adicionais', kwh: 3200, tariff: 2.96, cost: 9472, share: 7.7, reading: 'Peso secundário no fechamento.', tone: 'is-good' }
            ],
            insights: [
              'A modalidade convencional mantém a fatura abaixo do orçamento, mas sem capturar todo o benefício da curva horária.',
              'O risco financeiro é baixo, porém a oportunidade de economia é menor.',
              'Vale comparar o convencional apenas como referência de estabilidade.'
            ]
          }
        }
      },
      '2026-03': {
        monthLabel: 'Março de 2026',
        updatedAt: 'Atualizado às 14h20',
        tariffs: {
          green: {
            label: 'Horo-sazonal verde',
            budget: 132000,
            accumulatedKwh: 182700,
            projectedBill: 136480,
            components: [
              { name: 'Ponta contratada', kwh: 24600, tariff: 1.15, cost: 28290, share: 20.7, reading: 'Ponta controlada, mas já acima da média.', tone: 'is-warning' },
              { name: 'Fora de ponta', kwh: 146900, tariff: 0.61, cost: 89609, share: 65.7, reading: 'Principal alavanca da previsão de alta.', tone: 'is-alert' },
              { name: 'Encargos e bandeira', kwh: 11200, tariff: 1.66, cost: 18581, share: 13.6, reading: 'Encargos seguram parte do orçamento.', tone: 'is-warning' }
            ],
            insights: [
              'A previsão já excede o orçamento em março e pede correção ainda nesta semana.',
              'O custo fora de ponta continua sendo o principal motor da conta.',
              'A redução de cargas não críticas no restante do mês pode devolver parte da margem financeira.'
            ]
          },
          blue: {
            label: 'Horo-sazonal azul',
            budget: 132000,
            accumulatedKwh: 182700,
            projectedBill: 142930,
            components: [
              { name: 'Demanda ponta', kwh: 23800, tariff: 1.39, cost: 33082, share: 23.1, reading: 'Ponta pressionada no cenário azul.', tone: 'is-alert' },
              { name: 'Demanda fora de ponta', kwh: 144400, tariff: 0.63, cost: 90972, share: 63.6, reading: 'Componente dominante.', tone: 'is-alert' },
              { name: 'Encargos e bandeira', kwh: 13100, tariff: 1.44, cost: 18876, share: 13.3, reading: 'Encargos seguem elevados.', tone: 'is-warning' }
            ],
            insights: [
              'A modalidade azul agrava o desvio financeiro do mês.',
              'O peso da ponta faz a conta estourar o orçamento com pouca folga para correção.',
              'Não parece a melhor configuração para o perfil de consumo atual.'
            ]
          },
          flat: {
            label: 'Convencional',
            budget: 132000,
            accumulatedKwh: 182700,
            projectedBill: 138540,
            components: [
              { name: 'Energia ativa', kwh: 171500, tariff: 0.69, cost: 118335, share: 85.4, reading: 'Energia ativa domina o fechamento.', tone: 'is-alert' },
              { name: 'Encargos', kwh: 6900, tariff: 1.41, cost: 9729, share: 7.0, reading: 'Encargos em linha.', tone: 'is-good' },
              { name: 'Tributos e adicionais', kwh: 4300, tariff: 2.44, cost: 10476, share: 7.6, reading: 'Adicionais moderados.', tone: 'is-good' }
            ],
            insights: [
              'A tarifa convencional também ultrapassa o orçamento em março.',
              'Apesar da simplicidade, ela não resolve a pressão financeira do ciclo.',
              'O corte de consumo continua sendo a principal alavanca.'
            ]
          }
        }
      }
    };

    function formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    function renderForecast() {
      const month = forecastData[forecastMonthSelect.value];
      const tariff = month.tariffs[forecastTariffSelect.value];
      const budgetDelta = tariff.projectedBill - tariff.budget;
      const commitment = (tariff.projectedBill / tariff.budget) * 100;

      forecastCycleTitle.textContent = month.monthLabel;
      forecastCycleSubtitle.textContent = tariff.label;
      forecastBudgetLabel.textContent = `Orçamento ${formatCurrency(tariff.budget)}`;
      forecastUpdatedAt.textContent = month.updatedAt;
      forecastAccumulatedKwh.textContent = `${new Intl.NumberFormat('pt-BR').format(tariff.accumulatedKwh)} kWh`;
      forecastProjectedBill.textContent = formatCurrency(tariff.projectedBill);
      forecastBudgetDelta.textContent = `${budgetDelta >= 0 ? '+' : '-'}${formatCurrency(Math.abs(budgetDelta))}`;
      forecastCommitment.textContent = `${commitment.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
      forecastGaugeFill.style.width = `${Math.min(commitment, 140)}%`;
      forecastGaugeLimit.style.left = '100%';
      forecastNarrative.textContent = `A projeção com tarifa ${tariff.label.toLowerCase()} indica fechamento em ${formatCurrency(tariff.projectedBill)} para ${month.monthLabel}.`;

      tariffStack.innerHTML = tariff.components.map((component) => `
        <div class="tariff-item">
          <div class="tariff-item-head">
            <strong>${component.name}</strong>
            <span>${component.share.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</span>
          </div>
          <p>${component.reading}</p>
          <strong class="tariff-item-cost">${formatCurrency(component.cost)}</strong>
        </div>
      `).join('');

      forecastComponentTableBody.innerHTML = tariff.components.map((component) => `
        <tr>
          <td>${component.name}</td>
          <td>${new Intl.NumberFormat('pt-BR').format(component.kwh)} kWh</td>
          <td>${formatCurrency(component.tariff)}</td>
          <td>${formatCurrency(component.cost)}</td>
          <td>${component.share.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</td>
          <td><span class="table-status ${component.tone}">${component.reading}</span></td>
        </tr>
      `).join('');

      forecastInsights.innerHTML = tariff.insights.map((item) => `<li>${item}</li>`).join('');

      if (budgetDelta > 0) {
        setStandaloneStatus(forecastStatus, 'error', `A previsão excede o orçamento em ${formatCurrency(budgetDelta)}. O momento pede ajuste de carga e revisão do plano financeiro.`);
      } else if (budgetDelta > -5000) {
        setStandaloneStatus(forecastStatus, 'warning', 'A previsão ainda cabe no orçamento, mas com margem curta. Vale acompanhar diariamente.');
      } else {
        setStandaloneStatus(forecastStatus, 'success', 'A previsão está abaixo do orçamento com margem confortável no cenário atual.');
      }
    }

    forecastMonthSelect.addEventListener('change', renderForecast);
    forecastTariffSelect.addEventListener('change', renderForecast);
    renderForecast();
  }

  const costPeriodSelect = document.getElementById('costPeriodSelect');
  if (costPeriodSelect) {
    const costViewSelect = document.getElementById('costViewSelect');
    const costStatus = document.getElementById('costStatus');
    const costCycleTitle = document.getElementById('costCycleTitle');
    const costCycleSubtitle = document.getElementById('costCycleSubtitle');
    const costTopLabel = document.getElementById('costTopLabel');
    const costTotalLabel = document.getElementById('costTotalLabel');
    const costTopEntity = document.getElementById('costTopEntity');
    const costTopShare = document.getElementById('costTopShare');
    const costAboveAverage = document.getElementById('costAboveAverage');
    const costAverageValue = document.getElementById('costAverageValue');
    const costLeaderboard = document.getElementById('costLeaderboard');
    const costInsights = document.getElementById('costInsights');
    const costTableBody = document.getElementById('costTableBody');
    const costBars = document.getElementById('costBars');

    const costData = {
      '2026-01': {
        sector: [
          { name: 'Refrigeração', category: 'Setor', cost: 46200, share: 34.8, variation: 3.2, reading: 'Maior centro de custo do mês.', tone: 'is-alert' },
          { name: 'Climatização', category: 'Setor', cost: 33400, share: 25.2, variation: 1.4, reading: 'Custo alto, mas estável.', tone: 'is-warning' },
          { name: 'Operação de loja', category: 'Setor', cost: 28100, share: 21.2, variation: -2.1, reading: 'Queda leve frente ao mês anterior.', tone: 'is-good' },
          { name: 'Padaria e apoio', category: 'Setor', cost: 25100, share: 18.8, variation: 4.6, reading: 'Subiu e pede revisão de apoio térmico.', tone: 'is-warning' }
        ],
        equipment: [
          { name: 'Câmara fria 01', category: 'Refrigeração', cost: 21400, share: 16.1, variation: 2.8, reading: 'Equipamento líder de custo.', tone: 'is-alert' },
          { name: 'Chiller salão', category: 'Climatização', cost: 18600, share: 14.0, variation: 1.2, reading: 'Peso financeiro contínuo.', tone: 'is-warning' },
          { name: 'Expositores aquecidos', category: 'Padaria e apoio', cost: 15100, share: 11.4, variation: 5.1, reading: 'Alta recente de custo.', tone: 'is-warning' },
          { name: 'Iluminação corredor A', category: 'Operação de loja', cost: 12800, share: 9.6, variation: -3.0, reading: 'Redução após ajustes.', tone: 'is-good' }
        ]
      },
      '2026-02': {
        sector: [
          { name: 'Refrigeração', category: 'Setor', cost: 43800, share: 33.1, variation: -5.2, reading: 'Continua líder, mas caiu.', tone: 'is-warning' },
          { name: 'Climatização', category: 'Setor', cost: 31900, share: 24.1, variation: -4.5, reading: 'Melhora após campanhas.', tone: 'is-good' },
          { name: 'Operação de loja', category: 'Setor', cost: 29700, share: 22.4, variation: 5.7, reading: 'Subiu com maior ocupação.', tone: 'is-warning' },
          { name: 'Padaria e apoio', category: 'Setor', cost: 27000, share: 20.4, variation: 7.6, reading: 'Pressão de custo segue alta.', tone: 'is-alert' }
        ],
        equipment: [
          { name: 'Câmara fria 01', category: 'Refrigeração', cost: 20100, share: 15.2, variation: -6.1, reading: 'Melhorou, mas ainda lidera.', tone: 'is-warning' },
          { name: 'Forno apoio', category: 'Padaria e apoio', cost: 17200, share: 13.0, variation: 8.9, reading: 'Equipamento mais pressionado.', tone: 'is-alert' },
          { name: 'Chiller salão', category: 'Climatização', cost: 16500, share: 12.5, variation: -4.3, reading: 'Boa resposta a ajustes.', tone: 'is-good' },
          { name: 'Ilha congelados', category: 'Refrigeração', cost: 14100, share: 10.6, variation: 2.2, reading: 'Peso financeiro persistente.', tone: 'is-warning' }
        ]
      },
      '2026-03': {
        sector: [
          { name: 'Refrigeração', category: 'Setor', cost: 48900, share: 35.7, variation: 4.9, reading: 'Principal alvo para corte no mês.', tone: 'is-alert' },
          { name: 'Climatização', category: 'Setor', cost: 35200, share: 25.7, variation: 3.8, reading: 'Custo relevante e crescente.', tone: 'is-warning' },
          { name: 'Operação de loja', category: 'Setor', cost: 30100, share: 22.0, variation: 1.3, reading: 'Peso mediano com pouca folga.', tone: 'is-warning' },
          { name: 'Padaria e apoio', category: 'Setor', cost: 22800, share: 16.6, variation: -3.7, reading: 'Redução recente melhorou a posição.', tone: 'is-good' }
        ],
        equipment: [
          { name: 'Câmara fria 01', category: 'Refrigeração', cost: 22600, share: 16.5, variation: 6.3, reading: 'Maior custo unitário do ciclo.', tone: 'is-alert' },
          { name: 'Chiller salão', category: 'Climatização', cost: 19400, share: 14.2, variation: 5.1, reading: 'Pressão alta no conforto térmico.', tone: 'is-warning' },
          { name: 'Expositor congelados', category: 'Refrigeração', cost: 16800, share: 12.3, variation: 3.4, reading: 'Custo ainda crescente.', tone: 'is-warning' },
          { name: 'Forno apoio', category: 'Padaria e apoio', cost: 12100, share: 8.8, variation: -4.2, reading: 'Melhorou após controle de uso.', tone: 'is-good' }
        ]
      }
    };

    function renderCostRanking() {
      const period = costData[costPeriodSelect.value];
      const view = costViewSelect.value;
      const items = [...period[view]].sort((a, b) => b.cost - a.cost);
      const total = items.reduce((sum, item) => sum + item.cost, 0);
      const average = total / items.length;
      const top = items[0];
      const aboveAverage = items.filter((item) => item.cost > average).length;
      const highestCost = Math.max(...items.map((item) => item.cost));

      costCycleTitle.textContent = ({
        '2026-01': 'Janeiro de 2026',
        '2026-02': 'Fevereiro de 2026',
        '2026-03': 'Março de 2026'
      })[costPeriodSelect.value];
      costCycleSubtitle.textContent = view === 'sector' ? 'Custos consolidados por setor' : 'Custos consolidados por equipamento';
      costTopLabel.textContent = `Maior custo: ${top.name}`;
      costTotalLabel.textContent = `Total monitorado ${formatCurrency(total)}`;
      costTopEntity.textContent = top.name;
      costTopShare.textContent = `${top.share.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
      costAboveAverage.textContent = String(aboveAverage);
      costAverageValue.textContent = formatCurrency(average);

      costLeaderboard.innerHTML = items.map((item, index) => `
        <div class="leaderboard-row">
          <div class="leaderboard-rank">${index + 1}</div>
          <div class="leaderboard-main">
            <strong>${item.name}</strong>
            <span>${item.category}</span>
          </div>
          <div class="leaderboard-score">
            <strong>${formatCurrency(item.cost)}</strong>
            <span>${item.share.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% do total</span>
          </div>
        </div>
      `).join('');

      costTableBody.innerHTML = items.map((item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>${formatCurrency(item.cost)}</td>
          <td>${item.share.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</td>
          <td class="${item.variation > 0 ? 'is-alert' : 'is-good'}">${item.variation > 0 ? '+' : ''}${item.variation.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</td>
          <td><span class="table-status ${item.tone}">${item.reading}</span></td>
        </tr>
      `).join('');

      costBars.innerHTML = items.map((item) => `
        <article class="compare-bar-card">
          <div class="compare-bar-head">
            <strong>${item.name}</strong>
            <span>${formatCurrency(item.cost)}</span>
          </div>
          <div class="compare-bar-row">
            <span>Impacto</span>
            <div class="compare-bar-track"><div class="compare-bar-fill after-fill" style="width:${(item.cost / highestCost) * 100}%"></div></div>
            <strong>${item.share.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</strong>
          </div>
        </article>
      `).join('');

      costInsights.innerHTML = [
        `${top.name} é o primeiro alvo para corte porque lidera o ranking e concentra a maior fatia do gasto.`,
        aboveAverage > 1
          ? `${aboveAverage} itens já estão acima da média de custo e merecem revisão imediata.`
          : 'A maior parte dos itens está próxima da média, com um líder isolado de custo.',
        view === 'sector'
          ? 'Use o ranking setorial para decidir onde concentrar plano de redução no próximo mês.'
          : 'Use o ranking por equipamento para orientar manutenção, automação e desligamento seletivo.'
      ].map((item) => `<li>${item}</li>`).join('');

      if (top.share > 35) {
        setStandaloneStatus(costStatus, 'error', `${top.name} concentra uma parcela muito alta do custo total. O corte deve começar por esse item.`);
      } else if (aboveAverage >= 2) {
        setStandaloneStatus(costStatus, 'warning', 'Há mais de um item acima da média. Vale priorizar uma frente de redução em lote.');
      } else {
        setStandaloneStatus(costStatus, 'success', 'O custo está relativamente distribuído, com poucos itens puxando o total.');
      }
    }

    costPeriodSelect.addEventListener('change', renderCostRanking);
    costViewSelect.addEventListener('change', renderCostRanking);
    renderCostRanking();
  }
});
