from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
import re
from datetime import datetime
from transformers import pipeline


# CONFIGURATION


load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


#SENTIMENT ANALYSIS

sentiment_pipeline = pipeline("sentiment-analysis") 
#entiment_pipeline = pipeline(model="FacebookAI/roberta-large-mnli") 

# Database config — adjust to your actual DB credentials
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL

@app.post("/sentiment")
def sentiment():
    text = request.get_json().get("text")
    if not text:
        return {"error": "text is required"}, 400
    return sentiment_pipeline(text)[0]


# EMAIL

def is_valid_email(email):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email)

def clean_review_content(content):
    forbidden = ["<script>", "<iframe>", "DROP", "SELECT", "--"]
    if any(word.lower() in content.lower() for word in forbidden):
        return False
    if len(content) > 2000:
        return False
    return True


# MODELS


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(200), nullable=False, unique=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email
        }


class Movie(db.Model):
    __tablename__ = "movies"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    genre = db.Column(db.String(100), nullable=False)
    release_year = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "genre": self.genre,
            "release_year": self.release_year,
            "description": self.description
        }


class Favorite(db.Model):
    __tablename__ = "favorites"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey("movies.id"), nullable=False)
    added_at = db.Column(db.DateTime, server_default=db.func.now())


class Rating(db.Model):
    __tablename__ = "ratings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey("movies.id"), nullable=False)
    score = db.Column(db.Float, nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey("movies.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_hidden = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

# INSERTION DE DONNÉES DE TEST

with app.app_context():
    db.create_all()


# ROUTES USERS


@app.post("/users")
def create_user():
    try:
        data = request.get_json()

        username = data.get("username")
        email = data.get("email")

        if not username:
            return jsonify({"success": False, "error": "Username required"}), 400

        if not email or not is_valid_email(email):
            return jsonify({"success": False, "error": "Valid email required"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"success": False, "error": "Email already exists"}), 400

        user = User(username=username, email=email)
        db.session.add(user)
        db.session.commit()

        return jsonify({"success": True, "data": user.to_dict()}), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.get("/users")
def get_users():
    try:
        users = User.query.all()
        return jsonify({"success": True, "data": [u.to_dict() for u in users]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.put("/users/<int:user_id>")
def update_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404

        data = request.get_json()

        username = data.get("username")
        email = data.get("email")

        if username:
            user.username = username

        if email:
            if not is_valid_email(email):
                return jsonify({"success": False, "error": "Valid email required"}), 400
            if User.query.filter(User.email == email, User.id != user_id).first():
                return jsonify({"success": False, "error": "Email already exists"}), 400
            user.email = email

        db.session.commit()

        return jsonify({"success": True, "data": user.to_dict()}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ROUTES MOVIES

@app.post("/movies")
def create_movie():
    try:
        data = request.get_json()

        title = data.get("title")
        genre = data.get("genre")
        release_year = data.get("release_year")

        current_year = datetime.now().year

        if not title:
            return jsonify({"success": False, "error": "Title required"}), 400

        if not isinstance(release_year, int) or not (1888 <= release_year <= current_year):
            return jsonify({"success": False, "error": "Invalid release year"}), 400

        movie = Movie(
            title=title,
            genre=genre,
            release_year=release_year,
            description=data.get("description")
        )

        db.session.add(movie)
        db.session.commit()

        return jsonify({"success": True, "data": movie.to_dict()}), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.get("/movies")
def get_movies():
    try:
        movies = Movie.query.all()
        return jsonify({"success": True, "data": [m.to_dict() for m in movies]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.put("/movies/<int:movie_id>")
def update_movie(movie_id):
    try:
        movie = Movie.query.get(movie_id)
        if not movie:
            return jsonify({"success": False, "error": "Movie not found"}), 404

        data = request.get_json()

        title = data.get("title")
        genre = data.get("genre")
        release_year = data.get("release_year")

        current_year = datetime.now().year

        if title:
            movie.title = title

        if genre:
            movie.genre = genre

        if release_year is not None:
            if not isinstance(release_year, int) or not (1888 <= release_year <= current_year):
                return jsonify({"success": False, "error": "Invalid release year"}), 400
            movie.release_year = release_year

        if "description" in data:
            movie.description = data.get("description")

        db.session.commit()

        return jsonify({"success": True, "data": movie.to_dict()}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
    
# ROUTES RATINGS

@app.post("/ratings")
def add_rating():
    try:
        data = request.get_json()

        user_id = data.get("user_id")
        movie_id = data.get("movie_id")
        score = data.get("score")

        if not isinstance(score, (int, float)) or not (1 <= score <= 5):
            return jsonify({"success": False, "error": "Score must be between 1 and 5"}), 400

        existing = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()

        if existing:
            old_score = existing.score
            existing.score = score
            db.session.commit()

            return jsonify({
                "success": True,
                "old_score": old_score,
                "new_score": score,
                "delta": score - old_score
            }), 200

        rating = Rating(user_id=user_id, movie_id=movie_id, score=score)
        db.session.add(rating)
        db.session.commit()

        return jsonify({"success": True, "data": {"score": score}}), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.get("/ratings")
def get_ratings():
    try:
        ratings = Rating.query.all()
        return jsonify({"success": True, "data": [
            {
                "id": r.id,
                "user_id": r.user_id,
                "movie_id": r.movie_id,
                "score": r.score
            } for r in ratings
        ]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.put("/ratings/<int:rating_id>")
def update_rating(rating_id):
    try:
        rating = Rating.query.get(rating_id)
        if not rating:
            return jsonify({"success": False, "error": "Rating not found"}), 404

        data = request.get_json()
        score = data.get("score")

        if score is None or not isinstance(score, (int, float)) or not (1 <= score <= 5):
            return jsonify({"success": False, "error": "Score must be between 1 and 5"}), 400

        old_score = rating.score
        rating.score = score
        db.session.commit()

        return jsonify({
            "success": True,
            "old_score": old_score,
            "new_score": score,
            "delta": score - old_score
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500    
    

# ROUTES REVIEWS

@app.post("/reviews")
def add_review():
    try:
        data = request.get_json()

        content = data.get("content")

        if not content or not clean_review_content(content):
            return jsonify({"success": False, "error": "Invalid review content"}), 400

        review = Review(
            user_id=data.get("user_id"),
            movie_id=data.get("movie_id"),
            content=content
        )

        db.session.add(review)
        db.session.commit()

        return jsonify({"success": True}), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.get("/reviews")
def get_reviews():
    try:
        reviews = Review.query.all()
        return jsonify({"success": True, "data": [
            {
                "id": r.id,
                "user_id": r.user_id,
                "movie_id": r.movie_id,
                "content": r.content,
                "is_hidden": r.is_hidden
            } for r in reviews
        ]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
    
@app.put("/reviews/<int:review_id>")
def update_review(review_id):
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"success": False, "error": "Review not found"}), 404

        data = request.get_json()
        content = data.get("content")

        if content and not clean_review_content(content):
            return jsonify({"success": False, "error": "Invalid review content"}), 400

        if content:
            review.content = content

        if "is_hidden" in data:
            review.is_hidden = bool(data.get("is_hidden"))

        db.session.commit()

        return jsonify({"success": True}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500    
    


if __name__ == "__main__":
    app.run(debug=True, port=8000)
    