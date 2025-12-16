import asyncio
import os
import sys

import asyncpg

# Add project root to path if needed (though we just rely on installed packages)
sys.path.append(os.getcwd())


async def create_db():
    print("Connecting to Postgres...")
    try:
        # Connect to default 'postgres' database to create a new one
        conn = await asyncpg.connect(
            "postgresql://postgres:postgres@localhost:5432/postgres"
        )
    except Exception as e:
        print(f"Could not connect to Postgres: {e}")
        return

    try:
        print("Attempting to create 'hackathon_test' database...")
        await conn.execute("CREATE DATABASE hackathon_test")
        print("Database 'hackathon_test' created successfully.")
    except asyncpg.DuplicateDatabaseError:
        print("Database 'hackathon_test' already exists.")
    except Exception as e:
        print(f"Error creating database: {e}")
    finally:
        await conn.close()


if __name__ == "__main__":
    # Ensure we are running with the venv python where asyncpg is installed
    asyncio.run(create_db())
