from fastapi import APIRouter, HTTPException
from database import collection
from starlette.responses import RedirectResponse
from datetime import datetime, timezone
import logging
import re


# Set up logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

router = APIRouter()



@router.get("/{short_code}")
async def redirect_to_long_url(short_code: str):
    logger.debug("Test log message - Function started.") 
    url_data = collection.find_one({"short_code": short_code})
    
    if not url_data:
        logger.warning(f"Short code '{short_code}' not found in DB")
        raise HTTPException(status_code=404, detail="URL not found")
    logger.info(f"Redirecting to {url_data['long_url']}")

    # Handle expiration date check
    expiration_date = url_data.get("expiration_date")
    if expiration_date:
        logger.debug(f"Stored expiration: {expiration_date}")  # Debugging log
        logger.debug(f"Expiration date type: {type(expiration_date)}")

        # Ensure expiration_date is in datetime format
        if isinstance(expiration_date, str):
            try:
                expiration_date = datetime.fromisoformat(expiration_date.replace("Z", "+00:00"))
            except ValueError as e:
                logger.error(f"Invalid expiration date format in database: {e}")
                raise HTTPException(status_code=500, detail="Invalid expiration date format in database")

        elif isinstance(expiration_date, dict) and "$date" in expiration_date:
            try:
                expiration_date = datetime.fromisoformat(expiration_date["$date"].replace("Z", "+00:00"))
            except ValueError as e:
                logger.error(f"Invalid expiration date format in database: {e}")
                raise HTTPException(status_code=500, detail="Invalid expiration date format in database")

        elif not isinstance(expiration_date, datetime):
            logger.error("Unexpected expiration_date format in DB.")
            raise HTTPException(status_code=500, detail="Unexpected expiration date format in database")

        # Ensure comparison is timezone-aware
        expiration_date = expiration_date.astimezone(timezone.utc)
        current_time = datetime.now(timezone.utc)
        # Compare expiration time with the current time (UTC)
        if current_time > expiration_date:
            logger.info(f"URL '{short_code}' has expired.")  # Debugging log
            collection.delete_one({"short_code": short_code})  # Delete expired URL
            raise HTTPException(status_code=410, detail="URL has expired")


        
   
    return RedirectResponse(url_data["long_url"])
