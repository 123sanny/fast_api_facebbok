import sys
sys.path.insert(0, r"d:\frontend _chat\app")
from database import SessionLocal
from models.user import User
from models.social import Friend

db = SessionLocal()
try:
    users = db.query(User).all()
    print(f"Total Users in DB: {len(users)}")
    for u in users:
        print(f"User ID {u.id}: {u.first_name} {u.surname} ({u.email})")

    # Clean up any dummy test users created with @nexoria.social if desired
    dummy_users = db.query(User).filter(User.email.like("%@nexoria.social")).all()
    print(f"\nDummy seed users to remove: {len(dummy_users)}")
    for du in dummy_users:
        db.delete(du)
    db.commit()
    print("Cleaned up dummy users.")
    
    remaining = db.query(User).all()
    print(f"Remaining genuine registered users: {len(remaining)}")
    for u in remaining:
        print(f"Genuine User ID {u.id}: {u.first_name} {u.surname} ({u.email})")
finally:
    db.close()
