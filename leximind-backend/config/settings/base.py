"""
LexiMind Secure — Base Settings
Shared across dev and prod. Environment-specific values come from
config/settings/dev.py or prod.py (or env vars via python-decouple).
"""
import os
from pathlib import Path
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# ── Security ──────────────────────────────────────────────────────────────────
SECRET_KEY = config("SECRET_KEY", default="django-insecure-dev-key-change-in-prod")
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=lambda v: [s.strip() for s in v.split(",")])

# ── Auth ──────────────────────────────────────────────────────────────────────
AUTH_USER_MODEL = "accounts.User"

# ── Installed Apps ────────────────────────────────────────────────────────────
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    "django_celery_results",
]

LOCAL_APPS = [
    "apps.accounts",
    "apps.cases",
    "apps.documents",
    "apps.evidence",
    "apps.custody",
    "apps.blockchain",
    "apps.alerts",
    "apps.audit",
    "apps.ai",
    "apps.notifications",
    "apps.settings_app",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ── Middleware ────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL = config("DATABASE_URL", default="")

if DATABASE_URL:
    import dj_database_url  # noqa: optional
    DATABASES = {"default": dj_database_url.parse(DATABASE_URL)}
else:
    # Explicit Postgres config for dev
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("DB_NAME", default="leximind_db"),
            "USER": config("DB_USER", default="leximind"),
            "PASSWORD": config("DB_PASSWORD", default="leximind"),
            "HOST": config("DB_HOST", default="localhost"),
            "PORT": config("DB_PORT", default="5432"),
        }
    }

# ── Password Validation ───────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ── Internationalisation ──────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# ── Static + Media ────────────────────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "mediafiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── DRF ───────────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "login": "10/minute",  # tighter throttle on login endpoint
    },
    "EXCEPTION_HANDLER": "apps.common.exceptions.leximind_exception_handler",
}

# ── JWT ───────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=config("JWT_ACCESS_TTL_MINUTES", default=60, cast=int)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=config("JWT_REFRESH_TTL_DAYS", default=7, cast=int)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173,http://127.0.0.1:5173",
    cast=lambda v: [s.strip() for s in v.split(",")],
)
CORS_ALLOW_CREDENTIALS = True

# ── Celery ────────────────────────────────────────────────────────────────────
CELERY_BROKER_URL = config("REDIS_URL", default="redis://localhost:6379/0")
CELERY_RESULT_BACKEND = "django-db"
CELERY_CACHE_BACKEND = "django-cache"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE

# ── Encryption ────────────────────────────────────────────────────────────────
# AES key: 32-byte Fernet-compatible base64 key.
# Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
AES_ENCRYPTION_KEY = config("AES_ENCRYPTION_KEY", default="")

# ── drf-spectacular ───────────────────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    "TITLE": "LexiMind Secure API",
    "DESCRIPTION": "Government-grade legal/investigation intelligence platform backend.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
}

# ── Logging ───────────────────────────────────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
        },
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "django": {"handlers": ["console"], "level": "WARNING", "propagate": False},
        "apps": {"handlers": ["console"], "level": "DEBUG", "propagate": False},
    },
}

# ── Upload limits ─────────────────────────────────────────────────────────────
MAX_UPLOAD_SIZE_MB = 50
ALLOWED_UPLOAD_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.ms-excel",
    "text/csv",
    "image/png",
    "image/jpeg",
    "image/jpg",
]

# ── Failed-login tracking ─────────────────────────────────────────────────────
LOGIN_FAILURE_THRESHOLD = 5       # consecutive failures before alert
LOGIN_FAILURE_WINDOW_SECONDS = 120  # 2-minute window

# ── OpenRouter AI ─────────────────────────────────────────────────────────────
# Get a free API key at https://openrouter.ai/
# Free models (no billing required): set OPENROUTER_MODEL to any ":free" model.
OPENROUTER_API_KEY = config("OPENROUTER_API_KEY", default="")
OPENROUTER_BASE_URL = config("OPENROUTER_BASE_URL", default="https://openrouter.ai/api/v1")
# Default: Llama 3.1 8B (free tier, no credit card needed)
OPENROUTER_MODEL = config("OPENROUTER_MODEL", default="meta-llama/llama-3.1-8b-instruct:free")
# Site info headers (required by OpenRouter for usage tracking)
OPENROUTER_SITE_URL = config("OPENROUTER_SITE_URL", default="http://localhost:5173")
OPENROUTER_SITE_NAME = config("OPENROUTER_SITE_NAME", default="LexiMind Secure")
