MongoDB running on localhost:27017
Update REACT_APP_BACKEND_URL in frontend .env to http://localhost:8001

## Running the Todo App Locally

### **Prerequisites**
- Node.js (v18+)
- Python (3.9+)
- MongoDB installed and running

---

### **1. Backend Setup**

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Update .env file
# Make sure MONGO_URL points to your local MongoDB:
# MONGO_URL="mongodb://localhost:27017"
# DB_NAME="todo_app"

# Run the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

---

### **2. Frontend Setup**

```bash
# Navigate to frontend folder
cd frontend

# Update .env file - change this line:
# REACT_APP_BACKEND_URL=http://localhost:8001

# Install dependencies
yarn install

# Run the app
yarn start
```

---

### **3. Access the App**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8001/api/todos`

---

### **Quick .env Files for Local**

**backend/.env:**
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="todo_app"
CORS_ORIGINS="*"
```

**frontend/.env:**
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

Make sure MongoDB is running before starting the backend. On most systems: `mongod` or `brew services start mongodb-community` (Mac).