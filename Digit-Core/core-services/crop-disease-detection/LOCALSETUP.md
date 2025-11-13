# Local Setup Guide

This guide will help you set up the Crop Disease Detection Service on your local machine for development and testing.

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)
- Git

## Step-by-Step Setup

### 1. Clone the Repository

```bash
cd /path/to/core-services
cd crop-disease-detection
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Prepare Model Directory

```bash
mkdir -p src/models
```

**Note**: The service will work without a trained model by using dummy predictions. To use a real model:

1. Train or download a crop disease detection model
2. Save it as `src/models/crop_disease_model.h5`
3. Ensure the model accepts 224x224 RGB images

### 5. Configure the Service

Edit `src/Config.py` if you need to customize:
- Model paths
- Image size
- Confidence thresholds
- Supported crops
- Disease categories

### 6. Run the Service

```bash
cd src
python Controller.py
```

The service will start on `http://localhost:8080`

### 7. Test the Service

#### Health Check
```bash
curl http://localhost:8080/crop-disease/health
```

#### Disease Detection Test

Create a test script `test_service.py`:

```python
import requests
import base64

# Read an image file
with open('test_crop_image.jpg', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')

# Test disease detection
response = requests.post(
    'http://localhost:8080/crop-disease/detect',
    json={
        'image': image_data,
        'crop_type': 'tomato'
    }
)

print("Detection Result:")
print(response.json())

# Test disease info
response = requests.post(
    'http://localhost:8080/crop-disease/info',
    json={
        'disease_name': 'Early_blight',
        'crop_type': 'tomato'
    }
)

print("\nDisease Info:")
print(response.json())
```

Run the test:
```bash
python test_service.py
```

## Development Tips

### Hot Reload

For development with auto-reload on code changes:

```python
# In Controller.py, change the last line to:
controller.run(host='0.0.0.0', port=8080, debug=True)
```

### Using Different Port

```python
# In Controller.py:
controller.run(host='0.0.0.0', port=8081, debug=True)
```

### Environment Variables

Create a `.env` file for configuration:

```bash
FLASK_ENV=development
MODEL_PATH=./models/
PORT=8080
```

Load in your code:
```python
from dotenv import load_dotenv
load_dotenv()
```

## Troubleshooting

### Import Errors

If you get import errors:
```bash
# Make sure you're in the virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### TensorFlow Issues

If TensorFlow installation fails:
```bash
# For macOS with Apple Silicon:
pip install tensorflow-macos
pip install tensorflow-metal

# For older systems, use CPU-only version:
pip install tensorflow-cpu
```

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Model Loading Issues

- Ensure model file exists at `src/models/crop_disease_model.h5`
- Check model format is compatible with TensorFlow/Keras
- Verify model input shape matches IMAGE_SIZE in Config.py

## Docker Setup (Alternative)

### Build and Run with Docker

```bash
# Build image
docker build -t crop-disease-detection:dev .

# Run container
docker run -p 8080:8080 crop-disease-detection:dev

# Run with volume mount for development
docker run -p 8080:8080 \
  -v $(pwd)/src:/code \
  crop-disease-detection:dev
```

## Next Steps

1. Add your trained model to `src/models/`
2. Customize disease categories in `Config.py`
3. Add more treatment recommendations
4. Integrate with other DIGIT services
5. Set up logging and monitoring

## Resources

- [TensorFlow Documentation](https://www.tensorflow.org/api_docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease)
- [DIGIT Platform Documentation](https://core.digit.org/)
