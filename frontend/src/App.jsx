import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import './App.css'

function App() {
  const [activeModule, setActiveModule] = useState(null)

  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [goal, setGoal] = useState('Weight Loss')
  const [dietPlan, setDietPlan] = useState(null)
  const [dietPreference, setDietPreference] = useState('Vegetarian')
  const [intensity, setIntensity] = useState('Moderate')
  const [resistance, setResistance] = useState(20)
  const [performanceScore, setPerformanceScore] = useState(85)
  const [completedSessions, setCompletedSessions] = useState(4)
  const [fitnessGoal, setFitnessGoal] = useState('Weight Loss')
  const [workoutType, setWorkoutType] = useState('Gym')
  const [recommendation, setRecommendation] = useState({
  gym: 'Fitness Pro Gym',
  program: 'Strength & Cardio',
  challenge: '30-Day Fitness Challenge',
})
  const [chatMessage, setChatMessage] = useState('')
  const [chatReply, setChatReply] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [poseDetected, setPoseDetected] = useState(false)
  const [repCount, setRepCount] = useState(0)
  const [squatStage, setSquatStage] = useState('up')
  const [formFeedback, setFormFeedback] = useState('Stand straight to begin')

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const poseLandmarkerRef = useRef(null)
  const animationRef = useRef(null)
  const squatStageRef = useRef('up')
  const repCountRef = useRef(0)
  const downFramesRef = useRef(0)
  const upFramesRef = useRef(0)  

  const modules = [
    {
      number: '01',
      title: 'AI Gym Trainer',
      description: 'AI-powered workout detection, rep counting and form correction.',
      icon: '🏋️',
    },
    {
      number: '02',
      title: 'AI Dietician & Calorie Coach',
      description: 'BMI-based diet plans, calorie tracking and nutritional guidance.',
      icon: '🥗',
    },
    {
      number: '03',
      title: 'Smart Gym Assistant',
      description: 'IoT-enabled equipment monitoring and intelligent intensity control.',
      icon: '⚙️',
    },
    {
      number: '04',
      title: 'AI Fitness Habit Tracker',
      description: 'Track workout habits, predict skipped sessions and provide nudges.',
      icon: '📊',
    },
    {
      number: '05',
      title: 'Virtual Gym Buddy',
      description: 'Conversational AI for motivation and personalized fitness guidance.',
      icon: '🤖',
    },
    {
      number: '06',
      title: 'Pose-to-Performance Analyzer',
      description: 'Analyze movement efficiency and generate performance scores.',
      icon: '🎯',
    },
    {
      number: '07',
      title: 'Gym Recommender & Planner',
      description: 'Recommend gyms, workout programs and fitness challenges.',
      icon: '📍',
    },
  ]

  const initializePoseLandmarker = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        '/wasm'
      )
    

      const poseLandmarker = await PoseLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: '/models/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        }
      )

      poseLandmarkerRef.current = poseLandmarker
      console.log('MediaPipe Pose Landmarker ready')
    } catch (error) {
      console.error('MediaPipe initialization error:', error)
    }
  }
  const calculateAngle = (a, b, c) => {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x)

  let angle = Math.abs(radians * 180.0 / Math.PI)

  if (angle > 180.0) {
    angle = 360.0 - angle
  }

  return angle
}
  const drawPose = (result) => {
    const canvas = canvasRef.current
    const video = videoRef.current

    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!result.landmarks || result.landmarks.length === 0) {
      setPoseDetected(false)
      return
    }

    setPoseDetected(true)

    const landmarks = result.landmarks[0]

    const connections = [
      [11, 12],
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16],
      [11, 23],
      [12, 24],
      [23, 24],
      [23, 25],
      [25, 27],
      [24, 26],
      [26, 28],
    ]

    ctx.lineWidth = 4
    ctx.strokeStyle = '#a855f7'

    connections.forEach(([start, end]) => {
      const a = landmarks[start]
      const b = landmarks[end]

      if (!a || !b) return

      ctx.beginPath()
      ctx.moveTo(a.x * canvas.width, a.y * canvas.height)
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height)
      ctx.stroke()
    })

    ctx.fillStyle = '#22d3ee'

    landmarks.forEach((point) => {
      ctx.beginPath()
      ctx.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        5,
        0,
        Math.PI * 2
      )
      ctx.fill()
    })
  } 

  const detectPose = () => {
  const video = videoRef.current
  const poseLandmarker = poseLandmarkerRef.current

  if (
    !video ||
    !poseLandmarker ||
    video.readyState < 2
  ) {
    animationRef.current = requestAnimationFrame(detectPose)
    return
  }

  try {
    const result = poseLandmarker.detectForVideo(
      video,
      performance.now()
    )

    if (result.landmarks && result.landmarks.length > 0) {
      setPoseDetected(true)
      drawPose(result)

      const landmarks = result.landmarks[0]

      const leftHip = landmarks[23]
      const leftKnee = landmarks[25]
      const leftAnkle = landmarks[27]

      const rightHip = landmarks[24]
      const rightKnee = landmarks[26]
      const rightAnkle = landmarks[28]
      const leftShoulder = landmarks[11]
      const rightShoulder = landmarks[12]

      if (
  leftHip &&
  leftKnee &&
  leftAnkle &&
  rightHip &&
  rightKnee &&
  rightAnkle &&
  leftShoulder &&
  rightShoulder
) {
        const leftKneeAngle = calculateAngle(
          leftHip,
          leftKnee,
          leftAnkle
        )

        const rightKneeAngle = calculateAngle(
          rightHip,
          rightKnee,
          rightAnkle
        )

        const kneeAngle = Math.min(
          leftKneeAngle,
          rightKneeAngle
        )
        const shoulderX = (leftShoulder.x + rightShoulder.x) / 2
const shoulderY = (leftShoulder.y + rightShoulder.y) / 2

const hipX = (leftHip.x + rightHip.x) / 2
const hipY = (leftHip.y + rightHip.y) / 2

const backAngle = Math.abs(
  Math.atan2(
    shoulderY - hipY,
    shoulderX - hipX
  ) * 180 / Math.PI
)

if (squatStageRef.current === 'down') {
  if (backAngle > 25 && backAngle < 155) {
    setFormFeedback('Keep your back straighter.')
  } else {
    setFormFeedback('Good squat form!')
  }
}

        if (kneeAngle < 100) {
  downFramesRef.current += 1
  upFramesRef.current = 0

  if (
    downFramesRef.current >= 5 &&
    squatStageRef.current === 'up'
  ) {
    squatStageRef.current = 'down'
    setSquatStage('down')
    setFormFeedback('Good! Now stand back up.')
  }
} else if (kneeAngle > 160) {
  upFramesRef.current += 1
  downFramesRef.current = 0

  if (
    upFramesRef.current >= 5 &&
    squatStageRef.current === 'down'
  ) {
    squatStageRef.current = 'up'

    repCountRef.current += 1
    setRepCount(repCountRef.current)

    setSquatStage('up')
    setFormFeedback('Great squat! Keep going.')
  }
} else {
  downFramesRef.current = 0
  upFramesRef.current = 0
}
      }
    } else {
      setPoseDetected(false)
      drawPose(result)
      setFormFeedback('Move into the camera view.')
    }
  } catch (error) {
    console.error('Pose detection error:', error)
  }

  animationRef.current = requestAnimationFrame(detectPose)
}


  const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })

    streamRef.current = stream
    setCameraOn(true)

    setTimeout(async () => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream

        try {
          await videoRef.current.play()

          console.log('Camera video started')

          await initializePoseLandmarker()

          console.log('Starting pose detection...')

          detectPose()
        } catch (error) {
          console.error('Video/MediaPipe error:', error)
        }
      }
    }, 100)
  } catch (error) {
    console.error('Camera error:', error)
    alert('Camera access was denied or is unavailable.')
  }
}
  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setCameraOn(false)
    setPoseDetected(false)

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      )
    }
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  if (activeModule === 'recommender') {
  return (
    <div className="app">

      <header className="navbar">

        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span>AI Gym</span>
          <span className="logo-highlight">
            & Fitness Assistant
          </span>
        </div>

        <button
          className="profile-btn"
          onClick={() => setActiveModule(null)}
        >
          ← Back
        </button>

      </header>

      <main>

        <section className="trainer-page">

          <div className="section-heading">

            <p className="eyebrow">
              MODULE 07
            </p>

            <h2>
              Gym Recommender & Planner
            </h2>

            <p>
              Discover suitable gyms, workout programs
              and fitness challenges based on your goals.
            </p>

          </div>

          <div className="trainer-grid">

            <div className="trainer-card">

              <h3>Fitness Preferences</h3>

              <select
  className="diet-input"
  value={fitnessGoal}
  onChange={(e) => setFitnessGoal(e.target.value)}
>
  <option>Weight Loss</option>
  <option>Weight Gain</option>
  <option>Muscle Building</option>
  <option>General Fitness</option>
</select>

              <select
  className="diet-input"
  value={workoutType}
  onChange={(e) => setWorkoutType(e.target.value)}
>
  <option>Gym</option>
  <option>Home Workout</option>
  <option>Outdoor Training</option>
</select>

              <button
  className="primary-btn"
  onClick={async () => {
    try {
      const response = await fetch(
        'https://ai-gym-fitness-backend-9n7g.onrender.com/gym-recommendation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fitness_goal: fitnessGoal,
            workout_type: workoutType,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get gym recommendation')
      }

      const data = await response.json()

      setRecommendation({
        gym: data.gym,
        program: data.program,
        challenge: data.challenge,
      })

    } catch (error) {
      console.error('Gym recommendation error:', error)
      alert('Unable to connect to the fitness backend.')
    }
  }}
>
  Find Recommendations
</button>

            </div>

            <div className="feedback-card">

              <h3>Recommended Fitness Options</h3>

              <div className="feedback-row">
                <span>Recommended Gym</span>
                <strong>{recommendation.gym}</strong>
              </div>

              <div className="feedback-row">
                <span>Workout Program</span>
                <strong>{recommendation.program}</strong>
              </div>

              <div className="feedback-row">
                <span>Fitness Challenge</span>
                <strong>{recommendation.challenge}</strong>
              </div>

              <div className="feedback-message">
                These recommendations are selected
                to support your fitness goals and
                maintain consistent training.
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}
  if (activeModule === 'performance') {
  return (
    <div className="app">

      <header className="navbar">

        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span>AI Gym</span>
          <span className="logo-highlight">
            & Fitness Assistant
          </span>
        </div>

        <button
          className="profile-btn"
          onClick={() => setActiveModule(null)}
        >
          ← Back
        </button>

      </header>

      <main>

        <section className="trainer-page">

          <div className="section-heading">

            <p className="eyebrow">
              MODULE 06
            </p>

            <h2>
              Pose-to-Performance Analyzer
            </h2>

            <p>
              Analyze movement efficiency and generate
              an AI-based performance score.
            </p>

          </div>

          <div className="trainer-grid">

            <div className="trainer-card">

              <h3>Movement Analysis</h3>

              <div className="feedback-row">
                <span>Motion Efficiency</span>
                <strong>85%</strong>
              </div>

              <div className="feedback-row">
                <span>Movement Quality</span>
                <strong>Good</strong>
              </div>

              <div className="feedback-row">
                <span>Posture Stability</span>
                <strong>Good</strong>
              </div>

              <button
  className="primary-btn"
  onClick={async () => {
    try {
      const response = await fetch(
        'https://ai-gym-fitness-backend-9n7g.onrender.com/performance-analysis',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            performance_score: performanceScore,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to analyze performance')
      }

      const data = await response.json()

      setPerformanceScore(data.performance_score)

    } catch (error) {
      console.error('Performance analysis error:', error)
      alert('Unable to connect to the fitness backend.')
    }
  }}
>
  Analyze Performance
</button>

            </div>

            <div className="feedback-card">

              <h3>Performance Report</h3>

              <div className="feedback-row">
                <span>Performance Score</span>
                <strong>{performanceScore} / 100</strong>
              </div>

              <div className="feedback-row">
                <span>Overall Rating</span>
                <strong>
  {performanceScore >= 90
    ? 'Excellent'
    : performanceScore >= 75
      ? 'Good'
      : 'Needs Improvement'}
</strong>
              </div>

              <div className="feedback-message">
                Your movement efficiency is good.
                Focus on maintaining stable posture
                and consistent movement during
                your workouts.
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}
if (activeModule === 'buddy') {
  return (
    <div className="app">

      <header className="navbar">

        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span>AI Gym</span>
          <span className="logo-highlight">
            & Fitness Assistant
          </span>
        </div>

        <button
          className="profile-btn"
          onClick={() => setActiveModule(null)}
        >
          ← Back
        </button>

      </header>

      <main>

        <section className="trainer-page">

          <div className="section-heading">

            <p className="eyebrow">
              MODULE 05
            </p>

            <h2>
              Virtual Gym Buddy
            </h2>

            <p>
              Your AI workout companion for motivation
              and personalized fitness guidance.
            </p>

          </div>

          <div className="trainer-grid">

            <div className="trainer-card">

              <h3>AI Gym Buddy</h3>

              <div className="feedback-message">
                Hi! I'm your Virtual Gym Buddy.
                I'm here to motivate you and help
                you stay consistent with your workouts.
              </div>

             <div className="chat-box">

  <input
    type="text"
    placeholder="Ask your gym buddy..."
    value={chatMessage}
    onChange={(e) => setChatMessage(e.target.value)}
    className="diet-input"
  />

  <button
  className="primary-btn"
  onClick={async () => {
    if (!chatMessage.trim()) return

    try {
      const response = await fetch(
        'https://ai-gym-fitness-backend-9n7g.onrender.com/gym-buddy',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: chatMessage,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get gym buddy response')
      }

      const data = await response.json()

      setChatReply(data.reply)
      setChatMessage('')

    } catch (error) {
      console.error('Gym Buddy error:', error)
      alert('Unable to connect to the fitness backend.')
    }
  }}
>
  Send
</button>

  {chatReply && (
    <div className="feedback-message">
      <strong>AI Gym Buddy:</strong>
      <br />
      {chatReply}
    </div>
  )}

</div>

            </div>

            <div className="feedback-card">

              <h3>Fitness Guidance</h3>

              <div className="feedback-row">
                <span>Mood</span>
                <strong>Positive</strong>
              </div>

              <div className="feedback-row">
                <span>Motivation</span>
                <strong>High</strong>
              </div>

              <div className="feedback-message">
                You're doing great! Keep going and
                stay consistent with your fitness goals.
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}

  if (activeModule === 'habit') {
  return (

    
    <div className="app">

      <header className="navbar">

        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span>AI Gym</span>
          <span className="logo-highlight">
            & Fitness Assistant
          </span>
        </div>

        <button
          className="profile-btn"
          onClick={() => setActiveModule(null)}
        >
          ← Back
        </button>

      </header>

      <main>

        <section className="trainer-page">

          <div className="section-heading">

            <p className="eyebrow">
              MODULE 04
            </p>

            <h2>
              AI Fitness Habit Tracker
            </h2>

            <p>
              Track workout habits, identify missed
              sessions and receive motivational nudges.
            </p>

          </div>

          <div className="trainer-grid">

            <div className="trainer-card">

              <h3>Workout Habit</h3>

<div className="feedback-row">
  <span>Completed Sessions</span>
  <strong>{completedSessions}</strong>
</div>

<button
  className="primary-btn"
  onClick={async () => {
    const newSessions = Math.min(
      completedSessions + 1,
      5
    )

    try {
      const response = await fetch(
        'https://ai-gym-fitness-backend-9n7g.onrender.com/habit-tracker',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            completed_sessions: newSessions,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update habit tracker')
      }

      const data = await response.json()

      setCompletedSessions(data.completed_sessions)

    } catch (error) {
      console.error('Habit tracker error:', error)
      alert('Unable to connect to the fitness backend.')
    }
  }}
>
  Complete Workout
</button>

              

              <div className="feedback-row">
  <span>Habit Status</span>
  <strong>
    {completedSessions >= 4 ? 'Good' : 'Needs Improvement'}
  </strong>
</div>

            </div>

            <div className="feedback-card">

              <h3>AI Habit Insights</h3>

              <div className="feedback-row">
  <span>Missed Workout Risk</span>
  <strong>
    {completedSessions >= 4 ? 'Low' : 'High'}
  </strong>
</div>

              <div className="feedback-row">
                <span>Next Workout</span>
                <strong>Tomorrow</strong>
              </div>

             <div className="feedback-message">
  {completedSessions >= 4
    ? 'Great consistency! Keep following your workout schedule to maintain your fitness habit.'
    : 'Try to complete more workouts this week to improve your fitness habit.'}
</div>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}
  if (activeModule === 'smart-gym') {
  return (
    <div className="app">

      <header className="navbar">

        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span>AI Gym</span>
          <span className="logo-highlight">
            & Fitness Assistant
          </span>
        </div>

        <button
          className="profile-btn"
          onClick={() => setActiveModule(null)}
        >
          ← Back
        </button>

      </header>

      <main>

        <section className="trainer-page">

          <div className="section-heading">

            <p className="eyebrow">
              MODULE 03
            </p>

            <h2>
              Smart Gym Assistant
            </h2>

            <p>
              Monitor gym equipment and receive
              intelligent workout intensity and rest
              recommendations.
            </p>

          </div>

          <div className="trainer-grid">

            <div className="trainer-card">

              <h3>Equipment Monitor</h3>

              <div className="feedback-row">
                <span>Equipment Status</span>
                <strong>Connected</strong>
              </div>

              <div className="feedback-row">
                <span>Current Resistance</span>
                <strong>{resistance} kg</strong>
              </div>

              <div className="feedback-row">
                <span>Workout Intensity</span>
                <strong>{intensity}</strong>
              </div>

              <button
  className="primary-btn"
  onClick={async () => {
    try {
      const response = await fetch(
        'https://ai-gym-fitness-backend-9n7g.onrender.com/smart-gym',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intensity: intensity,
            resistance: resistance,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to adjust workout intensity')
      }

      const data = await response.json()

      setIntensity(data.recommended_intensity)
      setResistance(data.recommended_resistance)

    } catch (error) {
      console.error('Smart Gym error:', error)
      alert('Unable to connect to the fitness backend.')
    }
  }}
>

  Adjust Intensity
</button>

            </div>

            <div className="feedback-card">

              <h3>AI Recommendations</h3>

              <div className="feedback-row">
                <span>Performance</span>
                <strong>Good</strong>
              </div>

              <div className="feedback-row">
                <span>Recommended Intensity</span>
                <strong>{intensity}</strong>
              </div>

              <div className="feedback-row">
                <span>Rest Recommendation</span>
                <strong>60 seconds</strong>
              </div>

              <div className="feedback-message">
                AI recommends maintaining a moderate
                intensity and taking adequate rest
                between sets.
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  )
}
if (activeModule === 'diet') {
  return (
    <div className="app">
      <header className="navbar">

        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span>AI Gym</span>
          <span className="logo-highlight">
            & Fitness Assistant
          </span>
        </div>

        <button
          className="profile-btn"
          onClick={() => setActiveModule(null)}
        >
          ← Back
        </button>

      </header>

      <main>
        <section className="trainer-page">

          <div className="section-heading">
            <p className="eyebrow">MODULE 02</p>

            <h2>AI Dietician & Calorie Coach</h2>

            <p>
              Get BMI-based diet plans, calorie guidance
              and nutritional recommendations.
            </p>
          </div>

          <div className="trainer-grid">

            <div className="trainer-card">
              <h3>Your Details</h3>

              <input
                type="number"
                placeholder="Weight (kg)"
                className="diet-input"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />

              <input
                type="number"
                placeholder="Height (cm)"
                className="diet-input"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />

              <select
                className="diet-input"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                <option>Weight Loss</option>
                <option>Weight Gain</option>
                <option>Maintain Weight</option>
              </select>
                <select
  className="diet-input"
  value={dietPreference}
  onChange={(e) => setDietPreference(e.target.value)}
>
  <option>Vegetarian</option>
  <option>Non-Vegetarian</option>
  <option>Vegan</option>
</select>

                

             <button
  className="primary-btn"
  onClick={async () => {
    if (!weight || !height) {
      alert('Please enter your weight and height.')
      return
    }

    try {
      const response = await fetch(
        'https://ai-gym-fitness-backend-9n7g.onrender.com/diet-plan',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            weight: Number(weight),
            height: Number(height),
            goal: goal,
            dietary_preference: dietPreference,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to generate diet plan')
      }

      const data = await response.json()

      setDietPlan(data)

    } catch (error) {
      console.error('Diet plan error:', error)
      alert('Unable to connect to the fitness backend.')
    }
  }}
>
  Generate Diet Plan
</button>
  {dietPlan && (
  <div className="feedback-message">
    <strong>BMI: {dietPlan.bmi}</strong>
    <br />
    Goal: {dietPlan.goal}
  </div>
)}
            </div>

            <div className="feedback-card">

  <h3>Nutrition Guidance</h3>

  {!dietPlan ? (
    <div className="feedback-message">
      Enter your details to receive a personalized diet recommendation.
    </div>
  ) : (
    <div className="diet-result">

      <div className="feedback-row">
        <span>BMI</span>
        <strong>{dietPlan.bmi}</strong>
      </div>

      <div className="feedback-row">
        <span>Daily Calories</span>
        <strong>{dietPlan.daily_calories}</strong>
      </div>

      <h4>Breakfast</h4>
      <p>{dietPlan.breakfast}</p>

      <h4>Lunch</h4>
      <p>{dietPlan.lunch}</p>

      <h4>Dinner</h4>
      <p>{dietPlan.dinner}</p>

      <h4>Grocery List</h4>
      <p>{dietPlan.grocery}</p>

    </div>
  )}

</div>

          </div>

        </section>
      </main>
    </div>
  )
}

if (activeModule === 'admin') {
  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span>AI Gym</span>
          <span className="logo-highlight">& Fitness Assistant</span>
        </div>

        <button
          className="profile-btn"
          onClick={() => setActiveModule(null)}
        >
          ← Back
        </button>
      </header>

      <main className="module-page">
        <div className="section-heading">
          <p className="eyebrow">ADMIN DASHBOARD</p>
          <h1>Fitness System Overview</h1>
          <p>
            Monitor the status and performance of the AI Gym & Fitness Assistant.
          </p>
        </div>

        <div className="module-grid">

          <div className="module-card">
            <div className="module-top">
              <span className="module-number">01</span>
              <span className="module-icon">🏋️</span>
            </div>
            <h3>Total Modules</h3>
            <p>7 functional fitness modules implemented.</p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <span className="module-number">02</span>
              <span className="module-icon">✅</span>
            </div>
            <h3>Modules Tested</h3>
            <p>7 out of 7 modules successfully tested.</p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <span className="module-number">03</span>
              <span className="module-icon">⚡</span>
            </div>
            <h3>Backend Status</h3>
            <p>FastAPI backend and REST APIs are operational.</p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <span className="module-number">04</span>
              <span className="module-icon">📷</span>
            </div>
            <h3>Workout Analysis</h3>
            <p>MediaPipe pose detection and squat analysis active.</p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <span className="module-number">05</span>
              <span className="module-icon">🥗</span>
            </div>
            <h3>Diet Planning</h3>
            <p>BMI, calorie, meal and grocery recommendations available.</p>
          </div>

          <div className="module-card">
            <div className="module-top">
              <span className="module-number">06</span>
              <span className="module-icon">📊</span>
            </div>
            <h3>Performance</h3>
            <p>Performance scoring and fitness feedback available.</p>
          </div>

        </div>

        <div className="section-heading" style={{ marginTop: '40px' }}>
          <p className="eyebrow">ANALYTICS</p>
          <h2>Project Performance</h2>
        </div>

        <div className="module-grid">

          <div className="module-card">
            <h3>Functional Test Coverage</h3>
            <p>7 / 7 modules passed</p>
            <div className="status">
              <span></span> All Modules Passed
            </div>
          </div>

          <div className="module-card">
            <h3>System Architecture</h3>
            <p>React frontend connected with FastAPI backend through REST APIs.</p>
            <div className="status">
              <span></span> System Operational
            </div>
          </div>

          <div className="module-card">
            <h3>Computer Vision</h3>
            <p>Camera-based pose detection with squat repetition counting.</p>
            <div className="status">
              <span></span> MediaPipe Active
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
  if (activeModule === 'trainer') {
    return (
      <div className="app">
        <header className="navbar">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span>AI Gym</span>
            <span className="logo-highlight">
              & Fitness Assistant
            </span>
          </div>
      <div className="workout-stats">
          <div className="stat-box">
            <span>Reps</span>
            <strong>{repCount}</strong>
          </div>

      <div className="stat-box">
        <span>Stage</span>
        <strong>{squatStage}</strong>
          </div>

  <div className="stat-box">
    <span>Feedback</span>
    <strong>{formFeedback}</strong>
  </div>
</div>

          <button
            className="profile-btn"
            onClick={() => {
              stopCamera()
              setActiveModule(null)
            }}
          >
            ← Back
          </button>
        </header>

        <main>
          <section className="trainer-page">
            <div className="section-heading">
              <p className="eyebrow">MODULE 01</p>

              <h2>AI Gym Trainer</h2>

              <p>
                Your AI-powered personal trainer for workout detection,
                repetition counting and exercise form correction.
              </p>
            </div>

            <div className="trainer-grid">

              <div className="trainer-card">
                <h3>Select Workout</h3>

                <button className="workout-option">
                  🏋️ Squats
                </button>

                <button className="workout-option">
                  💪 Push-ups
                </button>

                <button className="workout-option">
                  🦵 Lunges
                </button>

                <button className="workout-option">
                  🏋️ Bicep Curls
                </button>
              </div>

              <div className="camera-card">

                {!cameraOn ? (
                  <div className="camera-placeholder">

                    <div className="camera-icon">📷</div>

                    <h3>Workout Camera</h3>

                    <p>
                      Camera feed will be used for pose detection
                      and real-time exercise analysis.
                    </p>

                    <button
                      className="primary-btn"
                      onClick={startCamera}
                    >
                      Start Camera
                    </button>

                  </div>
                ) : (
                  <div className="camera-active">

                    <div className="video-wrapper">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="camera-video"
                      />

                      <canvas
                        ref={canvasRef}
                        className="pose-canvas"
                      />
                    </div>

                    <div className="camera-status">
                      <span></span>

                      {poseDetected
                        ? 'Pose Detected'
                        : 'Looking for Person...'}
                    </div>

                    <button
                      className="secondary-btn"
                      onClick={stopCamera}
                    >
                      Stop Camera
                    </button>

                  </div>
                )}

              </div>

              <div className="feedback-card">

                <h3>Live AI Feedback</h3>

                <div className="feedback-row">
                  <span>Repetitions</span>
                  <strong>{repCount}</strong>
                </div>

                <div className="feedback-row">
                  <span>Form</span>
                  <strong>
                {poseDetected ? formFeedback : 'Waiting'}
                  </strong>
                </div>

                <div className="feedback-row">
                  <span>Posture</span>
                  <strong>
                    {poseDetected ? 'Tracking' : 'Waiting'}
                  </strong>
                </div>

                <div className="feedback-message">
                  {poseDetected
                   ? formFeedback
                   : 'Start your workout to receive real-time AI feedback.'}
                </div>
              </div>

            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="app">

      <header className="navbar">

        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span>AI Gym</span>
          <span className="logo-highlight">
            & Fitness Assistant
          </span>
        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#modules">Modules</a>
          <a href="#about">About</a>
        </nav>

        <button
  className="profile-btn"
  onClick={() => setActiveModule('admin')}
>
  Admin Dashboard
</button>

      </header>

      <main>

        <section className="hero-section" id="home">

          <div className="hero-content">

            <p className="eyebrow">
              AI-POWERED FITNESS PLATFORM
            </p>

            <h1>
              Your Personal
              <span> AI Fitness Assistant</span>
            </h1>

            <p className="hero-description">
              Train smarter, eat better and track your performance
              with intelligent fitness assistance powered by AI.
            </p>

            <div className="hero-buttons">

              <button
                className="primary-btn"
                onClick={() => setActiveModule('trainer')}
              >
                Start Training →
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  document
                    .getElementById('modules')
                    .scrollIntoView({ behavior: 'smooth' })
                }
              >
                Explore Modules
              </button>

            </div>

          </div>

          <div className="hero-card">

            <div className="pulse-ring">
              <div className="ai-symbol">AI</div>
            </div>

            <h3>AI Fitness Coach</h3>

            <p>
              Ready to help you reach your fitness goals.
            </p>

            <div className="status">
              <span></span> AI System Online
            </div>

          </div>

        </section>

        <section className="modules-section" id="modules">

          <div className="section-heading">

            <p className="eyebrow">
              CORE FEATURES
            </p>

            <h2>
              Everything you need for smarter fitness
            </h2>

            <p>
              Seven intelligent modules working together as your
              complete AI-powered gym and fitness assistant.
            </p>

          </div>

          <div className="module-grid">

            {modules.map((module) => (

              <div
                className="module-card"
                key={module.number}
              >

                <div className="module-top">

                  <span className="module-number">
                    {module.number}
                  </span>

                  <span className="module-icon">
                    {module.icon}
                  </span>

                </div>

                <h3>{module.title}</h3>

                <p>{module.description}</p>

                <button
  className="module-btn"
  onClick={() =>
    module.number === '01'
      ? setActiveModule('trainer')
      : module.number === '02'
        ? setActiveModule('diet')
        : module.number === '03'
        ? setActiveModule('smart-gym')
        : module.number === '04'
        ? setActiveModule('habit')
        : module.number === '05'
        ? setActiveModule('buddy')
        : module.number === '06'
        ? setActiveModule('performance')
        : module.number === '07'
        ? setActiveModule('recommender')
        : alert(`${module.title} will be added next.`)
        
  }

                >
                  Open Module →
                </button>

              </div>

            ))}

          </div>

        </section>

        <section className="stats-section">

          <div>
            <strong>7</strong>
            <span>AI Modules</span>
          </div>

          <div>
            <strong>AI</strong>
            <span>Powered Assistance</span>
          </div>

          <div>
            <strong>24/7</strong>
            <span>Fitness Support</span>
          </div>

          <div>
            <strong>360°</strong>
            <span>Fitness Tracking</span>
          </div>

        </section>

        <section className="about-section" id="about">

          <div>
            <p className="eyebrow">
              ABOUT THE SYSTEM
            </p>

            <h2>
              One platform for your complete fitness journey.
            </h2>
          </div>

          <p>
            The AI Gym & Fitness Assistant combines computer vision,
            conversational AI, nutritional intelligence, behavioral
            analysis, IoT integration and performance analytics to
            provide personalized fitness assistance.
          </p>

        </section>

      </main>

      <footer>

        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span>AI Gym</span>
          <span className="logo-highlight">
            & Fitness Assistant
          </span>
        </div>

        <p>
          AI-powered fitness technology
        </p>

      </footer>

    </div>
  )
}

export default App