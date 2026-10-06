// helper functions for verifying a ballot
// assumes all of Helios machinery is loaded

var VERIFIER_DEFAULT_MESSAGES = {
    electionFingerprint: 'Election fingerprint is %(hash)s',
    ballotTracker: 'Ballot tracker is %(tracker)s',
    fingerprintMatches: 'Election fingerprint matches ballot',
    fingerprintMismatch: 'Problem: election fingerprint does not match',
    ballotContents: 'Ballot contents:',
    nonHomomorphicWarning: 'Warning: the tally type for this question is not homomorphic. Verification may fail because this verifier only handles homomorphic ballots.',
    questionContents: 'Question %(number)s - %(short_name)s: %(answers)s',
    encryptionVerified: 'Encryption verified',
    encryptionMismatch: 'Problem: encryption does not match.',
    proofsOk: 'Cryptographic proofs verified.',
    proofsFailed: 'Problem: cryptographic proofs are invalid.',
    malformedInput: 'Problem parsing the election or ballot data structures; malformed input: %(error)s'
};

function verifier_format(message, values) {
    return message.replace(/%\(([^)]+)\)s/g, function(match, key) {
        return values[key];
    });
}

function verifier_message(messages, key, values) {
    var message = (messages && messages[key]) || VERIFIER_DEFAULT_MESSAGES[key];
    return values ? verifier_format(message, values) : message;
}

function verify_ballot(election_raw_json, encrypted_vote_json, status_cb, messages) {
    var overall_result = true;
    try {
        election = HELIOS.Election.fromJSONString(election_raw_json);
        var election_hash = election.get_hash();
        status_cb(verifier_message(messages, 'electionFingerprint', {hash: election_hash}));

        // display ballot fingerprint
        encrypted_vote = HELIOS.EncryptedVote.fromJSONObject(encrypted_vote_json, election);
        status_cb(verifier_message(messages, 'ballotTracker', {tracker: encrypted_vote.get_hash()}));

        // check the hash
        if (election_hash == encrypted_vote.election_hash) {
            status_cb(verifier_message(messages, 'fingerprintMatches'));
        } else {
            overall_result = false;
            status_cb(verifier_message(messages, 'fingerprintMismatch'));
        }

        // display the ballot as it is claimed to be
        status_cb(verifier_message(messages, 'ballotContents'));
        _(election.questions).each(function(q, qnum) {
            if (q.tally_type != 'homomorphic') {
                status_cb(verifier_message(messages, 'nonHomomorphicWarning'));
            }

            var answer_pretty_list = _(encrypted_vote.encrypted_answers[qnum].answer).map(function(aindex, anum) {
                return q.answers[aindex];
            });
            status_cb(verifier_message(messages, 'questionContents', {
                number: qnum + 1,
                short_name: q.short_name,
                answers: answer_pretty_list.join(', ')
            }));
        });

        // verify the encryption
        if (encrypted_vote.verifyEncryption(election.questions, election.public_key)) {
            status_cb(verifier_message(messages, 'encryptionVerified'));
        } else {
            overall_result = false;
            status_cb(verifier_message(messages, 'encryptionMismatch'));
        }

        // verify the proofs
        if (encrypted_vote.verifyProofs(election.public_key, function(ea_num, choice_num, result) {
        })) {
            status_cb(verifier_message(messages, 'proofsOk'));
        } else {
            overall_result = false;
            status_cb(verifier_message(messages, 'proofsFailed'));
        }
    } catch (e) {
        status_cb(verifier_message(messages, 'malformedInput', {error: e.toString()}));
        overall_result = false;
    }

    return overall_result;
}
