class AppException(Exception):
    """Base class for application exceptions."""

    def __init__(self, message: str, code: str = "ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class ValidationException(AppException):
    """Raised when validation fails."""

    def __init__(self, message: str):
        super().__init__(message, code="VALIDATION_ERROR")


class AuthenticationError(AppException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, code="AUTH_ERROR")
