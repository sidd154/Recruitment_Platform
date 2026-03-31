import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY") # Note: Supabase REST API doesn't support raw DDL out of the box via anon key easily without a custom RPC or using the Postgres connection string.

# However, for the sake of the demo script, let's read the SQL and print instructions if we can't execute it via REST
with open("supabase_schema.sql", "r") as f:
    sql = f.read()

print("To initialize the database, please run the following SQL in your Supabase SQL Editor:")
print("---")
print(sql)
print("---")
