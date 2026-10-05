
from database import SessionLocal
from models import User
from auth import hash_password


db = SessionLocal()


admin_email = "admin@example.com"
admin_password = "admin123"


existing_admin = (
    db.query(User)
    .filter(User.email == admin_email)
    .first()
)


if existing_admin:
    existing_admin.role = "ADMIN"

    db.commit()

    print("Existing user is now an ADMIN.")


else:
    admin = User(
        name="Admin",
        email=admin_email,
        hashed_password=hash_password(admin_password),
        role="ADMIN"
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    print("Admin user created successfully.")


db.close()
