from pydantic import BaseModel, HttpUrl, ValidationError
from typing import Optional
from datetime import datetime

class URLRequest(BaseModel):
    long_url:HttpUrl
    custom_alias: Optional[str] = None
    expiration_date: Optional[datetime] = None
    
    def __init__(self, **data):
        super().__init__(**data)
        # Ensure that long_url is processed as a string
        self.long_url = str(self.long_url)  # Ensure it's in string format for further operations

    
class URLEditRequest(BaseModel):
    # long_url:HttpUrl
    custom_alias: Optional[str] = None
    expiration_date: Optional[datetime] = None
    
    

# # Test with your URL
# try:
#     test_data = URLRequest(
#         long_url="https://youtu.be/nxD_l4nRJLI?si=pC0-wgT4JzTFgjTZ",
#         custom_alias="shoncititok",
#         expiration_date="2025-03-25T18:04:00.000Z"
#     )
#     print("Validation Successful:", test_data)
# except ValidationError as e:
#     print("Validation Error:", e)