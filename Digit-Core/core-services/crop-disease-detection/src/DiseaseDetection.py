import numpy as np
from PIL import Image
import tensorflow as tf
from Config import *
import os

# Global variable to store loaded model
_model = None

def load_model():
    """Load the pre-trained disease detection model"""
    global _model
    
    if _model is None:
        model_path = os.path.join(MODEL_PATH, DISEASE_MODEL_FILE)
        
        # Check if model file exists
        if os.path.exists(model_path):
            try:
                _model = tf.keras.models.load_model(model_path)
                print(f"Model loaded successfully from {model_path}")
            except Exception as e:
                print(f"Error loading model: {e}")
                _model = None
        else:
            print(f"Model file not found at {model_path}")
            print("Using dummy predictions for demonstration")
            _model = None
    
    return _model

def preprocess_image(image):
    """
    Preprocess image for model prediction
    
    Args:
        image: PIL Image object
    
    Returns:
        Preprocessed numpy array
    """
    # Resize image
    image = image.resize(IMAGE_SIZE)
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Convert to numpy array
    img_array = np.array(image)
    
    # Normalize pixel values
    img_array = img_array / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def calculate_severity(confidence, disease_name):
    """
    Calculate disease severity based on confidence and disease type
    
    Args:
        confidence: Prediction confidence
        disease_name: Name of detected disease
    
    Returns:
        Severity level string
    """
    if disease_name.lower() == 'healthy':
        return 'none'
    
    if confidence >= 0.9:
        return 'high'
    elif confidence >= 0.75:
        return 'medium'
    elif confidence >= 0.6:
        return 'low'
    else:
        return 'uncertain'

def detect_disease_from_image(image, crop_type=None):
    """
    Detect disease from crop image
    
    Args:
        image: PIL Image object
        crop_type: Optional crop type specification
    
    Returns:
        Dictionary containing detection results
    """
    # Preprocess image
    processed_image = preprocess_image(image)
    
    # Load model
    model = load_model()
    
    # If model is not available, return dummy prediction
    if model is None:
        return get_dummy_prediction(crop_type)
    
    # Make prediction
    predictions = model.predict(processed_image)
    
    # Get the class with highest probability
    predicted_class_idx = np.argmax(predictions[0])
    confidence = float(predictions[0][predicted_class_idx])
    
    # Determine crop type if not provided
    if crop_type is None:
        crop_type = 'tomato'  # Default crop type
    
    # Get disease categories for the crop
    disease_classes = DISEASE_CATEGORIES.get(crop_type, DISEASE_CATEGORIES['tomato'])
    
    # Get disease name
    if predicted_class_idx < len(disease_classes):
        disease_name = disease_classes[predicted_class_idx]
    else:
        disease_name = 'Unknown'
    
    # Calculate severity
    severity = calculate_severity(confidence, disease_name)
    
    # Get recommendations
    recommendations = get_treatment_recommendations(disease_name)
    
    return {
        'disease_name': disease_name,
        'confidence': round(confidence, 4),
        'crop_type': crop_type,
        'severity': severity,
        'recommendations': recommendations
    }

def get_dummy_prediction(crop_type=None):
    """
    Return dummy prediction when model is not available
    This is useful for testing and development
    """
    if crop_type is None:
        crop_type = 'tomato'
    
    dummy_diseases = {
        'tomato': 'Early_blight',
        'potato': 'Late_blight',
        'corn': 'Common_rust',
        'rice': 'Brown_spot'
    }
    
    disease_name = dummy_diseases.get(crop_type, 'Early_blight')
    confidence = 0.85
    severity = 'medium'
    recommendations = get_treatment_recommendations(disease_name)
    
    return {
        'disease_name': disease_name,
        'confidence': confidence,
        'crop_type': crop_type,
        'severity': severity,
        'recommendations': recommendations,
        'note': 'This is a dummy prediction. Model not loaded.'
    }

def get_treatment_recommendations(disease_name):
    """
    Get treatment recommendations for a disease
    
    Args:
        disease_name: Name of the disease
    
    Returns:
        Dictionary containing treatment information
    """
    return TREATMENT_RECOMMENDATIONS.get(
        disease_name,
        {
            'description': 'Disease information not available',
            'treatment': ['Consult agricultural expert'],
            'prevention': ['Follow general crop management practices']
        }
    )

def get_disease_info(disease_name, crop_type=None):
    """
    Get detailed information about a specific disease
    
    Args:
        disease_name: Name of the disease
        crop_type: Optional crop type
    
    Returns:
        Dictionary containing disease information
    """
    recommendations = get_treatment_recommendations(disease_name)
    
    return {
        'disease_name': disease_name,
        'crop_type': crop_type,
        'description': recommendations.get('description', 'No description available'),
        'treatment': recommendations.get('treatment', []),
        'prevention': recommendations.get('prevention', []),
        'severity_info': SEVERITY_LEVELS
    }
