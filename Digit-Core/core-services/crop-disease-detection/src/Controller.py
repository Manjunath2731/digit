from flask import Flask, jsonify, request
from DiseaseDetection import detect_disease_from_image, get_disease_info
from Config import *
import base64
import io
from PIL import Image

controller = Flask(__name__)

@controller.route('/crop-disease/detect', methods=['POST'])
def detect_disease():
    """
    Detect crop disease from uploaded image
    Expected payload: {
        "image": "base64_encoded_image",
        "crop_type": "optional_crop_type"
    }
    """
    try:
        request_data = request.get_json()
        
        if 'image' not in request_data:
            return jsonify({
                'error': 'No image provided',
                'status': 'failed'
            }), 400
        
        # Decode base64 image
        image_data = base64.b64decode(request_data['image'])
        image = Image.open(io.BytesIO(image_data))
        
        crop_type = request_data.get('crop_type', None)
        
        # Detect disease
        detection_result = detect_disease_from_image(image, crop_type)
        
        response = {
            'status': 'success',
            'disease_detected': detection_result['disease_name'],
            'confidence': detection_result['confidence'],
            'crop_type': detection_result['crop_type'],
            'severity': detection_result['severity'],
            'recommendations': detection_result['recommendations']
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500

@controller.route('/crop-disease/info', methods=['POST'])
def get_disease_details():
    """
    Get detailed information about a specific disease
    Expected payload: {
        "disease_name": "disease_name",
        "crop_type": "crop_type"
    }
    """
    try:
        request_data = request.get_json()
        
        if 'disease_name' not in request_data:
            return jsonify({
                'error': 'Disease name not provided',
                'status': 'failed'
            }), 400
        
        disease_name = request_data['disease_name']
        crop_type = request_data.get('crop_type', None)
        
        disease_info = get_disease_info(disease_name, crop_type)
        
        return jsonify({
            'status': 'success',
            'disease_info': disease_info
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500

@controller.route('/crop-disease/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'crop-disease-detection'
    })

if __name__ == '__main__':
    controller.run(host='0.0.0.0', port=8080, debug=False)
