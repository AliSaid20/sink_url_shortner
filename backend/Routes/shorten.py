# from pymongo import MongoClient
import qrcode
import io
import base64
from fastapi.responses import JSONResponse
from fastapi import APIRouter, HTTPException
from models import URLRequest
from database import collection
import shortuuid
from datetime import datetime,  timezone
from security import check_url_security
import os
from dotenv import load_dotenv
import logging


# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


FRONTEND_URL = os.getenv("FRONTEND_URL")
if not FRONTEND_URL:
    logger.error("❌ FRONTEND_URL not found in .env file")
    raise ValueError("❌ FRONTEND_URL not found in .env file")


# Get the BASE_URL from the environment variables
BASE_URL = os.getenv("BASE_URL")
if not BASE_URL:
    logger.error("❌ BASE_URL not found in .env file")
    raise ValueError("❌ BASE_URL not found in .env file")





router = APIRouter()

def generate_qr_code(url: str) -> str:
    """Generate a QR code and return it as a base64 string."""
    qr = qrcode.make(url)
    buffered = io.BytesIO()
    qr.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return qr_base64


@router.post("/shorten")
async def shorten_url(request: URLRequest):
    logger.info(f"Received request: {request.dict()}")
    
    # Check if the URL passes security checks
    if not check_url_security(request.long_url):
        raise HTTPException(status_code=400, detail="URL failed security checks.")
        
    try:
        # Check if the URL is provided
        if not request.long_url:
            raise HTTPException(status_code=400, detail="Long URL is required")
    
        # Check if the long URL is already shortened
        existing_entry = collection.find_one({"long_url": str(request.long_url)})
        if existing_entry:
            short_url = f"{BASE_URL}/{existing_entry['short_code']}"
            return JSONResponse(content={
                "message": "This URL has already been shortened.",
                "already_shortened": True,
                "shortened_url": short_url,
                "edit_link": f"{FRONTEND_URL}/edit/{existing_entry['edit_id']}",
                "qr_code": existing_entry["qr_code"]
            })
    
        # Generate short code
        short_code = request.custom_alias if request.custom_alias else shortuuid.uuid()[:6]
        logger.info(f"Generated short_code: {short_code}")  # Debug log

        if request.custom_alias:
            # Ensure custom_alias is a string
            short_code = str(request.custom_alias)
            if collection.find_one({"short_code": short_code}):
                logger.error(f"Custom alias '{short_code}' is already in use.")  # Log custom alias error
                raise HTTPException(status_code=400, detail=f"Custom alias '{short_code}' is already in use. Please try a different alias.")

        

        expiration_date = None
        if request.expiration_date:
            logger.info(f"Parsing expiration date: {request.expiration_date}")
            try:
                 # Log the raw value received for expiration_date
                logger.info(f"Raw expiration date: {request.expiration_date}")
                expiration_date = datetime.fromisoformat(str(request.expiration_date))
            except ValueError as e:
                logger.error(f"Invalid expiration date format: {e}")
                raise HTTPException(status_code=400, detail="Invalid expiration date format")

        logger.info(f"Received expiration_date: {request.expiration_date}")


        # Fix timezone issue
        if expiration_date:
            if expiration_date.tzinfo is None:
                expiration_date = expiration_date.replace(tzinfo=timezone.utc)
            
            else:
                expiration_date = expiration_date.astimezone(timezone.utc)    
            
            
            if expiration_date < datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Expiration date cannot be in the past.")

        edit_id = shortuuid.uuid()[:10]
        short_url = f"{BASE_URL}/{short_code}"

        try:
            qr_code = generate_qr_code(short_url)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating QR code: {e}")

        # Insert URL and related data into MongoDB (store expiration date as datetime)
        try:
            collection.insert_one({
                "short_code": short_code,
                "long_url": str(request.long_url),
                "expiration_date": expiration_date if expiration_date else None,  # Store as datetime
                "edit_id": edit_id,
                "qr_code": qr_code
            })
        except Exception as e:
            logger.error(f"Error saving to database: {e}")
            raise HTTPException(status_code=500, detail=f"Error saving data to database: {str(e)}")

        return JSONResponse(content={
            "shortened_url": short_url,
            "edit_link": f"{FRONTEND_URL}/edit/{edit_id}",
            "qr_code": qr_code
        })
    
    except HTTPException as e:
        logger.error(f"HTTP error: {e.detail}")
        raise e  # Re-raise the HTTPException to maintain the appropriate status code
    
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise HTTPException(status_code=500, detail=f"Server error: {e}")

@router.get("/qrcode/{short_code}")
async def get_qr_code(short_code: str):
    """Retrieve QR code from MongoDB (base64 format)."""
    data = collection.find_one({"short_code": short_code})
    
    if not data:
        raise HTTPException(status_code=404, detail="Short URL not found")

    # Check expiration if date is provided
    if data.get("expiration_date"):
        expiration_date = data["expiration_date"]
        if datetime.utcnow() > expiration_date:
            raise HTTPException(status_code=400, detail="This URL has expired")

    qr_code_base64 = data["qr_code"]
    return JSONResponse(content={"qr_code": qr_code_base64})
