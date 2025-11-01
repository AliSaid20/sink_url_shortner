from pymongo import MongoClient, ASCENDING
import os
from dotenv import load_dotenv
from pymongo.errors import ConnectionFailure
import logging

# Load environment variables from .env file
load_dotenv()

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)  # Adjust log level as necessary

# Fetch MongoDB URI from environment variables
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    logger.error("❌ MONGO_URI not found in .env file")
    raise ValueError("❌ MONGO_URI not found in .env file")

# Try to connect to MongoDB
try:
    # Initialize MongoDB client with timeout settings
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=10000)
    
    # Test the connection to MongoDB
    client.admin.command("ping") 
    
    # Get the database and collection
    db = client.get_database("url_shortner")
    collection = db.get_collection("urls")

    # Create index on short_code for uniqueness
    collection.create_index([("short_code", ASCENDING)], unique=True)

    logger.info("✅ Connected to MongoDB successfully!")

except ConnectionFailure:
    logger.error("❌ Failed to connect to MongoDB. Check if the server is running.")
    raise
except Exception as e:
    logger.error(f"❌ Failed to connect to MongoDB: {e}")