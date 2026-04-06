from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Enums
class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# Models
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    due_date: Optional[str] = None
    completed: bool = False


class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    due_date: Optional[str] = None


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None


class Todo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    due_date: Optional[str] = None
    completed: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# Routes
@api_router.get("/")
async def root():
    return {"message": "Todo API is running"}


@api_router.post("/todos", response_model=Todo)
async def create_todo(input: TodoCreate):
    todo_obj = Todo(
        title=input.title,
        description=input.description,
        priority=input.priority,
        due_date=input.due_date
    )
    doc = todo_obj.model_dump()
    await db.todos.insert_one(doc)
    return todo_obj


@api_router.get("/todos", response_model=List[Todo])
async def get_todos(
    priority: Optional[Priority] = None,
    completed: Optional[bool] = None
):
    query = {}
    if priority:
        query["priority"] = priority.value
    if completed is not None:
        query["completed"] = completed
    
    todos = await db.todos.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return todos


@api_router.get("/todos/{todo_id}", response_model=Todo)
async def get_todo(todo_id: str):
    todo = await db.todos.find_one({"id": todo_id}, {"_id": 0})
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@api_router.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: str, input: TodoUpdate):
    existing = await db.todos.find_one({"id": todo_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.todos.update_one({"id": todo_id}, {"$set": update_data})
    
    updated = await db.todos.find_one({"id": todo_id}, {"_id": 0})
    return updated


@api_router.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str):
    result = await db.todos.delete_one({"id": todo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully"}


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


