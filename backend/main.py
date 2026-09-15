from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="AI Gym & Fitness Assistant",
    description="AI-powered Gym and Fitness Assistant",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:5173",
    "https://ai-gym-fitness-assistant-8swx.onrender.com",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Gym & Fitness Assistant Backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# -----------------------------
# Module 02: AI Dietician
# -----------------------------

class DietRequest(BaseModel):
    weight: float
    height: float
    goal: str
    dietary_preference: str


@app.post("/diet-plan")
def generate_diet_plan(data: DietRequest):

    height_m = data.height / 100
    bmi = data.weight / (height_m * height_m)

    if data.goal == "Weight Loss":
        calories = "1800-2000 kcal/day"
        challenge = "Controlled calorie intake with balanced nutrition"
    elif data.goal == "Weight Gain":
        calories = "2200-2500 kcal/day"
        challenge = "Higher calorie intake with protein-rich foods"
    elif data.goal == "Muscle Building":
        calories = "2200-2600 kcal/day"
        challenge = "Protein-rich meals with strength training support"
    else:
        calories = "2000-2200 kcal/day"
        challenge = "Balanced nutrition for general fitness"

    if data.dietary_preference == "Vegetarian":
        breakfast = "Vegetable oats with curd"
        lunch = "Brown rice, dal, vegetables and salad"
        dinner = "Chapati, dal and mixed vegetables"
        grocery = "Oats, rice, dal, vegetables, fruits, curd and nuts"
    else:
        breakfast = "Vegetable oats with boiled eggs"
        lunch = "Brown rice, chicken, vegetables and salad"
        dinner = "Chapati, grilled chicken and mixed vegetables"
        grocery = "Oats, rice, dal, chicken, eggs, vegetables, fruits and curd"

    return {
        "bmi": round(bmi, 1),
        "goal": data.goal,
        "dietary_preference": data.dietary_preference,
        "daily_calories": calories,
        "breakfast": breakfast,
        "lunch": lunch,
        "dinner": dinner,
        "grocery_list": grocery,
        "guidance": challenge
    }
# -----------------------------
# Module 03: Smart Gym Assistant
# -----------------------------

class SmartGymRequest(BaseModel):
    intensity: str
    resistance: int


@app.post("/smart-gym")
def smart_gym_assistant(data: SmartGymRequest):

    if data.intensity == "Low":
        recommended_intensity = "Moderate"
        recommended_resistance = data.resistance + 5
        rest = "45 seconds"
        recommendation = "You can slightly increase the workout intensity."

    elif data.intensity == "Moderate":
        recommended_intensity = "High"
        recommended_resistance = data.resistance + 5
        rest = "60 seconds"
        recommendation = "Performance is good. You can increase intensity gradually."

    else:
        recommended_intensity = "Moderate"
        recommended_resistance = max(data.resistance - 5, 5)
        rest = "90 seconds"
        recommendation = "High intensity detected. Take adequate rest before the next set."

    return {
        "equipment_status": "Connected",
        "current_resistance": data.resistance,
        "current_intensity": data.intensity,
        "recommended_intensity": recommended_intensity,
        "recommended_resistance": recommended_resistance,
        "rest_recommendation": rest,
        "recommendation": recommendation
    }

    # -----------------------------
# Module 04: AI Fitness Habit Tracker
# -----------------------------

class HabitRequest(BaseModel):
    completed_sessions: int


@app.post("/habit-tracker")
def habit_tracker(data: HabitRequest):

    if data.completed_sessions >= 4:
        habit_status = "Good"
        missed_workout_risk = "Low"
        message = (
            "Great consistency! Keep following your workout "
            "schedule to maintain your fitness habit."
        )
    else:
        habit_status = "Needs Improvement"
        missed_workout_risk = "High"
        message = (
            "Try to complete more workouts this week "
            "to improve your fitness habit."
        )

    return {
        "completed_sessions": data.completed_sessions,
        "habit_status": habit_status,
        "missed_workout_risk": missed_workout_risk,
        "next_workout": "Tomorrow",
        "message": message
    }

# -----------------------------
# Module 05: Virtual Gym Buddy
# -----------------------------

class BuddyRequest(BaseModel):
    message: str


@app.post("/gym-buddy")
def gym_buddy(data: BuddyRequest):

    message = data.message.lower()

    reply = (
        "You've got this! Stay consistent with your workouts "
        "and keep working toward your fitness goals."
    )

    if (
        "tired" in message
        or "sad" in message
        or "motivat" in message
    ):
        reply = (
            "It's okay to have difficult days. Start with a small "
            "workout and build your momentum. You've got this!"
        )

    elif (
        "workout" in message
        or "exercise" in message
    ):
        reply = (
            "A consistent workout routine is important. Focus on "
            "good form, take adequate rest, and gradually improve "
            "your performance."
        )

    elif (
        "diet" in message
        or "food" in message
    ):
        reply = (
            "A balanced diet supports your fitness goals. Choose "
            "nutritious foods, stay hydrated, and follow a plan "
            "that suits your goal."
        )

    elif (
        "hello" in message
        or "hi" in message
    ):
        reply = (
            "Hey! Great to see you. What fitness goal are you "
            "working toward today?"
        )

    return {
        "user_message": data.message,
        "reply": reply
    }

# -----------------------------
# Module 06: Pose-to-Performance Analyzer
# -----------------------------

class PerformanceRequest(BaseModel):
    performance_score: int


@app.post("/performance-analysis")
def analyze_performance(data: PerformanceRequest):

    score = max(0, min(data.performance_score, 100))

    if score >= 90:
        rating = "Excellent"
        feedback = "Excellent movement efficiency and workout performance."
    elif score >= 75:
        rating = "Good"
        feedback = "Good performance. Keep improving your form and consistency."
    else:
        rating = "Needs Improvement"
        feedback = "Focus on improving movement efficiency and exercise form."

    return {
        "performance_score": score,
        "rating": rating,
        "feedback": feedback,
        "weekly_report": "Performance analysis completed successfully."
    }

# -----------------------------
# Module 07: Gym Recommender & Planner
# -----------------------------

class RecommendationRequest(BaseModel):
    fitness_goal: str
    workout_type: str


@app.post("/gym-recommendation")
def gym_recommendation(data: RecommendationRequest):

    gym = "Fitness Pro Gym"

    if data.fitness_goal == "Weight Loss":
        if data.workout_type == "Gym":
            program = "Cardio & Strength Training"
        elif data.workout_type == "Home Workout":
            program = "Home Cardio & Bodyweight Training"
        else:
            program = "Outdoor Cardio Training"

        challenge = "30-Day Fat Loss Challenge"

    elif data.fitness_goal == "Weight Gain":
        if data.workout_type == "Gym":
            program = "Strength & Resistance Training"
        else:
            program = "Home Strength Training"

        challenge = "30-Day Strength Challenge"

    elif data.fitness_goal == "Muscle Building":
        if data.workout_type == "Gym":
            program = "Muscle Building Program"
        else:
            program = "Home Muscle Building Program"

        challenge = "30-Day Muscle Building Challenge"

    else:
        program = "Balanced Fitness Program"
        challenge = "30-Day Fitness Challenge"

    return {
        "gym": gym,
        "fitness_goal": data.fitness_goal,
        "workout_type": data.workout_type,
        "program": program,
        "challenge": challenge
    }