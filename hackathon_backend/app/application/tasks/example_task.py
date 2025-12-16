from app.core.config.celery import celery_app


@celery_app.task(name="example_task")
def long_running_task(name: str, seconds: int) -> dict[str, str]:
    """
    Ağır bir işlemi simüle eden senkron bir görev.
    Celery worker'lar varsayılan olarak senkron çalışır.
    """
    import time

    print(f"Task started: {name}, waiting for {seconds} seconds...")
    time.sleep(seconds)  # Blocking IO simülasyonu
    print(f"Task finished: {name}")
    return {"msg": f"Hello {name}, task completed!", "status": "success"}
