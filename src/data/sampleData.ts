/**
 * Sample data for demo/development purposes
 * This file contains mock data for all views in the application
 */

import { Dilemma, Helper, WellnessVideo, Assessment } from '../types';

// Sample Feed Posts
export const samplePosts: Dilemma[] = [
  {
    id: '1',
    userToken: 'user123',
    title: 'Feeling overwhelmed with work-life balance',
    content: 'I\'ve been struggling to maintain a healthy work-life balance lately. My job demands have increased significantly, and I find myself working late into the evenings and weekends. I\'m missing out on time with family and friends, and my health is starting to suffer. I know I need to set boundaries, but I\'m afraid of disappointing my team or losing opportunities for advancement. Has anyone else dealt with this? How did you find the courage to prioritize your well-being?',
    category: 'work-stress',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    supportCount: 24,
    isSupported: false,
    isReported: false,
    status: 'active' as const
  },
  {
    id: '2',
    userToken: 'user456',
    title: 'Small victory: I went for a walk today!',
    content: 'I know it might not sound like much, but I\'ve been dealing with depression for months and today I finally managed to go for a 15-minute walk around my neighborhood. The sun felt amazing on my face, and I even smiled at a neighbor. It\'s been so long since I\'ve done something just for me. I\'m proud of this small step, and I wanted to share it with people who understand how big these "small" victories really are.',
    category: 'personal-growth',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    supportCount: 67,
    isSupported: false,
    isReported: false,
    status: 'active' as const
  },
  {
    id: '3',
    userToken: 'user789',
    title: 'Anxiety about upcoming family gathering',
    content: 'The holidays are coming up and I\'m already feeling anxious about family gatherings. There\'s always drama, uncomfortable questions about my life choices, and pressure to pretend everything is perfect. I love my family, but these events drain me emotionally. I\'m considering setting some boundaries this year or maybe limiting my time there. Has anyone successfully navigated family events while protecting their mental health?',
    category: 'anxiety',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    supportCount: 31,
    isSupported: false,
    isReported: false,
    status: 'active' as const
  },
  {
    id: '4',
    userToken: 'user234',
    title: 'Learning to cope with grief',
    content: 'It\'s been six months since I lost my mom, and the waves of grief still catch me off guard. Some days I feel like I\'m making progress, and then something small - a song, a smell, a memory - brings it all back. I\'m learning that grief isn\'t linear, and that\'s okay. I\'m trying to be gentle with myself and honor my feelings as they come. If you\'re grieving too, know that you\'re not alone in this journey.',
    category: 'grief',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    supportCount: 45,
    isSupported: false,
    isReported: false,
    status: 'active' as const
  },
  {
    id: '5',
    userToken: 'user567',
    title: 'Started therapy today!',
    content: 'After years of putting it off, I finally had my first therapy session today. I was so nervous, but my therapist was kind and understanding. We just talked about what brought me there and what I hope to work on. It feels like a weight has been lifted just knowing I\'m taking steps to help myself. For anyone on the fence about therapy - this is your sign to take that leap!',
    category: 'therapy',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    supportCount: 89,
    isSupported: false,
    isReported: false,
    status: 'active' as const
  }
];

// Sample Reflections/Journal Entries
export const sampleReflections = [
  {
    id: 'r1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 7,
    title: 'A Good Day',
    content: 'Today was better than most. I woke up feeling rested, had a productive morning, and even enjoyed lunch with a friend. Small progress, but I\'ll take it.',
    tags: ['gratitude', 'progress', 'social'],
    isPrivate: false
  },
  {
    id: 'r2',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 4,
    title: 'Struggling but Surviving',
    content: 'Anxiety was high today. Couldn\'t focus at work, but I used my breathing exercises and they helped a bit. Tomorrow is a new day.',
    tags: ['anxiety', 'coping', 'work'],
    isPrivate: true
  },
  {
    id: 'r3',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 8,
    title: 'Breakthrough in Therapy',
    content: 'Had an amazing therapy session today. Finally understood why I react certain ways to conflict. Feeling hopeful about applying these insights.',
    tags: ['therapy', 'growth', 'insight'],
    isPrivate: false
  },
  {
    id: 'r4',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    mood: 6,
    title: 'Practicing Self-Compassion',
    content: 'Made a mistake at work today, but instead of spiraling, I practiced self-compassion. Everyone makes mistakes. I\'m learning and growing.',
    tags: ['self-compassion', 'work', 'growth'],
    isPrivate: false
  }
];

// Sample Wellness Tracking Data
export const sampleWellnessData = {
  moodHistory: [
    { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), mood: 5, notes: 'Feeling neutral' },
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), mood: 6, notes: 'Better day' },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), mood: 4, notes: 'Anxious' },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), mood: 7, notes: 'Good progress' },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), mood: 6, notes: 'Stable' },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), mood: 8, notes: 'Great day!' },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), mood: 7, notes: 'Maintaining progress' }
  ],
  sleepData: [
    { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), hours: 6, quality: 'fair' },
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), hours: 7, quality: 'good' },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), hours: 5, quality: 'poor' },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), hours: 8, quality: 'excellent' },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), hours: 7, quality: 'good' },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), hours: 6, quality: 'fair' },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), hours: 7, quality: 'good' }
  ],
  exerciseData: [
    { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), minutes: 0, type: 'none' },
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), minutes: 30, type: 'walking' },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), minutes: 0, type: 'none' },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), minutes: 45, type: 'yoga' },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), minutes: 20, type: 'walking' },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), minutes: 60, type: 'gym' },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), minutes: 15, type: 'stretching' }
  ],
  goals: [
    { id: 'g1', title: 'Daily Meditation', progress: 70, target: '10 minutes daily', achieved: false },
    { id: 'g2', title: 'Weekly Therapy', progress: 100, target: '1 session per week', achieved: true },
    { id: 'g3', title: 'Exercise Routine', progress: 45, target: '3 times per week', achieved: false },
    { id: 'g4', title: 'Sleep Schedule', progress: 60, target: '8 hours nightly', achieved: false }
  ]
};

// Sample Wellness Videos
export const sampleWellnessVideos: WellnessVideo[] = [
  {
    id: 'v1',
    title: '10-Minute Morning Meditation',
    description: 'Start your day with calm and clarity through this guided meditation practice.',
    videoUrl: 'https://example.com/video1',
    thumbnailUrl: '/images/meditation-thumb.jpg',
    duration: '10:23',
    category: 'Meditation',
    tags: ['meditation', 'morning', 'mindfulness'],
    views: 1542,
    likes: 234
  },
  {
    id: 'v2',
    title: 'Breathing Exercises for Anxiety',
    description: 'Learn simple but effective breathing techniques to manage anxiety in the moment.',
    videoUrl: 'https://example.com/video2',
    thumbnailUrl: '/images/breathing-thumb.jpg',
    duration: '7:45',
    category: 'Anxiety Management',
    tags: ['anxiety', 'breathing', 'coping'],
    views: 2891,
    likes: 412
  },
  {
    id: 'v3',
    title: 'Progressive Muscle Relaxation',
    description: 'A guided session to release physical tension and promote deep relaxation.',
    videoUrl: 'https://example.com/video3',
    thumbnailUrl: '/images/relaxation-thumb.jpg',
    duration: '15:30',
    category: 'Relaxation',
    tags: ['relaxation', 'stress-relief', 'body-scan'],
    views: 987,
    likes: 178
  },
  {
    id: 'v4',
    title: 'Sleep Hygiene Tips',
    description: 'Expert advice on creating the perfect environment and routine for better sleep.',
    videoUrl: 'https://example.com/video4',
    thumbnailUrl: '/images/sleep-thumb.jpg',
    duration: '12:15',
    category: 'Sleep',
    tags: ['sleep', 'insomnia', 'rest'],
    views: 3456,
    likes: 567
  },
  {
    id: 'v5',
    title: 'Gentle Yoga for Beginners',
    description: 'A calming yoga flow perfect for stress relief and improving flexibility.',
    videoUrl: 'https://example.com/video5',
    thumbnailUrl: '/images/yoga-thumb.jpg',
    duration: '20:00',
    category: 'Exercise',
    tags: ['yoga', 'exercise', 'flexibility'],
    views: 2234,
    likes: 389
  }
];

// Sample Assessments
export const sampleAssessments: Assessment[] = [
  {
    id: 'a1',
    title: 'Anxiety Screening (GAD-7)',
    userToken: 'user123',
    type: 'gad-7',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    score: 8,
    answers: [1, 2, 1, 2, 1, 2, 1]
  },
  {
    id: 'a2',
    title: 'Depression Screening (PHQ-9)',
    userToken: 'user456',
    type: 'phq-9',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    score: 12,
    answers: [2, 1, 2, 1, 2, 1, 2, 1, 1]
  },
  {
    id: 'a3',
    title: 'Recent Anxiety Assessment',
    userToken: 'user789',
    type: 'gad-7',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    score: 5,
    answers: [1, 1, 1, 1, 1, 0, 0]
  }
];

// Sample Activity History
export const sampleActivityHistory = [
  {
    id: 'act1',
    type: 'post',
    action: 'Created a post',
    title: 'Feeling overwhelmed with work-life balance',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'act2',
    type: 'comment',
    action: 'Commented on a post',
    title: 'Small victory: I went for a walk today!',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'act3',
    type: 'reflection',
    action: 'Added a reflection',
    title: 'A Good Day',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'act4',
    type: 'assessment',
    action: 'Completed assessment',
    title: 'Mood Check-In',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'act5',
    type: 'wellness',
    action: 'Updated wellness goals',
    title: 'Daily Meditation',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Sample Helpers (for peer support)
export const sampleHelpers: Helper[] = [
  {
    id: 'h1',
    auth0UserId: 'auth0|helper1',
    displayName: 'Sarah M.',
    bio: 'Certified peer support specialist with experience in anxiety and depression. Here to listen without judgment.',
    joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    helperType: 'Certified',
    role: 'Certified',
    reputation: 4.8,
    isAvailable: true,
    expertise: ['Anxiety', 'Depression', 'Work Stress'],
    kudosCount: 127,
    totalSessions: 203,
    xp: 2400,
    level: 8,
    nextLevelXp: 3000,
    applicationStatus: 'approved',
    trainingCompleted: true,
    quizScore: 95
  },
  {
    id: 'h2',
    auth0UserId: 'auth0|helper2',
    displayName: 'Michael T.',
    bio: 'Recovery coach focusing on addiction and trauma. 5 years in recovery myself. You\'re not alone.',
    joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    helperType: 'Certified',
    role: 'Certified',
    reputation: 4.9,
    isAvailable: true,
    expertise: ['Addiction', 'Trauma', 'Recovery'],
    kudosCount: 310,
    totalSessions: 445,
    xp: 4200,
    level: 12,
    nextLevelXp: 5000,
    applicationStatus: 'approved',
    trainingCompleted: true,
    quizScore: 98
  },
  {
    id: 'h3',
    auth0UserId: 'auth0|helper3',
    displayName: 'Jessica L.',
    bio: 'Grief counselor and mindfulness practitioner. Helping others navigate loss and find peace.',
    joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    helperType: 'Community',
    role: 'Community',
    reputation: 4.7,
    isAvailable: false,
    expertise: ['Grief', 'Loss', 'Mindfulness'],
    kudosCount: 89,
    totalSessions: 134,
    xp: 1800,
    level: 6,
    nextLevelXp: 2000,
    applicationStatus: 'approved',
    trainingCompleted: true,
    quizScore: 92
  }
];

// Astral Tether Demo Data
export const astralTetherDemo = {
  connectionStatus: 'ready',
  energyLevel: 75,
  resonanceStrength: 82,
  activeConnections: 3,
  recentSessions: [
    {
      id: 'at1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      duration: '15 minutes',
      type: 'Calming',
      effectiveness: 85,
      notes: 'Felt a strong sense of peace and connection'
    },
    {
      id: 'at2',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      duration: '20 minutes',
      type: 'Energizing',
      effectiveness: 78,
      notes: 'Helped lift my mood and motivation'
    },
    {
      id: 'at3',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      duration: '10 minutes',
      type: 'Grounding',
      effectiveness: 92,
      notes: 'Perfect for managing anxiety in the moment'
    }
  ],
  availableModes: [
    {
      name: 'Calming Wave',
      description: 'Gentle, soothing energy to reduce anxiety and promote relaxation',
      icon: '🌊',
      color: '#6B9BD2'
    },
    {
      name: 'Energizing Pulse',
      description: 'Uplifting vibrations to boost mood and motivation',
      icon: '⚡',
      color: '#F4B942'
    },
    {
      name: 'Grounding Root',
      description: 'Stabilizing frequency to center yourself and find balance',
      icon: '🌳',
      color: '#7CB342'
    },
    {
      name: 'Heart Opening',
      description: 'Compassionate resonance to foster self-love and connection',
      icon: '💜',
      color: '#AB47BC'
    },
    {
      name: 'Clarity Focus',
      description: 'Sharpening wavelength to enhance mental clarity and focus',
      icon: '🔮',
      color: '#5E35B1'
    }
  ],
  testimonials: [
    {
      text: 'The Astral Tether has been a game-changer for my anxiety management.',
      author: 'Anonymous User',
      rating: 5
    },
    {
      text: 'I use it every morning to set a positive tone for my day.',
      author: 'Community Member',
      rating: 5
    },
    {
      text: 'Skeptical at first, but the calming effect is undeniable.',
      author: 'New User',
      rating: 4
    }
  ]
};

// Sample Chat Messages (for peer support)
export const sampleChatMessages = [
  {
    id: 'm1',
    senderId: 'helper',
    text: 'Hi there! I\'m Sarah, your peer support helper today. How are you feeling?',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isHelper: true
  },
  {
    id: 'm2',
    senderId: 'user',
    text: 'Hi Sarah. I\'m feeling pretty anxious about a presentation I have tomorrow.',
    timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    isHelper: false
  },
  {
    id: 'm3',
    senderId: 'helper',
    text: 'I understand how nerve-wracking presentations can be. What specifically about it is making you most anxious?',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    isHelper: true
  },
  {
    id: 'm4',
    senderId: 'user',
    text: 'I\'m worried I\'ll forget what to say or that people will judge me if I make a mistake.',
    timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    isHelper: false
  },
  {
    id: 'm5',
    senderId: 'helper',
    text: 'Those are very common fears, and they\'re completely valid. Let\'s work on some strategies to help you feel more confident. Have you tried any breathing exercises or grounding techniques before?',
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    isHelper: true
  }
];

// Sample Safety Plan
export const sampleSafetyPlan = {
  warningSignsInternal: [
    'Feeling hopeless or overwhelmed',
    'Increased anxiety or panic',
    'Difficulty sleeping',
    'Racing thoughts'
  ],
  warningSignsExternal: [
    'Isolating from friends and family',
    'Missing work or school',
    'Changes in eating habits',
    'Increased substance use'
  ],
  copingStrategies: [
    'Practice deep breathing exercises',
    'Go for a walk in nature',
    'Listen to calming music',
    'Use the 5-4-3-2-1 grounding technique',
    'Journal about my feelings',
    'Call a friend'
  ],
  supportContacts: [
    { name: 'Best Friend', phone: '555-0123', relationship: 'Friend' },
    { name: 'Therapist', phone: '555-0456', relationship: 'Professional' },
    { name: 'Sister', phone: '555-0789', relationship: 'Family' }
  ],
  professionalContacts: [
    { name: 'Crisis Hotline', phone: '988', available: '24/7' },
    { name: 'Local ER', phone: '911', available: '24/7' },
    { name: 'Therapist Office', phone: '555-0456', available: 'M-F 9-5' }
  ],
  safeEnvironment: [
    'Remove or secure any harmful items',
    'Stay with supportive people',
    'Avoid alcohol and drugs',
    'Create a calming space with soft lighting and comfortable items'
  ],
  reasonsToLive: [
    'My family who loves me',
    'My pet who needs me',
    'Dreams I want to achieve',
    'Places I want to visit',
    'The possibility of feeling better'
  ]
};