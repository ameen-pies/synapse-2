from pydantic import BaseModel, Field
from typing import List, Optional

class RecommendRequest(BaseModel):
    """Request model for recommendation endpoint"""
    topics: List[str] = Field(..., description="List of topics selected by user")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum number of recommendations")

class CourseRecommendation(BaseModel):
    """Single recommendation item"""
    title: str = Field(..., description="Title of the content")
    desc: str = Field(..., description="Description/summary")
    image: str = Field(..., description="Cover image URL")
    score: float = Field(..., description="Similarity score (0-1)")
    topic: Optional[str] = Field(None, description="Primary topic/category")
    content_type: Optional[str] = Field(None, description="Type: course, blog, or forum")

class RecommendResponse(BaseModel):
    """Response model for recommendations"""
    recommendations: List[CourseRecommendation]
    total: int = Field(..., description="Total number of recommendations returned")
    query_topics: Optional[List[str]] = Field(None, description="Topics used for query")