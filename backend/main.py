from fastapi import FastAPI
from Routes import shorten, redirect, edit
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os
import logging


load_dotenv()

logger = logging.getLogger(__name__)


app = FastAPI()


FRONTEND_URL = os.getenv("FRONTEND_URL")
if not FRONTEND_URL:
    logger.error("❌ FRONTEND_URL not found in .env file")
    raise ValueError("❌ FRONTEND_URL not found in .env file")


logger.info(f"Frontend URL: {FRONTEND_URL}")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # Allow the frontend's origin
    allow_credentials=True,
    allow_methods=["*"],  # Allowed HTTP methods
    allow_headers=["*"],  # Allow any headers
)


# Log the allowed origins for debugging
logger.info(f"Allow origins: {FRONTEND_URL}")

# Root route
@app.get("/")
async def read_root():
    return {"message": "Welcome to the URL Shortener API"}

#include routes
app.include_router(shorten.router)
app.include_router(redirect.router)
app.include_router(edit.router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)