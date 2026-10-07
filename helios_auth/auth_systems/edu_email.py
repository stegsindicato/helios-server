"""
Authentication by one-time code sent to an institutional email address.

Intended for open-registration elections. Once authentication succeeds,
Helios' normal openreg flow registers the authenticated User in the election.

The OTP is stored only as an HMAC in the Django server-side session. No extra
model or migration is required.
"""

import secrets
import time

from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.http import HttpResponseRedirect
from django.urls import re_path, reverse
from django.utils.crypto import constant_time_compare, salted_hmac
from django.utils.translation import gettext, gettext_lazy

from helios_auth import url_names
from helios_auth.utils import format_recipient


STATUS_UPDATES = False
CASE_INSENSITIVE_USER_ID = True
LOGIN_MESSAGE = gettext_lazy("Corporate email")

LOGIN_URL_NAME = "auth@edu_email@login"
VERIFY_URL_NAME = "auth@edu_email@verify"

PENDING_SESSION_KEY = "edu_email_pending"
USER_SESSION_KEY = "edu_email_user_id"
OTP_HMAC_SALT = "helios-auth.edu-email-otp.v1"


def _check_csrf(request):
  # Lazy import avoids a circular dependency while auth_systems is being built.
  from helios_auth.security import check_csrf
  return check_csrf(request)


def _render_template(request, template_name, values=None):
  # helios_auth.view_utils imports helios_auth.security, so keep it lazy too.
  from helios_auth.view_utils import render_template
  return render_template(request, template_name, values)


def _allowed_domain():
  return settings.EDU_EMAIL_DOMAIN.lower().lstrip('@').rstrip('.')


def _normalize_email(email):
  email = (email or '').strip().casefold()
  local, sep, domain = email.rpartition('@')
  domain = domain.rstrip('.')

  if not sep or not local or domain != _allowed_domain():
    raise ValidationError(
      gettext("Enter a valid @%(domain)s address.") % {
        'domain': _allowed_domain(),
      }
    )

  return "%s@%s" % (local, _allowed_domain())


def _otp_digest(email, code):
  return salted_hmac(
    OTP_HMAC_SALT,
    "%s:%s" % (email, code),
    secret=settings.SECRET_KEY,
    algorithm="sha256",
  ).hexdigest()


def _pending_expired(pending, now=None):
  now = now if now is not None else time.time()
  created_at = float(pending.get('created_at', 0))
  return (now - created_at) > settings.EDU_EMAIL_OTP_MAX_AGE


class EmailForm(forms.Form):
  email = forms.EmailField(label=gettext_lazy("Corporate email"), max_length=254)

  def clean_email(self):
    return _normalize_email(self.cleaned_data['email'])


class OTPForm(forms.Form):
  code = forms.RegexField(
    regex=r'^\d{6}$',
    label=gettext_lazy("Code"),
    max_length=6,
    min_length=6,
    error_messages={
      'invalid': gettext_lazy("Enter the 6-digit code."),
    },
  )


def get_auth_url(request, redirect_url=None):
  return reverse(LOGIN_URL_NAME)


def get_user_info_after_auth(request):
  email = request.session.pop(USER_SESSION_KEY, None)
  if not email:
    return None

  return {
    'type': 'edu_email',
    'user_id': email,
    'name': email,
    'info': {'email': email},
    'token': None,
  }


def do_logout(user):
  return None


def update_status(token, message):
  pass


def send_message(user_id, name, user_info, subject, body):
  send_mail(
    subject,
    body,
    settings.SERVER_EMAIL,
    [format_recipient(name or user_id, user_id)],
    fail_silently=False,
  )


def can_create_election(user_id, user_info):
  # Voters authenticated here must not gain election-creation privileges.
  return False


def login_view(request):
  # Direct visits should also work, not only /auth/start/edu_email.
  request.session['auth_system_name'] = 'edu_email'
  request.session.setdefault('auth_return_url', '/')

  if request.method == 'GET':
    return _render_template(request, 'edu_email/login', {
      'form': EmailForm(),
      'domain': _allowed_domain(),
    })

  _check_csrf(request)
  form = EmailForm(request.POST)
  if not form.is_valid():
    return _render_template(request, 'edu_email/login', {
      'form': form,
      'domain': _allowed_domain(),
    })

  now = time.time()
  previous = request.session.get(PENDING_SESSION_KEY)
  if previous:
    last_sent = float(previous.get('created_at', 0))
    if (now - last_sent) < settings.EDU_EMAIL_OTP_RESEND_SECONDS:
      return _render_template(request, 'edu_email/verify', {
        'form': OTPForm(),
        'domain': _allowed_domain(),
        'error': gettext("A code was sent recently. Check your email before requesting another one."),
      })

  email = form.cleaned_data['email']
  code = "%06d" % secrets.randbelow(1000000)

  request.session[PENDING_SESSION_KEY] = {
    'email': email,
    'code_digest': _otp_digest(email, code),
    'created_at': now,
    'attempts': 0,
  }

  minutes = max(1, settings.EDU_EMAIL_OTP_MAX_AGE // 60)
  body = gettext(
    "Hello,\n\n"
    "Your code to access the election is:\n\n"
    "%(code)s\n\n"
    "The code expires in %(minutes)d minutes.\n\n"
    "If you did not request this code, you can ignore this message.\n\n"
    "--\n%(site_title)s\n"
  ) % {
    'code': code,
    'minutes': minutes,
    'site_title': settings.SITE_TITLE,
  }

  try:
    send_mail(
      gettext(settings.EDU_EMAIL_SUBJECT),
      body,
      settings.SERVER_EMAIL,
      [email],
      fail_silently=False,
    )
  except Exception:
    # Do not log the recipient or OTP. Let the user retry.
    request.session.pop(PENDING_SESSION_KEY, None)
    return _render_template(request, 'edu_email/login', {
      'form': EmailForm(initial={'email': email}),
      'domain': _allowed_domain(),
      'error': gettext("We could not send the email. Please try again later."),
    })

  return HttpResponseRedirect(reverse(VERIFY_URL_NAME))


def verify_view(request):
  pending = request.session.get(PENDING_SESSION_KEY)
  if not pending:
    return HttpResponseRedirect(reverse(LOGIN_URL_NAME))

  if _pending_expired(pending):
    request.session.pop(PENDING_SESSION_KEY, None)
    return _render_template(request, 'edu_email/login', {
      'form': EmailForm(),
      'domain': _allowed_domain(),
      'error': gettext("The code has expired. Request a new one."),
    })

  if request.method == 'GET':
    return _render_template(request, 'edu_email/verify', {
      'form': OTPForm(),
      'domain': _allowed_domain(),
    })

  _check_csrf(request)
  form = OTPForm(request.POST)
  if not form.is_valid():
    return _render_template(request, 'edu_email/verify', {
      'form': form,
      'domain': _allowed_domain(),
    })

  attempts = int(pending.get('attempts', 0)) + 1
  pending['attempts'] = attempts
  request.session[PENDING_SESSION_KEY] = pending

  expected = pending.get('code_digest', '')
  supplied = _otp_digest(pending['email'], form.cleaned_data['code'])

  if not constant_time_compare(expected, supplied):
    if attempts >= settings.EDU_EMAIL_OTP_MAX_ATTEMPTS:
      request.session.pop(PENDING_SESSION_KEY, None)
      return _render_template(request, 'edu_email/login', {
        'form': EmailForm(),
        'domain': _allowed_domain(),
        'error': gettext("The maximum number of attempts has been exceeded. Request a new code."),
      })

    return _render_template(request, 'edu_email/verify', {
      'form': OTPForm(),
      'domain': _allowed_domain(),
      'error': gettext("Incorrect code."),
    })

  email = pending['email']
  request.session.pop(PENDING_SESSION_KEY, None)
  request.session[USER_SESSION_KEY] = email
  request.session['auth_system_name'] = 'edu_email'

  return HttpResponseRedirect(reverse(url_names.AUTH_AFTER))


urlpatterns = [
  re_path(r'^edu_email/login$', login_view, name=LOGIN_URL_NAME),
  re_path(r'^edu_email/verify$', verify_view, name=VERIFY_URL_NAME),
]
