from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage
import base64
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(
    title="CraftVista - AI-Powered Artisan Marketplace",
    description="Empowering Indian artisans with AI-powered storytelling and multilingual support",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# AI Chat Client
def get_ai_client():
    return LlmChat(
        api_key=os.environ.get('EMERGENT_LLM_KEY'),
        session_id=str(uuid.uuid4()),
        system_message="You are CraftVista AI, an expert assistant for Indian artisans. You help create compelling product descriptions, suggest pricing, provide cultural context, and craft engaging stories about handmade crafts. You understand traditional Indian crafts like pottery, textiles, metalwork, jewelry, woodwork, and regional specialties."
    ).with_model("gemini", "gemini-2.0-flash")

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "artisan"  # artisan or buyer
    profile: Optional[Dict] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    artisan_id: str
    title: str
    description: str
    price: float
    category: str
    materials: List[str] = []
    techniques: List[str] = []
    story: Optional[str] = None
    cultural_context: Optional[str] = None
    images: List[str] = []
    translations: Dict[str, Dict] = {}  # {lang: {title, description, story}}
    ai_generated: Dict[str, bool] = {}  # Track what was AI-generated
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductUpload(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: str
    materials: List[str] = []
    price: Optional[float] = None
    voice_note: Optional[str] = None  # Base64 encoded audio

class AIContentRequest(BaseModel):
    description: str
    category: str
    materials: List[str] = []
    artisan_name: Optional[str] = None

class StoryRequest(BaseModel):
    product_title: str
    description: str
    category: str
    materials: List[str] = []
    artisan_name: Optional[str] = None
    voice_input: Optional[str] = None

class TranslationRequest(BaseModel):
    text: str
    target_language: str
    content_type: str = "general"

# AI Services
class AIContentGenerator:
    def __init__(self):
        self.client = get_ai_client()
    
    async def generate_product_content(self, request: AIContentRequest) -> Dict[str, Any]:
        """Generate comprehensive product content using AI"""
        prompt = f"""
        As an expert in Indian handicrafts, generate comprehensive product information for this item:
        
        Description: {request.description}
        Category: {request.category}
        Materials: {', '.join(request.materials)}
        Artisan: {request.artisan_name or 'Traditional artisan'}
        
        Please provide:
        1. TITLE: Compelling, SEO-friendly product title (50-80 characters)
        2. DESCRIPTION: Detailed, engaging product description (150-300 words)
        3. PRICE_SUGGESTION: Fair price in INR based on materials, complexity, and market standards
        4. CULTURAL_CONTEXT: 2-3 sentences about the cultural significance and traditional techniques
        5. KEYWORDS: 5-8 relevant keywords for search optimization
        
        Format as JSON with keys: title, description, price_suggestion, cultural_context, keywords
        """
        
        try:
            message = UserMessage(text=prompt)
            response = await self.client.send_message(message)
            
            # Extract JSON from response
            response_text = response.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            return json.loads(response_text)
        except Exception as e:
            logging.error(f"AI content generation error: {e}")
            return {
                "title": f"Handcrafted {request.category}",
                "description": request.description,
                "price_suggestion": 500.0,
                "cultural_context": "A beautiful traditional Indian craft.",
                "keywords": [request.category, "handmade", "traditional"]
            }
    
    async def generate_story(self, request: StoryRequest) -> str:
        """Generate engaging product story"""
        prompt = f"""
        Create an engaging, emotional story about this handcrafted product that connects buyers with the artisan's skill and cultural heritage:
        
        Product: {request.product_title}
        Description: {request.description}
        Category: {request.category}
        Materials: {', '.join(request.materials)}
        Artisan: {request.artisan_name or 'A skilled artisan'}
        
        Write a compelling 2-3 paragraph story that:
        - Highlights the artisan's skill and dedication
        - Explains the traditional techniques used
        - Connects the piece to Indian cultural heritage
        - Creates emotional connection with potential buyers
        - Uses vivid, descriptive language
        
        Keep it authentic, respectful, and engaging (150-250 words).
        """
        
        try:
            message = UserMessage(text=prompt)
            response = await self.client.send_message(message)
            return response.strip()
        except Exception as e:
            logging.error(f"AI story generation error: {e}")
            return f"This beautiful {request.category} represents the timeless artistry of Indian craftsmanship, created with love and traditional techniques passed down through generations."

class TranslationService:
    def __init__(self):
        self.client = get_ai_client()
        self.language_names = {
            'hi': 'Hindi',
            'ta': 'Tamil', 
            'te': 'Telugu',
            'kn': 'Kannada',
            'ml': 'Malayalam',
            'bn': 'Bengali',
            'gu': 'Gujarati',
            'mr': 'Marathi'
        }
    
    async def translate_text(self, request: TranslationRequest) -> Dict[str, str]:
        """Translate text to target language"""
        target_lang_name = self.language_names.get(request.target_language, request.target_language)
        
        prompt = f"""
        Translate the following {request.content_type} text to {target_lang_name}.
        Preserve cultural context and craft terminology. Keep the meaning authentic.
        
        Text: {request.text}
        
        Provide only the translation, no additional text.
        """
        
        try:
            message = UserMessage(text=prompt)
            response = await self.client.send_message(message)
            return {
                "translated_text": response.strip(),
                "target_language": request.target_language
            }
        except Exception as e:
            logging.error(f"Translation error: {e}")
            return {
                "translated_text": request.text,
                "target_language": request.target_language
            }

# Initialize services
ai_generator = AIContentGenerator()
translator = TranslationService()

# Auth helpers
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user"""
    # For MVP, we'll use a simple token validation
    # In production, this would validate the JWT token from Google OAuth
    token = credentials.credentials
    
    # Mock user for development - replace with real OAuth validation
    user_data = {
        "id": "user_123",
        "email": "artisan@example.com",
        "name": "Test Artisan",
        "role": "artisan"
    }
    return User(**user_data)

# API Endpoints

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CraftVista API"}

# User Management
@api_router.post("/auth/google", response_model=User)
async def google_auth(token: str = Form(...)):
    """Handle Google OAuth authentication"""
    # For MVP - mock implementation
    # In production, validate Google token and create/get user
    user_data = {
        "email": "artisan@craftvista.com",
        "name": "Sample Artisan",
        "picture": "https://images.unsplash.com/photo-1611574557783-9a50bb34e9f5",
        "role": "artisan"
    }
    
    user = User(**user_data)
    
    # Store in database
    await db.users.update_one(
        {"email": user.email},
        {"$set": user.dict()},
        upsert=True
    )
    
    return user

@api_router.get("/users/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# Product Management
@api_router.post("/products/upload", response_model=Dict[str, Any])
async def upload_product(
    upload_data: ProductUpload,
    current_user: User = Depends(get_current_user)
):
    """Upload and process product with AI assistance"""
    
    # Generate AI content if needed
    content_request = AIContentRequest(
        description=upload_data.description or "Beautiful handcrafted item",
        category=upload_data.category,
        materials=upload_data.materials,
        artisan_name=current_user.name
    )
    
    ai_content = await ai_generator.generate_product_content(content_request)
    
    # Create product
    product = Product(
        artisan_id=current_user.id,
        title=upload_data.title or ai_content.get("title", f"Handcrafted {upload_data.category}"),
        description=upload_data.description or ai_content.get("description", "Beautiful handcrafted item"),
        price=upload_data.price or ai_content.get("price_suggestion", 500.0),
        category=upload_data.category,
        materials=upload_data.materials,
        cultural_context=ai_content.get("cultural_context"),
        ai_generated={
            "title": not upload_data.title,
            "description": not upload_data.description,
            "price": not upload_data.price,
            "cultural_context": True
        }
    )
    
    # Save to database
    await db.products.insert_one(product.dict())
    
    return {
        "product": product.dict(),
        "ai_suggestions": ai_content,
        "message": "Product uploaded successfully"
    }

@api_router.post("/products/{product_id}/story")
async def generate_product_story(
    product_id: str,
    story_request: StoryRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate AI-powered story for product"""
    
    story = await ai_generator.generate_story(story_request)
    
    # Update product with story
    await db.products.update_one(
        {"id": product_id, "artisan_id": current_user.id},
        {"$set": {"story": story, "ai_generated.story": True}}
    )
    
    return {"story": story}

@api_router.post("/products/{product_id}/translate")
async def translate_product(
    product_id: str,
    translation_request: TranslationRequest,
    current_user: User = Depends(get_current_user)
):
    """Translate product content"""
    
    # Get product
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    translation = await translator.translate_text(translation_request)
    
    # Update product translations
    lang = translation_request.target_language
    content_type = translation_request.content_type
    
    translations_update = {
        f"translations.{lang}.{content_type}": translation["translated_text"]
    }
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": translations_update}
    )
    
    return translation

@api_router.get("/products", response_model=List[Dict])
async def get_marketplace_products(
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """Get products for marketplace"""
    
    query = {}
    if category:
        query["category"] = category
    
    products = await db.products.find(query).skip(offset).limit(limit).to_list(length=limit)
    
    # Add artisan information
    for product in products:
        artisan = await db.users.find_one({"id": product["artisan_id"]})
        if artisan:
            product["artisan"] = {
                "name": artisan["name"],
                "picture": artisan.get("picture")
            }
    
    return products

@api_router.get("/products/{product_id}", response_model=Dict)
async def get_product_detail(product_id: str):
    """Get detailed product information"""
    
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Add artisan information
    artisan = await db.users.find_one({"id": product["artisan_id"]})
    if artisan:
        product["artisan"] = {
            "name": artisan["name"],
            "picture": artisan.get("picture"),
            "profile": artisan.get("profile", {})
        }
    
    return product

@api_router.get("/categories")
async def get_categories():
    """Get available product categories"""
    return {
        "categories": [
            {"id": "pottery", "name": "Pottery & Ceramics", "icon": "🏺"},
            {"id": "textiles", "name": "Textiles & Fabrics", "icon": "🧵"},
            {"id": "jewelry", "name": "Jewelry & Accessories", "icon": "💍"},
            {"id": "woodwork", "name": "Woodwork & Furniture", "icon": "🪵"},
            {"id": "metalwork", "name": "Metalwork & Sculptures", "icon": "⚒️"},
            {"id": "paintings", "name": "Paintings & Art", "icon": "🎨"},
            {"id": "leather", "name": "Leather Crafts", "icon": "👜"},
            {"id": "stone", "name": "Stone & Marble Work", "icon": "🪨"}
        ]
    }

@api_router.get("/languages")
async def get_supported_languages():
    """Get supported languages for translation"""
    return {
        "languages": [
            {"code": "en", "name": "English", "native": "English"},
            {"code": "hi", "name": "Hindi", "native": "हिन्दी"},
            {"code": "ta", "name": "Tamil", "native": "தமிழ்"},
            {"code": "te", "name": "Telugu", "native": "తెలుగు"},
            {"code": "kn", "name": "Kannada", "native": "ಕನ್ನಡ"},
            {"code": "ml", "name": "Malayalam", "native": "മലയാളം"},
            {"code": "bn", "name": "Bengali", "native": "বাংলা"},
            {"code": "gu", "name": "Gujarati", "native": "ગુજરાતી"},
            {"code": "mr", "name": "Marathi", "native": "मराठी"}
        ]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()