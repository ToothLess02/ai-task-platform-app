import os
import json
import time
import datetime
import redis
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()

# Environment Variables
REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
REDIS_QUEUE = os.getenv("REDIS_QUEUE_NAME", "ai_task_queue")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/ai_task_db")

print(f"[Worker Init] Connecting to Redis at {REDIS_HOST}:{REDIS_PORT} (Queue: {REDIS_QUEUE})")
r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, decode_responses=True)

print(f"[Worker Init] Connecting to MongoDB at {MONGODB_URI}")
mongo_client = MongoClient(MONGODB_URI)
db = mongo_client.get_database()
tasks_collection = db["tasks"]

def add_task_log(task_id, message, level="INFO"):
    log_entry = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc),
        "message": message,
        "level": level
    }
    tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$push": {"logs": log_entry}}
    )

def update_task_status(task_id, status, result=None, execution_time_ms=0):
    update_data = {
        "status": status,
        "updatedAt": datetime.datetime.now(datetime.timezone.utc)
    }
    if result is not None:
        update_data["result"] = str(result)
    if execution_time_ms > 0:
        update_data["executionTimeMs"] = execution_time_ms

    tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update_data}
    )

def process_operation(operation_type, input_text):
    if operation_type == "Uppercase":
        return input_text.upper()
    elif operation_type == "Lowercase":
        return input_text.lower()
    elif operation_type == "Reverse String":
        return input_text[::-1]
    elif operation_type == "Word Count":
        words = [w for w in input_text.strip().split() if w]
        return f"Total words: {len(words)}"
    else:
        raise ValueError(f"Unsupported operation type: {operation_type}")

def run_worker():
    print("[Worker] AI Task Processing Worker started listening for queue jobs...")
    while True:
        try:
            # Blocking pop from Redis queue (timeout = 5 seconds)
            item = r.blpop(REDIS_QUEUE, timeout=5)
            if item is None:
                continue

            queue_name, raw_payload = item
            print(f"[Worker] Popped task payload: {raw_payload}")
            payload = json.loads(raw_payload)
            
            task_id = payload.get("taskId")
            input_text = payload.get("inputText", "")
            operation_type = payload.get("operationType", "")

            if not task_id:
                print("[Worker Error] Payload missing taskId")
                continue

            # 1. Change status to Running
            start_time = time.time()
            update_task_status(task_id, "Running")
            add_task_log(task_id, f"Worker picked up task '{task_id}'. Starting operation '{operation_type}'.")

            # 2. Process Task Operation
            try:
                result = process_operation(operation_type, input_text)
                end_time = time.time()
                duration_ms = round((end_time - start_time) * 1000, 2)

                # 3. Save result and update status to Success
                add_task_log(task_id, f"Operation '{operation_type}' completed in {duration_ms}ms.")
                update_task_status(task_id, "Success", result=result, execution_time_ms=duration_ms)
                print(f"[Worker Success] Task {task_id} completed successfully in {duration_ms}ms.")

            except Exception as op_err:
                end_time = time.time()
                duration_ms = round((end_time - start_time) * 1000, 2)
                err_msg = f"Task processing failed: {str(op_err)}"
                add_task_log(task_id, err_msg, level="ERROR")
                update_task_status(task_id, "Failed", result=None, execution_time_ms=duration_ms)
                print(f"[Worker Error] Task {task_id} failed: {err_msg}")

        except redis.ConnectionError:
            print("[Worker Redis Error] Connection lost. Re-trying in 3 seconds...")
            time.sleep(3)
        except Exception as e:
            print(f"[Worker Exception] Unexpected loop error: {str(e)}")
            time.sleep(1)

if __name__ == "__main__":
    run_worker()
