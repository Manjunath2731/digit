# Changelog

All notable changes to the Crop Disease Detection Service will be documented in this file.

## [1.0.0] - 2025-11-09

### Added
- Initial release of crop disease detection service
- Disease detection from images using deep learning
- Support for multiple crop types (tomato, potato, corn, rice)
- Confidence scoring and severity assessment
- Treatment and prevention recommendations
- RESTful API with Flask
- Docker containerization
- Health check endpoint
- Comprehensive documentation

### Features
- POST /crop-disease/detect - Detect disease from image
- POST /crop-disease/info - Get disease information
- GET /crop-disease/health - Health check endpoint

### Supported Diseases
- Tomato: Bacterial spot, Early blight, Late blight, Leaf mold, and more
- Potato: Early blight, Late blight
- Corn: Cercospora leaf spot, Common rust, Northern Leaf Blight
- Rice: Bacterial leaf blight, Brown spot, Leaf smut
