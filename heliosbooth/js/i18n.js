/**
 * Internationalized strings for the Helios voting booth.
 *
 * The Django JavaScript catalog is loaded from /jsi18n/ before this file.
 * Keep user-visible booth strings here so `makemessages -d djangojs` can
 * extract them into locale/<lang>/LC_MESSAGES/djangojs.po.
 */
(function(global) {
  'use strict';

  var djangoI18n = global.django || {};
  var gettext = djangoI18n.gettext || function(message) { return message; };
  var ngettext = djangoI18n.ngettext || function(singular, plural, count) {
    return count === 1 ? singular : plural;
  };
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

  var i18n = {
    votingBooth: gettext('Helios Voting Booth'),
    exit: gettext('Exit'),
    select: gettext('Select'),
    review: gettext('Review'),
    submit: gettext('Submit'),
    start: gettext('Start'),
    proceed: gettext('Proceed'),
    previous: gettext('Previous'),
    next: gettext('Next'),
    moreInfo: gettext('more info'),
    change: gettext('change'),
    question: gettext('Question'),
    noChoiceSelected: gettext('No choice selected'),
    proceedToLogin: gettext('Proceed to Login'),
    spoilAndAudit: gettext('Spoil & Audit'),
    optional: gettext('optional'),
    backToVoting: gettext('Back to Voting'),
    postAuditedBallot: gettext('Post audited ballot to tracking center'),
    contactForHelp: gettext('Contact election support'),
    electionFingerprint: gettext('Election Fingerprint:'),

    leaveWarning: gettext('If you leave this page with an in-progress ballot, your ballot will be lost.'),
    exitConfirm: gettext('Are you sure you want to exit the booth and lose all information about your current ballot?'),
    maximumSelected: gettext('Maximum number of options selected. To change your selection, please deselect a current selection first.'),
    processing: gettext('Processing...'),
    checkingCapabilities: gettext('Checking capabilities and loading election booth...'),
    loadingMayTake: gettext('This may take up to 10 seconds.'),
    problemHeading: gettext("There's a problem"),
    javaProblem: gettext('It appears that your browser does not have Java enabled. Helios needs Java to perform encryption within the browser.'),
    javaInstall: gettext('You may be able to install Java by visiting java.com.'),
    encryptingBallot: gettext('Helios is now encrypting your ballot'),
    encryptionMayTake: gettext('This may take up to two minutes.'),

    // Translators: These are the three steps shown before voting starts.
    stepSelect: gettext('<b>Select</b> your preferred options.'),
    stepReview: gettext('<b>Review</b> your choices, which are then encrypted.'),
    stepSubmit: gettext('<b>Submit</b> your encrypted ballot and authenticate to verify your eligibility.'),
    voteInstructions: gettext('To vote, follow these steps:'),

    previewOnly: gettext('The public key for this election is not yet ready. This election is in preview mode only.'),
    reviewBallot: gettext('Review your Ballot'),
    ballotTrackerLabel: gettext('Your ballot tracker is'),
    auditHeading: gettext('Your audited ballot'),
    auditImportant: gettext('<b><u>IMPORTANT</u></b>: this ballot, now that it has been audited, <em>will not be tallied</em>.'),
    auditCastAgain: gettext('To cast a ballot, you must click the "Back to Voting" button below, re-encrypt it, and choose "cast" instead of "audit."'),
    auditWhy: gettext('<b>Why?</b> Helios prevents you from auditing and casting the same ballot to provide you with some protection against coercion.'),
    auditNowWhat: gettext('<b>Now what?</b> Copy the audit information below and use the ballot verifier to verify it.'),
    selectAuditInfo: gettext('Select your ballot audit info'),
    ballotVerifier: gettext('ballot verifier'),
    auditSatisfied: gettext('Once you are satisfied, click the "Back to Voting" button to re-encrypt and cast your ballot.'),
    beforeBackToVoting: gettext('Before going back to voting, you can post this audited ballot to the Helios tracking center so that others might double-check the verification of this ballot.'),
    auditMustCast: gettext('<b>Even if you post your audited ballot, you must go back to voting and choose "cast" if you want your vote to count.</b>'),
    auditOptionalExplanation: gettext('If you choose, you can spoil this ballot and reveal how your choices were encrypted. This is an optional auditing process.'),
    auditReencryptExplanation: gettext('You will then be guided to re-encrypt your choices for final casting.'),

    minimumAnswers: function(minimum) {
      return format(
        ngettext(
          'You need to select at least %(minimum)s answer.',
          'You need to select at least %(minimum)s answers.',
          minimum
        ),
        {minimum: minimum}
      );
    },

    maySelectUpTo: function(maximum) {
      return format(
        ngettext(
          'You may select up to %(maximum)s choice in total.',
          'You may select up to %(maximum)s choices in total.',
          maximum
        ),
        {maximum: maximum}
      );
    },

    questionPosition: function(current, total) {
      return format(
        gettext('Question %(current)s of %(total)s'),
        {current: current, total: total}
      );
    },

    selectionInstruction: function(minimum, maximum) {
      if (minimum && minimum > 0) {
        if (maximum !== null && typeof maximum !== 'undefined') {
          if (minimum === maximum) {
            return format(
              ngettext(
                'Select exactly %(maximum)s answer.',
                'Select exactly %(maximum)s answers.',
                maximum
              ),
              {maximum: maximum}
            );
          }
          return format(
            gettext('Select between %(minimum)s and %(maximum)s answers.'),
            {minimum: minimum, maximum: maximum}
          );
        }
        return format(
          ngettext(
            'Select at least %(minimum)s answer.',
            'Select at least %(minimum)s answers.',
            minimum
          ),
          {minimum: minimum}
        );
      }

      if (maximum !== null && typeof maximum !== 'undefined') {
        return format(
          ngettext(
            'Select up to %(maximum)s answer.',
            'Select up to %(maximum)s answers.',
            maximum
          ),
          {maximum: maximum}
        );
      }

      return gettext('Select as many answers as you approve of.');
    },

    selectionSummary: function(count, minimum, maximum) {
      var message;
      if (minimum === maximum) {
        message = ngettext(
          '%(count)s selection; exactly %(maximum)s required.',
          '%(count)s selections; exactly %(maximum)s required.',
          count
        );
      } else if (!minimum) {
        message = ngettext(
          '%(count)s selection; up to %(maximum)s allowed.',
          '%(count)s selections; up to %(maximum)s allowed.',
          count
        );
      } else {
        message = ngettext(
          '%(count)s selection; between %(minimum)s and %(maximum)s allowed.',
          '%(count)s selections; between %(minimum)s and %(maximum)s allowed.',
          count
        );
      }
      return format(message, {
        count: count,
        minimum: minimum,
        maximum: maximum
      });
    },

    encryptionProblem: function(percentage, helpEmail) {
      return format(
        gettext('There appears to be a problem with the encryption process. Please email %(help_email)s and indicate that your encryption process froze at %(percentage)s%%.'),
        {help_email: helpEmail, percentage: percentage}
      );
    },

    auditedBallotPosted: gettext('This audited ballot has been posted. Remember, this vote will only be used for auditing and will not be tallied. Click "Back to Voting" and cast a new ballot to make sure your vote counts.'),

    ballotTrackerFor: function(electionName, tracker) {
      return format(
        gettext('Your ballot tracker for %(election_name)s: %(tracker)s'),
        {election_name: electionName, tracker: tracker}
      );
    },

    helpSubject: function(electionName) {
      return format(
        gettext('Help with election %(election_name)s'),
        {election_name: electionName}
      );
    },

    helpBody: function(electionUuid) {
      return format(
        gettext('I need help with election %(election_uuid)s'),
        {election_uuid: electionUuid}
      );
    },

    applyStaticText: function() {
      document.title = i18n.votingBooth;
      setText('booth_title', i18n.votingBooth);
      setText('exit_link', i18n.exit);
      setText('progress_select_label', i18n.select);
      setText('progress_review_label', i18n.review);
      setText('progress_submit_label', i18n.submit);
      setText('checking_capabilities', i18n.checkingCapabilities);
      setText('loading_may_take', i18n.loadingMayTake);
      setText('problem_heading', i18n.problemHeading);
      setText('java_problem', i18n.javaProblem);
      setText('java_install_text', i18n.javaInstall);
      setText('processing_heading', i18n.processing);
      setText('encrypting_heading', i18n.encryptingBallot);
      setText('encryption_may_take', i18n.encryptionMayTake);
      document.documentElement.lang = 'gl';
    }
  };

  global.BOOTH_I18N = i18n;
})(window);
