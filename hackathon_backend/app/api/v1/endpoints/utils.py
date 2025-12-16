from typing import Any

from fastapi import APIRouter

from app.application.tasks.example_task import long_running_task

router = APIRouter()


@router.post("/test-celery/", status_code=201)
def test_celery_task(msg: str, seconds: int = 5) -> Any:
    """
    Arka planda çalışacak bir görev başlatır.
    """
    # .delay() metodu görevi kuyruğa atar ve hemen döner (Non-blocking)
    task = long_running_task.delay(msg, seconds)

    return {
        "message": "Görev kuyruğa alındı.",
        "task_id": str(task.id),
        "status": "Processing",
    }
