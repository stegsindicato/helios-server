/**
 * Helios Timezone Display Utility
 * Uses built-in browser Intl API for timezone conversion.
 */

var HeliosTimezone = (function() {
  'use strict';

  var locale = document.documentElement.lang || navigator.language || 'en-US';
  var i18n = (window.HELIOS_I18N && window.HELIOS_I18N.timezone) || {};

  var config = {
    utcFormatter: new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    localFormatter: new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  };

  function getLocalTimezoneName() {
    try {
      var formatter = new Intl.DateTimeFormat(locale, { timeZoneName: 'short' });
      var parts = formatter.formatToParts(new Date());
      var tzPart = parts.find(function(part) { return part.type === 'timeZoneName'; });
      return tzPart ? tzPart.value : (i18n.localLabel || 'Local');
    } catch (e) {
      return i18n.localLabel || 'Local';
    }
  }

  function parseUTCDate(utcDateStr) {
    if (!utcDateStr || typeof utcDateStr !== 'string') return null;
    var date = new Date(utcDateStr + ' UTC');
    if (isNaN(date.getTime())) {
      date = new Date(utcDateStr);
      if (isNaN(date.getTime())) return null;
    }
    return date;
  }

  function isUTCTimezone(date) {
    return date.getTimezoneOffset() === 0;
  }

  function createTimezoneHTML(date) {
    var utcFormatted = config.utcFormatter.format(date);
    var localFormatted = config.localFormatter.format(date);
    var localTz = getLocalTimezoneName();

    if (isUTCTimezone(date)) {
      return '<strong>' + utcFormatted + ' UTC</strong>';
    }

    return '<span class="tz-utc" title="' + (i18n.utcTitle || 'Universal Coordinated Time') + '">' +
           utcFormatted + ' UTC</span>' +
           '<span class="tz-separator"> / </span>' +
           '<span class="tz-local" title="' + (i18n.localTimezoneTitle || 'Your local timezone') + '">' +
           localFormatted + ' ' + localTz + '</span>';
  }

  function convertTimestamp(element) {
    if (!element || element.classList.contains('tz-converted')) return;
    var utcDateStr = element.getAttribute('data-utc-time') || element.textContent.trim();
    var date = parseUTCDate(utcDateStr);
    if (!date) {
      console.warn('[HeliosTimezone] Could not parse datetime:', utcDateStr);
      return;
    }
    var container = document.createElement('span');
    container.className = 'tz-display';
    container.innerHTML = createTimezoneHTML(date);
    element.innerHTML = '';
    element.appendChild(container);
    element.classList.add('tz-converted');
  }

  function createHelperHTML(date) {
    var utcFormatted = config.utcFormatter.format(date);
    var localFormatted = config.localFormatter.format(date);
    var localTz = getLocalTimezoneName();
    var label = i18n.thisTimeIs || 'This time is:';

    if (isUTCTimezone(date)) {
      return '<small>' + label + ' <strong>' + utcFormatted + ' UTC</strong></small>';
    }

    return '<small>' + label + ' <strong>' + utcFormatted + ' UTC</strong> / ' +
           '<strong>' + localFormatted + ' ' + localTz + '</strong></small>';
  }

  function updateDateTimeInputHelper(input) {
    if (!input || !input.value) return;
    var date = new Date(input.value + ':00Z');
    if (isNaN(date.getTime())) return;
    var helper = input.nextElementSibling;
    if (!helper || !helper.classList.contains('tz-input-helper')) {
      helper = document.createElement('div');
      helper.className = 'tz-input-helper';
      input.parentNode.insertBefore(helper, input.nextSibling);
    }
    helper.innerHTML = createHelperHTML(date);
  }

  function initTimestampElements() {
    var elements = document.querySelectorAll('[data-utc-time]');
    Array.prototype.forEach.call(elements, convertTimestamp);
  }

  function initDateTimeInputs() {
    var datetimeInputs = document.querySelectorAll('input[type="datetime-local"]');
    Array.prototype.forEach.call(datetimeInputs, function(input) {
      input.addEventListener('change', function() { updateDateTimeInputHelper(this); });
      if (input.value) updateDateTimeInputHelper(input);
    });
  }

  function init() {
    initTimestampElements();
    initDateTimeInputs();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return {
    init: init,
    convertTimestamp: convertTimestamp,
    updateDateTimeInputHelper: updateDateTimeInputHelper,
    parseUTCDate: parseUTCDate,
    getLocalTimezoneName: getLocalTimezoneName,
    createTimezoneHTML: createTimezoneHTML,
    createHelperHTML: createHelperHTML
  };
})();
