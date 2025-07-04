# seed_tasks.py

import os
from pymongo import MongoClient
from faker import Faker
from datetime import datetime, timedelta
import random
from bson.objectid import ObjectId

# --- Configuration ---
# Update with your MongoDB connection string if it's different
# It's best practice to use an environment variable for this
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/") 
DB_NAME = "todo_app"

# --- Initialize Libraries ---
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
fake = Faker()

def generate_random_deadline():
    """Generates a random deadline within the next 60 days."""
    days_in_future = random.randint(1, 60)
    return datetime.now() + timedelta(days=days_in_future)

def seed_tasks():
    """
    Finds all users and adds 20 random tasks for each one.
    """
    try:
        users_collection = db.users
        tasks_collection = db.tasks

        # 1. Fetch all existing users
        all_users = list(users_collection.find({}, {"_id": 1, "displayName": 1}))

        if not all_users:
            print("No users found in the database. Please create some users first.")
            return

        print(f"Found {len(all_users)} user(s). Seeding tasks...")
        
        total_tasks_added = 0

        # 2. Loop through each user
        for user in all_users:
            user_id = user["_id"]
            user_name = user["displayName"]
            tasks_for_user = []

            # 3. Generate 20 random tasks for the current user
            for _ in range(20):
                task_document = {
                    "title": fake.sentence(nb_words=random.randint(4, 8)).replace('.', ''),
                    "description": fake.paragraph(nb_sentences=random.randint(2, 5)),
                    "deadline": generate_random_deadline(),
                    "status": random.choice(["Pending", "Completed"]),
                    "owner": user_id,
                    "createdAt": datetime.now(),
                    "updatedAt": datetime.now(),
                }
                tasks_for_user.append(task_document)
            
            # 4. Insert all generated tasks for the user in one go
            if tasks_for_user:
                tasks_collection.insert_many(tasks_for_user)
                total_tasks_added += len(tasks_for_user)
                print(f"  -> Added 20 tasks for user: {user_name}")

        print(f"\nSeeding complete. Total tasks added: {total_tasks_added}")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # 5. Close the database connection
        client.close()
        print("Database connection closed.")

if __name__ == "__main__":
    seed_tasks()