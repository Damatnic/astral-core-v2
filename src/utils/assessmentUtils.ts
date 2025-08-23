export interface AssessmentQuestion {
  id: string;
  text: string;
  options: {
    value: number;
    text: string;
  }[];
}

export interface AssessmentResult {
  score: number;
  severity: string;
  recommendation: string;
}

// PHQ-9 Depression Assessment Questions
export const phq9Questions: AssessmentQuestion[] = [
  {
    id: 'phq9-1',
    text: 'Little interest or pleasure in doing things',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9-2',
    text: 'Feeling down, depressed, or hopeless',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9-3',
    text: 'Trouble falling or staying asleep, or sleeping too much',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9-4',
    text: 'Feeling tired or having little energy',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9-5',
    text: 'Poor appetite or overeating',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9-6',
    text: 'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9-7',
    text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9-8',
    text: 'Moving or speaking so slowly that other people could have noticed or being so fidgety or restless that you have been moving around a lot more than usual',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'phq9-9',
    text: 'Thoughts that you would be better off dead, or of hurting yourself',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  }
];

// GAD-7 Anxiety Assessment Questions
export const gad7Questions: AssessmentQuestion[] = [
  {
    id: 'gad7-1',
    text: 'Feeling nervous, anxious, or on edge',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7-2',
    text: 'Not being able to stop or control worrying',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7-3',
    text: 'Worrying too much about different things',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7-4',
    text: 'Trouble relaxing',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7-5',
    text: 'Being so restless that it is hard to sit still',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7-6',
    text: 'Becoming easily annoyed or irritable',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  },
  {
    id: 'gad7-7',
    text: 'Feeling afraid, as if something awful might happen',
    options: [
      { value: 0, text: 'Not at all' },
      { value: 1, text: 'Several days' },
      { value: 2, text: 'More than half the days' },
      { value: 3, text: 'Nearly every day' }
    ]
  }
];

// PHQ-9 Score Interpretation
export const getPhq9Result = (score: number): AssessmentResult => {
  if (score <= 4) {
    return {
      score,
      severity: 'Minimal Depression',
      recommendation: 'Your symptoms suggest minimal depression. Continue monitoring your mental health and maintain healthy lifestyle habits.'
    };
  } else if (score <= 9) {
    return {
      score,
      severity: 'Mild Depression',
      recommendation: 'Your symptoms suggest mild depression. Consider reaching out to a mental health professional for support and guidance.'
    };
  } else if (score <= 14) {
    return {
      score,
      severity: 'Moderate Depression',
      recommendation: 'Your symptoms suggest moderate depression. We recommend speaking with a healthcare provider about treatment options.'
    };
  } else if (score <= 19) {
    return {
      score,
      severity: 'Moderately Severe Depression',
      recommendation: 'Your symptoms suggest moderately severe depression. Please consider seeking professional help soon for proper evaluation and treatment.'
    };
  } else {
    return {
      score,
      severity: 'Severe Depression',
      recommendation: 'Your symptoms suggest severe depression. We strongly recommend contacting a mental health professional immediately for proper care and support.'
    };
  }
};

// GAD-7 Score Interpretation
export const getGad7Result = (score: number): AssessmentResult => {
  if (score <= 4) {
    return {
      score,
      severity: 'Minimal Anxiety',
      recommendation: 'Your symptoms suggest minimal anxiety. Continue practicing stress management and healthy coping strategies.'
    };
  } else if (score <= 9) {
    return {
      score,
      severity: 'Mild Anxiety',
      recommendation: 'Your symptoms suggest mild anxiety. Consider learning relaxation techniques and speaking with a mental health professional if symptoms persist.'
    };
  } else if (score <= 14) {
    return {
      score,
      severity: 'Moderate Anxiety',
      recommendation: 'Your symptoms suggest moderate anxiety. We recommend consulting with a healthcare provider about treatment options and coping strategies.'
    };
  } else {
    return {
      score,
      severity: 'Severe Anxiety',
      recommendation: 'Your symptoms suggest severe anxiety. Please consider seeking professional help soon for proper evaluation and treatment to improve your quality of life.'
    };
  }
};