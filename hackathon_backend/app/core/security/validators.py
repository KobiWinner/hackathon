from password_validator import PasswordValidator

# Password Validator Kuralları
password_schema = PasswordValidator()
password_schema.min(8).max(
    64
).has().uppercase().has().lowercase().has().digits().has().no().spaces()


def validate_password_requirements(v: str) -> str:
    if not password_schema.validate(v):
        raise ValueError(f"Şifre kurallara uymuyor: {password_schema.validate(v)}")
    return v
