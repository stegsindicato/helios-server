/**
 * Internationalized strings for the Helios single-ballot verifier.
 *
 * The Django JavaScript catalog is loaded from /jsi18n/ before this file.
 * Keep all user-visible verifier strings here so `makemessages -d djangojs`
 * can extract them into locale/<lang>/LC_MESSAGES/djangojs.po.
 */
(function(global) {
  'use strict';

  var djangoI18n = global.django || {};
  var gettext = djangoI18n.gettext || function(message) { return message; };
  var interpolate = djangoI18n.interpolate || function(format, values) {
    return format.replace(/%\(([^)]+)\)s/g, function(match, key) {
      return values[key];
    }).replace(/%%/g, '%');
  };

  function format(message, values) {
    return interpolate(message, values, true);
  }

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  var messages = {
    title: gettext('Helios Single-Ballot Verifier'),
    loadingVerifier: gettext('Loading verifier...'),
    javaMissing: gettext('Your browser does not have the Java plugin installed.'),
    javaRequired: gettext('At this time, the Java plugin is required for browser-based ballot auditing, although it is not required for ballot preparation.'),
    verifierDescription: gettext('This single-ballot verifier lets you enter an audited ballot and verify that it was prepared correctly.'),
    electionUrlLabel: gettext('Enter the Election URL:'),
    ballotLabel: gettext('Your Ballot:'),
    verify: gettext('Verify'),

    loadingElection: gettext('Loading election...'),
    castBallotWarning: gettext("It looks like you are trying to verify a cast ballot. That can't be done; only audited ballots can be verified."),
    successfulVerification: gettext('Verification successful. Done.'),
    failedVerification: gettext('Problem: this ballot does not verify.'),
    electionLoadProblem: gettext('Problem loading the election. Are you sure you have the right election URL?'),

    electionFingerprint: gettext('Election fingerprint is %(hash)s'),
    ballotTracker: gettext('Ballot tracker is %(tracker)s'),
    fingerprintMatches: gettext('Election fingerprint matches ballot'),
    fingerprintMismatch: gettext('Problem: election fingerprint does not match'),
    ballotContents: gettext('Ballot contents:'),
    nonHomomorphicWarning: gettext('Warning: the tally type for this question is not homomorphic. Verification may fail because this verifier only handles homomorphic ballots.'),
    questionContents: gettext('Question %(number)s - %(short_name)s: %(answers)s'),
    encryptionVerified: gettext('Encryption verified'),
    encryptionMismatch: gettext('Problem: encryption does not match.'),
    proofsOk: gettext('Cryptographic proofs verified.'),
    proofsFailed: gettext('Problem: cryptographic proofs are invalid.'),
    malformedInput: gettext('Problem parsing the election or ballot data structures; malformed input: %(error)s')
  };

  var i18n = {
    messages: messages,

    format: function(key, values) {
      return format(messages[key], values || {});
    },

    applyStaticText: function() {
      document.title = messages.title;
      document.documentElement.lang = 'gl';
      setText('verifier_title', messages.title);
      setText('verifier_loading', messages.loadingVerifier);
      setText('dummy_bigint_primary', messages.javaMissing);
      setText('dummy_bigint_secondary', messages.javaRequired);
      setText('verifier_description', messages.verifierDescription);
      setText('election_url_label', messages.electionUrlLabel);
      setText('ballot_label', messages.ballotLabel);

      var verifyButton = document.getElementById('verify_button');
      if (verifyButton) {
        verifyButton.value = messages.verify;
      }
    }
  };

  global.VERIFIER_I18N = i18n;
})(window);
