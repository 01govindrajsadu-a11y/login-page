from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token, jwt_required, get_jwt_identity, create_refresh_token)
from werkzeug.security import (generate_password_hash, check_password_hash)
from datetime import  datetime, timezone, timedelta


app = Flask(__name__)
    
    
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:Govindraj399821!@localhost/user_db"  
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "mysecretkey"  
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone_num = db.Column(db.String(12), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
with app.app_context():
    db.create_all()
    
@app.post("/api/auth/register")
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    phone_num = data.get("phone_num") or ""
    name = data.get("name") or ""

    if not email or not password or not phone_num or not name:
        return jsonify({"error": "email or password required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already registered"}), 409
    
    if User.query.filter_by(phone_num=phone_num).first():
        return jsonify({"error": "phone number already registered"}), 409

    pw_hash = generate_password_hash(password)
    user = User(email=email, password_hash=pw_hash, phone_num=phone_num, name=name)
    
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "registered-successfully",
        "user": {"id": user.id, "email": user.email}
    }), 201
    
@app.post("/api/auth/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower().lower()
    password = data.get("password") or ""
    
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid credentials"}), 401

    access = create_access_token(identity=str(user.id))
    refresh = create_refresh_token(identity=str(user.id))
    return jsonify({
        "access_token": access,
        "refresh_token": refresh,
        "user": {"id": user.id, "email": user.email}
    }), 200
    
@app.post("/api/auth/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access = create_access_token(identity=user_id)
    return jsonify({"access_token": access}), 200

@app.get("/api/users/me")
@jwt_required()
def me():
    uid = int(get_jwt_identity())
    user = db.session.get(User, uid)
    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "phone_num": user.phone_num,
        "created_at": user.created_at.isoformat()
    }), 200

@app.patch("/api/users/me")
@jwt_required()
def update_me():
    uid = int(get_jwt_identity())
    user = db.session.get(User, uid)
    data = request.get_json() or {}
    touched = False

    if "email" in data:
        new_email = (data["email"] or "").strip().lower()
        if not new_email:
            return jsonify({"error": "email cannot be empty"}), 400
        if new_email != user.email and User.query.filter_by(email=new_email).first():
            return jsonify({"error": "email already in use"}), 409
        user.email = new_email
        touched = True

    if "password" in data:
        new_pw = data["password"] or ""
        if len(new_pw) < 4:
            return jsonify({"error": "password must be at least 4 characters"}), 400
        user.password_hash = generate_password_hash(new_pw)
        touched = True

    if not touched:
        return jsonify({"message": "no changes"}), 200

    db.session.commit()
    return jsonify({"message": "account updated successfully", "user": {"id": user.id, "email": user.email}}), 200

@app.delete("/api/users/me")
@jwt_required()
def delete_me():
    uid = int(get_jwt_identity())
    user = db.session.get(User, uid)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "account deleted"}), 200

@app.get("/healthz")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(debug=True)