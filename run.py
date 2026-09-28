import os

from server.app import app

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("NANKAI_GAME_PORT", "8090"))
    uvicorn.run(app, host="127.0.0.1", port=port)
