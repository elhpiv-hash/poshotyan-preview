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
  var metrikaLoaded = false;
  function loadMetrika() {
    if (metrikaLoaded || !/^\d+$/.test(METRIKA_ID)) return;
    metrikaLoaded = true;
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = 1 * new Date();
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.appendChild(s);
    window.ym(Number(METRIKA_ID), 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false
    });
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
      try { localStorage.removeItem(KEY); } catch (e) {}
      banner.hidden = false;
    });
  }

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
