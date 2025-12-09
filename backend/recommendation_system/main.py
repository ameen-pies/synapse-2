from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import logging
from typing import List
import os

from db import db, courses_coll, blogs_coll, forums_coll
from models import RecommendRequest, RecommendResponse, CourseRecommendation
from embeddings import EmbeddingGenerator
from recommender import FAISSRecommender

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="E-Learning Recommendation System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
embedding_gen = None
recommender = None

# Image URLs for topics (fallback)
TOPIC_IMAGES = {
    "AI": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
    "Machine Learning": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
    "Web Development": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
    "Data Science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    "Cloud": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
    "Cybersecurity": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400",
    "default": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400"
}

def get_image_for_content(content: dict) -> str:
    """Get appropriate image URL for content"""
    
    # Your schema: images.cover_image
    if 'images' in content and isinstance(content['images'], dict):
        if 'cover_image' in content['images'] and content['images']['cover_image']:
            cover = content['images']['cover_image']
            # Replace picsum placeholder with real Unsplash images
            if 'picsum.photos' not in cover:
                return cover
    
    # Fallback: try flat 'image' field
    if 'image' in content and content['image']:
        return content['image']
    
    # Match based on category
    category = content.get('category', '').lower()
    category_mapping = {
        'développement web': 'Web Development',
        'design graphique': 'UX/UI',
        'cybersécurité': 'Cybersecurity',
        'intelligence artificielle': 'AI',
        'data science': 'Data Science',
        'cloud': 'Cloud',
        'mobile': 'Mobile'
    }
    
    matched_key = category_mapping.get(category, None)
    if matched_key and matched_key in TOPIC_IMAGES:
        return TOPIC_IMAGES[matched_key]
    
    # Try to match tags
    tags = content.get('tags', [])
    if isinstance(tags, str):
        tags = [tags]
    
    for tag in tags:
        tag_lower = tag.lower()
        if tag_lower in ['deep-learning', 'ml', 'ai']:
            return TOPIC_IMAGES['AI']
        elif tag_lower in ['frontend', 'backend', 'web']:
            return TOPIC_IMAGES['Web Development']
        elif tag_lower in ['cloud', 'aws', 'azure']:
            return TOPIC_IMAGES['Cloud']
        elif tag_lower in ['security', 'cybersecurity']:
            return TOPIC_IMAGES['Cybersecurity']
        elif tag_lower in ['data', 'analytics']:
            return TOPIC_IMAGES['Data Science']
    
    # Check title for keywords
    title = content.get('title', '').lower()
    for key in TOPIC_IMAGES.keys():
        if key.lower() in title:
            return TOPIC_IMAGES[key]
    
    return TOPIC_IMAGES['default']

@app.on_event("startup")
async def startup_event():
    """Initialize recommendation system on startup"""
    global embedding_gen, recommender
    
    try:
        logger.info("Initializing recommendation system...")
        
        # Initialize embedding generator
        embedding_gen = EmbeddingGenerator()
        
        # Load content from MongoDB
        logger.info("Loading content from MongoDB...")
        contents = []
        
        # Load courses - ADD CONTENT_TYPE MARKER
        if courses_coll:
            courses = list(db[courses_coll].find().limit(1000))
            logger.info(f"Loaded {len(courses)} courses")
            # Mark each course with its type
            for course in courses:
                course['content_type'] = 'course'
            contents.extend(courses)
        
        # Load blogs - ADD CONTENT_TYPE MARKER
        if blogs_coll:
            blogs = list(db[blogs_coll].find().limit(1000))
            logger.info(f"Loaded {len(blogs)} blogs")
            # Mark each blog with its type
            for blog in blogs:
                blog['content_type'] = 'blog'
            contents.extend(blogs)
        
        # Load forums - ADD CONTENT_TYPE MARKER
        if forums_coll:
            forums = list(db[forums_coll].find().limit(500))
            logger.info(f"Loaded {len(forums)} forum posts")
            # Mark each forum with its type
            for forum in forums:
                forum['content_type'] = 'forum'
            contents.extend(forums)
        
        if not contents:
            logger.warning("No content found in database. Using sample data.")
            contents = create_sample_data()
        
        # Initialize recommender
        recommender = FAISSRecommender(embedding_gen)
        recommender.build_index(contents)
        
        logger.info("Recommendation system initialized successfully!")
        
    except Exception as e:
        logger.error(f"Error initializing recommendation system: {e}")
        raise

def create_sample_data() -> List[dict]:
    """Create sample data if database is empty"""
    return [
        {"title": "Introduction to Machine Learning", "description": "Learn ML basics", "topics": ["AI", "Machine Learning"], "category": "Course", "content_type": "course"},
        {"title": "Deep Learning Specialization", "description": "Advanced neural networks", "topics": ["AI", "Deep Learning"], "category": "Course", "content_type": "course"},
        {"title": "Web Development Bootcamp", "description": "Full stack development", "topics": ["Web Development", "Full Stack"], "category": "Course", "content_type": "course"},
        {"title": "React Complete Guide", "description": "Master React framework", "topics": ["Web Development", "React"], "category": "Course", "content_type": "course"},
        {"title": "Data Science with Python", "description": "Python for data analysis", "topics": ["Data Science", "Python"], "category": "Course", "content_type": "course"},
        {"title": "AWS Cloud Practitioner", "description": "AWS fundamentals", "topics": ["Cloud", "AWS"], "category": "Course", "content_type": "course"},
        {"title": "Cybersecurity Basics", "description": "Network security essentials", "topics": ["Cybersecurity"], "category": "Course", "content_type": "course"},
        {"title": "NLP with Transformers", "description": "Natural language processing", "topics": ["AI", "NLP"], "category": "Course", "content_type": "course"},
        {"title": "Docker and Kubernetes", "description": "Container orchestration", "topics": ["DevOps", "Cloud"], "category": "Course", "content_type": "course"},
        {"title": "UI/UX Design Principles", "description": "User interface design", "topics": ["UX/UI", "Design"], "category": "Course", "content_type": "course"}
    ]

@app.get("/")
async def root():
    """Serve index.html"""
    return FileResponse("frontend/index.html")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "index_trained": recommender.is_trained if recommender else False,
        "total_content": recommender.index.ntotal if recommender and recommender.index else 0
    }

@app.post("/api/recommend")
async def recommend(request: RecommendRequest):
    """Generate content recommendations based on user topics"""
    try:
        if not recommender or not recommender.is_trained:
            raise HTTPException(status_code=503, detail="Recommendation system not ready")
        
        if not request.topics:
            raise HTTPException(status_code=400, detail="No topics provided")
        
        logger.info(f"Generating recommendations for topics: {request.topics}")
        
        # Get recommendations
        results = recommender.search(request.topics, k=request.limit)
        
        # Format response - NOW INCLUDING CONTENT_TYPE AND EXTRA FIELDS
        recommendations = []
        type_counts = {"course": 0, "blog": 0, "forum": 0, "other": 0}
        for content, score in results:
            # Extract description
            desc = content.get('description', 'No description available')
            if len(desc) > 200:
                desc = desc[:197] + '...'
            
            # Extract primary topic/tag
            topic = 'General'
            if 'category' in content:
                topic = content['category']
            elif 'tags' in content and content['tags']:
                topic = content['tags'][0] if isinstance(content['tags'], list) else content['tags']
            elif 'labels' in content and content['labels']:
                topic = content['labels'][0] if isinstance(content['labels'], list) else content['labels']
            
            # Base fields that match the Pydantic model
            rec = CourseRecommendation(
                title=content.get('title', 'Untitled Course'),
                desc=desc,
                image=get_image_for_content(content),
                score=score,
                topic=topic,
                content_type=content.get('content_type', 'course'),
            )
            
            # Add extra fields that aren't in the model (will still go through
            # because we removed response_model validation on this route)
            rec_dict = rec.dict()
            rec_dict['_id'] = str(content.get('_id', ''))
            rec_dict['tags'] = content.get('tags', [])
            rec_dict['difficulty'] = content.get('difficulty', 'Intermédiaire')
            rec_dict['duration_hours'] = content.get('duration_hours')
            rec_dict['author'] = content.get('author', 'Expert Synapse')
            rec_dict['views'] = content.get('views', 0)
            rec_dict['replies'] = content.get('replies', 0)
            rec_dict['labels'] = content.get('labels', [])
            
            recommendations.append(rec_dict)
            ctype = rec_dict.get("content_type", "other")
            if ctype not in type_counts:
                type_counts["other"] += 1
            else:
                type_counts[ctype] += 1
        
        logger.info(
            f"Returning {len(recommendations)} recommendations "
            f"(courses={type_counts['course']}, blogs={type_counts['blog']}, forums={type_counts['forum']}, other={type_counts['other']})"
        )
        
        return {
            "recommendations": recommendations,
            "total": len(recommendations)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/refresh-index")
async def refresh_index():
    """Refresh FAISS index with latest content from database"""
    try:
        global recommender
        
        logger.info("Refreshing FAISS index...")
        
        contents = []
        if courses_coll:
            courses = list(db[courses_coll].find().limit(1000))
            for course in courses:
                course['content_type'] = 'course'
            contents.extend(courses)
            
        if blogs_coll:
            blogs = list(db[blogs_coll].find().limit(1000))
            for blog in blogs:
                blog['content_type'] = 'blog'
            contents.extend(blogs)
            
        if forums_coll:
            forums = list(db[forums_coll].find().limit(500))
            for forum in forums:
                forum['content_type'] = 'forum'
            contents.extend(forums)
        
        if not contents:
            contents = create_sample_data()
        
        recommender.build_index(contents)
        
        return {
            "status": "success",
            "total_content": recommender.index.ntotal
        }
        
    except Exception as e:
        logger.error(f"Error refreshing index: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Mount static files
if os.path.exists("frontend"):
    app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)