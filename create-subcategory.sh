#!/bin/bash

# Create a simple test image file
echo "Creating test image..."
echo "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" | base64 -d > test_image.gif

# Create subcategory with image upload
echo "Creating subcategory..."
curl -X POST \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODU4NjYyNSwiZXhwIjoxNzU5MTkxNDI1fQ.9zqTP3wswjNF6JBUPM9dTfmkivy5BZK4AcOutacoivc" \
  -F "name=Test Subcategory" \
  -F "description=Test subcategory for aaaa category" \
  -F "categoryId=68d09d14912f2dd98c097770" \
  -F "image=@test_image.gif" \
  http://localhost:8080/api/subcategories

echo -e "\n\nCleaning up..."
rm test_image.gif

echo "Done!"
