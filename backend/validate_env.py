"""
Environment Variable Validator
Validates all required environment variables at application startup
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Required environment variables
REQUIRED_ENV_VARS = {
    "JWT_SECRET_KEY": {
        "min_length": 32,
        "description": "JWT secret key for token signing"
    },
    "MONGODB_URL_KEY": {
        "min_length": 10,
        "description": "MongoDB connection URL"
    },
    "GOOGLE_API_KEY": {
        "min_length": 20,
        "description": "Google API key for Gemini"
    },
    "MONGODB_DATABASE_NAME": {
        "min_length": 1,
        "description": "MongoDB database name"
    }
}

def validate_env_vars():
    """Validate all required environment variables"""
    errors = []
    warnings = []
    
    print("🔍 Validating environment variables...")
    
    # Check for missing variables
    missing_vars = []
    for var_name, config in REQUIRED_ENV_VARS.items():
        value = os.getenv(var_name)
        
        if not value:
            missing_vars.append(var_name)
            errors.append(f"❌ {var_name} is not set - {config['description']}")
        elif len(value) < config.get('min_length', 1):
            errors.append(
                f"❌ {var_name} is too short "
                f"(min {config['min_length']} characters) - {config['description']}"
            )
        else:
            # Mask sensitive values in output
            masked_value = value[:4] + "..." + value[-4:] if len(value) > 8 else "***"
            print(f"  ✅ {var_name}: {masked_value}")
    
    # Additional validations
    jwt_key = os.getenv("JWT_SECRET_KEY")
    if jwt_key and len(jwt_key) < 64:
        warnings.append(
            f"⚠️  JWT_SECRET_KEY should be at least 64 characters for better security "
            f"(current: {len(jwt_key)} characters)"
        )
    
    # MongoDB URL validation
    mongo_url = os.getenv("MONGODB_URL_KEY")
    if mongo_url and not (mongo_url.startswith("mongodb://") or mongo_url.startswith("mongodb+srv://")):
        errors.append("❌ MONGODB_URL_KEY must start with 'mongodb://' or 'mongodb+srv://'")
    
    # Print warnings
    if warnings:
        print("\n⚠️  Warnings:")
        for warning in warnings:
            print(f"  {warning}")
    
    # Print errors and exit if any
    if errors:
        print("\n❌ Validation failed:\n")
        for error in errors:
            print(f"  {error}")
        print("\n💡 Please check your .env file and set all required variables.")
        sys.exit(1)
    
    print("\n✅ All environment variables validated successfully!\n")
    return True

if __name__ == "__main__":
    validate_env_vars()
