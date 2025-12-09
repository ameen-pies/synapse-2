import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Environment variables
MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DATABASE_NAME")  

# Collection names (as strings)
USERS_COL = os.getenv("USERS_COLL", "userdatas")
FORUMS_COL = os.getenv("FORUMS_COLL", "forums")
BLOGS_COL = os.getenv("BLOGS_COLL", "blogs")
COURSES_COL = os.getenv("COURSES_COLL", "courses")
INDEX_COLL = os.getenv("INDEX_COLL", "mfacodes")

if MONGO_URI is None:
    raise RuntimeError("Please set MONGODB_URI in .env")

# Create MongoDB client and access database
client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Export collection names (as strings) - used by main.py
courses_coll = COURSES_COL
blogs_coll = BLOGS_COL
forums_coll = FORUMS_COL
users_coll = USERS_COL
global_index_coll = INDEX_COLL

# Also export collection objects for direct access (optional)
courses_collection = db[COURSES_COL]
blogs_collection = db[BLOGS_COL]
forums_collection = db[FORUMS_COL]
users_collection = db[USERS_COL]
index_collection = db[INDEX_COLL]

print(f"✅ Connected to MongoDB: {DB_NAME}")
print(f"📊 Collections: {', '.join([COURSES_COL, BLOGS_COL, FORUMS_COL])}")