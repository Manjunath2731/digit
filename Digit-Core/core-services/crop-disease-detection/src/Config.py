########### MODEL CONFIGURATION #####################

# Model paths
MODEL_PATH = './models/'
DISEASE_MODEL_FILE = 'crop_disease_model.h5'

# Image preprocessing settings
IMAGE_SIZE = (224, 224)
IMAGE_CHANNELS = 3

# Confidence threshold for disease detection
CONFIDENCE_THRESHOLD = 0.6

# Supported crop types
SUPPORTED_CROPS = [
    'tomato',
    'potato',
    'corn',
    'rice',
    'wheat',
    'cotton',
    'apple',
    'grape',
    'pepper',
    'strawberry'
]

########### DISEASE CATEGORIES #####################

DISEASE_CATEGORIES = {
    'tomato': [
        'Bacterial_spot',
        'Early_blight',
        'Late_blight',
        'Leaf_Mold',
        'Septoria_leaf_spot',
        'Spider_mites',
        'Target_Spot',
        'Yellow_Leaf_Curl_Virus',
        'Mosaic_virus',
        'Healthy'
    ],
    'potato': [
        'Early_blight',
        'Late_blight',
        'Healthy'
    ],
    'corn': [
        'Cercospora_leaf_spot',
        'Common_rust',
        'Northern_Leaf_Blight',
        'Healthy'
    ],
    'rice': [
        'Bacterial_leaf_blight',
        'Brown_spot',
        'Leaf_smut',
        'Healthy'
    ]
}

########### TREATMENT RECOMMENDATIONS #####################

TREATMENT_RECOMMENDATIONS = {
    'Bacterial_spot': {
        'description': 'Bacterial disease causing dark spots on leaves and fruits',
        'treatment': [
            'Remove and destroy infected plant parts',
            'Apply copper-based bactericides',
            'Improve air circulation',
            'Avoid overhead watering'
        ],
        'prevention': [
            'Use disease-free seeds',
            'Rotate crops',
            'Maintain proper plant spacing'
        ]
    },
    'Early_blight': {
        'description': 'Fungal disease causing brown spots with concentric rings',
        'treatment': [
            'Apply fungicides containing chlorothalonil or mancozeb',
            'Remove infected leaves',
            'Mulch around plants'
        ],
        'prevention': [
            'Rotate crops annually',
            'Water at base of plants',
            'Ensure good drainage'
        ]
    },
    'Late_blight': {
        'description': 'Serious fungal disease that can destroy entire crops',
        'treatment': [
            'Apply fungicides immediately',
            'Remove and destroy infected plants',
            'Improve air circulation'
        ],
        'prevention': [
            'Use resistant varieties',
            'Avoid overhead irrigation',
            'Monitor weather conditions'
        ]
    },
    'Healthy': {
        'description': 'Plant appears healthy with no visible disease symptoms',
        'treatment': [
            'Continue regular monitoring',
            'Maintain good cultural practices'
        ],
        'prevention': [
            'Regular inspection',
            'Proper nutrition and watering',
            'Good sanitation practices'
        ]
    }
}

########### SEVERITY LEVELS #####################

SEVERITY_LEVELS = {
    'low': 'Minor infection, early intervention recommended',
    'medium': 'Moderate infection, immediate treatment required',
    'high': 'Severe infection, aggressive treatment necessary',
    'critical': 'Critical infection, consider removing affected plants'
}

########### EXTERNAL SERVICE CONFIGURATION #####################

# MDMS Service (if needed for master data)
MDMS_HOST = 'http://egov-mdms-service.egov:8080/'
MDMS_SEARCH_URL = 'egov-mdms-service/v1/_search'

# Default tenant configuration
DEFAULT_TENANT = 'pb'
