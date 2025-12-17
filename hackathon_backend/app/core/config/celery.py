from celery import Celery

from app.core.config.settings import settings

celery_app = Celery("hackathon_worker", broker=settings.CELERY_BROKER_URL)

celery_app.conf.update(
    result_backend=settings.CELERY_RESULT_BACKEND,
    # İçerik formatı (Güvenlik için sadece JSON kabul ediyoruz)
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Görevleri otomatik bul (app/application/tasks/ klasörüne bakacak)
    # Görevleri otomatik bul (app/application/tasks/ klasörüne bakacak)
    imports=["app.application.tasks.example_task", "app.application.tasks.data_collector"],
    beat_schedule={
        "collect_data_every_5_minutes": {
            "task": "app.application.tasks.data_collector.collect_data_task",
            "schedule": 30.0,  # 30 saniye
        },
    },
)
