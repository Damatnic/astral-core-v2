import React, { useState } from 'react';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ApiClient } from '../utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { isError } from '../types/common';

const lessons = [
    {
        title: "Lesson 1: The Role of a Peer Supporter",
        content: "Your role is to listen, validate, and support. You are not a therapist. Avoid giving advice or trying to 'fix' someone's problem. Your presence and empathy are the most powerful tools you have."
    },
    {
        title: "Lesson 2: Active Listening",
        content: "Active listening means focusing completely on what is being said. Paraphrase what you hear to show you understand (e.g., 'It sounds like you're feeling...'). Ask open-ended questions to encourage sharing (e.g., 'How did that make you feel?')."
    },
    {
        title: "Lesson 3: Maintaining Boundaries & Anonymity",
        content: "Never ask for or share personal identifying information (names, locations, social media). Keep the focus on the seeker's experience. If a conversation becomes inappropriate or you feel uncomfortable, you have the right to end it and report the user."
    },
    {
        title: "Lesson 4: Crisis Recognition",
        content: "While you are not a crisis counselor, it's important to recognize signs of immediate danger, such as direct threats of self-harm. If you see this, use the 'Alert Moderator' tool immediately. Do not try to handle the crisis yourself."
    }
];

const quizQuestions = [
    {
        question: "What is your primary role as a peer supporter?",
        options: ["To give advice", "To fix their problem", "To listen and validate feelings", "To act as a therapist"],
        correctAnswer: "To listen and validate feelings"
    },
    {
        question: "A user says 'I feel so alone.' What is the BEST response?",
        options: ["'You should try going out more.'", "'I know exactly how you feel, one time I...'", "'It sounds incredibly difficult to feel so alone. I'm here to listen.'", "'Don't worry, you'll be fine.'"],
        correctAnswer: "'It sounds incredibly difficult to feel so alone. I'm here to listen.'"
    },
     {
        question: "A user says they are going to harm themselves right now. What should you do?",
        options: ["Try to talk them out of it yourself.", "Ask for their location so you can call for help.", "Ignore it, they are probably not serious.", "Use the 'Alert Moderator' tool and disengage."],
        correctAnswer: "Use the 'Alert Moderator' tool and disengage."
    }
];

export const HelperTrainingView: React.FC<{
    onTrainingComplete: () => void;
}> = ({ onTrainingComplete }) => {
    const { helperProfile } = useAuth();
    const { addToast, showConfirmationModal } = useNotification();
    const [step, setStep] = useState(0); // 0 to lessons.length-1 for lessons, lessons.length for quiz
    const [answers, setAnswers] = useState<(string | null)[]>(Array(quizQuestions.length).fill(null));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = answer;
        setAnswers(newAnswers);
    };

    const handleSubmitQuiz = async () => {
        const score = answers.reduce((correctCount, answer, index) => {
            return answer === quizQuestions[index].correctAnswer ? correctCount + 1 : correctCount;
        }, 0);
        
        const passed = score / quizQuestions.length >= 0.75;

        if (passed) {
            setIsSubmitting(true);
            try {
                if(helperProfile) {
                    await ApiClient.helpers.submitTrainingQuiz(helperProfile.id, score);
                    showConfirmationModal({
                        title: "Quiz Passed!",
                        message: `Congratulations! You scored ${score}/${quizQuestions.length}. You can now apply for certification from your profile page.`,
                        confirmText: "Continue",
                        onConfirm: onTrainingComplete,
                    });
                }
            } catch (err) {
                const errorMessage = isError(err) ? err.message : "Failed to submit quiz results.";
                addToast(errorMessage, 'error');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            showConfirmationModal({
                title: "Quiz Results",
                message: `You scored ${score}/${quizQuestions.length}. You did not meet the passing score (75%). Please review the lessons and try again.`,
                confirmText: "Try Again",
                onConfirm: () => {
                    setAnswers(Array(quizQuestions.length).fill(null));
                    setStep(0);
                },
            });
        }
    };

    if (step < lessons.length) {
        const lesson = lessons[step];
        return (
             <>
                <div className="view-header"><h1>Helper Training</h1></div>
                <Card>
                    <h2>{lesson.title}</h2>
                    <p>{lesson.content}</p>
                    <div className="form-actions">
                        {step > 0 && <AppButton variant="secondary" onClick={() => setStep(step - 1)}>Previous Lesson</AppButton>}
                        <AppButton onClick={() => setStep(step + 1)}>
                            {step === lessons.length - 1 ? "Start Quiz" : "Next Lesson"}
                        </AppButton>
                    </div>
                </Card>
            </>
        )
    }

    return (
        <>
            <div className="view-header"><h1>Training Quiz</h1></div>
            <Card>
                {quizQuestions.map((q, index) => (
                    <div key={index} className="form-group" style={{marginBottom: '2rem'}}>
                        <label style={{fontSize: '1.1rem', marginBottom: '1rem'}}>{index + 1}. {q.question}</label>
                        <div className="radio-group" style={{flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem'}}>
                            {q.options.map(option => (
                                <div key={option}>
                                    <input
                                        type="radio"
                                        id={`q${index}-${option}`}
                                        name={`question-${index}`}
                                        value={option}
                                        checked={answers[index] === option}
                                        onChange={() => handleAnswerChange(index, option)}
                                    />
                                    <label htmlFor={`q${index}-${option}`}>{option}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="form-actions">
                    <AppButton variant="success" onClick={handleSubmitQuiz} isLoading={isSubmitting}>Submit Quiz</AppButton>
                </div>
            </Card>
        </>
    );
};

export default HelperTrainingView;