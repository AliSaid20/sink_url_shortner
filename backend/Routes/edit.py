from fastapi import APIRouter, HTTPException
from database import collection
from models import URLEditRequest
import re
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
import logging
from fastapi.responses import JSONResponse
from Routes.shorten import generate_qr_code


router = APIRouter()

load_dotenv()

logger = logging.getLogger(__name__)

# Get the BASE_URL from the environment variables
BASE_URL = os.getenv("BASE_URL")
if not BASE_URL:
    logger.error("❌ BASE_URL not found in .env file")
    raise ValueError("❌ BASE_URL not found in .env file")

FRONTEND_URL = os.getenv("FRONTEND_URL")
if not FRONTEND_URL:
    logger.error("❌ FRONTEND_URL not found in .env file")
    raise ValueError("❌ FRONTEND_URL not found in .env file")


@router.get("/edit/{edit_id}")
async def get_url_details(edit_id: str):
    url_data = collection.find_one({"edit_id": edit_id}, {"_id": 0, "long_url": 1, "custom_alias": 1, "expiration_date": 1, "short_code": 1})

    if not url_data:
        raise HTTPException(status_code=404, detail="Edit link is invalid or expired")
    
    # Ensure expiration_date is None if missing
    expiration_date = url_data.get("expiration_date", None)

        # Convert expiration_date if it's stored in MongoDB's `{"$date": ...}` format
    if isinstance(expiration_date, dict) and "$date" in expiration_date:
        expiration_date = expiration_date["$date"]
        
    
    # Convert to ISO format if it's a datetime object
    elif isinstance(expiration_date, datetime):
        expiration_date = expiration_date.isoformat()

    return {
        "long_url": url_data["long_url"],
        "custom_alias": url_data.get("custom_alias"),
        "expiration_date": expiration_date,
        "short_code": url_data["short_code"],
        "shortened_url": f"{BASE_URL}/{url_data['short_code']}"  # ✅ Add shortened URL
    }


@router.put("/edit/{edit_id}")
async def edit_url(edit_id: str, request: URLEditRequest):
    
      # Log the received expiration_date
    print("Received expiration_date:", request.expiration_date)  # This will print to your server logs
    
    """Edit an existing shortened URL."""
    try:
        existing_entry = collection.find_one({"edit_id": edit_id})
        
        if not existing_entry:
            raise HTTPException(status_code=404, detail="URL not found")

        # Prevent editing expired URLs
        expiration_date = existing_entry.get("expiration_date")
        if expiration_date:
        # Handle MongoDB stored format
            # Handle MongoDB stored format ({"$date": ...})
            if isinstance(expiration_date, dict) and "$date" in expiration_date:
                expiration_date = expiration_date["$date"]
            
            

            
        
            # ✅ Ensure expiration_date is always timezone-aware (UTC)
            if expiration_date.tzinfo is None:
                expiration_date = expiration_date.replace(tzinfo=timezone.utc)
        
             # Ensure comparison is timezone-aware
            expiration_date = expiration_date.astimezone(timezone.utc)
            current_time = datetime.now(timezone.utc)

            # Compare expiration time with the current time (UTC)
            if current_time > expiration_date:
                raise HTTPException(status_code=400, detail="Cannot edit an expired URL.")

        updated_data = {}

        # Check if the user is updating the custom alias
        
        if request.custom_alias and request.custom_alias != existing_entry["short_code"]:
            # Check if the alias already exists in the collection
            existing_alias = collection.find_one({"short_code": request.custom_alias})
            if existing_alias:
                raise HTTPException(status_code=400, detail=f"Alias '{request.custom_alias}' is already in use.")
            updated_data["short_code"] = request.custom_alias

        # Update expiration date if provided
         # Handle expiration date setting
        expiration_date = None  # Default to None if no expiration date is provided
        if request.expiration_date != "permanent" and request.expiration_date:
            try:
                  # Handle expiration date correctly if it's a string in ISO format
                if isinstance(request.expiration_date, str):
                    # If it's a string, replace "Z" with "+00:00" for UTC and parse it
                    expiration_date_str = request.expiration_date.replace("Z", "+00:00")
                    expiration_date = datetime.fromisoformat(expiration_date_str)
                elif isinstance(request.expiration_date, datetime):
                    expiration_date = request.expiration_date
                else:
                    raise ValueError("Invalid expiration date format")
                # Ensure the datetime is in UTC timezone
                updated_data["expiration_date"] = expiration_date.replace(tzinfo=timezone.utc)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid expiration date format")
        
        else:
            updated_data["expiration_date"] = None
            
        
        # Fix timezone issue
        if expiration_date:
            if expiration_date.tzinfo is None:
                expiration_date = expiration_date.replace(tzinfo=timezone.utc)
            
            else:
                expiration_date = expiration_date.astimezone(timezone.utc)    
            
            
            if expiration_date < datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Expiration date cannot be in the past.")

        
        # Update database if updated data exists
        if updated_data:
            collection.update_one({"edit_id": edit_id}, {"$set": updated_data})

        # Re-generate QR code if alias or URL changed
        if "short_code" in updated_data or "long_url" in updated_data:
            short_url = f"{BASE_URL}/{updated_data.get('short_code', existing_entry['short_code'])}"
            qr_code = generate_qr_code(short_url)
            collection.update_one({"edit_id": edit_id}, {"$set": {"qr_code": qr_code}})

        # Return updated info with the original URL, shortened URL, and QR code
        updated_entry = collection.find_one({"edit_id": edit_id})

            # Ensure expiration_date is in correct format
        expiration_date = updated_entry.get("expiration_date")
        if isinstance(expiration_date, datetime):
            expiration_date = expiration_date.isoformat()
            
            
        return JSONResponse(content={
            "original_url": updated_entry["long_url"],  # original long URL
            "previous_shortened_url": f"{BASE_URL}/{existing_entry['short_code']}",  # previously shortened URL
            "shortened_url": f"{BASE_URL}/{updated_entry['short_code']}",
            "edit_link": f"{FRONTEND_URL}/edit/{edit_id}",
            "qr_code": updated_entry.get("qr_code"),
            "expiration_date": expiration_date
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
