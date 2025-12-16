from app.core.patterns.pipeline import BaseStep, PipelineContext


class RequireRoleStep(BaseStep):
    """
    Kullanıcının belirli bir role sahip olup olmadığını denetleyen adım.
    Admin rolü her zaman geçiş hakkına sahiptir.
    """

    def __init__(self, required_role: str):
        self.required_role = required_role

    async def process(self, context: PipelineContext) -> None:
        # Kullanıcı Context içinde var mı? (Authentication Check)
        # API katmanında token kontrolü yapılsa bile, pipeline'ın
        # kendi kendine yetebilmesi (self-contained) için bu kontrol şarttır.
        if not context.user:
            context.errors.append("Authentication required: No user found in context.")
            return

        # Rol Kontrolü (Authorization Check)
        # Kullanıcının rolü istenen rol değilse VE kullanıcı admin değilse hata ver.
        if self.required_role not in context.user.roles and not context.user.is_admin:
            context.errors.append(
                f"Permission denied. Required role: '{self.required_role}'"
            )
