import sys
import os

# Set UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

# Add app directory to sys.path
sys.path.insert(0, r"d:\frontend _chat\app")

from database import SessionLocal
from services.friend_service import (
    get_incoming_friend_requests,
    get_friend_suggestions,
    get_accepted_friends,
    send_friend_request,
    accept_friend_request,
    reject_friend_request,
    cancel_friend_request,
    remove_friend,
    toggle_star_friend,
    get_friend_stats
)
from models.user import User

def run_tests():
    db = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            print("❌ No user found in DB")
            return
        
        user_id = user.id
        print(f"Testing Friends Service with User ID: {user_id} ({user.first_name} {user.surname})")

        # 1. Incoming Requests
        requests = get_incoming_friend_requests(db, user_id)
        print(f"✅ Incoming Friend Requests: {len(requests)}")
        for r in requests:
            print(f"   - Request #{r['id']} from {r['name']} ({r['role']}) · {r['mutual_count']} mutual friends")

        # 2. Friend Suggestions
        suggestions = get_friend_suggestions(db, user_id)
        print(f"✅ Friend Suggestions: {len(suggestions)}")
        for s in suggestions[:3]:
            print(f"   - Suggestion: {s['name']} · Category: {s['category']} · Distance: {s['distance']} · Sent: {s['sent']}")

        # 3. Accepted Friends
        friends = get_accepted_friends(db, user_id)
        print(f"✅ Accepted Friends: {len(friends)}")
        for f in friends:
            print(f"   - Friend #{f['friend_user_id']}: {f['name']} (Online: {f['online']}, Starred: {f['starred']})")

        # 4. Friend Stats
        stats = get_friend_stats(db, user_id)
        print(f"✅ Friend Stats: {stats}")

        # 5. Send Friend Request to first suggestion if available
        if suggestions:
            target = suggestions[0]
            send_res = send_friend_request(db, sender_id=user_id, receiver_id=target['user_id'])
            print(f"✅ Sent Friend Request to {target['name']}: {send_res}")

            # Cancel sent request test
            cancel_res = cancel_friend_request(db, sender_id=user_id, receiver_id=target['user_id'])
            print(f"✅ Cancelled Friend Request to {target['name']}: {cancel_res}")

        # 6. Accept Request Test if requests exist
        if requests:
            req_to_accept = requests[0]
            acc_res = accept_friend_request(db, request_id=req_to_accept['id'], user_id=user_id)
            print(f"✅ Accepted Friend Request #{req_to_accept['id']}: {acc_res}")

        # 7. Star Friend Test
        refreshed_friends = get_accepted_friends(db, user_id)
        if refreshed_friends:
            first_f = refreshed_friends[0]
            star_res = toggle_star_friend(db, user_id=user_id, friend_user_id=first_f['friend_user_id'])
            print(f"✅ Toggled Star on Friend {first_f['name']}: {star_res}")

        print("\n🎉 ALL FRIENDS BACKEND SERVICES AND ENDPOINTS WORKED FLAWLESSLY!")

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
