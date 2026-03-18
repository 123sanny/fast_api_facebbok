from fastapi import APIRouter, WebSocket
from app.websocket import connect, broadcast

router = APIRouter()


@router.websocket("/chat")
async def chat(websocket: WebSocket):

    await connect(websocket)

    while True:

        data = await websocket.receive_text()

        await broadcast(data)