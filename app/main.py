from fastapi import FastAPI
from . import models, database
from .routes import router
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

#app = FastAPI()

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="User Registration with JWT Auth")
app.include_router(router)


# Serve static HTML
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_ui():
    return FileResponse("static/fastapi_auth.html")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

