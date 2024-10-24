from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict
import qrcode
import cv2
import numpy as np
import uuid
import os
from pathlib import Path
import ssl

app = FastAPI(title='root app')

# ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# ssl_context.load_cert_chain('ssl/cert.pem', keyfile='ssl/key.pem')

api_app = FastAPI(title='api app')

# Enable CORS
api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directories
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MODEL_DIR = UPLOAD_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)
QR_DIR = UPLOAD_DIR / "qrcodes"
QR_DIR.mkdir(exist_ok=True)
MARKER_DIR = UPLOAD_DIR / "markers"
MARKER_DIR.mkdir(exist_ok=True)

# Storage for file mappings
FILE_STORAGE: Dict[str, dict] = {}

def generate_ar_marker_pattern(image_path: Path, output_path: Path):
    """Generate AR.js marker pattern file from QR code image."""
    # Read the QR code image
    img = cv2.imread(str(image_path))
    
    # Convert to grayscale if not already
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img
    
    # Resize to 64x64 (standard for AR.js patterns)
    marker_size = 64
    resized = cv2.resize(gray, (marker_size, marker_size))
    
    # Normalize values between 0 and 1
    normalized = resized.astype(np.float32) / 255.0
    
    # Write pattern file
    with open(output_path, 'w') as f:
        # Write marker header (required by AR.js)
        f.write("PATT\n")
        
        # Write marker data in all 4 rotations
        for rotation in range(4):
            rotated = np.rot90(normalized, rotation)
            for row in rotated:
                # Convert normalized values back to 0-255 range
                values = [str(int(x * 255)) for x in row]
                f.write(" ".join(values) + "\n")
            f.write("\n")

@api_app.post("/upload/model")
async def upload_model(file: UploadFile = File(...)):
    """Upload a 3D model file and generate QR code and AR marker pattern."""
    if not file.filename.endswith(('.glb', '.gltf')):
        raise HTTPException(400, "Only .glb or .gltf files are supported")
    
    # Generate unique file ID and paths
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    model_filename = f"{file_id}{file_extension}"
    qr_filename = f"{file_id}.png"
    marker_filename = f"{file_id}.patt"
    
    model_path = MODEL_DIR / model_filename
    qr_path = QR_DIR / qr_filename
    marker_path = MARKER_DIR / marker_filename
    
    try:
        # Save the model file
        content = await file.read()
        with model_path.open("wb") as buffer:
            buffer.write(content)
        
        # Generate and save QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(file_id)
        qr.make(fit=True)
        qr_image = qr.make_image(fill_color="black", back_color="white")
        qr_image.save(qr_path)
        
        # Generate AR marker pattern from QR code
        generate_ar_marker_pattern(qr_path, marker_path)
        
        # Store the file mappings
        FILE_STORAGE[file_id] = {
            "model_path": str(model_path),
            "qr_path": str(qr_path),
            "marker_path": str(marker_path)
        }
        
        return {
            "file_id": file_id,
            "message": "Files created successfully"
        }
        
    except Exception as e:
        # Clean up any created files
        model_path.unlink(missing_ok=True)
        qr_path.unlink(missing_ok=True)
        marker_path.unlink(missing_ok=True)
        raise HTTPException(500, f"Failed to process files: {str(e)}")

@api_app.get("/files/{file_id}")
async def get_file_info(file_id: str):
    """Get information about stored files for a given file ID."""
    if file_id not in FILE_STORAGE:
        raise HTTPException(404, "File ID not found")
    return FILE_STORAGE[file_id]

@api_app.get("/model/{file_id}")
async def get_model(file_id: str):
    """Serve the 3D model file."""
    if file_id not in FILE_STORAGE:
        raise HTTPException(404, "File ID not found")
    
    model_path = Path(FILE_STORAGE[file_id]["model_path"])
    if not model_path.exists():
        raise HTTPException(404, "Model file not found")
    
    return FileResponse(
        path=model_path,
        filename=model_path.name,
        media_type="application/octet-stream"
    )

@api_app.get("/qr/{file_id}")
async def get_qr(file_id: str):
    """Serve the QR code image."""
    if file_id not in FILE_STORAGE:
        raise HTTPException(404, "File ID not found")
    
    qr_path = Path(FILE_STORAGE[file_id]["qr_path"])
    if not qr_path.exists():
        raise HTTPException(404, "QR code not found")
    
    return FileResponse(
        path=qr_path,
        filename=qr_path.name,
        media_type="image/png"
    )

@api_app.get("/marker/{file_id}")
async def get_marker(file_id: str):
    """Serve the AR marker pattern file."""
    if file_id not in FILE_STORAGE:
        raise HTTPException(404, "File ID not found")
    
    marker_path = Path(FILE_STORAGE[file_id]["marker_path"])
    if not marker_path.exists():
        raise HTTPException(404, "Marker pattern not found")
    
    return FileResponse(
        path=marker_path,
        filename=marker_path.name,
        media_type="text/plain"
    )
    
app.mount("/api", api_app)

# Serve Frontend

app.mount("/", StaticFiles(directory="static", html=True), name="frontend")
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)