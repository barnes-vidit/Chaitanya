export interface Question {
    id: string;
    text: string;
    type: 'scale' | 'yes_no' | 'input';
    options?: { label: string; value: number }[];
}

export interface AssessmentType {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    maxScore: number;
}

export const assessments: AssessmentType[] = [];
