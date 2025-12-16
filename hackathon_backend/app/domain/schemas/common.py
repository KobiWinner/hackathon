from pydantic import BaseModel, Field


class HealthCheck(BaseModel):
    """
    Sistem sağlık durumunu temsil eden Domain Varlığı.
    """

    status: str = Field(
        ..., title="Durum", description="API'nin o anki durumu", examples=["ok"]
    )
    project_name: str = Field(..., title="Proje Adı", description="Uygulamanın ismi")
    version: str = Field(default="0.1.0", title="Versiyon")
    mode: str = Field(default="production", title="Çalışma Modu (Debug/Prod)")
