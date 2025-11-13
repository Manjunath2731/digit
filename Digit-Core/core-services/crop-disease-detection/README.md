# Crop Disease Detection Service

AI-powered service for detecting crop diseases from images using deep learning models. This service provides real-time disease detection, severity assessment, and treatment recommendations for various crops.

## Features

- **Disease Detection**: Identify crop diseases from uploaded images
- **Multi-Crop Support**: Supports multiple crop types (tomato, potato, corn, rice, wheat, etc.)
- **Confidence Scoring**: Provides confidence levels for predictions
- **Severity Assessment**: Categorizes disease severity (low, medium, high, critical)
- **Treatment Recommendations**: Offers actionable treatment and prevention advice
- **RESTful API**: Easy integration with other services

## Supported Crops

- Tomato
- Potato
- Corn (Maize)
- Rice
- Wheat
- Cotton
- Apple
- Grape
- Pepper
- Strawberry

## Service Dependencies

- TensorFlow/Keras for deep learning inference
- Flask for REST API
- PIL/OpenCV for image processing

## API Endpoints

### 1. Disease Detection

**Endpoint**: `POST /crop-disease/detect`

Detects crop disease from an uploaded image.

**Request Body**:
```json
{
  "image": "base64_encoded_image_string",
  "crop_type": "tomato"
}
```

**Response**:
```json
{
  "status": "success",
  "disease_detected": "Early_blight",
  "confidence": 0.8542,
  "crop_type": "tomato",
  "severity": "medium",
  "recommendations": {
    "description": "Fungal disease causing brown spots with concentric rings",
    "treatment": [
      "Apply fungicides containing chlorothalonil or mancozeb",
      "Remove infected leaves",
      "Mulch around plants"
    ],
    "prevention": [
      "Rotate crops annually",
      "Water at base of plants",
      "Ensure good drainage"
    ]
  }
}
```

### 2. Disease Information

**Endpoint**: `POST /crop-disease/info`

Get detailed information about a specific disease.

**Request Body**:
```json
{
  "disease_name": "Late_blight",
  "crop_type": "potato"
}
```

**Response**:
```json
{
  "status": "success",
  "disease_info": {
    "disease_name": "Late_blight",
    "crop_type": "potato",
    "description": "Serious fungal disease that can destroy entire crops",
    "treatment": [...],
    "prevention": [...],
    "severity_info": {...}
  }
}
```

### 3. Health Check

**Endpoint**: `GET /crop-disease/health`

Check service health status.

**Response**:
```json
{
  "status": "healthy",
  "service": "crop-disease-detection"
}
```

## Setup and Installation

### Local Development

1. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

2. **Prepare Model** (Optional):
   - Place your trained model file in `src/models/crop_disease_model.h5`
   - If no model is available, the service will use dummy predictions for testing

3. **Run the Service**:
```bash
cd src
python Controller.py
```

The service will start on `http://localhost:8080`

### Docker Deployment

1. **Build Docker Image**:
```bash
docker build -t crop-disease-detection:latest .
```

2. **Run Container**:
```bash
docker run -p 8080:8080 crop-disease-detection:latest
```

### Kubernetes Deployment

Create a deployment YAML file following the pattern of other services in the core-services directory.

## Model Information

The service is designed to work with TensorFlow/Keras models trained on crop disease datasets. 

### Model Requirements:
- Input: RGB images (224x224 pixels)
- Output: Softmax probabilities for disease classes
- Format: HDF5 (.h5) or SavedModel format

### Training Your Own Model:
You can train custom models using datasets like:
- PlantVillage Dataset
- Crop Disease Dataset from Kaggle
- Custom agricultural datasets

Place the trained model in `src/models/crop_disease_model.h5`

## Configuration

Edit `src/Config.py` to customize:
- Model paths and parameters
- Image preprocessing settings
- Confidence thresholds
- Supported crops and diseases
- Treatment recommendations

## Testing

### Using cURL:

```bash
# Health check
curl http://localhost:8080/crop-disease/health

# Disease detection (with base64 encoded image)
curl -X POST http://localhost:8080/crop-disease/detect \
  -H "Content-Type: application/json" \
  -d '{
    "image": "base64_encoded_image_here",
    "crop_type": "tomato"
  }'
```

### Using Python:

```python
import requests
import base64

# Read and encode image
with open('crop_image.jpg', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')

# Make request
response = requests.post(
    'http://localhost:8080/crop-disease/detect',
    json={
        'image': image_data,
        'crop_type': 'tomato'
    }
)

print(response.json())
```

## Performance Considerations

- **Image Size**: Images are automatically resized to 224x224 pixels
- **Batch Processing**: For multiple images, send separate requests or implement batch endpoint
- **Model Loading**: Model is loaded once at startup and cached in memory
- **Response Time**: Typical response time is 100-500ms depending on hardware

## Future Enhancements

- [ ] Support for batch image processing
- [ ] Integration with weather data for better predictions
- [ ] Historical disease tracking
- [ ] Multi-language support for recommendations
- [ ] Mobile app integration
- [ ] Real-time monitoring dashboard

## Contributing

Follow the standard contribution guidelines for the DIGIT platform.

## License

Licensed under the same terms as the DIGIT platform.

## Support

For issues and questions, please refer to the DIGIT platform documentation or raise an issue in the repository.
