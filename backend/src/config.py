import os
from dotenv import load_dotenv
load_dotenv()

from typing import Optional

# Load environment variables from .env file


class Config:
    """
    Configuration class to manage application settings
    """
    # Qdrant Configuration

    QDRANT_URL: str = os.getenv("QDRANT_URL")
    QDRANT_API_KEY: Optional[str] = os.getenv("QDRANT_API_KEY")
    QDRANT_COLLECTION_NAME: str = os.getenv("QDRANT_COLLECTION_NAME", "book_content")

    # Google Gemini Configuration
    GOOGLE_GEMINI_API_KEY: Optional[str] = os.getenv("GOOGLE_GEMINI_API_KEY")
    GEMINI_MODEL_NAME: str = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")

    # Application Configuration
    APP_NAME: str = os.getenv("APP_NAME", "Book RAG Chatbot API")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS Configuration for GitHub Pages
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://your-username.github.io")
    CORS_ORIGINS: list = ["*"]

    # Model and Processing Configuration
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))

    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rag_chatbot.db")

    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "app.log")

    @classmethod
    def validate(cls) -> list:
        """
        Validate required configuration settings
        Returns a list of missing required environment variables
        """
        missing_vars = []

        if not cls.GOOGLE_GEMINI_API_KEY:
            missing_vars.append("GOOGLE_GEMINI_API_KEY")

        return missing_vars

# Create a global config instance
config_main = Config()


# Validate configuration on import
missing_vars = config_main.validate()
if missing_vars:
    print(f"Warning: Missing required environment variables: {', '.join(missing_vars)}")

# Example usage:
if __name__ == "__main__":
    print(f"App: {config_main.APP_NAME} v{config_main.APP_VERSION}")
    print(f"Qdrant URL: {config_main.QDRANT_URL}")
    print(f"Frontend URL: {config_main.FRONTEND_URL}")
    print(f"Debug mode: {config_main.DEBUG}")
    print(f"Missing required vars: {config_main.validate()}")