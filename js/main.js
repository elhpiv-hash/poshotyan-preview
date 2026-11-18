(function () {
  'use strict';

  // TODO: заменить METRIKA_ID на номер счётчика Яндекс Метрики (только цифры)
  var METRIKA_ID = 'METRIKA_ID';
  var KEY = 'cookie-consent';

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  // Метрика подключается только после «Принять». Вебвизор выключен.
  var METRIKA_OPT_OUT = 'disableYaCounter' + METRIKA_ID;
  var metrikaLoaded = false;
  var metrikaScript = null;

  // Удаляем данные, которые успела записать Метрика (только её ключи).
  function clearMetrikaData() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ym') !== 0) return;
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + location.hostname;
    });
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('_ym') === 0) localStorage.removeItem(k);
      });
    } catch (e) {}
  }

  function loadMetrika() {
    if (metrikaLoaded || !/^\d+$/.test(METRIKA_ID)) return;
    // Снимаем блокировку, оставленную предыдущим отзывом согласия.
    window[METRIKA_OPT_OUT] = false;
    if (typeof window.ym !== 'function') {
      window.ym = function () { (window.ym.a = window.ym.a || []).push(arguments); };
      window.ym.l = 1 * new Date();
    }
    metrikaLoaded = true;
    // tag.js загружается не более одного раза за жизнь страницы.
    if (!metrikaScript) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://mc.yandex.ru/metrika/tag.js';
      metrikaScript = s;
      document.head.appendChild(s);
    }
    window.ym(Number(METRIKA_ID), 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false
    });
  }

  // Отзыв согласия: официальный destruct + блокировка повторной инициализации.
  function stopMetrika() {
    if (!metrikaLoaded) return;
    metrikaLoaded = false;
    window[METRIKA_OPT_OUT] = true;
    if (typeof window.ym === 'function') window.ym(Number(METRIKA_ID), 'destruct');
    clearMetrikaData();
  }

  var banner = document.getElementById('cookie');
  var choice = getChoice();
  if (choice === 'all') loadMetrika();
  if (banner) {
    if (!choice) banner.hidden = false;
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cookie]');
      if (!btn) return;
      var v = btn.getAttribute('data-cookie');
      setChoice(v);
      banner.hidden = true;
      if (v === 'all') loadMetrika();
      else stopMetrika();
    });
  }

  // Цели по внешним ссылкам и звонкам фиксируются только после согласия на Метрику.
  document.addEventListener('click', function (e) {
    if (!metrikaLoaded || typeof window.ym !== 'function') return;
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var goal = null;
    if (href.indexOf('max.ru') !== -1) goal = 'max_click';
    else if (href.indexOf('wa.me') !== -1) goal = 'whatsapp_click';
    else if (href.indexOf('t.me') !== -1) goal = 'telegram_click';
    else if (href.indexOf('tel:') === 0) goal = 'phone_click';
    else if (href.indexOf('yandex.ru/maps') !== -1) goal = 'reviews_click';
    if (goal) window.ym(Number(METRIKA_ID), 'reachGoal', goal);
  });

  // Кнопка «Изменить выбор» на странице политики
  var reset = document.querySelector('[data-cookie-reset]');
  if (reset && banner) {
    reset.addEventListener('click', function () {
      stopMetrika();
      try { localStorage.removeItem(KEY); } catch (e) {}
      banner.hidden = false;
    });
  }

  // Раскрывающиеся ответы в разделе FAQ.
  document.documentElement.classList.add('js');
  document.querySelectorAll('.acc__head').forEach(function (head) {
    var panel = document.getElementById(head.getAttribute('aria-controls'));
    if (!panel) return;
    head.addEventListener('click', function () {
      var open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!open));
      panel.classList.toggle('is-open', !open);
    });
  });

  // Крупный просмотр грамот
  var box = document.getElementById('lightbox');
  if (box && typeof box.showModal === 'function') {
    var img = null;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a.award');
      if (!a) return;
      e.preventDefault();
      if (!img) {
        img = document.createElement('img');
        box.appendChild(img);
      }
      var thumb = a.querySelector('img');
      img.width = Number(a.getAttribute('data-w'));
      img.height = Number(a.getAttribute('data-h'));
      img.alt = thumb ? thumb.alt : '';
      img.src = a.getAttribute('href');
      box.showModal();
    });
    box.addEventListener('click', function () { box.close(); });
  }
})();
