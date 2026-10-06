"""
Forms for Helios
"""

from django import forms
from django.conf import settings
from django.utils.translation import gettext_lazy as _

from .fields import DateTimeLocalField
from .models import Election


class ElectionForm(forms.Form):
  short_name = forms.SlugField(
      max_length=40,
      label=_("Short name"),
      help_text=_("No spaces; this will be part of the election URL, e.g. my-club-2010."),
  )
  name = forms.CharField(
      max_length=100,
      label=_("Name"),
      widget=forms.TextInput(attrs={'size':60}),
      help_text=_("The display name for your election, e.g. My Club 2010 Election."),
  )
  description = forms.CharField(
      max_length=4000,
      label=_("Description"),
      widget=forms.Textarea(attrs={'cols': 70, 'wrap': 'soft'}),
      required=False,
  )
  election_type = forms.ChoiceField(label=_("Type"), choices=Election.ELECTION_TYPES)
  use_voter_aliases = forms.BooleanField(
      required=False,
      initial=False,
      label=_("Use voter aliases"),
      help_text=_("If selected, voter identities will be replaced with aliases, e.g. “V12”, in the ballot tracking center."),
  )
  randomize_answer_order = forms.BooleanField(
      required=False,
      initial=False,
      label=_("Randomize answer order"),
      help_text=_("Enable this if you want the answers to questions to appear in random order for each voter."),
  )
  private_p = forms.BooleanField(
      required=False,
      initial=False,
      label=_("Private?"),
      help_text=_("A private election is only visible to registered voters."),
  )
  help_email = forms.CharField(
      required=False,
      initial="",
      label=_("Help email address"),
      help_text=_("An email address voters should contact if they need help."),
  )

  if settings.ALLOW_ELECTION_INFO_URL:
    election_info_url = forms.CharField(
        required=False,
        initial="",
        label=_("Election information URL"),
        help_text=_("The URL of a PDF document that contains extra election information, e.g. candidate bios and statements."),
    )

  voting_starts_at = DateTimeLocalField(
      label=_("Voting starts at"),
      help_text=_("UTC date and time when voting begins."),
      required=False,
  )
  voting_ends_at = DateTimeLocalField(
      label=_("Voting ends at"),
      help_text=_("UTC date and time when voting ends."),
      required=False,
  )


class ElectionTimeExtensionForm(forms.Form):
  voting_extended_until = DateTimeLocalField(
      label=_("Extend voting until"),
      help_text=_("UTC date and time until which voting is extended."),
      required=False,
  )


class EmailVotersForm(forms.Form):
  subject = forms.CharField(max_length=80, label=_("Subject"))
  body = forms.CharField(max_length=4000, widget=forms.Textarea, label=_("Message"))
  send_to = forms.ChoiceField(
      label=_("Send to"),
      initial="all",
      choices=[
          ('all', _('all voters')),
          ('voted', _('voters who have cast a ballot')),
          ('not-voted', _('voters who have not yet cast a ballot')),
      ],
  )


class TallyNotificationEmailForm(forms.Form):
  subject = forms.CharField(max_length=80, label=_("Subject"))
  body = forms.CharField(max_length=2000, widget=forms.Textarea, required=False, label=_("Message"))
  send_to = forms.ChoiceField(
      label=_("Send to"),
      choices=[
          ('all', _('all voters')),
          ('voted', _('only voters who cast a ballot')),
          ('none', _('no one — are you sure about this?')),
      ],
  )


class VoterPasswordForm(forms.Form):
  voter_id = forms.CharField(max_length=50, label=_("Voter ID"))
  password = forms.CharField(widget=forms.PasswordInput(), max_length=100, label=_("Password"))


class VoterPasswordResendForm(forms.Form):
  voter_id = forms.CharField(
      max_length=50,
      label=_("Voter ID"),
      help_text=_("Enter the voter ID you were assigned for this election."),
  )
